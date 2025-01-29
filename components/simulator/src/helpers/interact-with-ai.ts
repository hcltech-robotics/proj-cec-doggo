import { BaseMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";
import { Tool, tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";

export class InteractWithAI {
  private llm: ChatOpenAI;
  private llmWithTools: Runnable;
  private messages: BaseMessage[] = [];

  private tools: Record<string, Tool> = {
    move_forward: tool(
      () => {
        return `** Sending "move (forward)" thru WS://`;
      },
      {
        name: "move_forward",
        description: "Use this tool to move the dog forward 1 meter",
      }
    ),
    move_backward: tool(
      () => {
        return `** Sending "move (backward)" thru WS://`;
      },
      {
        name: "move_backward",
        description: "Use this tool to move the dog backward 1 meter",
      }
    ),
    move_right: tool(
      () => {
        return `** Sending "move (right)" thru WS://`;
      },
      {
        name: "move_right",
        description: "Use this tool to move the dog right 1 meter",
      }
    ),
    move_left: tool(
      () => {
        return `** Sending "move (left)" thru WS://`;
      },
      {
        name: "move_left",
        description: "Use this tool to move the dog left 1 meter",
      }
    ),
    dance: tool(
      () => {
        return `** Sending "dance1_command" thru WS://`;
      },
      {
        name: "dance",
        description: "Use this tool to perform a dance or any command which can be understand as dance.",
      }
    ),
    stand_hind: tool(
      () => {
        return `** Sending "stand (hind legs)" thru WS://`;
      },
      {
        name: "stand_hind",
        description: "Use this tool to stand on your hind legs",
      }
    ),
    hand_stand: tool(
      () => {
        return `** Sending "stand (front legs)" thru WS://`;
      },
      {
        name: "hand_stand",
        description: "Use this tool to stand on your front legs or hands",
      }
    ),
    standby_pose: tool(
      () => {
        return `** Sending "balancestand" thru WS://`;
      },
      {
        name: "standby_pose",
        description: "This tools is for reset your pose into the regular state. Also understood as stand on 4 legs.",
      }
    ),
    lie_down: tool(
      () => {
        return `** Sending "standdown" thru WS://`;
      },
      {
        name: "lie_down",
        description: "This tools is for lie down the dog.",
      }
    ),
    sit: tool(
      () => {
        return `** Sending "sit" thru WS://`;
      },
      {
        name: "sit",
        description: "This tools is for sit the dog.",
      }
    ),
  };

  constructor(private initialContext: string) {
    const localStorageGUIConfigurations =
      localStorage.getItem("guiState") && JSON.parse(localStorage.getItem("guiState") as string);
    const apiKey = localStorageGUIConfigurations?.folders.API.controllers.apiKey;

    this.llm = new ChatOpenAI({
      apiKey,
    });

    this.llmWithTools = this.llm.bindTools(Object.values(this.tools));

    this.messages.push(new SystemMessage(this.initialContext));
  }

  public async invoke(message: string): Promise<string> {
    this.messages.push(new HumanMessage(message));

    const aiMessage = await this.llmWithTools.invoke(this.messages);
    this.messages.push(aiMessage);

    if (aiMessage?.tool_calls && aiMessage.tool_calls.length > 0) {
      const response: string[] = [];

      for (const call of aiMessage.tool_calls) {
        if (Object.keys(this.tools).includes(call.name)) {
          const toolResult = await this.tools[call.name].invoke(aiMessage);

          console.log(aiMessage, toolResult);

          this.messages.push(new ToolMessage({ content: toolResult, tool_call_id: call.id! }));
          response.push(toolResult);
        } else {
          response.push(`*Missing tool: ${call.name}`);
        }
      }

      return response.join("; ");
    } else {
      return aiMessage.content as string;
    }
  }
}
