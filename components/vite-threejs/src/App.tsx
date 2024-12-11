import { useEffect } from "react";
import { init, animate } from "./scene";
import { main } from "./Websocket";

const App = () => {
  useEffect(() => {
    init()
    animate()

  }, [])
  useEffect(() => {
    main()
  }, [])
  return null;
};

export default App;
