import { Environment, Grid, OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { PropsWithChildren } from 'react';
import { Config } from './ControlPanel';

export const MainScene = (props: PropsWithChildren<{ config: Config }>) => {
  return (
    <Canvas shadows camera={{ position: [-4.0, 4.0, 4.0], fov: 75 }}>
      {props.children}
      <group rotation={[Math.PI / -2, 0.0, 0.0, 'ZYX']} position={[0.0, -0.04, 0.0]}>
        <mesh receiveShadow position={[0.0, 0.0, 0.04]}>
          <planeGeometry args={[10, 10]} isBufferGeometry />
          <shadowMaterial />
        </mesh>
      </group>
      <Environment background preset="sunset" blur={0.5} />
      <ambientLight intensity={0.5} />
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
      {props.config.grid ? (
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
      <EffectComposer>
        <Bloom luminanceThreshold={2} mipmapBlur />
        <ToneMapping />
      </EffectComposer>
      <OrbitControls enableDamping={true} enableZoom={true} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      {props.config.graphStats ? <Stats /> : ''}
    </Canvas>
  );
};
