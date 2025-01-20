import { ChatOpenAI } from "@langchain/openai";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { Message } from "../components/chatWindow";

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

  const llm = new ChatOpenAI({
    apiKey,
  });

  const calculatorSchema = z.object({
    operation: z
      .enum(["add", "subtract", "multiply", "divide"])
      .describe("The type of operation to execute."),
    number1: z.number().describe("The first number to operate on."),
    number2: z.number().describe("The second number to operate on."),
  });

  const calculatorTool = tool(
    async ({ operation, number1, number2 }) => {
      if (operation === "add") {
        return `${number1 + number2}`;
      } else if (operation === "subtract") {
        return `${number1 - number2}`;
      } else if (operation === "multiply") {
        return `${number1 * number2}`;
      } else if (operation === "divide") {
        return `${number1 / number2}`;
      } else {
        throw new Error("Invalid operation.");
      }
    },
    {
      name: "calculator",
      description: "Can perform mathematical operations.",
      schema: calculatorSchema,
    }
  );

  let messages = undefined;
  if (!chatHistory.length) {
    messages = [new HumanMessage(message)];
  } else {
    messages = chatHistory.map((chat) => {
      switch (chat.sender) {
        case "user":
          return new HumanMessage(chat.text);
        case "assistant":
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

  const llmWithTools = llm.bindTools([calculatorTool]);
  const aiMessage = await llmWithTools.invoke(messages);

  /* if (aiMessage?.tool_calls && aiMessage.tool_calls.length > 0) {
    messages.push(aiMessage);
    for (const toolCall of aiMessage.tool_calls) {
      const toolMessage = await calculatorTool.invoke(toolCall);
      messages.push(toolMessage);
    }
    const aiResponseWithTools = await llmWithTools.invoke(messages);
    return aiResponseWithTools.content as string;
  } else {
    return aiMessage.content as string;
  } */
};
