import { parse } from '@foxglove/rosmsg';
import { MessageReader } from '@foxglove/rosmsg2-serialization';
import { Channel, FoxgloveClient, MessageData } from '@foxglove/ws-protocol';
import { interestingTopics } from '../model/Go2RobotTopics';
import { EnrichedChannel } from '../model/FoxgloveBasics';

export class RobotCommunication {
  private client: FoxgloveClient;
  public channels: Record<number, EnrichedChannel> = {};
  public channelByName: Record<string, EnrichedChannel> = {};

  public onOpen = () => {};

  public onAdvertise = (topics: Channel[]) => {
    topics.forEach((topic) => {
      if (interestingTopics.includes(topic.topic)) {
        const subscriptionId = this.client.subscribe(topic.id);
        const definition = parse(topic.schema, { ros2: true });
        const reader = new MessageReader(definition);
        this.channels[subscriptionId] = {
          ...topic,
          lastMessage: {},
          decoder: (msg: DataView) => reader.readMessage(msg),
        };
        this.channelByName[topic.topic] = this.channels[subscriptionId];
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
      this.channels[message.subscriptionId]!.lastMessage = data;
    }
  };

  constructor(private address: string = 'ws://localhost:8765') {
    this.client = new FoxgloveClient({
      ws: new WebSocket(this.address, [FoxgloveClient.SUPPORTED_SUBPROTOCOL]),
    });

    this.client.on('open', this.onOpen);
    this.client.on('advertise', this.onAdvertise);
    this.client.on('message', this.onMessage);
  }
}
