const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

let pairingCode = '';
let connected = false;

module.exports = async (req, res) => {
  const { state, saveState } = useSingleFileAuthState('./session.json');

  if (!connected) {
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['AbuzarBot', 'Chrome', '1.0.0'],
    });

    sock.ev.on('connection.update', ({ connection, pairingCode: code }) => {
      if (code) pairingCode = code;
      if (connection === 'open') connected = true;
    });

    sock.ev.on('creds.update', saveState);
  }

  if (req.url.includes('/api/download')) {
    if (fs.existsSync('./session.json')) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="session.json"');
      return res.end(fs.readFileSync('./session.json'));
    } else {
      return res.end('❌ Session not ready.');
    }
  }

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ pairingCode }));
};
