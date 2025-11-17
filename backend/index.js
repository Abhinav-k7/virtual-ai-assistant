import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import geminiResponse from "./gemini.js"
import isAuth from "./middlewares/isAuth.js"
import User from "./models/user.model.js"


const app = express()
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
const port = process.env.PORT || 5000
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)

// Test endpoint to verify Gemini API
app.get("/api/test-gemini", async (req, res) => {
    try {
        const result = await geminiResponse("hello", "TestAssistant", "TestUser");
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Full flow test endpoint
app.get("/api/test-full", async (req, res) => {
    try {
        const command = "what is 2+2";
        const assistantName = "TestBot";
        const userName = "TestUser";

        console.log("=== Full Test Flow ===");
        console.log("Calling geminiResponse...");
        const result = await geminiResponse(command, assistantName, userName);
        console.log("Raw result:", result);

        if (!result) {
            return res.json({ success: false, message: "Gemini returned null" });
        }

        const jsonMatch = result.match(/{[\s\S]*}/)
        if (!jsonMatch) {
            return res.json({ success: false, message: "No JSON found", result });
        }

        let jsonString = jsonMatch[0];
        jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')

        console.log("Cleaned JSON string:", jsonString);
        const gemResult = JSON.parse(jsonString);

        res.json({ success: true, gemResult });
    } catch (error) {
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

app.listen(port, () => {
    connectDb()
    console.log("server started")
})

