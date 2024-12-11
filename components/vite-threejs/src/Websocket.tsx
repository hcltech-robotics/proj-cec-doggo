import { FoxgloveClient } from "@foxglove/ws-protocol";
//import { WebSocket } from "ws";
import { MessageReader } from "@foxglove/rosmsg2-serialization";
import { parse, stringify } from "@foxglove/rosmsg";

async function main() {
    const client = new FoxgloveClient({
        ws: new WebSocket(`ws://localhost:8765`, [FoxgloveClient.SUPPORTED_SUBPROTOCOL]),
    });
    const deserializers = new Map();
    client.on("advertise", (channels) => {
        for (const channel of channels) {
            if (channel.encoding === "json") {
                const subId = client.subscribe(channel.id);
                const textDecoder = new TextDecoder();
                deserializers.set(subId, (data: any) => JSON.parse(textDecoder.decode(data)));
            } else if (channel.encoding === "cdr") {
                // message definition comes from `parse()` in @foxglove/rosmsg
                const messageDefinition = parse(channel.schema, {ros2: true})
                const cdrReader = new MessageReader(messageDefinition);
                const subId = client.subscribe(channel.id);
                //const textDecoder = new TextDecoder();
                deserializers.set(subId, (data: any) => cdrReader.readMessage(data));

            } else {
                console.warn(`Unsupported encoding ${channel.encoding}`);
                continue;
            }
        }
    });
    client.on("message", ({ subscriptionId, timestamp, data }) => {
        console.log({
            subscriptionId,
            timestamp,
            data: deserializers.get(subscriptionId)(data),
        });
    });
}

export { main }