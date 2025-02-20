import { ToolMessage } from '@langchain/core/messages';
import { ToolCall } from '@langchain/core/messages/tool';
import { tool, Tool } from '@langchain/core/tools';
import { LlmToolHelper } from 'src/model/LlmToolInterface';
import { Vector3 } from 'three';
import { StoreApi, UseBoundStore } from 'zustand';
import { uInt8ToBase64String } from '../helper/UInt8ToBase64';
import { robotCommands } from '../model/Go2RobotInterfaces';
import { topicList } from '../model/Go2RobotTopics';
import { ChatHistoryActions, ChatHistoryState } from './ChatHistoryService';
import { LlmCommunicationService } from './LlmCommunicationService';
import { RobotCommunicationService } from './RobotCommunicationService';

export class LlmRobotTooling implements LlmToolHelper {
  private tools: Record<string, { tool: Tool; displayResponse: boolean }> = {
    move_forward: {
      displayResponse: false,
      tool: tool(
        () => {
          this.robot.twistMessage({ angular: new Vector3(0, 0, 0), linear: new Vector3(1, 0, 0) });
          return `** Sending "move (forward)" thru WS://`;
        },
        {
          name: 'move_forward',
          description: 'Use this tool to move the dog forward 1 meter',
        },
      ),
    },
    move_backward: {
      displayResponse: false,
      tool: tool(
        () => {
          this.robot.twistMessage({ angular: new Vector3(0, 0, 0), linear: new Vector3(-1, 0, 0) });
          return `** Sending "move (backward)" thru WS://`;
        },
        {
          name: 'move_backward',
          description: 'Use this tool to move the dog backward 1 meter',
        },
      ),
    },
    move_right: {
      displayResponse: false,
      tool: tool(
        () => {
          this.robot.twistMessage({ angular: new Vector3(Math.PI / 2, 0, 0), linear: new Vector3(1, 0, 0) });
          return `** Sending "move (right)" thru WS://`;
        },
        {
          name: 'move_right',
          description: 'Use this tool to move the dog right 1 meter',
        },
      ),
    },
    move_left: {
      displayResponse: false,
      tool: tool(
        () => {
          this.robot.twistMessage({ angular: new Vector3(Math.PI / -2, 0, 0), linear: new Vector3(1, 0, 0) });
          return `** Sending "move (left)" thru WS://`;
        },
        {
          name: 'move_left',
          description: 'Use this tool to move the dog left 1 meter',
        },
      ),
    },
    dance: {
      displayResponse: false,
      tool: tool(
        () => {
          this.robot.sportMessage(robotCommands.Dance1);
          return `** Sending "dance1_command" thru WS://`;
        },
        {
          name: 'dance',
          description: 'Use this tool to perform a dance or any command which can be understand as dance.',
        },
      ),
    },
    hand_stand: {
      displayResponse: false,
      tool: tool(
        () => {
          this.robot.sportMessage(robotCommands.Handstand);
          return `** Sending "stand (front legs)" thru WS://`;
        },
        {
          name: 'hand_stand',
          description: 'Use this tool to stand on your front legs or hands',
        },
      ),
    },
    standby_pose: {
      displayResponse: false,
      tool: tool(
        () => {
          this.robot.sportMessage(robotCommands.StandUp);
          return `** Sending "balancestand" thru WS://`;
        },
        {
          name: 'standby_pose',
          description: 'This tools is for reset your pose into the regular state. Also understood as stand on 4 legs.',
        },
      ),
    },
    lie_down: {
      displayResponse: false,
      tool: tool(
        () => {
          this.robot.sportMessage(robotCommands.StandDown);
          return `** Sending "standdown" thru WS://`;
        },
        {
          name: 'lie_down',
          description: 'This tools is for lie down the dog.',
        },
      ),
    },
    sit: {
      displayResponse: false,
      tool: tool(
        () => {
          this.robot.sportMessage(robotCommands.Sit);
          return `** Sending "sit" thru WS://`;
        },
        {
          name: 'sit',
          description: 'This tools is for sit the dog.',
        },
      ),
    },
    image_analyze: {
      displayResponse: true,
      tool: tool(
        async () => {
          return await this.analyzeImage();
        },
        {
          name: 'image_analyze',
          description:
            'This tool is to take a photo of what is ahead of you and analyze it to get a written summary of what is in that photo.',
        },
      ),
    },
  };

  private analyzeImage = async () => {
    const imageData = uInt8ToBase64String(this.robot.channelByName[topicList.TOPIC_CAMERA].lastMessage.data);

    const response = await this.visualAgent.invoke([
      {
        type: 'text',
        text: 'Describe this next photo as per instructions.',
      },
      { image_url: { url: `data:image/png;base64,${imageData}`, detail: 'low' }, type: 'image_url' },
    ]);

    return response;
  };

  public getTools = (): Tool[] => {
    return Object.values(this.tools).map((t) => t.tool);
  };

  public invokeTool = async (input: ToolCall): Promise<{ toolResult: ToolMessage; displayResponse: boolean } | undefined> => {
    if (input.name in this.tools && input.id) {
      const result = await this.tools[input.name]?.tool.invoke(input);
      if (this.tools[input.name]?.displayResponse) {
        const { addTextMessage } = this.chatHistory.getState();
        addTextMessage(result.content, 'other');
      }
      return { toolResult: result, displayResponse: !!this.tools[input.name]?.displayResponse };
    }

    return;
  };

  constructor(
    private robot: RobotCommunicationService,
    private visualAgent: LlmCommunicationService,
    private chatHistory: UseBoundStore<StoreApi<ChatHistoryState & ChatHistoryActions>>,
  ) {}
}
