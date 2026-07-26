const OpenAI = require("openai");

const openai = new OpenAI({
    baseURL: "http://localhost:11434/v1", // Pointing to Ollama's local API
    apiKey: "ollama", // Required by the OpenAI SDK, but Ollama doesn’t validate it
});

module.exports = async function (prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: "deepseek-r1:7b", // Ensure this model is running
            messages: [{ role: "user", content: prompt }],
        });

        console.log(response);
        console.log(response.choices[0].message.content);
        return response
    } catch (error) {
        console.error("Error:", error.message);
    }
}