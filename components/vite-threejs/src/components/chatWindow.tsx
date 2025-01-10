import React, { useEffect, useRef, useState } from "react";
import ChatInput from "../overlaygui/chatinput";
import { fetchLangChainResponse } from "../helpers/langchain";
import "./chatWindow.css";

export interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const systemMessageFileLocation = "/chat-system-message";

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
  const [fileContent, setFileContent] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const historyProps = {
    isHistoryActive: historyActive,
    onHistoryActive: (isHistoryActive: boolean) =>
      setHistoryActive(isHistoryActive),
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadFile = async () => {
      try {
        const markdown = await fetch(`${systemMessageFileLocation}.md`);
        const text = await markdown.text();
        setFileContent(text);
      } catch (error) {
        console.error("Error fetching file:", error);
      }
    };

    loadFile();
  }, []);

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

    const result = await fetchLangChainResponse(messages, message, fileContent);
    const botMessage: Message = {
      id: messages.length + 2,
      text: result.generations[0][0].text,
      sender: "bot",
    };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
