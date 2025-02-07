import { BaseMessage, HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { Tool, tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { getClient } from '../robot/foxgloveConnection';

export const SPORT_CMD = {
  1001: 'Damp',
  1002: 'BalanceStand',
  1003: 'StopMove',
  1004: 'StandUp',
  1005: 'StandDown',
  1006: 'RecoveryStand',
  1007: 'Euler',
  1008: 'Move',
  1009: 'Sit',
  1010: 'RiseSit',
  1011: 'SwitchGait',
  1012: 'Trigger',
  1013: 'BodyHeight',
  1014: 'FootRaiseHeight',
  1015: 'SpeedLevel',
  1016: 'Hello',
  1017: 'Stretch',
  1018: 'TrajectoryFollow',
  1019: 'ContinuousGait',
  1020: 'Content',
  1021: 'Wallow',
  1022: 'Dance1',
  1023: 'Dance2',
  1024: 'GetBodyHeight',
  1025: 'GetFootRaiseHeight',
  1026: 'GetSpeedLevel',
  1027: 'SwitchJoystick',
  1028: 'Pose',
  1029: 'Scrape',
  1030: 'FrontFlip',
  1031: 'FrontJump',
  1032: 'FrontPounce',
  1033: 'WiggleHips',
  1034: 'GetState',
  1035: 'EconomicGait',
  1036: 'FingerHeart',
};

export const ROBOT_CMD = {
  Damp: 1001,
  BalanceStand: 1002,
  StopMove: 1003,
  StandUp: 1004,
  StandDown: 1005,
  RecoveryStand: 1006,
  Euler: 1007,
  Move: 1008,
  Sit: 1009,
  RiseSit: 1010,
  SwitchGait: 1011,
  Trigger: 1012,
  BodyHeight: 1013,
  FootRaiseHeight: 1014,
  SpeedLevel: 1015,
  Hello: 1016,
  Stretch: 1017,
  TrajectoryFollow: 1018,
  ContinuousGait: 1019,
  Content: 1020,
  Wallow: 1021,
  Dance1: 1022,
  Dance2: 1023,
  GetBodyHeight: 1024,
  GetFootRaiseHeight: 1025,
  GetSpeedLevel: 1026,
  SwitchJoystick: 1027,
  Pose: 1028,
  Scrape: 1029,
  FrontFlip: 1030,
  FrontJump: 1031,
  FrontPounce: 1032,
  WiggleHips: 1033,
  GetState: 1034,
  EconomicGait: 1035,
  FingerHeart: 1036,
};

const moveCommand = (distance: number, angle: number = 0) => {
  const client = getClient();
  if (!client) {
    console.error('Foxglove client is not available');
    return;
  }
  const channelId = client.advertise({
    topic: '/turtle1/cmd_vel',
    encoding: 'json',
    schemaName: 'geometry_msgs/msg/Twist',
  });

  const message = new Uint8Array(
    new TextEncoder().encode(
      JSON.stringify({ linear: { x: distance, y: 0, z: 0 }, angular: { x: 0, y: 0, z: Math.PI * 2 * (angle / 360) } }),
    ),
  );
  client.sendMessage(channelId, message);
};

const sportCommand = (cmd: number) => {
  const uniqID = (new Date().valueOf() % 2147483648) + Math.floor(Math.random() * 1e3);
  const commandId = cmd;

  const client = getClient();
  if (!client) {
    console.error('Foxglove client is not available');
    return;
  }
  const channelId = client.advertise({
    topic: '/rt/api/sport/request',
    encoding: 'json',
    schemaName: '-TBD-',
  });

  const message = new Uint8Array(
    new TextEncoder().encode(
      JSON.stringify({
        header: { identity: { id: uniqID, api_id: commandId } },
        parameter: JSON.stringify(commandId),
      }),
    ),
  );
  client.sendMessage(channelId, message);
};

export class InteractWithAI {
  private llm: ChatOpenAI;
  private llmWithTools: Runnable;
  private messages: BaseMessage[] = [];
  private apiKey = '';

  private async analyzeImage(): Promise<string> {
    const imageData = document.getElementById('camera').toDataURL('image/png');
    const chat = new ChatOpenAI({
      apiKey: this.apiKey,
      model: 'gpt-4o-mini',
      maxTokens: 1000,
    });

    const messages = [
      new HumanMessage({
        content: [
          { type: 'text', text: "What's in this image?" },
          { image_url: { url: imageData, detail: 'low' }, type: 'image_url' },
        ],
      }),
    ];

    const response = await chat.invoke(messages);
    return response.content as string;
  }

  private tools: Record<string, Tool> = {
    move_forward: tool(
      () => {
        moveCommand(1);
        return `** Sending "move (forward)" thru WS://`;
      },
      {
        name: 'move_forward',
        description: 'Use this tool to move the dog forward 1 meter',
      },
    ),
    move_backward: tool(
      () => {
        moveCommand(-1);
        return `** Sending "move (backward)" thru WS://`;
      },
      {
        name: 'move_backward',
        description: 'Use this tool to move the dog backward 1 meter',
      },
    ),
    move_right: tool(
      () => {
        moveCommand(1, 90);
        return `** Sending "move (right)" thru WS://`;
      },
      {
        name: 'move_right',
        description: 'Use this tool to move the dog right 1 meter',
      },
    ),
    move_left: tool(
      () => {
        moveCommand(1, -90);
        return `** Sending "move (left)" thru WS://`;
      },
      {
        name: 'move_left',
        description: 'Use this tool to move the dog left 1 meter',
      },
    ),
    dance: tool(
      () => {
        sportCommand(ROBOT_CMD.Dance1);
        return `** Sending "dance1_command" thru WS://`;
      },
      {
        name: 'dance',
        description: 'Use this tool to perform a dance or any command which can be understand as dance.',
      },
    ),
    stand_hind: tool(
      () => {
        return `** Sending "stand (hind legs)" thru WS://`;
      },
      {
        name: 'stand_hind',
        description: 'Use this tool to stand on your hind legs',
      },
    ),
    hand_stand: tool(
      () => {
        return `** Sending "stand (front legs)" thru WS://`;
      },
      {
        name: 'hand_stand',
        description: 'Use this tool to stand on your front legs or hands',
      },
    ),
    standby_pose: tool(
      () => {
        sportCommand(ROBOT_CMD.BalanceStand);
        return `** Sending "balancestand" thru WS://`;
      },
      {
        name: 'standby_pose',
        description: 'This tools is for reset your pose into the regular state. Also understood as stand on 4 legs.',
      },
    ),
    lie_down: tool(
      () => {
        sportCommand(ROBOT_CMD.StandDown);
        return `** Sending "standdown" thru WS://`;
      },
      {
        name: 'lie_down',
        description: 'This tools is for lie down the dog.',
      },
    ),
    sit: tool(
      () => {
        sportCommand(ROBOT_CMD.Sit);
        return `** Sending "sit" thru WS://`;
      },
      {
        name: 'sit',
        description: 'This tools is for sit the dog.',
      },
    ),
    image_analyze: tool(
      async () => {
        return this.analyzeImage();
      },
      {
        name: 'image_analyze',
        description:
          'Use this tool to tell the dog what it sees in the picture. So this tool analyzes an image and describes what it sees.',
      },
    ),
  };

  constructor(private initialContext: string) {
    const localStorageGUIConfigurations = localStorage.getItem('guiState') && JSON.parse(localStorage.getItem('guiState') as string);
    this.apiKey = localStorageGUIConfigurations?.folders.API.controllers.apiKey;

    this.llm = new ChatOpenAI({
      apiKey: this.apiKey,
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
          // response.push(toolResult);

          this.messages.push(new HumanMessage('Comment the tool call with an informal short message as thought by a clever dog.'));

          const comment = await this.llmWithTools.invoke(this.messages);

          response.push(comment.content);
        } else {
          response.push(`*Missing tool: ${call.name}`);
        }
      }

      return response.join('; ');
    } else {
      return aiMessage.content as string;
    }
  }

  public handleAction = (action: string): void => {
    switch (action) {
      case 'standby_pose': {
        sportCommand(ROBOT_CMD.BalanceStand);
        break;
      }
      case 'dance': {
        sportCommand(ROBOT_CMD.Dance1);
        break;
      }
      case 'stand_hind': {
        // TODO: Implement stand_hind action
        console.warn('stand_hind action is not implemented');
        break;
      }
      case 'hand_stand': {
        // TODO: Implement hand_stand action
        console.warn('hand_stand action is not implemented');
        break;
      }
      case 'sit': {
        sportCommand(ROBOT_CMD.Sit);
        break;
      }
    }
  };
}
