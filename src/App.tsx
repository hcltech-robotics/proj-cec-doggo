import { Grid, OrbitControls } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import URDFLoader from 'urdf-loader';

const Go2Robot = (props: { joints?: Record<string, number> }) => {
  const robotMesh = useLoader(URDFLoader as any, '/assets/go2.urdf');

  if (props.joints) {
    Object.keys(props.joints).forEach((joint) => {
      robotMesh.joints[joint].setJointValue(props.joints![joint]);
    });
  }

  return <primitive object={robotMesh} />;
};

const App = () => {
  return (
    <>
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <Grid
          renderOrder={-1}
          position={[0, -1.85, 0]}
          infiniteGrid
          cellSize={0.6}
          cellThickness={0.6}
          sectionSize={3.3}
          sectionThickness={1.5}
          sectionColor={'purple'}
          fadeDistance={30}
        />
        <OrbitControls enableDamping={true} enableZoom={true} makeDefault minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} />
        <Go2Robot />
      </Canvas>
    </>
  );
};

export default App;
