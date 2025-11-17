import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const testGeminiAPI = async () => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const model = process.env.GEMINI_MODEL;

        console.log("API Key (first 20 chars):", apiKey.substring(0, 20) + "...");
        console.log("Model:", model);

        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

        console.log("\nMaking request to Gemini API...");
        console.log("Endpoint:", apiUrl.substring(0, 100) + "...");

        const response = await axios.post(apiUrl, {
            contents: [
                {
                    parts: [{ text: "Hello, what is 2+2?" }],
                },
            ],
        });

        console.log("\n✅ SUCCESS!");
        console.log("Status:", response.status);
        console.log("Response structure:");
        console.log("- candidates:", !!response.data.candidates);
        console.log("- candidates[0]:", !!response.data.candidates[0]);
        console.log("- content:", !!response.data.candidates[0].content);
        console.log("- parts:", !!response.data.candidates[0].content.parts);
        console.log("- text:", response.data.candidates[0].content.parts[0].text.substring(0, 100));
    } catch (error) {
        console.log("\n❌ ERROR!");
        console.log("Status:", error.response?.status);
        console.log("Status Text:", error.response?.statusText);
        console.log("Error Message:", error.message);

        if (error.response?.data?.error) {
            console.log("\nAPI Error Details:");
            console.log(JSON.stringify(error.response.data.error, null, 2));
        }

        if (error.response?.status === 400) {
            console.log(
                "\n⚠️ 400 Bad Request - The request was malformed. Check JSON structure."
            );
        }
        if (error.response?.status === 401) {
            console.log(
                "\n⚠️ 401 Unauthorized - API key is invalid or expired. Get a new one from https://aistudio.google.com/app/apikey"
            );
        }
        if (error.response?.status === 429) {
            console.log(
                "\n⚠️ 429 Too Many Requests - You've hit the rate limit. Wait a moment."
            );
        }
    }
};

testGeminiAPI();
