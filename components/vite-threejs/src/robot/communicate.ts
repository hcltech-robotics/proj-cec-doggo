import { MessageWriter } from "@foxglove/rosmsg2-serialization";
import { parse } from "@foxglove/rosmsg";
import { Twist } from "../robot/messages";
import { getClient } from "../Websocket";

export function sendTwistMessage() {
    const client = getClient();
    if (!client) {
        console.error("Foxglove client is not available")
        return
    }
    const messageDefinition = parse(Twist, { ros2: true });

    const channelId = client.advertise({
        topic: "/cmd_vel",
        encoding: "json",
        schemaName: "geometry_msgs/Twist",
    });


    const writer = new MessageWriter(messageDefinition);
    const cmdVelMessage = {
        linear: {
            x: 1.0, // Move forward at 1 m/s
            y: 0.0,
            z: 0.0,
        },
        angular: {
            x: 0.0,
            y: 0.0,
            z: 0.5, // Rotate at 0.5 rad/s around z-axis
        },
    };
    const message = writer.writeMessage({ data: cmdVelMessage });
    client.sendMessage(channelId, message);
    // see message with: ros2 topic echo /cmd_vel

}