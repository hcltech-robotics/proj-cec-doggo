import "./gui.css"

function CustomGUI(props) {
    const value = props?.data ?? -1
    if (props?.show) {
        return null
    }

    const handleClick = () => {
        const event = new CustomEvent('hackathonGuiEvent', {
            detail: { message: 'Hello from react...', asd: 'bsd' },
            bubbles: true,
            cancelable: true,
        })
        document.dispatchEvent(event)
    }
    return <div className="custom-gui">
        <div className="control">
            {value}
            <button onClick={handleClick}>hello</button>
        </div>

    </div >
}

export { CustomGUI }