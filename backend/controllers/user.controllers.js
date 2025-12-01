import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment";

/* ============================================================
   SECTION 1: GET CURRENT USER
   ============================================================ */
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if (!user)
            return res.status(400).json({ message: "User not found" });

        // ✅ Sanitize history: convert old string entries to objects
        if (user.history && Array.isArray(user.history)) {
            user.history = user.history.map((item) => {
                if (typeof item === 'string') {
                    return { command: item, response: '', type: 'general', timestamp: new Date() };
                }
                return item;
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        return res.status(400).json({ message: "Error fetching current user" });
    }
};

/* ============================================================
   SECTION 2: UPDATE ASSISTANT DETAILS
   ============================================================ */
export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body;

        // Upload new image or keep existing one
        const assistantImage = req.file
            ? await uploadOnCloudinary(req.file.path)
            : imageUrl;

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { assistantName, assistantImage },
            { new: true }
        ).select("-password");

        return res.status(200).json(updatedUser);

    } catch (error) {
        return res.status(400).json({ message: "Error updating assistant" });
    }
};

/* ============================================================
   SECTION 3: CORE AI ASSISTANT HANDLER (OPTIMIZED)
   ============================================================ */
export const askToAssistant = async (req, res) => {
    try {
        const startTime = Date.now();
        const { command } = req.body;

        if (!command)
            return res.status(400).json({ response: "Command is required" });

        console.log(`🎯 Processing command: "${command}"`);

        const user = await User.findById(req.userId);

        if (!user)
            return res.status(400).json({ response: "User not found" });

        const assistantName = user.assistantName;
        const userName = user.name;

        /* CALL GEMINI FOR AI RESPONSE WITH CONVERSATION HISTORY */
        const responseText = await geminiResponse(command, assistantName, userName, user.history);

        if (!responseText) {
            return res.status(500).json({
                response: "Gemini API returned empty response"
            });
        }

        /* Parse response (gemini.js now returns object directly) */
        const gemResult = typeof responseText === 'object'
            ? responseText
            : (() => {
                const jsonMatch = responseText.match(/{[\s\S]*}/);
                if (!jsonMatch) return null;

                let jsonString = jsonMatch[0]
                    .replace(/^```(?:json)?\n?/, "")
                    .replace(/\n?```$/, "");

                try {
                    return JSON.parse(jsonString);
                } catch (error) {
                    return null;
                }
            })();

        if (!gemResult) {
            return res.status(400).json({ response: "Sorry, I can't understand" });
        }

        const { type, userInput, response } = gemResult;

        /* SAVE BOTH COMMAND AND RESPONSE TO HISTORY */
        user.history.push({
            command: command,
            response: response,
            type: type,
            timestamp: new Date()
        });
        user.save().catch(err => console.error("History save error:", err.message));

        /* TYPE-BASED RESPONSE HANDLING */
        const responseMap = {
            "get-date": {
                type,
                userInput,
                response: `Current date is ${moment().format("YYYY-MM-DD")}`
            },
            "get-time": {
                type,
                userInput,
                response: `Current time is ${moment().format("hh:mm A")}`
            },
            "get-day": {
                type,
                userInput,
                response: `Today is ${moment().format("dddd")}`
            },
            "get-month": {
                type,
                userInput,
                response: `This month is ${moment().format("MMMM")}`
            }
        };

        const finalResponse = responseMap[type] || { type, userInput, response };

        const responseTime = Date.now() - startTime;
        console.log(`✅ Response sent in ${responseTime}ms`);

        return res.json({
            ...finalResponse,
            responseTime
        });

    } catch (error) {
        console.error("❌ Assistant error:", error.message);
        return res.status(500).json({
            response: "Error executing assistant command",
            error: error.message
        });
    }
};

/* ============================================================
   SECTION 4: PUBLIC ENDPOINT FOR CHROME EXTENSION
   ============================================================ */
export const askToAssistantPublic = async (req, res) => {
    try {
        const startTime = Date.now();
        const { command } = req.body;

        if (!command)
            return res.status(400).json({ response: "Command is required" });

        console.log(`🎯 [PUBLIC] Processing command: "${command}"`);

        // Use default assistant name and user name for public requests
        const assistantName = "Nova";
        const userName = "User";

        /* CALL GEMINI FOR AI RESPONSE */
        const responseText = await geminiResponse(command, assistantName, userName);

        if (!responseText) {
            return res.status(500).json({
                response: "Gemini API returned empty response"
            });
        }

        /* Parse response (gemini.js now returns object directly) */
        const gemResult = typeof responseText === 'object'
            ? responseText
            : (() => {
                const jsonMatch = responseText.match(/{[\s\S]*}/);
                if (!jsonMatch) return null;

                let jsonString = jsonMatch[0]
                    .replace(/^```(?:json)?\n?/, "")
                    .replace(/\n?```$/, "");

                try {
                    return JSON.parse(jsonString);
                } catch (error) {
                    return null;
                }
            })();

        if (!gemResult) {
            return res.status(500).json({
                response: responseText || "Could not parse Gemini response"
            });
        }

        const duration = Date.now() - startTime;
        console.log(`✅ [PUBLIC] Response ready in ${duration}ms`);

        return res.status(200).json({
            response: gemResult.response || "No response generated",
            action: gemResult.action || "respond"
        });

    } catch (error) {
        console.error("❌ Public Assistant error:", error.message);
        return res.status(500).json({
            response: "Error executing assistant command",
            error: error.message
        });
    }
};

/* ============================================================
   SECTION 5: DEV TESTING -- CAN BE REMOVED IN PRODUCTION
   ============================================================ */
// This is for local debugging only
if (process.env.NODE_ENV === 'development') {
    console.log("ℹ️ Running in development mode");
}
