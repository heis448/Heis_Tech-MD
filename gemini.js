const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
    name: 'gemini',
    description: 'Ask a question to Gemini.',
    async execute({ sock, msg, args }) {
        const query = args.join(' ');
        if (!query) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a question.' }, { quoted: msg });
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(query);
            const response = await result.response;
            const text = response.text();
            await sock.sendMessage(msg.key.remoteJid, { text: text }, { quoted: msg });
        } catch (error) {
            console.error(error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Sorry, I couldn\'t get a response from Gemini.' }, { quoted: msg });
        }
    }
};