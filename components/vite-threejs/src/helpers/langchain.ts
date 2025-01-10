import { OpenAI } from "@langchain/openai";
import { Message } from "../components/chatwindow";

export const fetchLangChainResponse = async (
  prompt: Message[],
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

  const messages = prompt
    .map((message) => {
      return message.text;
    })
    .join();

  let combinedPrompt = `${initialContext}\n\n${message}`;

  if (messages.length) {
    combinedPrompt = `${initialContext}\n\n${messages}\n\n${message}`;
  }

  return await openai.generate([combinedPrompt]);
};
