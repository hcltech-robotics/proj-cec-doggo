import { useEffect, useState } from "react";
import { init, animate, transform_cb, registerGUIConnector } from "./scene";
import { main } from "./Websocket";
import { CustomGUI } from "./gui";

class ExternalTools {
  guiCallback = (n: number) => {};
  constructor() { }
  init() {
    init();
    animate();
    main(transform_cb);
  }
  subscribeUI(cb: (n: number) => void) {
    console.log("Subscribed...")
    this.guiCallback = cb
    registerGUIConnector(cb)
    // this.guiCallback(Math.floor(Math.random() * 100))
    return null;
  }
  unSubscribeUI() {
    console.log("UnSubscribed...")
    return null;
  }
}

const tools = new ExternalTools();
tools.init();

const App = () => {
  const [data, setState] = useState(0)
  useEffect(() => {
    tools.subscribeUI(setState);
    return () => {
      tools.unSubscribeUI();
    };
  }, [setState]);
  return <CustomGUI data={data} show={true} />;
};

export default App;
