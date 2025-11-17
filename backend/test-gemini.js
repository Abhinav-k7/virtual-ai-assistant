import dotenv from "dotenv"
dotenv.config()
import geminiResponse from "./gemini.js"

async function test() {
    console.log("Testing Gemini API...")
    console.log("API Key:", process.env.GEMINI_API_KEY?.substring(0, 10) + "...")
    console.log("Model:", process.env.GEMINI_MODEL)

    const result = await geminiResponse("hello", "TestBot", "TestUser")
    console.log("Result:", result)
}

test().catch(console.error)
