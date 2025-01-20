import React, { FormEvent, useRef, useState } from "react";
import { Send, Mic, History } from "lucide-react";
import { handleOnVoice } from "../helpers/speechRecognition";

interface ChatInputProps {
  onSend: (message: string) => void;
  history: {
    isHistoryActive: boolean;
    onHistoryActive: (isActive: boolean) => void;
  };
  hasMessage: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  history,
  hasMessage,
}) => {
  const { isHistoryActive, onHistoryActive } = history;
  const [message, setMessage] = useState<string>("");
  const [isActiveSpeechRecognition, setIsActiveSpeechRecognition] =
    useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
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
          ref={inputRef}
        />
        <button
          type="button"
          className={`chat-button ${
            isActiveSpeechRecognition ? "active-speech-recognition" : ""
          }`}
          onClick={() =>
            handleOnVoice(setMessage, setIsActiveSpeechRecognition, inputRef)
          }
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
        <button
          type="button"
          className="chat-button"
          disabled={hasMessage}
          onClick={() => onHistoryActive(!isHistoryActive)}
          aria-label="Chat history visibility"
        >
          <History />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
