import { getChannelData, getClient } from "./foxgloveConnection";

window.debugChannelData = () =>
  Object.values(getChannelData()).map((e) => ({
    sn: e.schemaName,
    t: e.topic,
    channel: e,
  }));

window.send_message = (txt: string) => {
  //ros2 topic echo /chatter
  const client = getClient();
  if (!client) {
    console.error("Foxglove client is not available");
    return;
  }
  const channelId = client.advertise({
    topic: "/chatter",
    encoding: "json",
    schemaName: "std_msgs/String",
  });

  const message = new Uint8Array(new TextEncoder().encode(JSON.stringify({ data: txt })));
  client.sendMessage(channelId, message);
};
