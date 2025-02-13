import { Environment, Grid, OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { Go2Robot } from './component/go2-robot';
import { RobotCommunication } from './service/robot-communication.service';

const connection = new RobotCommunication('ws://10.1.1.145:8765');

const App = () => {
  return (
    <>
      <Canvas shadows camera={{ position: [-4.0, 4.0, 4.0], fov: 65 }}>
        <group rotation={[-3.14 / 2, 0.0, 0.0, 'ZYX']} position={[0.0, -0.04, 0.0]}>
          <Go2Robot connection={connection} />
        </group>

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
        <EffectComposer>
          <Bloom luminanceThreshold={2} mipmapBlur />
          <ToneMapping />
        </EffectComposer>
        <OrbitControls enableDamping={true} enableZoom={true} makeDefault minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2} />
        <Stats />
      </Canvas>
    </>
  );
};

export default App;
