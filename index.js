const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const kickConnections = new Map();

function connectToKickChat(channelName) {
  if (kickConnections.has(channelName)) {
    kickConnections.get(channelName).close();
  }

  console.log(`Connecting to Kick.com chat for channel: ${channelName}`);
  
  const kickWsUrl = 'wss://ws-mt1.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.4.0&flash=false';
  
  const ws = new WebSocket(kickWsUrl);
  
  ws.on('open', () => {
    console.log(`Connected to Kick.com chatroom for ${channelName}`);
    
    const subscribeMsg = {
      event: 'pusher:subscribe',
      data: {
        auth: '',
        channel: `chatrooms.${channelName}`
      }
    };
    ws.send(JSON.stringify(subscribeMsg));
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`Received message from Kick: ${message.event}`);
      
      io.to(channelName).emit('kickMessage', message);
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${channelName}:`, error);
    setTimeout(() => reconnectToKickChat(channelName), 5000);
  });

  ws.on('close', () => {
    console.log(`Connection closed for ${channelName}`);
    setTimeout(() => reconnectToKickChat(channelName), 5000);
  });

  kickConnections.set(channelName, ws);
  return ws;
}

function reconnectToKickChat(channelName, attempt = 0) {
  const maxAttempts = 10;
  const baseDelay = 1000;
  
  if (attempt < maxAttempts) {
    const delay = Math.min(30000, baseDelay * Math.pow(2, attempt));
    console.log(`Reconnecting to ${channelName} in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);
    
    setTimeout(() => {
      connectToKickChat(channelName);
    }, delay);
  } else {
    console.error(`Max reconnection attempts reached for ${channelName}`);
  }
}

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('joinChannel', (channelName) => {
    console.log(`Client joining channel: ${channelName}`);
    
    socket.join(channelName);
    
    if (!kickConnections.has(channelName)) {
      connectToKickChat(channelName);
    }
  });
  
  socket.on('leaveChannel', (channelName) => {
    socket.leave(channelName);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Kick.com Chat Proxy Server' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;