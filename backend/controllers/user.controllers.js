import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from "moment"
export const getCurrentUser = async (req, res) => {
   try {
      const userId = req.userId
      const user = await User.findById(userId).select("-password")
      if (!user) {
         return res.status(400).json({ message: "user not found" })
      }

      return res.status(200).json(user)
   } catch (error) {
      return res.status(400).json({ message: "get current user error" })
   }
}

export const updateAssistant = async (req, res) => {
   try {
      const { assistantName, imageUrl } = req.body
      let assistantImage;
      if (req.file) {
         assistantImage = await uploadOnCloudinary(req.file.path)
      } else {
         assistantImage = imageUrl
      }

      const user = await User.findByIdAndUpdate(req.userId, {
         assistantName, assistantImage
      }, { new: true }).select("-password")
      return res.status(200).json(user)


   } catch (error) {
      return res.status(400).json({ message: "updateAssistantError user error" })
   }
}


export const askToAssistant = async (req, res) => {
   try {
      console.log("=== askToAssistant called ===")
      console.log("req.userId:", req.userId)
      console.log("req.body:", req.body)

      const { command } = req.body
      if (!command) {
         return res.status(400).json({ response: "Command is required" })
      }

      if (!req.userId) {
         return res.status(401).json({ response: "User not authenticated" })
      }

      const user = await User.findById(req.userId);
      console.log("User found:", user ? "yes" : "no")

      if (!user) {
         return res.status(400).json({ response: "User not found" })
      }

      user.history.push(command)
      await user.save()
      const userName = user.name
      const assistantName = user.assistantName

      console.log("Calling geminiResponse with:", { command, assistantName, userName })
      const result = await geminiResponse(command, assistantName, userName)
      console.log("Gemini Result:", result)

      if (!result) {
         console.error("CRITICAL: Gemini returned null/undefined - check backend terminal for error logs")
         // Return detailed error response so frontend can see what happened
         return res.status(500).json({
            response: "Gemini API returned empty response",
            details: "Check backend logs - Gemini call failed silently"
         })
      }

      const jsonMatch = result.match(/{[\s\S]*}/)
      if (!jsonMatch) {
         console.error("No JSON found in response:", result)
         return res.status(400).json({ response: "sorry, i can't understand" })
      }

      let gemResult;
      try {
         // Extract JSON and handle markdown code blocks
         let jsonString = jsonMatch[0]
         // Remove markdown code block formatting if present
         jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')

         gemResult = JSON.parse(jsonString)
      } catch (parseError) {
         console.error("JSON Parse Error:", parseError.message)
         console.error("Failed to parse:", jsonMatch[0])
         return res.status(400).json({ response: "Failed to parse response" })
      }

      console.log("Parsed Gemini Result:", gemResult)
      const type = gemResult.type

      switch (type) {
         case 'get-date':
            return res.json({
               type,
               userInput: gemResult.userInput,
               response: `current date is ${moment().format("YYYY-MM-DD")}`
            });
         case 'get-time':
            return res.json({
               type,
               userInput: gemResult.userInput,
               response: `current time is ${moment().format("hh:mm A")}`
            });
         case 'get-day':
            return res.json({
               type,
               userInput: gemResult.userInput,
               response: `today is ${moment().format("dddd")}`
            });
         case 'get-month':
            return res.json({
               type,
               userInput: gemResult.userInput,
               response: `today is ${moment().format("MMMM")}`
            });
         case 'google-search':
         case 'youtube-search':
         case 'youtube-play':
         case 'general':
         case "calculator-open":
         case "instagram-open":
         case "facebook-open":
         case "weather-show":
            return res.json({
               type,
               userInput: gemResult.userInput,
               response: gemResult.response,
            });

         default:
            // Defensive fallback: if Gemini returned a type we don't expect,
            // treat it as a 'general' response instead of returning 400.
            console.warn("Warning: Unknown gemini type received:", type)
            console.warn("Full gemResult:", gemResult)

            return res.json({
               type: 'general',
               userInput: gemResult.userInput || (gemResult.input || ''),
               response: gemResult.response || "Sorry, I couldn't process that request."
            })
      }

   } catch (error) {
      console.error("Ask Assistant Error:", error.message)
      console.error("Stack:", error.stack)
      return res.status(500).json({
         response: "ask assistant error",
         error: error.message,
         type: error.constructor.name
      })
   }
}

fetch('http://localhost:8000/api/user/asktoassistant', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   credentials: 'include',
   body: JSON.stringify({ command: 'hello' })
})
   .then(r => {
      console.log('Status:', r.status);
      return r.json().then(data => console.log('Body:', data));
   })
   .catch(console.error);