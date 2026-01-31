
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple script to list models
async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("Error: GEMINI_API_KEY is not set.");
        console.error("Usage: set GEMINI_API_KEY=your_key && node scripts/list-models.js");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        // Note: listModels might not be directly exposed on genAI instance in all SDK versions,
        // but let's try the standard way or use the model manager if available.
        // Actually, usually it is not on the client but we can try to get a model and catch error, 
        // or just try a standard request to see if it works.
        // Wait, the SDK does not have a 'listModels' helper easily accessible in the simplified client?
        // Let's check typical usage. 
        // Actually, for the JS SDK, listing models is not always straightforward without using the REST API directly or specific helper.
        // Let's try to just run a simple generateContent with "gemini-1.5-flash" and see if it works here (isolation test).

        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success! gemini-1.5-flash is working.");
        console.log("Response:", result.response.text());

    } catch (e) {
        console.error("\nFailed with gemini-1.5-flash:");
        console.error(e.message);

        console.log("\n--------------------------------\n");
        console.log("Testing gemini-pro...");
        try {
            const genAI2 = new GoogleGenerativeAI(key);
            const model2 = genAI2.getGenerativeModel({ model: "gemini-pro" });
            const result2 = await model2.generateContent("Hello");
            console.log("Success! gemini-pro is working.");
            console.log("Response:", result2.response.text());
        } catch (e2) {
            console.error("\nFailed with gemini-pro:");
            console.error(e2.message);
        }
    }
}

listModels();
