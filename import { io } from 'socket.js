import { io } from 'socket.io-client';

class KickChatService {
  constructor() {
    this.socket = null;
    this.channelName = null;
    this.messageListeners = [];
    this.statusListeners = [];
    this.connectionStatus = 'disconnected';
  }

  connect(proxyUrl, channelName) {
    // Disconnect if already connected
    if (this.socket) {
      this.disconnect();
    }

    this.channelName = channelName;
    
    // Connect to the proxy server
    this.socket = io(proxyUrl);
    
    this.socket.on('connect', () => {
      console.log('Connected to proxy server');
      this.setStatus('connected');
      
      // Join the specific channel
      this.socket.emit('joinChannel', channelName);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.setStatus('error');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from proxy server');
      this.setStatus('disconnected');
    });
    
    this.socket.on('kickMessage', this.handleKickMessage.bind(this));
  }
  
  disconnect() {
    if (this.socket) {
      if (this.channelName) {
        this.socket.emit('leaveChannel', this.channelName);
      }
      this.socket.disconnect();
      this.socket = null;
      this.channelName = null;
      this.setStatus('disconnected');
    }
  }
  
  handleKickMessage(message) {
    // Only process chat messages
    if (message.event === 'App\\Events\\ChatMessageEvent') {
      try {
        const data = JSON.parse(message.data);
        const chatMessage = {
          id: data.id || `msg-${Date.now()}-${Math.random()}`,
          username: data.sender?.username || 'Anonymous',
          message: data.message || '',
          timestamp: new Date().toISOString(),
          raw: data
        };
        
        // Notify all listeners
        this.notifyMessageListeners(chatMessage);
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    }
  }
  
  addMessageListener(listener) {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }
  
  addStatusListener(listener) {
    this.statusListeners.push(listener);
    // Immediately notify with current status
    listener(this.connectionStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }
  
  notifyMessageListeners(message) {
    this.messageListeners.forEach(listener => listener(message));
  }
  
  setStatus(status) {
    this.connectionStatus = status;
    this.statusListeners.forEach(listener => listener(status));
  }
}

// Create singleton instance
const kickChatService = new KickChatService();
export default kickChatService;
