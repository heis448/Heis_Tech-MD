module.exports = {
    name: 'ping',
    description: 'Check the bot\'s latency.',
    async execute({ sock, msg }) {
        const startTime = Date.now();
        const sentMsg = await sock.sendMessage(msg.key.remoteJid, { text: 'Pinging...' }, { quoted: msg });
        const endTime = Date.now();
        const latency = endTime - startTime;
        await sock.sendMessage(msg.key.remoteJid, { text: `Pong! Latency: ${latency}ms` }, { quoted: sentMsg });
    }
};