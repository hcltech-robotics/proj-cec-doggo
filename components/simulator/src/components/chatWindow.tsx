import React, { useEffect, useRef, useState } from "react";
import { InteractWithAI } from "../helpers/interact-with-ai";
import ChatInput from "../overlaygui/chatinput";

import "./chatWindow.css";

export interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant" | "system";
  image: string | null;
}

const getDisplayDuration = (messageLength: number) => {
  const baseTime = 2000;
  const maxTime = 8000;
  const lengthFactor = 50;
  const extraTime = Math.min(Math.ceil(messageLength / lengthFactor) * 1000, maxTime);
  return baseTime + extraTime;
};

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={`message ${message.sender}`}>
      {message.image && (
        <img src={message.image} alt="Attached image" />
      )}
      <span>{message.text}</span>
    </div>
  );
};

const ChatWindow: React.FC<{ ai: InteractWithAI }> = ({ ai }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyActive, setHistoryActive] = useState<boolean>(false);
  const [notificationMessages, setNotificationMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const historyProps = {
    isHistoryActive: historyActive,
    onHistoryActive: (isHistoryActive: boolean) => setHistoryActive(isHistoryActive),
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: "user",
      image: null,
    };

    setMessages([...messages, newMessage]);
    setNewNotificationMessage(newMessage);

    const results = await ai.invoke(message);
    results.forEach(result => {
      const assistantMessage: Message = {
        id: messages.length + 2,
        text: result.text,
        image: result.image,
        sender: "assistant",
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setNewNotificationMessage(assistantMessage);
    });
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const setNewNotificationMessage = (message: Message) => {
    const id = new Date().getTime();
    const newNotificationMessage: Message = {...message, id};
    const duration = getDisplayDuration(message.text.length);

    setNotificationMessages((prevNotificationMessages: Message[]) => [
      ...prevNotificationMessages,
      newNotificationMessage as Message,
    ]);

    setTimeout(() => {
      setNotificationMessages((prevNotificationMessages) =>
        prevNotificationMessages.filter((msg) => msg.id !== id && msg.id > id)
      );
    }, duration);
  };

  return (
    <div className="chat-window-wrapper">
      <div className="chat-window">
        <div className="notification-messages-container">
          {!historyActive && notificationMessages.map((message) => <ChatMessage key={message.id} message={message} />)}
        </div>
        <div className={`message-list ${historyActive ? "active" : ""}`}>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSend={(message) => sendMessage(message)} history={historyProps} hasMessage={!messages.length} />
      </div>
    </div>
  );
};

export default ChatWindow;
