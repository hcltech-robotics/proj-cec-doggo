import { useEffect } from "react";
import { init, animate } from "./scene";

const App = () => {
  useEffect(() => {
    init()
    animate()

  }, [])
  return null;
};

export default App;
