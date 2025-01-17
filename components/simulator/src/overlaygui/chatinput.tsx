import React, { useState } from 'react';
import { Send, Mic } from 'lucide-react';

const ChatInput = ({ onSend, onVoice }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-input-wrapper">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message to control the robot..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="button"
          className="chat-button"
          onClick={onVoice}
          aria-label="Voice input"
        >
          <Mic />
        </button>
        <button
          type="submit"
          className="chat-button"
          disabled={!message.trim()}
          aria-label="Send message"
        >
          <Send />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;