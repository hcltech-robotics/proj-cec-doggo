import { useEffect, useRef, useState } from 'react';
import ChatWindow from './components/chatWindow';
import { InteractWithAI } from './helpers/interact-with-ai';
import { JoyController, JoysToRobot, JoystickHandler } from './joystick/joy-controller';
import { CanvasFrame, OverlayGUI } from './overlaygui/overlaygui';
import { GuiCallback } from './types';
import { getSceneManager } from './visualizer';
import Notification from './components/Notification';

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
  const hasLoaded = useRef<boolean>(false);
  const [fileContent, setFileContent] = useState<string>('');
  // const [notification, setNotification] = useState<string | null>(null);
  const [aiInstance, setAiInstance] = useState<InteractWithAI | null>(null);
  const [notification, setNotification] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    try {
      setNotification(null);
      setAiInstance(new InteractWithAI(fileContent));
    } catch (error) {
      console.error('Error initializing AI:', error);
      setNotification(
        <Notification
          content={
            <div>
              <span>Chat is not available. Please check API key in the Configuration panel and refresh the webpage.</span>
              <br />
              <br />
              <span>{error instanceof Error ? `Error: ${error.message}.` : 'An unknown error occurred'}</span>
            </div>
          }
          isClosable={false}
        />,
      );
    }
  }, []);

  useEffect(() => {
    tools.subscribeUI((n) => setState(n));
    return () => {
      tools.unSubscribeUI();
    };
  }, [setState]);

  useEffect(() => {
    const loadFile = async () => {
      if (hasLoaded.current) return; // Prevent re-running
      hasLoaded.current = true;

      try {
        const markdown = await fetch(`${systemMessageFileLocation}.md`);
        const text = await markdown.text();
        console.trace('file load');
        setFileContent(text);
      } catch (error) {
        console.error('Error fetching file:', error);
      }
    };

    loadFile();
  }, []);

  const onError = (error: unknown) => {
    setNotification(
      <Notification
        content={
          error.status === 401 ? (
            <div>
              <span>Chat is not available. Please check API key in the Configuration panel and refresh the webpage.</span>
            </div>
          ) : (
            <div>
              <span>Chat is not available.</span>
              <br />
              <br />
              <span>{error instanceof Error ? `Error: ${error.message}.` : 'An unknown error occurred'}</span>
            </div>
          )
        }
        isClosable={false}
      />,
    );
  };

  return (
    <div>
      <OverlayGUI ai={aiInstance} data={data} show={true} />
      <CanvasFrame />
      {!notification ? <ChatWindow ai={aiInstance} onError={onError} /> : notification}
      {/* {!hasAILoaded && notification} */}
      <JoyController joy={joy1} class="joy1" />
      <JoyController joy={joy2} class="joy2" />
    </div>
  );
};

export default App;
