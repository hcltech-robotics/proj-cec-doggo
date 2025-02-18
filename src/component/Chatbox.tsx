import { History, Mic, Send } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';
import { LlmCommunicationService } from 'src/service/LlmCommunicationService';
import { RobotCommunication } from 'src/service/RobotCommunicationService';

import './Chatbox.css';

export const Chatbox = (props: { connection: RobotCommunication; llm: LlmCommunicationService }) => {
  const [input, setInput] = useState('');

  const textarea = useRef<HTMLTextAreaElement>(null);

  const inputChange: FormEventHandler<HTMLTextAreaElement> = (event) => {
    setInput((event.target as HTMLTextAreaElement).value);
    if (textarea.current) {
      textarea.current.style.height = '1.2em';
      if (textarea.current.scrollHeight > 36) {
        textarea.current.style.height = `${textarea.current.scrollHeight}px`;
      }
    }
  };

  return (
    <div className="chatbox">
      <div className="chat-controls">
        <textarea className="chat-textarea" placeholder="Chat with the robot..." onInput={inputChange} ref={textarea}></textarea>
        <button className="chat-button">
          <Mic />
        </button>
        <button className="chat-button" disabled={input.trim().length === 0}>
          <Send />
        </button>
        <button className="chat-button">
          <History />
        </button>
      </div>
    </div>
  );
};
