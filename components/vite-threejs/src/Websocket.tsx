import { FoxgloveClient } from "@foxglove/ws-protocol";
//import { WebSocket } from "ws";
import { MessageReader } from "@foxglove/rosmsg2-serialization";
import { parse, stringify } from "@foxglove/rosmsg";
import { subscribe_channels } from "./scene";

window.channelData = {};
window.getChannelData = () =>
  Object.values(window.channelData).map((e) => ({
    sn: e.schemaName,
    t: e.topic,
    channel: e,
  }));

let client: FoxgloveClient | null = null;

window.send_message =(txt: string) => {
  //ros2 topic echo /chatter
  const client = window.get_client()

  const channelId = client.advertise({
    topic: "/chatter",
    encoding: "json",
    schemaName: "std_msgs/String",
  });

  const message = new Uint8Array(
    new TextEncoder().encode(JSON.stringify({ data: txt }))
    );
  client.sendMessage(channelId, message); 
}


export function get_client() {
  return client;
}

window.get_client = get_client

async function init_websocket(transform_cb, ws_url = "ws://localhost:8765") {
  if (client) {
    client.close();
  }
  client = new FoxgloveClient({
    ws: new WebSocket(ws_url, [FoxgloveClient.SUPPORTED_SUBPROTOCOL]),
  });
  // client.sendMessage()
  const deserializers = new Map();
  client.on("advertise", (channels) => {
    for (const channel of channels) {
      if (!subscribe_channels.has(channel.topic)) {
        console.warn("Not subscribed to channel", channel);
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
        window.channelData[subId] = channel;
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
    // console.log({
    //     subscriptionId,
    //     timestamp,
    //     data: deserializers.get(subscriptionId)(data),
    //     m
    // });
    // debugger
    const parsedData = deserializers.get(subscriptionId)(data);
    // debugger
    // console.log(parsedData.channelTopic)
    if (
      parsedData.channelTopic === "/joint_states" ||
      parsedData.channelTopic === "/tf" ||
      parsedData.channelTopic === "/joint_states" ||
      parsedData.channelTopic === "/odom" ||
      parsedData.channelTopic === "/utlidar/voxel_map_compressed"
    ) {
      transform_cb({ subscriptionId, timestamp, data: parsedData });
    }
    if ( parsedData.channelTopic === "/camera/compressed" ) {
      console.log(parsedData);
      window.updateCanvasWithJPEG(parsedData.messageData.data);
    }
  });
}

export { init_websocket };
