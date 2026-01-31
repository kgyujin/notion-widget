
// Script to check API key and list models using direct REST call
// This bypasses the SDK to verify if the key works and what models are visible.

import https from 'https';

const key = process.env.GEMINI_API_KEY;

if (!key) {
    console.error("Error: GEMINI_API_KEY is not set.");
    console.error("Usage: set GEMINI_API_KEY=your_key && node scripts/check-api.js");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log(`Checking API access for key: ${key.substring(0, 5)}...`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);

            if (res.statusCode !== 200) {
                console.error(`\n❌ API Request Failed (Status: ${res.statusCode})`);
                console.error("Error Details:", JSON.stringify(json, null, 2));
                return;
            }

            if (!json.models) {
                console.log("No models found in response.");
                console.log(json);
                return;
            }

            console.log("\n✅ API Key is Valid! Available Models:");
            console.log("----------------------------------------");
            const models = json.models
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name.replace('models/', ''));

            models.forEach(m => console.log(`- ${m}`));
            console.log("----------------------------------------");

        } catch (e) {
            console.error("Failed to parse response:", e.message);
            console.log("Raw output:", data);
        }
    });

}).on('error', (err) => {
    console.error("Network Error:", err.message);
});
