import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';

const DEFAULT_TIMEOUT = 10_000;

export class LlmCommunicationService {
  private llm: ChatOpenAI | undefined;
  private llmWithTools: Runnable | undefined;
  private messages: BaseMessage[] = [];

  public setApiKey = (apiKey: string, clearHistory: boolean = false) => {
    this.llm = new ChatOpenAI({ apiKey });
    this.llmWithTools = this.llm.bindTools(Object.values(this.tools));

    if (clearHistory) {
      this.messages = [];
    }
  };

  public invoke = async (message: string) => {
    if (this.llmWithTools) {
      this.messages.push(new HumanMessage(message));

      const aiMessage = await this.llmWithTools.invoke(this.messages, { timeout: DEFAULT_TIMEOUT });

      this.messages.push(aiMessage);

      return aiMessage.content;
    }
  };

  constructor(private apiKey: string, private tools = []) {
    if (this.apiKey) {
      this.setApiKey(this.apiKey);
    }
  }
}
