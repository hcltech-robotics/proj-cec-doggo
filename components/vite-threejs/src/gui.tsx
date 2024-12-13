import "./gui.css"

function CustomGUI(props) {
    const value = props?.data ?? -1
    if (props?.show) {
        return null
    }
    return <div className="custom-gui">
        <div className="control">
            {value}
            <button onClick={() => {
                console.log("HI")
            }}>hello</button>
        </div>

    </div>
}

export { CustomGUI }