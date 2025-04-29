import { useState, useEffect, useRef } from 'react';
import kickChatService from './KickChatService';
import './chatavatar.css';

// List of emoji characters to use as avatars
const EMOJIS = ['😀', '😄', '😊', '🙂', '😎', '🤓', '🧐', '🤔', '🤗', '🤩', '😍', '🥳', '😜', '🤪', '😇', '🦄', '🐱', '🐶', '🦊', '🐼'];

// Maximum number of avatars to display at once
const MAX_AVATARS = 20;

// Time in milliseconds to display the message bubble
const MESSAGE_DISPLAY_TIME = 5000;

// Time in milliseconds to keep the avatar on screen
const AVATAR_LIFETIME = 30000;

const ChatAvatar = ({ channelName = 'eyzaun', proxyUrl }) => {
  const [avatars, setAvatars] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Use ref to track mounted state to prevent memory leaks
  const mounted = useRef(true);
  
  useEffect(() => {
    // Set up when component mounts
    mounted.current = true;
    
    // Connect to Kick.com chat via proxy
    if (channelName && proxyUrl) {
      kickChatService.connect(proxyUrl, channelName);
    }
    
    // Set up message listener
    const removeMessageListener = kickChatService.addMessageListener(handleNewMessage);
    
    // Set up status listener
    const removeStatusListener = kickChatService.addStatusListener(setConnectionStatus);
    
    // Clean up when component unmounts
    return () => {
      mounted.current = false;
      removeMessageListener();
      removeStatusListener();
      kickChatService.disconnect();
    };
  }, [channelName, proxyUrl]);
  
  // Handle new chat message
  const handleNewMessage = (message) => {
    if (!mounted.current) return;
    
    // Create a new avatar
    const newAvatar = {
      id: message.id,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      username: message.username,
      message: message.message,
      position: Math.random() * 80 + 10, // Random position between 10% and 90%
      showMessage: true,
      createdAt: Date.now(),
    };
    
    // Add the new avatar and ensure we don't exceed the maximum
    setAvatars(prev => {
      const updated = [...prev, newAvatar];
      return updated.length > MAX_AVATARS ? updated.slice(-MAX_AVATARS) : updated;
    });
    
    // Hide the message bubble after a delay
    setTimeout(() => {
      if (!mounted.current) return;
      setAvatars(prev => 
        prev.map(avatar => 
          avatar.id === message.id ? { ...avatar, showMessage: false } : avatar
        )
      );
    }, MESSAGE_DISPLAY_TIME);
    
    // Remove the avatar entirely after a longer delay
    setTimeout(() => {
      if (!mounted.current) return;
      setAvatars(prev => prev.filter(avatar => avatar.id !== message.id));
    }, AVATAR_LIFETIME);
  };
  
  return (
    <div className="chat-avatar-container">
      <div className="connection-status">
        Status: {connectionStatus} {connectionStatus === 'connected' ? '🟢' : '🔴'}
      </div>
      
      <div className="avatars-container">
        {avatars.map(avatar => (
          <div 
            key={avatar.id} 
            className="avatar"
            style={{ left: `${avatar.position}%` }}
          >
            {avatar.showMessage && (
              <div className="speech-bubble">
                <div className="username">{avatar.username}</div>
                <div className="message">{avatar.message}</div>
              </div>
            )}
            <div className="emoji-avatar">{avatar.emoji}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatAvatar;
