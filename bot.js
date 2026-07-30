const bedrock = require('bedrock-protocol');
const express = require('express');

// --- 1. WEBSERVER FOR RENDER HEALTH CHECKS ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('AFK Bot is alive and running!');
});

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});

// --- 2. CONFIGURATION ---
const SERVER_IP = 'oneblock-Kifb.aternos.me';
const SERVER_PORT = 24811;

function connectBot() {
  console.log('Connecting bot to server...');

  const client = bedrock.createClient({
    host: SERVER_IP,
    port: SERVER_PORT,
    // REAL AUTHENTICATION SETUP (Bypasses 'not_authenticated' kick)
    offline: false,              // Must be false for Bedrock protocol authentication
    profilesFolder: './.mca',    // Stores session tokens so you only log in once
    onMsaCode: (data) => {       // Prints authentication link in Render logs
      console.log('==================================================');
      console.log('AUTHENTICATION REQUIRED:');
      console.log(`1. Go to: ${data.verification_uri}`);
      console.log(`2. Enter code: ${data.user_code}`);
      console.log('==================================================');
    }
  });

  client.on('join', () => {
    console.log(`SUCCESS: Bot connected to ${SERVER_IP}!`);

    // Anti-AFK Chat Keep-alive every 60 seconds
    setInterval(() => {
      try {
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username || 'AFKBot',
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
    console.error('Bot error:', err.message);
  });

  client.on('close', () => {
    console.log('Connection closed.');
    reconnect();
  });
}

// Auto-reconnect handler
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

// Start the bot
connectBot();
