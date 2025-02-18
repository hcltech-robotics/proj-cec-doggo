import { useEffect, useState } from 'react';
import ChatWindow from './components/chatWindow';
import { InteractWithAI } from './helpers/interact-with-ai';
import { JoyController, JoysToRobot, JoystickHandler } from './joystick/joy-controller';
import { CanvasFrame, OverlayGUI } from './overlaygui/overlaygui';
import { GuiCallback } from './types';
import { getSceneManager } from './visualizer';
import { SceneManager } from './visualizer/SceneManager';
import { WebSocketEventHandler } from './robot/foxgloveConnection';

class ExternalTools {
  sceneManager: SceneManager = getSceneManager();
  guiCallback = (n: number) => {};
  constructor() {}
  init(onEvent: WebSocketEventHandler) {
    this.sceneManager.init(onEvent);
    this.sceneManager.animate();
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

const systemMessageFileLocation = '/chat-system-message';

const joy1 = new JoystickHandler();
const joy2 = new JoystickHandler();
const robotControl = new JoysToRobot(joy1, joy2);

const App = () => {
  const [data, setState] = useState(0);
  const [fileContent, setFileContent] = useState<string>('');
  const [isConnectionFailed, setIsConnectionFailed] = useState<boolean>(false);

  const tools = new ExternalTools();
  const ai = new InteractWithAI(fileContent);

  useEffect(() => {
    tools.subscribeUI((n) => setState(n));
    return () => {
      tools.unSubscribeUI();
    };
  }, [setState]);
  
  useEffect(() => {
    tools.init(handleEvent);

    return () => {
      if (tools.sceneManager.client) {
        tools.sceneManager.client.close();
      }
    };
  }, []);

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


  const reconnect = () => {
    tools.init(handleEvent);
  };
 
  const handleEvent = (event: 'open' | 'close' | 'error') => {
    switch (event) {
      case 'open':
        setIsConnectionFailed(false);
        break;
      case 'close':
      case 'error':
        setIsConnectionFailed(true);
        break;
    }
  };

  return (
    <div>
      <OverlayGUI ai={ai} data={data} show={true} />
      <CanvasFrame />
      <ChatWindow ai={ai} />
      <JoyController joy={joy1} class="joy1" />
      <JoyController joy={joy2} class="joy2" />
      <div className={`failed-connection-wrapper ${isConnectionFailed ? 'show' : ''} `}>
        <p>Websocket connection <span>failed</span>. Please check the URL in the Configuration panel and try to <button onClick={reconnect}>reconnect</button> again.</p>
      </div>
    </div>
  );
};

export default App;
