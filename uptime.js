module.exports = {
    name: 'uptime',
    description: 'Shows how long the bot has been running.',
    async execute({ sock, msg, startTime }) {
        const uptime = Date.now() - startTime;
        const seconds = Math.floor((uptime / 1000) % 60);
        const minutes = Math.floor((uptime / (1000 * 60)) % 60);
        const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        await sock.sendMessage(msg.key.remoteJid, { text: `Uptime: ${uptimeString}` }, { quoted: msg });
    }
};