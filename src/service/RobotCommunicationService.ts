import { parse } from '@foxglove/rosmsg';
import { MessageReader } from '@foxglove/rosmsg2-serialization';
import { Channel, FoxgloveClient, MessageData } from '@foxglove/ws-protocol';
import { LidarData, RobotCommand, Transform, TwistMessage, WebRtcMessage } from 'src/model/Go2RobotInterfaces';
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

export class RobotCommunication {
  public voxelWorker: Worker;
  private client: FoxgloveClient;
  public channels: Record<number, EnrichedChannel<any>> = {};
  public channelByName: TypedChannels = {} as TypedChannels;
  public pubTopics: Partial<Record<PublishTopicListName, number>> = {};

  public onOpen = () => {};

  public onAdvertise = (topics: Channel[]) => {
    topics.forEach((topic) => {
      if (subscribedTopics.includes(topic.topic as TopicListName)) {
        const subscriptionId = this.client.subscribe(topic.id);
        const definition = parse(topic.schema, { ros2: true });
        const reader = new MessageReader(definition);
        this.channels[subscriptionId] = {
          ...topic,
          lastMessage: {},
          decoder: (msg: DataView) => reader.readMessage(msg),
        };
        this.channelByName[topic.topic as TopicListName] = this.channels[subscriptionId];
      }
    });
  };

  private decode = (message: MessageData) => {
    if (this.channels[message.subscriptionId]) {
      return this.channels[message.subscriptionId]!.decoder(message.data);
    }

    return;
  };

  public onMessage = (message: MessageData) => {
    const data = this.decode(message);

    if (data) {
      if (this.channels[message.subscriptionId]?.topic === topicList.TOPIC_LIDAR) {
        this.voxelWorker.postMessage({
          resolution: data.resolution,
          origin: data.origin,
          width: data.width,
          data: data.data,
        });
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
    let channelId = this.pubTopics[topic];
    if (!channelId) {
      this.pubTopics[topic] = this.client.advertise(channelDefinitions[topic]);
      channelId = this.pubTopics[topic];
    }

    const message = new Uint8Array(new TextEncoder().encode(JSON.stringify(structuredMessage)));

    this.client.sendMessage(channelId, message);
  };

  constructor(private address: string = 'ws://localhost:8765') {
    this.client = new FoxgloveClient({
      ws: new WebSocket(this.address, [FoxgloveClient.SUPPORTED_SUBPROTOCOL]),
    });

    this.client.on('open', this.onOpen);
    this.client.on('advertise', this.onAdvertise);
    this.client.on('message', this.onMessage);

    this.voxelWorker = new Worker(new URL('/assets/voxel-worker.js', import.meta.url));
    this.voxelWorker.onmessage = this.voxelParser;
  }
}
