import { ContactShadows, Environment, Grid, OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { Go2Robot } from './component/go2-robot';
import { RobotCommunication } from './service/robot-communication.service';
import { useRef } from 'react';
import { DirectionalLight } from 'three';

const connection = new RobotCommunication('ws://10.1.1.145:8765');

const App = () => {
  const lh = useRef(new DirectionalLight());

  return (
    <>
      <Canvas shadows camera={{ position: [-4.0, 4.0, 4.0], fov: 65 }}>
        <group castShadow receiveShadow rotation={[-3.14 / 2, 0.0, 0.0, 'ZYX']} position={[0.0, -0.04, 0.0]}>
          <mesh castShadow receiveShadow>
            <Go2Robot connection={connection} />
          </mesh>

          <mesh receiveShadow>
            <planeGeometry args={[10, 10]} isBufferGeometry />
            <meshStandardMaterial />
          </mesh>
        </group>

        <directionalLight
          position={[2, 1, 2]}
          rotation={[0.0, -0.5, 0.5, 'XYZ']}
          color={0xeeeeff}
          intensity={3}
          shadow-radius={10}
          ref={lh}
        />
        {/* <directionalLightHelper args={[lh.current, 1, 'red']} color={'red'} />
        <ContactShadows blur={0.8} opacity={0.9} far={10} /> */}

        <Environment background preset="sunset" blur={0.5} />
        <ambientLight intensity={0.5} />
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
