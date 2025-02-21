import { Grid, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useContext, useMemo, useRef, useState } from 'react';
import { ParsedPointCloud2 } from 'src/model/Go2RobotInterfaces';
import { AppContext } from '../AppContext';
import { useInterval } from '../helper/TimeHooks';
import { topicList } from '../model/Go2RobotTopics';
import './DepthCam.css';

const TARGET_FPS = 30;

export const DepthCam = () => {
  const connection = useContext(AppContext).connection;

  const [stamp, setStamp] = useState<string>('');
  const [zoom, setZoom] = useState<boolean>(false);
  const [data, setData] = useState<ParsedPointCloud2<Float32Array>>();

  const wrapper = useRef<HTMLDivElement>(null);

  useInterval(() => {
    const msg = connection.channelByName[topicList.TOPIC_DEPTHCAM]?.lastMessage;
    if (msg && msg.header) {
      setStamp(`${msg.header.stamp.sec}-${msg.header.stamp.nanosec}`);
    }
  }, 1000 / TARGET_FPS);

  useMemo(() => {
    const msg = connection.channelByName[topicList.TOPIC_DEPTHCAM]?.lastMessage;

    if (msg?.header) {
      const points = new Float32Array(msg.points);
      const colors = new Float32Array(msg.colors);

      // console.log({ p: points.slice(0, 20), c: colors.slice(0, 20) });

      setData({ colors, points, header: msg.header });
    }
  }, [stamp]);

  const changeZoom = () => {
    setZoom(!zoom);
  };

  return (
    <div className={`depthcam zoomed ${zoom ? 'zoomed' : ''}`} ref={wrapper} onDoubleClick={changeZoom}>
      <Canvas className="depthcam-canvas" shadows camera={{ position: [0.1, 0.0, 0.0], fov: 50 }}>
        {data ? (
          <group>
            <mesh rotation={[Math.PI / -2, Math.PI / 2, Math.PI / 2, 'ZYX']}>
              <bufferGeometry>
                <float32BufferAttribute args={[data.points || [], 3]} attach="attributes-position" />
                <float32BufferAttribute args={[data.colors || [], 3]} attach="attributes-color" />
              </bufferGeometry>
            </mesh>
          </group>
        ) : (
          ''
        )}

        <ambientLight intensity={0.5} />
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
        <OrbitControls enableDamping={true} enableZoom={true} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
};
