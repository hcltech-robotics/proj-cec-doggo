import { Environment, Grid, OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { useState } from 'react';
import { ControlPanel } from './component/ControlPanel';
import { Go2Robot } from './component/Go2Robot';
import { RobotCommunication } from './service/RobotCommunicationService';

const connection = new RobotCommunication('ws://10.1.1.145:8765');

const App = () => {
  let [config, setConfig] = useState({ graphStats: true, grid: true, robotShadow: true });

  return (
    <>
      <ControlPanel configChange={setConfig} />
      <Canvas shadows camera={{ position: [-4.0, 4.0, 4.0], fov: 65 }}>
        <Go2Robot connection={connection} castShadow={config.robotShadow} />
        <group rotation={[-3.14 / 2, 0.0, 0.0, 'ZYX']} position={[0.0, -0.04, 0.0]}>
          <mesh receiveShadow position={[0.0, 0.0, 0.04]}>
            <planeGeometry args={[10, 10]} isBufferGeometry />
            <shadowMaterial />
          </mesh>
        </group>
        <Environment background preset="sunset" blur={0.5} />
        <ambientLight intensity={0.4} />
        <directionalLight
          castShadow
          position={[2, 4, 2]}
          rotation={[0.0, -0.5, 0.5, 'XYZ']}
          color={0xddddcc}
          intensity={2}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={0.2}
        />
        {config.grid ? (
          <Grid
            infiniteGrid
            renderOrder={-1}
            position={[0.0, 0.005, 0.0]}
            cellSize={0.45}
            cellThickness={0.6}
            sectionSize={0.45 * 8}
            sectionThickness={2}
            sectionColor={'teal'}
            fadeDistance={50}
          />
        ) : (
          ''
        )}
        x
        <EffectComposer>
          <Bloom luminanceThreshold={2} mipmapBlur />
          <ToneMapping />
        </EffectComposer>
        <OrbitControls enableDamping={true} enableZoom={true} makeDefault minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2} />
        {config.graphStats ? <Stats /> : ''}
      </Canvas>
    </>
  );
};

export default App;
