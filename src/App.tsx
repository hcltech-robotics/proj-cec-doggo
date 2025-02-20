import { useEffect, useState } from 'react';
import { AppContext } from './AppContext';
import { CameraSnapshot } from './component/CameraSnapshot';
import { ChatWithAi } from './component/ChatWithAi';
import { Config, ControlPanel, initialConfig } from './component/ControlPanel';
import { Go2Robot } from './component/Go2Robot';
import { MainScene } from './component/MainScene';
import { VoxelCloud } from './component/VoxelCloud';
import { useChatHistoryStore } from './service/ChatHistoryService';
import { LlmCommunicationService } from './service/LlmCommunicationService';
import { LlmRobotTooling } from './service/LlmRobotTooling';
import { RobotCommunicationService } from './service/RobotCommunicationService';

const connection = new RobotCommunicationService();
const tooling = new LlmRobotTooling(connection);
const chatAgent = new LlmCommunicationService('', tooling);
const visualAgent = new LlmCommunicationService('');

const App = () => {
  let [config, setConfig] = useState<Config>(initialConfig);

  useEffect(() => {
    connection.connect(config.robotWs);
    chatAgent.setApiKey(config.apiKey);
    visualAgent.setApiKey(config.apiKey, true);
  }, [config]);

  return (
    <AppContext.Provider value={{ chatHistory: useChatHistoryStore, connection, chatAgent, visualAgent }}>
      <ControlPanel configChange={setConfig} />
      <MainScene config={config}>
        <Go2Robot castShadow={config.robotShadow} />
        <VoxelCloud />
      </MainScene>
      <CameraSnapshot />
      <ChatWithAi />
    </AppContext.Provider>
  );
};

export default App;
