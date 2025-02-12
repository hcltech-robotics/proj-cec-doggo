import { Environment, Grid, OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { Object3D, Vector3 } from 'three';
import { Go2Robot } from './component/go2-robot';
import { RobotCommunication } from './service/robot-communication.service';

const connection = new RobotCommunication('ws://10.1.1.145:8765');

const App = () => {
  Object3D.DEFAULT_UP = new Vector3(0, 0, 1);

  return (
    <>
      <Canvas shadows camera={{ position: [-4.0, 4.0, 4.0], fov: 65 }}>
        <scene>
          <Go2Robot connection={connection} />

          <mesh receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial />
          </mesh>

          <directionalLight castShadow position={[1, 1, 2]} rotation={[0, -0.5, 0]} color={0xeeeeff} intensity={2} shadow-radius={5} />

          <group receiveShadow rotation={[3.14 / 2, 0.0, 0.0, 'ZYX']} position={[0.0, 0.0, 0.045]}>
            <Environment background preset="sunset" blur={0.5} />
            <ambientLight intensity={0.5} />
            <Grid
              infiniteGrid
              renderOrder={-1}
              position={[0.0, 0.0, 0.045]}
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
          </group>
        </scene>

        <OrbitControls enableDamping={true} enableZoom={true} makeDefault minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2} />
        <Stats />
      </Canvas>
    </>
  );
};

export default App;
