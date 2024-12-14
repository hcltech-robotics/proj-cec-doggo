import { MessageWriter } from "@foxglove/rosmsg2-serialization";
import { get_client } from "../Websocket";
import "./overlaygui.css";
import { parse } from "@foxglove/rosmsg";

function sendChatGPTMessage() {
  const c = get_client();
  debugger;
  const subscribedChannel = (window.getChannelData() || []).find(
    (e) => e.t === "/gpt_cmd"
  );
  console.log(subscribedChannel);
  if (subscribedChannel) {
    const channel = subscribedChannel.channel;
    const messageDefinition = parse(channel.schema, { ros2: true });
    const writer = new MessageWriter(messageDefinition);
    const data = `please say what is 2+2?`;
    const message = writer.writeMessage({ data });
    const msg = c?.sendMessage(channel.id, message);
    console.log(msg);
  }
}

function sendTwistMessage() {
  const c = get_client();
  debugger;
  const subscribedChannel = (window.getChannelData() || []).find(
    (e) => e.t === "/cmd_vel"
  );
  console.log(subscribedChannel);
  if (subscribedChannel) {
    const channel = subscribedChannel.channel;
    const messageDefinition = parse(channel.schema, { ros2: true });
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
    const msg = c?.sendMessage(channel.id, message);
    console.log(msg);
  }
}

function OverlayGUI(props) {
  const value = props?.data ?? -1;
  if (!props?.show) {
    return null;
  }

  const handleClick = () => {
    const event = new CustomEvent("hackathonGuiEvent", {
      detail: { message: "Hello from react...", asd: "bsd" },
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
    sendTwistMessage()
  };
  return (
    <div className="custom-gui">
      <div className="control">
        {value}
        <button onClick={handleClick}>hello</button>
      </div>
    </div>
  );
}

export { OverlayGUI };
