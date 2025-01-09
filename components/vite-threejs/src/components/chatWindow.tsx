import React, { useEffect, useRef, useState } from "react";
import ChatInput from "../overlaygui/chatinput";
import { fetchLangChainResponse } from "../helpers/langchain";
import "./chatWindow.css";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={`message ${message.sender}`}>
      <span>{message.text}</span>
    </div>
  );
};

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [historyActive, setHistoryActive] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: "user",
    };
    setMessages([...messages, newMessage]);

    // Simulate bot response
    /* setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: `Echo: ${message}`,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1000); */

    setInput("");

    const result = await fetchLangChainResponse(message);
    const botMessage: Message = {
        id: messages.length + 2,
        text: `Echo: ${result.generations[0][0].text}`,
        sender: "bot",
      };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const historyProps = {
    isHistoryActive: historyActive,
    onHistoryActive: (isHistoryActive: boolean) =>
      setHistoryActive(isHistoryActive),
  };

  return (
    <div className="chat-window-wrapper">
      <div className="chat-window">
        <div className={`message-list ${historyActive ? "active" : ""}`}>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput
          onSend={(message) => sendMessage(message)}
          history={historyProps}
          hasMessage={!messages.length}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
