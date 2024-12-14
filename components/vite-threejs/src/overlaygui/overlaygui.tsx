import { MessageWriter } from "@foxglove/rosmsg2-serialization";
import { get_client } from "../Websocket";
import "./overlaygui.css";

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
    const c = get_client();
    debugger;
    const gptChannel = (window.getChannelData() || []).find(
      (e) => e.t === "/gpt_cmd"
    );
    if (gptChannel) {
      const channelId = gptChannel.channel.id;

      const writer = new MessageWriter([
        { definitions: [{ name: "data", type: "string" }] },
      ]);
      const data = `please say what is 2+2?`;
      const message = writer.writeMessage({ data });
      c?.sendMessage(channelId, message);
    }
    console.log(gptChannel);
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
