#!/usr/bin/env node

/**
 * Comprehensive test suite for Virtual Assistant
 * Run with: node full-test.js
 */

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BACKEND_URL = "http://localhost:8000";
let testsPassed = 0;
let testsFailed = 0;

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
};

function log(message, color = "reset") {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
    log(`\n▶️  Testing: ${name}`, "cyan");
}

function logPass(message) {
    log(`✅ ${message}`, "green");
    testsPassed++;
}

function logFail(message) {
    log(`❌ ${message}`, "red");
    testsFailed++;
}

function logInfo(message) {
    log(`ℹ️  ${message}`, "blue");
}

async function testBackendConnection() {
    logTest("Backend Connection");
    try {
        const response = await axios.get(`${BACKEND_URL}/api/test-gemini`, {
            timeout: 5000,
        });
        if (response.status === 200) {
            logPass("Backend is running and responding");
        }
    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            logFail(
                "Backend is not running. Start it with: cd backend; node index.js"
            );
        } else {
            logFail(`Backend error: ${error.message}`);
        }
    }
}

async function testGeminiAPI() {
    logTest("Gemini API Connection");
    try {
        const response = await axios.get(`${BACKEND_URL}/api/test-gemini`, {
            timeout: 10000,
        });

        if (response.data.success) {
            logPass("Gemini API is accessible and returning responses");
            logInfo(`Response length: ${response.data.result.length} characters`);
        } else {
            logFail("Gemini API returned an error");
            logInfo(`Error: ${response.data.error}`);
        }
    } catch (error) {
        logFail(`Gemini API test failed: ${error.message}`);
    }
}

async function testEnvironment() {
    logTest("Environment Configuration");

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL;

    if (!apiKey) {
        logFail("GEMINI_API_KEY is not set in .env");
    } else {
        logPass(
            `GEMINI_API_KEY is set (${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)})`
        );
    }

    if (!model) {
        logFail("GEMINI_MODEL is not set in .env");
    } else if (model === "gemini-2.0-flash") {
        logPass(`GEMINI_MODEL is set to: ${model}`);
    } else {
        logFail(`GEMINI_MODEL is set to: ${model} (expected: gemini-2.0-flash)`);
    }
}

async function testFullFlow() {
    logTest("Full Flow (Gemini → Parsing → Response)");
    try {
        const response = await axios.get(`${BACKEND_URL}/api/test-full`, {
            timeout: 15000,
        });

        if (response.data.success) {
            logPass("Full flow completed successfully");
            logInfo(`Type: ${response.data.gemResult.type}`);
            logInfo(`Response: ${response.data.gemResult.response}`);
        } else {
            logFail("Full flow returned an error");
            logInfo(`Error: ${response.data.error}`);
        }
    } catch (error) {
        logFail(`Full flow test failed: ${error.message}`);
        if (error.response?.data?.error) {
            logInfo(`Details: ${error.response.data.error}`);
        }
    }
}

async function testDirectAPI() {
    logTest("Direct Gemini API (without backend)");
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

        if (!apiKey) {
            logFail("API key not available in environment");
            return;
        }

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
            {
                contents: [
                    {
                        parts: [{ text: "Say hello in one word" }],
                    },
                ],
            },
            { timeout: 10000 }
        );

        if (response.status === 200) {
            logPass("Direct Gemini API call successful");
            const text = response.data.candidates[0].content.parts[0].text;
            logInfo(`Response: ${text.substring(0, 50)}`);
        }
    } catch (error) {
        if (error.response?.status === 401) {
            logFail("Gemini API: Unauthorized (invalid API key)");
        } else if (error.response?.status === 429) {
            logFail("Gemini API: Rate limited");
        } else {
            logFail(`Direct API test failed: ${error.message}`);
        }
    }
}

async function runAllTests() {
    log("\n╔════════════════════════════════════════╗", "cyan");
    log("║   Virtual Assistant Test Suite         ║", "cyan");
    log("╚════════════════════════════════════════╝\n", "cyan");

    await testEnvironment();
    await testBackendConnection();
    await testDirectAPI();
    await testGeminiAPI();
    await testFullFlow();

    log("\n╔════════════════════════════════════════╗", "cyan");
    log(`║   Results: ${testsPassed} Passed  │  ${testsFailed} Failed        ║`, "cyan");
    log("╚════════════════════════════════════════╝\n", "cyan");

    if (testsFailed === 0) {
        log("All tests passed! ✨", "green");
        log(
            "\nNext step: Log into the app and test voice commands via the browser."
        );
    } else {
        log(`${testsFailed} test(s) failed. See details above.`, "red");
        log("\nTroubleshooting steps:");
        log("1. Check backend is running: netstat -ano | findstr :8000", "yellow");
        log(
            "2. Check .env file has valid GEMINI_API_KEY and GEMINI_MODEL",
            "yellow"
        );
        log(
            "3. Check internet connection for Gemini API access",
            "yellow"
        );
        log("4. Check backend logs for error details", "yellow");
    }
}

runAllTests();
