import { useEffect, useRef, useState } from 'react';
import { InteractWithAI } from './helpers/interact-with-ai';
import { JoyController, JoysToRobot, JoystickHandler } from './joystick/joy-controller';
import { CanvasFrame, OverlayGUI } from './overlaygui/overlaygui';
import { SceneManager } from './visualizer/SceneManager';
import { WebSocketEventHandler } from './robot/foxgloveConnection';
import { MessageError } from './interfaces/interact-with-ai.interface';
import { GuiCallback } from './types';
import { getSceneManager } from './visualizer';
import ChatWindow from './components/chatWindow';
import Notification, { NotificationError } from './components/notification';

class ExternalTools {
  sceneManager: SceneManager = getSceneManager();
  guiCallback = (n: number) => {};
  constructor() {}
  init(onEvent: WebSocketEventHandler) {
    this.sceneManager.init(onEvent);
    this.sceneManager.animate();
  }
  reconnectWebsocketConnection(onEvent: WebSocketEventHandler) {
    this.sceneManager.reconnectWebsocketConnection(onEvent);
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
  const hasLoaded = useRef<boolean>(false);
  const hasDevelopmentLoaded = useRef<boolean>(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [aiInstance, setAiInstance] = useState<InteractWithAI | null>(null);
  const [isConnectionFailed, setIsConnectionFailed] = useState<string | null>(null);
  const [chatConnectionError, setChatConnectionError] = useState<NotificationError | null>(null);
  const [tools] = useState(new ExternalTools());

  useEffect(() => {
    tools.subscribeUI((n) => setState(n));
    return () => {
      tools.unSubscribeUI();
    };
  }, [setState]);

  useEffect(() => {
    // Prevent re-running in dev mode
    if (hasDevelopmentLoaded.current) {
      return;
    }
    hasDevelopmentLoaded.current = true;

    tools.init(handleEvent);

    return () => {
      if (tools.sceneManager.client) {
        tools.sceneManager.client.close();
      }
    };
  }, []);

  useEffect(() => {
    const loadFile = async () => {
      // Prevent re-running
      if (hasLoaded.current) {
        return;
      }
      hasLoaded.current = true;

      try {
        const markdown = await fetch(`${systemMessageFileLocation}.md`);
        const text = await markdown.text();
        setFileContent(text);
        setAiInstance(new InteractWithAI(text));
      } catch (error) {
        console.error('Error fetching file:', error);
        setChatConnectionError(error as MessageError);
      }
    };

    loadFile();
  }, []);

  const onError = (error: MessageError) => {
    console.error('OnError about chat: ', error.code, error.message);
    setAiInstance(null);
    setChatConnectionError(error);
  };

  const handleEvent = (event: { type: 'open' | 'close' | 'error'; url: string }) => {
    switch (event.type) {
      case 'open':
        setIsConnectionFailed(null);
        break;
      case 'close':
      case 'error':
        setIsConnectionFailed(event.url);
        break;
    }
  };

  const reconnect = () => {
    setIsConnectionFailed(null);
    tools.reconnectWebsocketConnection(handleEvent);
  };

  return (
    <div>
      {aiInstance && <OverlayGUI ai={aiInstance} data={data} show={true} />}
      <CanvasFrame />
      {aiInstance ? (
        <ChatWindow ai={aiInstance} onError={onError} />
      ) : (
        <Notification
          align="bottom"
          message="Chat is not available. Please check API key in the ⚙️ Configuration panel in the top right corner and refresh the webpage."
          error={chatConnectionError}
        />
      )}
      <JoyController joy={joy1} class="joy1" />
      <JoyController joy={joy2} class="joy2" />
      {isConnectionFailed && (
        <Notification
          error={null}
          content={
            <>
              <p>
                Websocket connection failed to '{isConnectionFailed}'. Please check the URL in the ⚙️ Configuration panel in the top right
                corner and try to reconnect again.
              </p>
              <button onClick={reconnect}>🔄 Try to reconnect</button>
            </>
          }
        />
      )}
    </div>
  );
};

export default App;
