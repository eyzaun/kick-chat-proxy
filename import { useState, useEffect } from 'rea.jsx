import { useState, useEffect } from 'react';
import './channelconfig.css';

const ChannelConfig = ({ channelName, setChannelName, proxyUrl, setProxyUrl }) => {
  const [inputChannel, setInputChannel] = useState(channelName);
  const [inputProxy, setInputProxy] = useState(proxyUrl);
  const [configVisible, setConfigVisible] = useState(false);

  // Update inputs when props change
  useEffect(() => {
    setInputChannel(channelName);
    setInputProxy(proxyUrl);
  }, [channelName, proxyUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setChannelName(inputChannel.trim());
    setProxyUrl(inputProxy.trim());
    setConfigVisible(false);
  };

  return (
    <>
      <button 
        className="config-toggle-button"
        onClick={() => setConfigVisible(!configVisible)}
      >
        {configVisible ? '✕' : '⚙️'}
      </button>
      
      {configVisible && (
        <div className="channel-config">
          <h3>Chat Configuration</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="channelName">Kick.com Channel Name:</label>
              <input
                type="text"
                id="channelName"
                value={inputChannel}
                onChange={(e) => setInputChannel(e.target.value)}
                placeholder="e.g., eyzaun"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="proxyUrl">Proxy Server URL:</label>
              <input
                type="text"
                id="proxyUrl"
                value={inputProxy}
                onChange={(e) => setInputProxy(e.target.value)}
                placeholder="e.g., https://your-server.vercel.app"
              />
            </div>
            
            <div className="button-group">
              <button type="submit" className="save-button">Save & Connect</button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setConfigVisible(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChannelConfig;
