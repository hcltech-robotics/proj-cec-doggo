import { useEffect, useState } from 'react';
import ChatWindow from './components/chatWindow';
import { InteractWithAI } from './helpers/interact-with-ai';
import { JoyController, JoysToRobot, JoystickHandler } from './joystick/joy-controller';
import { CanvasFrame, OverlayGUI } from './overlaygui/overlaygui';
import { GuiCallback } from './types';
import { getSceneManager } from './visualizer';

class ExternalTools {
  guiCallback = (n: number) => {};
  constructor() {}
  init() {
    const sceneManager = getSceneManager();
    sceneManager.init();
    sceneManager.animate();
  }
  subscribeUI(cb: GuiCallback) {
    console.log('Subscribed...');
    this.guiCallback = cb;
    // registerGUIConnector(cb)
    return null;
  }
  unSubscribeUI() {
    console.log('UnSubscribed...');
    return null;
  }
}

const tools = new ExternalTools();
tools.init();

const systemMessageFileLocation = '/chat-system-message';

const joy1 = new JoystickHandler();
const joy2 = new JoystickHandler();
const robotControl = new JoysToRobot(joy1, joy2);

const App = () => {
  const [data, setState] = useState(0);
  useEffect(() => {
    tools.subscribeUI((n) => setState(n));
    return () => {
      tools.unSubscribeUI();
    };
  }, [setState]);

  const [fileContent, setFileContent] = useState<string>('');

  useEffect(() => {
    const loadFile = async () => {
      try {
        const markdown = await fetch(`${systemMessageFileLocation}.md`);
        const text = await markdown.text();
        setFileContent(text);
      } catch (error) {
        console.error('Error fetching file:', error);
      }
    };

    loadFile();
  }, []);

  const ai = new InteractWithAI(fileContent);

  return (
    <div>
      <OverlayGUI ai={ai} data={data} show={true} />
      <CanvasFrame />
      <ChatWindow ai={ai} />
      <JoyController joy={joy1} class="joy1" />
      <JoyController joy={joy2} class="joy2" />
    </div>
  );
};

export default App;
