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
          <mesh castShadow>
            <Go2Robot connection={connection} />
          </mesh>
          <mesh receiveShadow position={[0.0, 0.0, 0.0]}>
            <planeGeometry args={[10, 10]} isBufferGeometry />
            <meshLambertMaterial />
          </mesh>
        </group>

        <Environment background preset="sunset" blur={0.5} />
        <ambientLight intensity={0.5} />

        <pointLight
          castShadow
          position={[2, 1, 2]}
          rotation={[0.0, -0.5, 0.5, 'XYZ']}
          color={0xeeeeff}
          intensity={30}
          shadow-radius={100}
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-camera-near={0.5}
          shadow-camera-far={500}
        />

        <Grid
          infiniteGrid
          renderOrder={-1}
          position={[0.0, -0.005, 0.0]}
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
