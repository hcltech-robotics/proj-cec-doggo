import { useEffect, useState } from 'react';
import { CameraSnapshot } from './component/CameraSnapshot';
import { Chatbox } from './component/ChatBox';
import { Config, ControlPanel } from './component/ControlPanel';
import { Go2Robot } from './component/Go2Robot';
import { MainScene } from './component/MainScene';
import { VoxelCloud } from './component/VoxelCloud';
import { LlmCommunicationService } from './service/LlmCommunicationService';
import { RobotCommunication } from './service/RobotCommunicationService';

const connection = new RobotCommunication('ws://10.1.1.145:8765');
const chatAgent = new LlmCommunicationService('');
const visualAgent = new LlmCommunicationService('');

const App = () => {
  let [config, setConfig] = useState<Config>({ graphStats: true, grid: true, robotShadow: true, apiKey: '' });

  useEffect(() => {
    chatAgent.setApiKey(config.apiKey);
    visualAgent.setApiKey(config.apiKey, true);
  }, [config]);

  return (
    <>
      <ControlPanel configChange={setConfig} />
      <MainScene config={config}>
        <Go2Robot connection={connection} castShadow={config.robotShadow} />
        <VoxelCloud connection={connection} />
      </MainScene>
      <CameraSnapshot connection={connection} />
      <Chatbox connection={connection} llm={chatAgent} />
    </>
  );
};

export default App;
