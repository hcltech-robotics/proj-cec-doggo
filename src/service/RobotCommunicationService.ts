import { parse } from '@foxglove/rosmsg';
import { MessageReader } from '@foxglove/rosmsg2-serialization';
import { Channel, FoxgloveClient, MessageData } from '@foxglove/ws-protocol';
import { LidarData, ParsedPointCloud2, RobotCommand, Transform, TwistMessage, WebRtcMessage } from 'src/model/Go2RobotInterfaces';
import { EnrichedChannel } from '../model/FoxgloveBasics';
import {
  channelDefinitions,
  PublishTopicListName,
  publishTopics,
  subscribedTopics,
  topicList,
  TopicListName,
  TypedChannels,
} from '../model/Go2RobotTopics';
import { depthCamWorker } from './DepthCamWorker';

export class RobotCommunicationService {
  private client: FoxgloveClient | undefined = undefined;

  private topicOverrides: Partial<Record<TopicListName, string>> = {};

  private paused: boolean = false;

  public get depthCamTopic() {
    return (this.topicOverrides[topicList.TOPIC_DEPTHCAM] as typeof topicList.TOPIC_DEPTHCAM) || topicList.TOPIC_DEPTHCAM;
  }

  public get cameraTopic() {
    return (this.topicOverrides[topicList.TOPIC_CAMERA] as typeof topicList.TOPIC_CAMERA) || topicList.TOPIC_CAMERA;
  }

  public voxelWorker: Worker;
  public depthCamWorker: Worker;
  public channels: Record<number, EnrichedChannel<any>> = {};
  public channelByName: TypedChannels = {} as TypedChannels;
  public pubTopics: Partial<Record<PublishTopicListName, number>> = {};

  public onOpen = () => {};

  public onAdvertise = (topics: Channel[]) => {
    const subscribeTo = [...subscribedTopics, ...Object.values(this.topicOverrides)];
    topics.forEach((topic) => {
      if (subscribeTo.includes(topic.topic as TopicListName)) {
        const subscriptionId = this.client!.subscribe(topic.id);
        const definition = parse(topic.schema, { ros2: true });
        const reader = new MessageReader(definition);
        this.channels[subscriptionId] = {
          ...topic,
          lastMessage: {},
          decoder: (msg: DataView) => reader.readMessage(msg),
        };
        this.channelByName[topic.topic as TopicListName] = this.channels[subscriptionId]!;
      }
    });
  };

  private decode = (message: MessageData) => {
    if (this.channels[message.subscriptionId]) {
      return this.channels[message.subscriptionId]!.decoder(message.data);
    }

    return;
  };

  public setTopicOverride = (topic: TopicListName, newTopicName: string) => {
    this.topicOverrides[topic] = newTopicName;
  };

  public onMessage = (message: MessageData) => {
    const data = this.decode(message);

    if (data && !this.paused) {
      document.dispatchEvent(new CustomEvent('robotMessage', { detail: { topic: this.channels[message.subscriptionId]?.topic } }));

      if (this.channels[message.subscriptionId]?.topic === topicList.TOPIC_LIDAR) {
        this.voxelWorker.postMessage({
          resolution: data.resolution,
          origin: data.origin,
          width: data.width,
          data: data.data,
        });
      } else if (this.channels[message.subscriptionId]?.topic === this.depthCamTopic) {
        this.depthCamWorker.postMessage(data);
      } else {
        if (this.channels[message.subscriptionId]?.topic === topicList.TOPIC_TRANSFORM) {
          const transform = data as Transform;
          if (transform.transforms) {
            const base = transform.transforms.find((t) => t.child_frame_id === 'base_link');
            if (base) {
              this.channels[message.subscriptionId]!.lastMessage = data;
            }
          }
        } else {
          this.channels[message.subscriptionId]!.lastMessage = data;
        }
      }
    }
  };

  public voxelParser = ({ data }: { data: LidarData }) => {
    this.channelByName[topicList.TOPIC_LIDAR].lastMessage = data;
  };

  public depthCamParser = ({ data }: { data: ParsedPointCloud2 }) => {
    this.channelByName[this.depthCamTopic].lastMessage = data;
  };

  public twistMessage = (twist: TwistMessage) => {
    this.sendMessage(twist, publishTopics.TOPIC_VELOCITY);
  };

  public sportMessage = (command: RobotCommand) => {
    this.webRtcMessage({ api_id: command, topic: 'rt/api/sport/request' });
  };

  public webRtcMessage = (rtcMessage: WebRtcMessage) => {
    this.sendMessage(rtcMessage, publishTopics.TOPIC_WEBRTC);
  };

  public speakMessage = (text: string, voiceName: string = 'XrExE9yKIg1WjnnlVkGX') => {
    this.sendMessage({ text, voice_name: voiceName }, publishTopics.TOPIC_WEBRTC);
  };

  public sendMessage = (structuredMessage: Record<any, any>, topic: PublishTopicListName) => {
    if (this.client) {
      let channelId = this.pubTopics[topic];
      if (!channelId) {
        this.pubTopics[topic] = this.client.advertise(channelDefinitions[topic]);
        channelId = this.pubTopics[topic];
      }

      const message = new Uint8Array(new TextEncoder().encode(JSON.stringify(structuredMessage)));

      console.log('[LOG: Robot] Sending message to', topic, structuredMessage);

      this.client.sendMessage(channelId!, message);
    }
  };

  public connect = (address: string = 'ws://localhost:8765') => {
    if (this.client) {
      this.client.close();
    }

    this.client = new FoxgloveClient({
      ws: new WebSocket(address, [FoxgloveClient.SUPPORTED_SUBPROTOCOL]),
    });

    this.client.on('open', this.onOpen);
    this.client.on('advertise', this.onAdvertise);
    this.client.on('message', this.onMessage);
  };

  public pause = () => {
    this.paused = true;
  };

  public resume = () => {
    this.paused = false;
  };

  constructor() {
    this.voxelWorker = new Worker(new URL('/assets/voxel-worker.js', import.meta.url));
    this.voxelWorker.onmessage = this.voxelParser;

    const depthCamWorkerCode = depthCamWorker.toString();
    const depthCamWorkerBlob = new Blob([`(${depthCamWorkerCode})()`]);
    this.depthCamWorker = new Worker(URL.createObjectURL(depthCamWorkerBlob));
    this.depthCamWorker.onmessage = this.depthCamParser;
  }
}
