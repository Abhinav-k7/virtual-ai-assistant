// Run this in browser console after logging in to test the voice command flow
async function testVoiceCommandFlow() {
    console.log("=== Testing Voice Command Flow ===\n");

    // Step 1: Check authentication
    console.log("Step 1: Checking authentication...");
    let authResponse = await fetch("http://localhost:8000/api/test-auth", {
        credentials: "include",
    });
    let authData = await authResponse.json();
    console.log("Auth Status:", authResponse.status);
    console.log("Auth Data:", authData);

    if (!authData.success && authResponse.status !== 200) {
        console.error("❌ NOT AUTHENTICATED - Status:", authResponse.status);
        console.error("Please log in first!");
        return;
    }

    console.log("✅ Authenticated\n");

    // Step 2: Get current user
    console.log("Step 2: Getting current user...");
    let userResponse = await fetch("http://localhost:8000/api/user/current", {
        credentials: "include",
    });
    let userData = await userResponse.json();
    console.log("User:", userData.name);
    console.log("Assistant Name:", userData.assistantName);
    console.log("✅ Got user\n");

    // Step 3: Test the full flow with a simple command
    console.log("Step 3: Sending test command...");
    console.log("Command: 'hello'");

    let assistantResponse = await fetch(
        "http://localhost:8000/api/user/asktoassistant",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ command: "hello" }),
        }
    );

    console.log("Response Status:", assistantResponse.status);
    let assistantData = await assistantResponse.json();
    console.log("Response Data:", assistantData);

    if (assistantResponse.status === 500) {
        console.error("❌ Got 500 Error");
        console.error("Details:", assistantData.details);
        console.error("\n⚠️ Check the backend terminal for detailed logs!");
        console.error("You should see logs like:");
        console.error("- 'geminiResponse called with: ...'");
        console.error("- 'Using model: gemini-2.0-flash'");
        console.error("- 'Gemini API Response Status: 200' or an error");
    } else if (assistantResponse.ok) {
        console.log("✅ Success!");
        console.log("Type:", assistantData.type);
        console.log("Response:", assistantData.response);
    }
}

// Copy this entire function into your browser console
// Make sure you're logged in first
// Then type: testVoiceCommandFlow()
console.log("Function loaded! Now type: testVoiceCommandFlow()");