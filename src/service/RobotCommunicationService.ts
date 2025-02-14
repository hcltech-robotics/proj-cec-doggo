import { parse } from '@foxglove/rosmsg';
import { MessageReader } from '@foxglove/rosmsg2-serialization';
import { Channel, FoxgloveClient, MessageData } from '@foxglove/ws-protocol';
import { EnrichedChannel } from '../model/FoxgloveBasics';
import { interestingTopics, topicList, TopicListName, TypedChannels } from '../model/Go2RobotTopics';
import { LidarData } from 'src/model/Go2RobotInterfaces';

export class RobotCommunication {
  public voxelWorker: Worker;
  private client: FoxgloveClient;
  public channels: Record<number, EnrichedChannel<any>> = {};
  public channelByName: TypedChannels = {} as TypedChannels;

  public onOpen = () => {};

  public onAdvertise = (topics: Channel[]) => {
    topics.forEach((topic) => {
      if (interestingTopics.includes(topic.topic as TopicListName)) {
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
        this.channels[message.subscriptionId]!.lastMessage = data;
      }
    }
  };

  public voxelParser = ({ data }: { data: LidarData }) => {
    this.channelByName[topicList.TOPIC_LIDAR].lastMessage = data;
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
