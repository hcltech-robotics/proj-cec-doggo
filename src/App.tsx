import { useEffect, useState } from 'react';
import { AppContext } from './AppContext';
import { BrandLogo } from './component/BrandLogo';
import { CameraSnapshot } from './component/CameraSnapshot';
import { ChatWithAi } from './component/ChatWithAi';
import { Config, ControlPanel, initialConfig } from './component/ControlPanel';
import { DepthCam } from './component/DepthCam';
import { Go2Robot } from './component/Go2Robot';
import { JoyController } from './component/JoyController';
import { MainScene } from './component/MainScene';
import { VoxelCloud } from './component/VoxelCloud';
import { topicList } from './model/Go2RobotTopics';
import { useChatHistoryStore } from './service/ChatHistoryService';
import { LlmCommunicationService } from './service/LlmCommunicationService';
import { LlmRobotTooling } from './service/LlmRobotTooling';
import { RobotCommunicationService } from './service/RobotCommunicationService';
import { DirectRobotControls } from './component/DirectRobotControls';
import ErrorNotification, { ErrorNotificationMessage } from './component/ErrorNotification';

const connection = new RobotCommunicationService();
const visualAgent = new LlmCommunicationService('');
const tooling = new LlmRobotTooling(connection, visualAgent, useChatHistoryStore);
const chatAgent = new LlmCommunicationService('', tooling);

chatAgent.setSystemPrompt(`
  You are a robot dog (model: Unitree Go2) with sensors and actuators.
  Check if the interaction from a human needs any tools to execute the command precisely.
  Take a step-by-step approach, one tool calling for one step and reuse the result, call the next tool if necessary.
  You must assume that you're just dropped into a situation and you don't know anything about your surroundings nor your current position, so you need to check them first.
  You should act like a regular dog if you're given dog commands.
  Only use tools if that is the best step to be taken, because you may be engaged in simple conversations as well.
`);

visualAgent.setSystemPrompt(
  `These photos are taken by a camera, attached to a robot dog. Describe the photo as detailed as possible, but be brief and factual.`,
);

const App = () => {
  const [config, setConfig] = useState<Config>(initialConfig);
  const [paused, setPaused] = useState(false);
  const [chatError, setChatError] = useState<ErrorNotificationMessage | null>(null);
  const [connectionError, setConnectionError] = useState<ErrorNotificationMessage | null>(null);

  useEffect(() => {
    if (config.apiKey) {
      chatAgent.setApiKey(config.apiKey);
      visualAgent.setApiKey(config.apiKey, true, { model: 'gpt-4o-mini', maxTokens: 1000, cache: true });
    } else {
      setChatError({ code: '-', message: 'API key is missing.', param: undefined, type: 'error' });
    }
  }, [config.apiKey]);

  useEffect(() => {
    connection.setTopicOverride(topicList.TOPIC_DEPTHCAM, config.depthCamTopic);
    connection.setTopicOverride(topicList.TOPIC_CAMERA, config.cameraTopic);
    connection.connect(config.robotWs, setConnectionError);

    return () => {
      connection.disconnect();
    };
  }, [config.robotWs, config.depthCamTopic, config.cameraTopic]);

  useEffect(() => {
    if (paused) {
      connection.pause();
    } else {
      connection.resume();
    }
  }, [paused]);

  const connectToWebsocket = () => {
    connection.connect(config.robotWs, setConnectionError);
  };

  const reconnect = () => {
    setConnectionError(null);
    connectToWebsocket();
  };

  const handleChatError = (error: ErrorNotificationMessage) => {
    setChatError(error);
  };

  return (
    <AppContext.Provider value={{ chatHistory: useChatHistoryStore, connection, chatAgent, visualAgent }}>
      {connectionError && (
        <ErrorNotification
          align="middle"
          message={
            `${connectionError.message}  Please check the URL in the Configuration panel in the top right corner and try to reconnect again.` ||
            'Error'
          }
          errorDetails={null}
          buttonProps={{ title: 'Try to reconnect', onClick: reconnect }}
        />
      )}
      {chatError && (
        <ErrorNotification
          align="bottom"
          message="Chat is not available. Please check API key in the Configuration panel in the top right corner and refresh the webpage."
          errorDetails={chatError}
        />
      )}
      <ControlPanel configChange={setConfig} paused={paused} setPaused={setPaused} />
      <MainScene config={config}>
        <Go2Robot castShadow={config.robotShadow} />
        <VoxelCloud />
      </MainScene>
      {config.joystick ? <JoyController /> : ''}
      {config.showCamera ? <CameraSnapshot /> : ''}
      {config.showDepthCam ? <DepthCam /> : ''}
      <DirectRobotControls />
      {!chatError && <ChatWithAi handleConnection={handleChatError} />}
      <BrandLogo />
    </AppContext.Provider>
  );
};

export default App;
