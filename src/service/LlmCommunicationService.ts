import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { LlmToolHelper } from 'src/model/LlmToolInterface';

const DEFAULT_TIMEOUT = 10_000;

export class LlmCommunicationService {
  private llm: ChatOpenAI | undefined;
  private llmWithTools: Runnable | undefined;
  private messages: BaseMessage[] = [];

  public setApiKey = (apiKey: string, clearHistory: boolean = false, ...llmArgs: any) => {
    this.llm = new ChatOpenAI({ model: 'gpt-4o-mini', apiKey, ...llmArgs });
    if (this.tooling) {
      this.llmWithTools = this.llm.bindTools(Object.values(this.tooling.getTools()));
    } else {
      this.llmWithTools = this.llm;
    }

    if (clearHistory) {
      this.messages = [];
    }
  };

  public setSystemPrompt = (prompt: string) => {
    this.messages = [new SystemMessage({ content: prompt })];
  };

  private handeToolCalls = async (aiMessage: any) => {
    if (this.llmWithTools && this.tooling) {
      if (aiMessage.tool_calls) {
        for (const toolCall of aiMessage.tool_calls) {
          const callResult = await this.tooling.invokeTool(toolCall);
          if (callResult?.toolResult) {
            this.messages.push(aiMessage);
            this.messages.push(callResult?.toolResult);
            if (!callResult.displayResponse) {
              this.messages.push(new HumanMessage('Comment the tool call with an informal short message as thought by a clever dog.'));
              aiMessage = await this.llmWithTools.invoke(this.messages, { timeout: DEFAULT_TIMEOUT });
            } else {
              return;
            }
          }
        }
      }
    }

    return aiMessage;
  };

  public invoke = async (message: any) => {
    if (this.llmWithTools) {
      this.messages.push(new HumanMessage({ content: message }));

      let aiMessage = await this.llmWithTools.invoke(this.messages, { timeout: DEFAULT_TIMEOUT });

      if (aiMessage.tool_calls) {
        aiMessage = await this.handeToolCalls(aiMessage);
      }

      if (aiMessage) {
        this.messages.push(aiMessage);

        return aiMessage.content;
      }
    }
  };

  constructor(private apiKey: string, private tooling?: LlmToolHelper) {
    if (this.apiKey) {
      this.setApiKey(this.apiKey);
    }
  }
}
