const os = require('os');

module.exports = {
    name: 'stats',
    description: 'Displays bot and server statistics.',
    async execute({ sock, msg, commands }) {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const cpuUsage = os.cpus();

        const statsText = `
*Bot Stats*
- Total Commands: ${commands.size}
- Platform: ${os.platform()}
- Arch: ${os.arch()}

*Server Stats*
- RAM Usage: ${(usedMemory / 1024 / 1024).toFixed(2)} MB / ${(totalMemory / 1024 / 1024).toFixed(2)} MB
- CPU: ${cpuUsage[0].model}
        `;
        await sock.sendMessage(msg.key.remoteJid, { text: statsText }, { quoted: msg });
    }
};