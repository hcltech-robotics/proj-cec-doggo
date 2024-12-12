import { FoxgloveClient } from "@foxglove/ws-protocol";
//import { WebSocket } from "ws";
import { MessageReader } from "@foxglove/rosmsg2-serialization";
import { parse, stringify } from "@foxglove/rosmsg";

window.channelData = {}
window.getChannelData = () => Object.values(window.channelData).map(e => (({ sn: e.schemaName, t: e.topic, channel: e })))

async function main(transform_cb) {
    const client = new FoxgloveClient({
        ws: new WebSocket(`ws://localhost:8765`, [
            FoxgloveClient.SUPPORTED_SUBPROTOCOL,
        ]),
    });
    const deserializers = new Map();
    client.on("advertise", (channels) => {
        for (const channel of channels) {
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
                window.channelData[subId] = channel
                //const textDecoder = new TextDecoder();
                deserializers.set(subId, (data: any) => ({ channelSchemaName: channel.schemaName, channelId: channel.id, channelTopic: channel.topic, messageData: cdrReader.readMessage(data) }));
            } else {
                console.warn(`Unsupported encoding ${channel.encoding}`);
                continue;
            }
        }
    });
    client.on("message", (m) => {
        const { subscriptionId, timestamp, data } = m
        // console.log({
        //     subscriptionId,
        //     timestamp,
        //     data: deserializers.get(subscriptionId)(data),
        //     m
        // });
        // debugger
        const parsedData = deserializers.get(subscriptionId)(data)
        //debugger
        if (parsedData.channelTopic === "/joint_states" || parsedData.channelTopic === "/tf" || parsedData.channelTopic === "/joint_states" || parsedData.channelTopic === "/odom") {
            transform_cb({ subscriptionId, timestamp, data: parsedData });
        }
    });
}

export { main };
