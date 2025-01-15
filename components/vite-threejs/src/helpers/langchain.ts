import { OpenAI } from "@langchain/openai";
import { Message } from "../components/chatWindow";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";

export const fetchLangChainResponse = async (
  chatHistory: Message[],
  message: string,
  initialMessage: string
) => {
  const initialContext = initialMessage;
  const localStorageGUIConfigurations =
    localStorage.getItem("guiState") &&
    JSON.parse(localStorage.getItem("guiState") as string);
  const apiKey =
    localStorageGUIConfigurations?.folders.Controls.controllers.apiKey;

  const openai = new OpenAI({
    apiKey,
  });

  let messages = undefined;

  if (!chatHistory.length) {
    messages = [new HumanMessage(message)];
  } else {
    messages = chatHistory.map((chat) => {
      switch (chat.sender) {
        case "user":
          return new HumanMessage(chat.text);
        case "bot":
          return new AIMessage(chat.text);
        case "system":
          return new SystemMessage(chat.text);
        default:
          return new HumanMessage(chat.text);
      }
    });
    messages.push(new HumanMessage(message));
  }

  messages.unshift(new SystemMessage(initialContext));

  return await openai.invoke(messages);
};
