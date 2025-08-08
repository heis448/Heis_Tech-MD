const ytdl = require('ytdl-core');
const fs = require('fs');

module.exports = {
    name: 'music',
    description: 'Download music from YouTube.',
    async execute({ sock, msg, args }) {
        const url = args[0];
        if (!ytdl.validateURL(url)) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a valid YouTube URL.' }, { quoted: msg });
        }

        try {
            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;
            const stream = ytdl(url, { filter: 'audioonly' });
            const filePath = `./temp_${title}.mp3`;

            stream.pipe(fs.createWriteStream(filePath));
            stream.on('end', async () => {
                await sock.sendMessage(msg.key.remoteJid, { audio: { url: filePath }, mimetype: 'audio/mp4' }, { quoted: msg });
                fs.unlinkSync(filePath);
            });
        } catch (error) {
            console.error(error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to download the music.' }, { quoted: msg });
        }
    }
};