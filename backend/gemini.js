/************************************************************
 *  MODULE 1 — IMPORTS & AXIOS RETRY CONFIG
 ************************************************************/
import axios from "axios";
import axiosRetry from "axios-retry";

// Configure retries with shorter delays for faster response
axiosRetry(axios, {
    retries: 2, // Reduced from 3
    retryDelay: (retryCount) => retryCount * 500, // 500ms, 1000ms (faster than exponential)
    retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            error.response?.status === 429;
    },
});

// Response cache to avoid duplicate API calls
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes


/************************************************************
 *  MODULE 2 — CACHE MANAGEMENT
 ************************************************************/
const getCachedResponse = (cacheKey) => {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log("⚡ [CACHE HIT]", cacheKey);
        return cached.data;
    }
    responseCache.delete(cacheKey);
    return null;
};

const setCachedResponse = (cacheKey, data) => {
    responseCache.set(cacheKey, {
        data,
        timestamp: Date.now()
    });
};

const createCacheKey = (command) => {
    return command.toLowerCase().trim();
};


/************************************************************
 *  MODULE 3 — HELPER: LIST AVAILABLE MODELS (OPTIONAL)
 ************************************************************/
const listModels = async (apiKey) => {
    try {
        const res = await axios.get(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
            { timeout: 5000 } // 5 second timeout
        );
        console.log("Available Models:", res.data.models.map(m => m.name).slice(0, 3));
    } catch (err) {
        console.log("Model list fetch skipped (dev mode)");
    }
};


/************************************************************
 *  MODULE 4 — IMPROVED PROMPT WITH CONVERSATION HISTORY
 ************************************************************/
const buildPrompt = (command, assistantName, userName, conversationHistory = []) => {
    // Include last 3 messages from history for minimal context
    let historyContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-3); // Last 3 messages only
        historyContext = `\nRecent context:\n`;
        recentHistory.forEach((msg) => {
            if (msg.command && msg.response) {
                historyContext += `Q: ${msg.command}\nA: ${msg.response}\n`;
            }
        });
    }

    return `You are ${assistantName}. Respond DIRECTLY and CONCISELY (20-30 words max).

${historyContext}
RESPOND ONLY with valid JSON (no extra text):
{
  "type": "general|google-search|youtube-play|get-time|get-date|get-day|get-month|calculator-open|weather-show|explain|how-to|recommendation",
  "userInput": "${command.replace(/"/g, '\\"')}",
  "response": "Direct answer only, 20-50 words max",
  "searchQuery": "extracted search term (for search/youtube only)"
}

Rules:
- DIRECT answers only. NO greetings, NO questions back
- 20-50 words MAX
- 'general' type for most queries
- 'google-search' only if user asks to search - EXTRACT search term in searchQuery
- 'youtube-play' only if user asks to play/watch/open video - EXTRACT video name in searchQuery
- Do NOT ask follow-up questions or add extra text

User command: ${command}`;
};


/************************************************************
 *  MODULE 5 — JSON PARSER
 ************************************************************/
const extractJSON = (raw) => {
    const match = raw.match(/{[\s\S]*}/);
    if (!match) return null;

    let jsonString = match[0]
        .replace(/^```(?: json) ?\n ?/, "")
        .replace(/\n?```$/, "");

    try {
        return JSON.parse(jsonString);
    } catch (err) {
        return null;
    }
};


/************************************************************
 *  MODULE 6 — OPTIMIZED GEMINI API CALL (FASTER)
 ************************************************************/
const callGeminiAPI = async (model, apiKey, prompt) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

    const startTime = Date.now();

    const response = await axios.post(apiUrl, {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150, // ✅ REDUCED to 150 for concise, natural responses
            topK: 40,
            topP: 0.95
        }
    }, {
        timeout: 30000 // ✅ INCREASED to 30 seconds (Gemini can be slow)
    });

    const responseTime = Date.now() - startTime;
    console.log(`⚡ API Response Time: ${responseTime}ms`);

    return response.data.candidates[0].content.parts[0].text;
};


/************************************************************
 *  MODULE 7 — MAIN FUNCTION (WITH CONVERSATION HISTORY)
 ************************************************************/
const geminiResponse = async (command, assistantName, userName, conversationHistory = []) => {
    console.log("\n🚀 Processing command:", command);

    // Special handling for "who created you" to say username instead of Google
    if (command.toLowerCase().includes("who created you")) {
        return {
            type: "general",
            userInput: command,
            response: `${userName} created me.`,
            searchQuery: ""
        };
    }

    // Special handling for "open youtube" to open in browser
    if (command.toLowerCase().includes("open youtube")) {
        return {
            type: "youtube-play",
            userInput: command,
            response: "Opening YouTube in browser.",
            searchQuery: "youtube"
        };
    }

    // Check cache first
    const cacheKey = createCacheKey(command);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
        return cached;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let model = process.env.GEMINI_MODEL || "gemini-2.0-flash"; // Faster model
    const fallbackModel = "gemini-1.5-flash"; // Also fast

    const prompt = buildPrompt(command, assistantName, userName, conversationHistory);

    let raw;
    try {
        raw = await callGeminiAPI(model, apiKey, prompt);
    } catch (err) {
        // Handle timeout errors specifically
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            console.warn(`⚠️ Model ${model} timeout (${err.message}). Trying: ${fallbackModel}`);
            try {
                raw = await callGeminiAPI(fallbackModel, apiKey, prompt);
            } catch (fallbackErr) {
                console.error("❌ Fallback model also failed:", fallbackErr.message);
                return {
                    type: "general",
                    userInput: command,
                    response: "Sorry, the AI service is taking too long to respond. Please try again."
                };
            }
        } else if (err.response?.status === 404) {
            console.log(`⚠️ Model ${model} not found. Trying: ${fallbackModel}`);
            try {
                raw = await callGeminiAPI(fallbackModel, apiKey, prompt);
            } catch (fallbackErr) {
                console.error("❌ Fallback model also failed:", fallbackErr.message);
                return {
                    type: "general",
                    userInput: command,
                    response: "Sorry, I'm temporarily unavailable."
                };
            }
        } else {
            console.error("❌ Gemini API error:", err.message);
            return {
                type: "general",
                userInput: command,
                response: "Error connecting to AI service. Please try again."
            };
        }
    }

    const parsed = extractJSON(raw);

    if (!parsed) {
        console.warn("⚠️ Failed to parse JSON response");
        return {
            type: "general",
            userInput: command,
            response: "Sorry, I couldn't understand that."
        };
    }

    // Cache the response
    setCachedResponse(cacheKey, parsed);

    return parsed;
};

export default geminiResponse;