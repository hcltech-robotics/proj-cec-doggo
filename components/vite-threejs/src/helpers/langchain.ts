import { OpenAI } from "@langchain/openai";

const localStorageGUIConfigurations =
  localStorage.getItem("guiState") &&
  JSON.parse(localStorage.getItem("guiState") as string);
const apiKey =
  localStorageGUIConfigurations.folders.API_Keys.controllers.ChatGPT_key;

export const fetchLangChainResponse = async (prompt: string) => {
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  return await openai.generate([prompt]);
};
