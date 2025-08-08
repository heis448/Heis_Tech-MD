module.exports = {
    name: 'menu',
    description: 'Displays the command menu.',
    async execute({ sock, msg, commands }) {
        const menuImage = {
            image: { url: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png' }, // Replace with your image URL
            caption: `
*WhatsApp Bot Menu*

Here are the available commands:
${[...commands.values()].map(cmd => `- *${cmd.name}*: ${cmd.description}`).join('\n')}
            `
        };
        await sock.sendMessage(msg.key.remoteJid, menuImage, { quoted: msg });
    }
};