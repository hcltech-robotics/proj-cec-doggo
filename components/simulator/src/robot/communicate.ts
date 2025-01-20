import { MessageWriter } from "@foxglove/rosmsg2-serialization";
import { parse } from "@foxglove/rosmsg";
import { Twist } from "./messages";
import { getClient } from "./foxgloveConnection";
import "./playground"
import { FoxgloveClient } from "@foxglove/ws-protocol";

const advertisedTopics: Record<string, number> = {}

function getChannelId(topicName: string) {
    if (topicName in advertisedTopics) {
        return advertisedTopics[topicName]
    }
    console.error("Topic %s is not advertised yet", topicName)
    return null
}

export function registerAdvertisements(client: FoxgloveClient) {
    const channelsToAdvertise = [
        {
            topic: "/cmd_vel",
            encoding: "cdr",
            schemaName: "geometry_msgs/Twist",
        }
    ]

    for (let ch of channelsToAdvertise) {
        const channelId = client.advertise(ch);
        advertisedTopics[ch.topic] = channelId
    }
}

export function sendTwistMessage(twistMessage = {
    linear: { x: 23.0, y: 0.0, z: 0.0, },
    angular: { x: 0.0, y: 0.0, z: 0.5 },
}) {
    /**
     *  You can inspect the ros messages with this command:
     * 
     *  ros2 topic echo /cmd_vel
     */
    const client = getClient();
    if (!client) {
        console.error("Foxglove client is not available")
        return
    }
    const messageDefinition = parse(Twist, { ros2: true });
    const channelId = getChannelId("/cmd_vel")
    if (!channelId) {
        return
    }
    const writer = new MessageWriter(messageDefinition);
    const message = writer.writeMessage(twistMessage);
    client.sendMessage(channelId, message);
}