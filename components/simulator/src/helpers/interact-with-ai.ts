import { BaseMessage, HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { Tool, tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';

import { getClient } from '../robot/foxgloveConnection';
import { MessageWithImage } from '../interfaces/interact-with-ai.interface';

const DEFAULT_TIMEOUT = 10000;

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
  1301: 'Handstand',
  1302: 'CrossStep',
  1303: 'OnesidedStep',
  1304: 'Bound',
  1305: 'MoonWalk',
  1039: 'StandOut',
  1045: 'FreeWalk',
  1050: 'Standup',
  1051: 'CrossWalk',
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
  Handstand: 1301,
  CrossStep: 1302,
  OnesidedStep: 1303,
  Bound: 1304,
  MoonWalk: 1305,
  StandOut: 1039,
  FreeWalk: 1045,
  Standup: 1050,
  CrossWalk: 1051,
};

const moveCommand = (distance: number, angle: number = 0) => {
  const client = getClient();
  if (!client) {
    console.error('Foxglove client is not available');
    return;
  }
  const channelId = client.advertise({
    topic: '/cmd_vel',
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
  const client = getClient();
  if (!client) {
    console.error('Foxglove client is not available');
    return;
  }
  const channelId = client.advertise({
    topic: '/webrtc_req',
    encoding: 'json',
    schemaName: 'unitree_go/msg/WebRtcReq',
  });

  console.log('Sended command to "/webrtc_req": ', cmd, Object.keys(ROBOT_CMD).find(key => ROBOT_CMD[key] === cmd));

  const message = new Uint8Array(new TextEncoder().encode(JSON.stringify({ api_id: cmd, topic: 'rt/api/sport/request' })));
  client.sendMessage(channelId, message);
};

const sendVoice = (text: string) => {
  const client = getClient();
  if (!client) {
    console.error('Foxglove client is not available');
    return;
  }
  const channelId = client.advertise({
    topic: '/tts',
    encoding: 'json',
    schemaName: 'go2_tts_msgs/msg/TTSRequest',
  });

  const message = new Uint8Array(new TextEncoder().encode(JSON.stringify({ text, voice_name: 'XrExE9yKIg1WjnnlVkGX' })));
  client.sendMessage(channelId, message);
};

export class InteractWithAI {
  private llm: ChatOpenAI;
  private llmWithTools: Runnable;
  private messages: BaseMessage[] = [];
  private apiKey = '';
  private imageData = '';

  private async analyzeImage(): Promise<MessageWithImage> {
    const cameraCanvas = document.getElementById('camera') as HTMLCanvasElement;
    if (!cameraCanvas) {
      console.error('Camera canvas not found.');
      return { text: 'Camera canvas not found.', image: null };
    }
    this.imageData = cameraCanvas.toDataURL('image/png');

    const chat = new ChatOpenAI({
      apiKey: this.apiKey,
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      cache: true
    });

    const messages = [
      new HumanMessage({
        content: [
          { type: 'text', text: "What's in this image?" },
          { image_url: { url: this.imageData, detail: 'low' }, type: 'image_url' },
        ],
      }),
    ];

    const result = await chat.invoke(messages, { timeout: DEFAULT_TIMEOUT });
    const response = { text: result.content as string, image: this.imageData };
    this.imageData = '';
    return response;
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
        sportCommand(ROBOT_CMD.Handstand);
        return `** Sending "stand (front legs)" thru WS://`;
      },
      {
        name: 'hand_stand',
        description: 'Use this tool to stand on your front legs or hands',
      },
    ),
    standby_pose: tool(
      () => {
        sportCommand(ROBOT_CMD.StandUp);
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

  public async invoke(message: string): Promise<MessageWithImage[]> {
    this.messages.push(new HumanMessage(message));

    const aiMessage = await this.llmWithTools.invoke(this.messages, { timeout: DEFAULT_TIMEOUT });
    this.messages.push(aiMessage);

    if (aiMessage?.tool_calls && aiMessage.tool_calls.length > 0) {
      const response: MessageWithImage[] = [];

      for (const call of aiMessage.tool_calls) {
        if (Object.keys(this.tools).includes(call.name)) {
          const toolResult = await this.tools[call.name].invoke(aiMessage, { timeout: DEFAULT_TIMEOUT });

          console.log(aiMessage, toolResult);

          this.messages.push(new ToolMessage({ content: toolResult.text, tool_call_id: call.id! }));
          // response.push(toolResult);

          if (call.name !== 'image_analyze') {
            this.messages.push(new HumanMessage('Comment the tool call with an informal short message as thought by a clever dog.'));
          }

          const comment = await this.llmWithTools.invoke(this.messages, { timeout: DEFAULT_TIMEOUT });

          if (call.name !== 'image_analyze') {
            response.push({ text: comment.content, image: null });
            sendVoice(comment.content);
          } else {
            response.push({ text: toolResult.text, image: toolResult.image });
            sendVoice(toolResult.text);
          }
        } else {
          response.push({ text: `*Missing tool: ${call.name}`, image: null });
        }
      }
      return response;
    } else {
      sendVoice(aiMessage.content);
      return [{ text: aiMessage.content as string, image: null }];
    }
  }

  public handleAction = (action: string): void => {
    switch (action) {
      case 'standby_pose': {
        sportCommand(ROBOT_CMD.StandUp);
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
        sportCommand(ROBOT_CMD.Handstand);
        break;
      }
      case 'sit': {
        sportCommand(ROBOT_CMD.Sit);
        break;
      }
      case 'hello': {
        sportCommand(ROBOT_CMD.Hello);
        break;
      }
      case 'finger_heart': {
        sportCommand(ROBOT_CMD.FingerHeart);
        break;
      }
      case 'stand_down': {
        sportCommand(ROBOT_CMD.StandDown);
        break;
      }
      case 'jump': {
        sportCommand(ROBOT_CMD.FrontJump);
        break;
      }
    }
  };
}
