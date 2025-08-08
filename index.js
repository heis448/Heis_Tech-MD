const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, jidDecode, proto, getContentType } = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const express = require("express");
const { exec } = require("child_process");
const readline = require("readline"); // Import readline
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Store for bot data
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

// Command handler
const commands = new Map();
fs.readdirSync('./commands').forEach(file => {
    if (file.endsWith('.js')) {
        const command = require(`./commands/${file}`);
        commands.set(command.name, command);
    }
});

let startTime = Date.now();

// Function to get user input from the console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // Set to false for pairing code
        auth: state,
        browser: ['My-Bot', 'Chrome', '1.0.0'],
    });

    store.bind(sock.ev);

    // This block is new! It handles the pairing code logic.
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('Please enter your WhatsApp number (with country code, e.g., 14155552671):\n');
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`Your pairing code is: ${code}`);
    }


    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const messageType = getContentType(msg.message);
        const from = msg.key.remoteJid;
        const body = (messageType === 'conversation') ? msg.message.conversation : (messageType === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';

        const prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi)[0] : /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi)[0] : '';
        const commandName = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        if (commands.has(commandName)) {
            const command = commands.get(commandName);
            try {
                await command.execute({ sock, msg, args, commands, startTime });
            } catch (error) {
                console.error(error);
                await sock.sendMessage(from, { text: 'An error occurred while executing the command.' }, { quoted: msg });
            }
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            startTime = Date.now();
            console.log('Connected to WhatsApp');
            rl.close(); // Close the readline interface after successful connection
        }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
}

// Keep the bot alive on hosting platforms
app.get('/', (req, res) => {
    res.send('WhatsApp Bot is running!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

connectToWhatsApp();