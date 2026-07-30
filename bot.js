const bedrock = require('bedrock-protocol');
const express = require('express');

// --- 1. START A WEBSERVER FOR RENDER HEALTH CHECKS ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('AFK Bot is alive and running!');
});

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});

// --- 2. CONFIGURATION ---
const SERVER_IP = 'oneblock-Kifb.aternos.me'; // Quotes around string
const SERVER_PORT = 24811;                    // Your Aternos Bedrock port
const BOT_NAME = 'afkbot';                   // Your desired bot username

function connectBot() {
  console.log('Connecting bot to server...');

  const client = bedrock.createClient({
    host: SERVER_IP,
    port: SERVER_PORT,
    username: BOT_NAME,
    offline: true // Set to true if your Aternos server is in Cracked mode
  });

  client.on('join', () => {
    console.log(`Bot ${BOT_NAME} successfully joined the server!`);

    // Keep-alive chat loop every 60 seconds
    setInterval(() => {
      try {
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          xuid: '',
          platform_chat_id: '',
          message: 'AFK Ping'
        });
      } catch (err) {
        console.error('Ping error:', err.message);
      }
    }, 60000);
  });

  client.on('kick', (reason) => {
    console.log('Kicked from server:', reason);
    reconnect();
  });

  client.on('error', (err) => {
    console.error('Bot encountered error:', err.message);
  });

  client.on('close', () => {
    console.log('Connection closed.');
    reconnect();
  });
}

// Auto-reconnect handler if server restarts or bot drops
let isReconnecting = false;
function reconnect() {
  if (isReconnecting) return;
  isReconnecting = true;
  console.log('Attempting to reconnect in 30 seconds...');
  setTimeout(() => {
    isReconnecting = false;
    connectBot();
  }, 30000);
}

// Start the bot connection
connectBot();
