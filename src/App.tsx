import { useState } from 'react';
import { ControlPanel } from './component/ControlPanel';
import { Go2Robot } from './component/Go2Robot';
import { MainScene } from './component/MainScene';
import { VoxelCloud } from './component/VoxelCloud';
import { RobotCommunication } from './service/RobotCommunicationService';

const connection = new RobotCommunication('ws://10.1.1.145:8765');

const App = () => {
  let [config, setConfig] = useState({ graphStats: true, grid: true, robotShadow: true });

  return (
    <>
      <ControlPanel configChange={setConfig} />
      <MainScene config={config}>
        <Go2Robot connection={connection} castShadow={config.robotShadow} />
        <VoxelCloud connection={connection} />
      </MainScene>
    </>
  );
};

export default App;
