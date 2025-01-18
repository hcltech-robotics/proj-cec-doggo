import { useEffect, useState } from "react";
import { getSceneManager } from "./visualizer";
import { OverlayGUI, CanvasFrame } from "./overlaygui/overlaygui";
import ChatInput from './overlaygui/chatinput';
import { GuiCallback } from "./types";


class ExternalTools {
  guiCallback = (n: number) => {}
  constructor() { }
  init() {
    const sceneManager = getSceneManager();
    sceneManager.init();
    sceneManager.animate();
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
      <ChatInput />
    </div>
  );
};

export default App;
