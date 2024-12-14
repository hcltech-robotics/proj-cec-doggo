import { get_client } from "../Websocket"
import "./overlaygui.css"

function OverlayGUI(props) {
    const value = props?.data ?? -1
    if (!props?.show) {
        return null
    }

    const handleClick = () => {
        const event = new CustomEvent('hackathonGuiEvent', {
            detail: { message: 'Hello from react...', asd: 'bsd' },
            bubbles: true,
            cancelable: true,
        })
        document.dispatchEvent(event)
        const c = get_client()
        const gptChannel = (window.getChannelData() || []).find(e=>e.channelTopic === "/gpt_cmd")
        console.log(gptChannel);
        c?.sendMessage()
    }
    return <div className="custom-gui">
        <div className="control">
            {value}
            <button onClick={handleClick}>hello</button>
        </div>

    </div >
}

export { OverlayGUI }