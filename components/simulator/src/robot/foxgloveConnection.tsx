import { Channel, FoxgloveClient } from "@foxglove/ws-protocol";
import { MessageReader } from "@foxglove/rosmsg2-serialization";
import { parse } from "@foxglove/rosmsg";
import { getSubscribeChannels } from "./channelData";
import { SceneTransformCb } from "../types";
import { registerAdvertisements } from "./communicate"
import { SceneManager } from "../visualizer/SceneManager";

let client: FoxgloveClient | null = null;
const channelData: Record<string, Channel> = {}

export function getClient() {
  return client;
}
export function getChannelData() {
  return channelData;
}

async function initFoxGloveWebsocket(transform_cb: SceneTransformCb, ws_url = "ws://localhost:8765", s: SceneManager) {
  if (client) {
    client.close();
  }
  client = new FoxgloveClient({
    ws: new WebSocket(ws_url, [FoxgloveClient.SUPPORTED_SUBPROTOCOL]),
  });
  const deserializers = new Map();
  const subscribe_channels = getSubscribeChannels();

  client.on("advertise", (channels) => {
    if (!client) {
      return
    }
    for (const channel of channels) {
      if (!subscribe_channels.has(channel.topic)) {
        console.warn("Not subscribed to channel", channel);
        continue
      }
      console.info("Channel advertised:", channel);
      if (channel.encoding === "json") {
        const subId = client.subscribe(channel.id);
        const textDecoder = new TextDecoder();
        deserializers.set(subId, (data: any) =>
          JSON.parse(textDecoder.decode(data))
        );
      } else if (channel.encoding === "cdr") {
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
  client.on("message", (m) => {
    const { subscriptionId, timestamp, data } = m;
    const parsedData = deserializers.get(subscriptionId)(data);
    if (parsedData.channelTopic === "/camera/compressed") {
      // console.log(parsedData);
      window.updateCanvasWithJPEG(parsedData.messageData.data);
    } else if ([...subscribe_channels].some(c => c == parsedData.channelTopic)) {
      transform_cb({ subscriptionId, timestamp, data: parsedData }, s);
    }
  });
  client.on("open", () => {
    if (client) {
      registerAdvertisements(client)
    }
  })
}

export { initFoxGloveWebsocket };
