import { useEffect } from "react";
import { init, animate, transform_cb } from "./scene";
import { main } from "./Websocket";

class ExternalTools {
  constructor() {}
  init() {
    init();
    animate();
    main(transform_cb);
  }
  subscribeUI() {
    return null;
  }
  unSubscribeUI() {
    return null;
  }
}

const tools = new ExternalTools();
tools.init();

const App = () => {
  useEffect(() => {
    tools.subscribeUI();
    return () => {
      tools.unSubscribeUI();
    };
  }, []);
  return null;
};

export default App;
