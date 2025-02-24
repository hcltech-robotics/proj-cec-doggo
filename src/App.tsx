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
  let [config, setConfig] = useState<Config>(initialConfig);
  let [paused, setPaused] = useState(false);

  useEffect(() => {
    connection.setTopicOverride(topicList.TOPIC_DEPTHCAM, config.depthCamTopic);
    connection.setTopicOverride(topicList.TOPIC_CAMERA, config.cameraTopic);
    connection.connect(config.robotWs);
    chatAgent.setApiKey(config.apiKey);
    visualAgent.setApiKey(config.apiKey, true, { model: 'gpt-4o-mini', maxTokens: 1000, cache: true });
  }, [config]);

  useEffect(() => {
    if (paused) {
      connection.pause();
    } else {
      connection.resume();
    }
  }, [paused]);

  console.log('render');

  return (
    <AppContext.Provider value={{ chatHistory: useChatHistoryStore, connection, chatAgent, visualAgent }}>
      <ControlPanel configChange={setConfig} paused={paused} setPaused={setPaused} />
      <MainScene config={config}>
        <Go2Robot castShadow={config.robotShadow} />
        <VoxelCloud />
      </MainScene>
      {config.joystick ? <JoyController /> : ''}
      {config.showCamera ? <CameraSnapshot /> : ''}
      {config.showDepthCam ? <DepthCam /> : ''}
      <ChatWithAi />
      <BrandLogo />
    </AppContext.Provider>
  );
};

export default App;
