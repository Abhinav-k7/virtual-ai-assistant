//this file is for testing JSON extraction and parsing from a string response
//this file during deployment we can exclude it
//// Test the JSON extraction and parsing
const response = `\`\`\`json
{
  "type": "general",
  "userInput": "hello",
  "response": "Hello there!"
}
\`\`\``;

console.log("Original response:", response);

const jsonMatch = response.match(/{[\s\S]*}/);
console.log("JSON Match:", jsonMatch);

if (jsonMatch) {
    let jsonString = jsonMatch[0];
    console.log("Before cleanup:", jsonString);

    // Remove markdown code block formatting if present
    jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    console.log("After cleanup:", jsonString);

    try {
        const parsed = JSON.parse(jsonString);
        console.log("Parsed successfully:", parsed);
    } catch (error) {
        console.error("Parse error:", error.message);
    }
}
