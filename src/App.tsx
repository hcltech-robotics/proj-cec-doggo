import { Grid, OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Go2Robot } from './component/go2-robot';
import { RobotCommunication } from './service/robot-communication.service';

const connection = new RobotCommunication('ws://10.1.1.145:8765');

const App = () => {
  return (
    <>
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <Grid
          infiniteGrid
          renderOrder={-1}
          position={[0, -0.45, 0]}
          cellSize={0.45}
          cellThickness={0.6}
          sectionSize={0.45 * 8}
          sectionThickness={2}
          sectionColor={'teal'}
          fadeDistance={50}
        />
        <OrbitControls enableDamping={true} enableZoom={true} makeDefault minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
        <Go2Robot connection={connection} />
        <Stats />
      </Canvas>
    </>
  );
};

export default App;
