import { Channel, FoxgloveClient } from '@foxglove/ws-protocol';
import { MessageReader } from '@foxglove/rosmsg2-serialization';
import { parse } from '@foxglove/rosmsg';
import { getSubscribeChannels } from './channelData';
import { SceneTransformCb } from '../types';
import { registerAdvertisements } from './communicate';
import { SceneManager } from '../visualizer/SceneManager';

let client: FoxgloveClient | null = null;
const channelData: Record<string, Channel> = {};

export function getClient() {
  return client;
}
export function getChannelData() {
  return channelData;
}

export interface WebSocketEventHandler {
  (event: 'open' | 'close' | 'error'): void;
}

async function createFoxGloveWebsocket(
  transform_cb: SceneTransformCb,
  ws_url = 'ws://localhost:8765',
  s: SceneManager,
  onEvent: WebSocketEventHandler,
) {
  if (client) {
    client.close();
  }
  client = new FoxgloveClient({
    ws: new WebSocket(ws_url, [FoxgloveClient.SUPPORTED_SUBPROTOCOL]),
  });
  const deserializers = new Map();
  const subscribe_channels = getSubscribeChannels();

  client.on('advertise', (channels) => {
    if (!client) {
      return;
    }

    s.userSettings.topicList.parse(channels);

    for (const channel of channels) {
      if (!subscribe_channels.has(channel.topic)) {
        console.warn('Not subscribed to channel', channel);
        continue;
      }
      console.info('Channel advertised:', channel);
      if (channel.encoding === 'json') {
        const subId = client.subscribe(channel.id);
        const textDecoder = new TextDecoder();
        deserializers.set(subId, (data: any) => JSON.parse(textDecoder.decode(data)));
      } else if (channel.encoding === 'cdr') {
        // message definition comes from `parse()` in @foxglove/rosmsg
        const messageDefinition = parse(channel.schema, { ros2: true });
        const cdrReader = new MessageReader(messageDefinition);
        const subId = client.subscribe(channel.id);
        channelData[subId] = channel;
        //const textDecoder = new TextDecoder();
        deserializers.set(subId, (data: any) => ({
          channelSchemaName: channel.schemaName,
          channelId: channel.id,
          channelTopic: channel.topic,
          messageData: cdrReader.readMessage(data),
        }));
      } else {
        console.warn(`Unsupported encoding ${channel.encoding}`);
        continue;
      }
    }
  });
  client.on('message', (m) => {
    const { subscriptionId, timestamp, data } = m;
    const parsedData = deserializers.get(subscriptionId)(data);
    if (parsedData.channelTopic === '/camera/compressed') {
      window.updateCanvasWithJPEG(parsedData.messageData.data);
    } else if ([...subscribe_channels].some((c) => c == parsedData.channelTopic)) {
      transform_cb({ subscriptionId, timestamp, data: parsedData }, s);
    }
  });
  client.on('open', () => {
    if (client) {
      registerAdvertisements(client);
    }
    onEvent('open');
  });
  client.on('close', () => {
    s.userSettings.topicList.reset();
    onEvent('close');
  });

  client.on('error', () => {
    onEvent('error');
  });
}

export { createFoxGloveWebsocket };
