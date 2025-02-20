import { ToolCall, ToolMessage } from '@langchain/core/messages/tool';
import { Tool } from '@langchain/core/tools';

export interface LlmToolHelper {
  getTools: () => Tool[];
  invokeTool: (input: ToolCall) => Promise<ToolMessage | undefined>;
}
