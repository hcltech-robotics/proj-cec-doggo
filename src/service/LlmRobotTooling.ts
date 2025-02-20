import { ToolMessage } from '@langchain/core/messages';
import { ToolCall } from '@langchain/core/messages/tool';
import { tool, Tool } from '@langchain/core/tools';
import { LlmToolHelper } from 'src/model/LlmToolInterface';
import { Vector3 } from 'three';
import { RobotCommunicationService } from './RobotCommunicationService';

export class LlmRobotTooling implements LlmToolHelper {
  private tools: Record<string, Tool> = {
    moveForward: tool(
      () => {
        this.robot.twistMessage({ angular: new Vector3(0, 0, 0), linear: new Vector3(1, 0, 0) });
      },
      {
        name: 'moveForward',
        description: 'Use this tool to move the dog forward 1 meter',
      },
    ),
  };

  public getTools = (): Tool[] => {
    return [this.tools['moveForward']!];
  };

  public invokeTool = async (input: ToolCall): Promise<ToolMessage | undefined> => {
    if (input.name in this.tools && input.id) {
      const result = await this.tools[input.name]?.invoke(input);
      return new ToolMessage({
        content: result.text,
        tool_call_id: input.id,
      });
    }

    return;
  };

  constructor(private robot: RobotCommunicationService) {}
}
