import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import geminiResponse from "./gemini.js";
import isAuth from "./middlewares/isAuth.js";
import User from "./models/user.model.js";
import { Server as SocketIO } from 'socket.io'; // Fixed import
import { initWakeWord, cleanupWakeWord } from "./wakeWord.js"; // Import wake word module

// Validate critical environment variables on startup
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not set in .env. Exiting.");
    process.exit(1);
}
if (!process.env.GEMINI_MODEL) {
    console.warn("⚠️  GEMINI_MODEL not set; defaulting to gemini-1.5-flash.");
}
if (!process.env.PICOVOICE_API_KEY) {
    console.error("❌ PICOVOICE_API_KEY not set in .env. Exiting.");
    process.exit(1);
}

const app = express();

// CORS configuration - Allow extension requests from any origin
// Extension content scripts run in the context of the website they're on
// So requests come from various origins (YouTube, Gmail, etc.)
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests from:
        // 1. React frontend on localhost:5173
        // 2. Chrome extension (content scripts have origin like https://example.com)
        // 3. Localhost for testing
        const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];

        // Allow all origins that match these patterns:
        // - localhost (any port)
        // - chrome-extension:// (extension)
        // - Any https:// (for deployed extension)
        if (!origin ||
            origin.includes('localhost') ||
            origin.includes('chrome-extension') ||
            origin.startsWith('https://') ||
            origin.startsWith('http://') ||
            allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

const port = process.env.PORT || 8000;
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Create HTTP server and attach Socket.io
const server = app.listen(port, () => {
    connectDb();
    console.log(`✅ Server started on port ${port}. Health check: http://localhost:${port}/api/health`);
});
const io = new SocketIO(server, { // Fixed initialization
    cors: {
        origin: function (origin, callback) {
            const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
            if (!origin ||
                origin.includes('localhost') ||
                origin.includes('chrome-extension') ||
                origin.startsWith('https://') ||
                origin.startsWith('http://') ||
                allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Initialize wake word detection after server starts
initWakeWord(io);

// Improved parsing function with fallback for robustness
const parseGeminiResponse = (rawText) => {
    if (!rawText) {
        console.warn("No raw text from Gemini; using fallback.");
        return { type: "general", userInput: "", response: "Sorry, I couldn't process that. Try again." };
    }
    // Extract JSON
    const jsonMatch = rawText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
        console.warn("No JSON match in response; using fallback. Raw:", rawText.substring(0, 200));
        return { type: "general", userInput: "", response: "Sorry, I didn't understand. Please rephrase." };
    }
    let jsonString = jsonMatch[0];
    // Clean up code blocks
    jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    try {
        const parsed = JSON.parse(jsonString);
        // Basic validation: Ensure required fields
        if (!parsed.type || !parsed.response) {
            throw new Error("Missing required fields in JSON.");
        }
        return parsed;
    } catch (e) {
        console.error("JSON parse failed:", e.message, "Raw:", rawText.substring(0, 200));
        return { type: "general", userInput: "", response: "Oops, something went wrong. Please try again." };
    }
};

// Test endpoint to verify Gemini API
app.get("/api/test-gemini", async (req, res) => {
    try {
        const result = await geminiResponse("hello", "TestAssistant", "TestUser");
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Full flow test endpoint with improved parsing
app.get("/api/test-full", async (req, res) => {
    try {
        const command = "what is 2+2";
        const assistantName = "TestBot";
        const userName = "TestUser";

        console.log("=== Full Test Flow ===");
        console.log("Calling geminiResponse...");
        const result = await geminiResponse(command, assistantName, userName);
        console.log("Raw result:", result);

        const gemResult = parseGeminiResponse(result);  // Always returns a valid object
        res.json({ success: true, gemResult });
    } catch (error) {
        console.error("Full flow error:", error);
        res.status(500).json({ success: false, error: error.message, stack: error.stack });
    }
});

// Endpoint to check authentication
app.get("/api/test-auth", isAuth, async (req, res) => {
    try {
        console.log("=== Test Auth Endpoint ===");
        console.log("req.userId:", req.userId);
        const user = await User.findById(req.userId);
        console.log("User found:", user ? "yes" : "no");

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        res.json({
            success: true,
            userId: req.userId,
            userName: user.name,
            assistantName: user.assistantName
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// New health check endpoint for monitoring
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), model: process.env.GEMINI_MODEL });
});

// Cleanup on process exit
process.on('SIGINT', () => {
    cleanupWakeWord();
    server.close(() => {
        console.log('Server shut down gracefully.');
        process.exit(0);
    });
});