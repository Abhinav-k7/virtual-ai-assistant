import axios from "axios"

const geminiResponse = async (command, assistantName, userName) => {
    console.log("\n========== GEMINI RESPONSE FUNCTION START ==========")
    try {
        const apiKey = process.env.GEMINI_API_KEY
        const model = process.env.GEMINI_MODEL || "gemini-pro"

        console.log("[1] Function called with:")
        console.log("    - Command (first 50 chars):", command.substring(0, 50))
        console.log("    - Assistant Name:", assistantName)
        console.log("    - User Name:", userName)
        console.log("[2] Environment loaded:")
        console.log("    - Model:", model)
        console.log("    - API Key present:", !!apiKey)
        console.log("    - API Key length:", apiKey ? apiKey.length : 0)

        // Use v1 API which supports gemini-1.5-flash
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`

        console.log("[3] Making API request to Gemini...")
        console.log("    - URL (first 100 chars):", apiUrl.substring(0, 100) + "...")

        const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month"|"calculator-open" | "instagram-open" |"facebook-open" |"weather-show"
  ,
  "userInput": "<original user input>" {only remove your name from userinput if exists} and agar kisi ne google ya youtube pe kuch search karne ko bola hai to userInput me only bo search baala text jaye,

  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userinput": original sentence the user spoke.
- "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question. aur agar koi aisa question puchta hai jiska answer tume pata hai usko bhi general ki category me rakho bas short answer dena
- "google-search": if user wants to search something on Google .
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to  open a calculator .
- "instagram-open": if user wants to  open instagram .
- "facebook-open": if user wants to open facebook.
-"weather-show": if user wants to know weather
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.

Important:
- Use ${userName} agar koi puche tume kisne banaya 
- Only respond with the JSON object, nothing else.


now your userInput- ${command}
`;





        const result = await axios.post(apiUrl, {
            "contents": [{
                "parts": [{ "text": prompt }]
            }]
        })
        console.log("[4] API Request successful!")
        console.log("    - Status:", result.status)
        console.log("    - Has data:", !!result.data)
        console.log("    - Has candidates:", !!result.data.candidates)

        // Check if response has expected structure
        if (!result.data || !result.data.candidates || !result.data.candidates[0]) {
            console.error("[ERROR] Unexpected Gemini response structure:")
            console.error("    - result.data:", !!result.data)
            console.error("    - candidates:", !!result.data?.candidates)
            console.error("    - candidates[0]:", !!result.data?.candidates?.[0])
            console.error("    - Full data:", JSON.stringify(result.data).substring(0, 200))
            return null
        }

        const responseText = result.data.candidates[0].content.parts[0].text
        console.log("[5] Response text extracted:")
        console.log("    - Length:", responseText.length)
        console.log("    - First 100 chars:", responseText.substring(0, 100))
        console.log("========== GEMINI RESPONSE FUNCTION END (SUCCESS) ==========\n")
        return responseText
    } catch (error) {
        console.error("\n[ERROR] Exception caught in geminiResponse:")
        console.error("    - Error type:", error.constructor.name)
        console.error("    - Message:", error.message)

        if (error.response) {
            console.error("    - HTTP Status:", error.response.status)
            console.error("    - Status Text:", error.response.statusText)
            console.error("    - Response data (first 300 chars):", JSON.stringify(error.response.data).substring(0, 300))

            if (error.response.data?.error) {
                console.error("    - API Error:", JSON.stringify(error.response.data.error, null, 2))
            }
        } else {
            console.error("    - No response object (network error?)")
            console.error("    - Full error:", error.toString())
        }
        console.error("========== GEMINI RESPONSE FUNCTION END (ERROR) ==========\n")
        return null
    }
}

export default geminiResponse