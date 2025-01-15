import { useEffect, useState } from "react";
import { init, animate } from "./scene";
import { OverlayGUI, CanvasFrame } from "./overlaygui/overlaygui";
import ChatWindow from "./components/chatWindow";
import { GuiCallback } from "./types";


class ExternalTools {
  guiCallback = (n: number) => {}
  constructor() { }
  init() {
    init();
    animate();
  }
  subscribeUI(cb: GuiCallback) {
    console.log("Subscribed...")
    this.guiCallback = cb
    // registerGUIConnector(cb)
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
    tools.subscribeUI((n) => setState(n));
    return () => {
      tools.unSubscribeUI();
    };
  }, [setState]);
  return (
    <div>
      <OverlayGUI data={data} show={true} />
      <CanvasFrame />
      <ChatWindow />
    </div>
  );
};

export default App;
