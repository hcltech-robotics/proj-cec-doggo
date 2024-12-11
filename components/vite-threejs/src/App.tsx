import { useEffect } from "react";
import { init, animate ,transform_cb} from "./scene";
import { main } from "./Websocket";

const App = () => {
  useEffect(() => {
    init()
    animate()

  }, [])
  useEffect(() => {
    main(transform_cb)
  }, [])
  return null;
};

export default App;
