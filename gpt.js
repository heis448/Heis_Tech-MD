const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
    name: 'gpt',
    description: 'Ask a question to ChatGPT.',
    async execute({ sock, msg, args }) {
        const query = args.join(' ');
        if (!query) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a question.' }, { quoted: msg });
        }

        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: 'user', content: query }],
                model: 'gpt-3.5-turbo',
            });
            await sock.sendMessage(msg.key.remoteJid, { text: completion.choices[0].message.content }, { quoted: msg });
        } catch (error) {
            console.error(error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Sorry, I couldn\'t get a response from ChatGPT.' }, { quoted: msg });
        }
    }
};