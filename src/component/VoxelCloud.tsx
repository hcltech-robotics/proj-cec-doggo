import { useFrame, useLoader } from '@react-three/fiber';
import { useContext, useState } from 'react';
import { LidarData } from 'src/model/Go2RobotInterfaces';
import { DoubleSide, NearestFilter, TextureLoader } from 'three';
import { AppContext } from '../AppContext';
import { topicList } from '../model/Go2RobotTopics';

export const VoxelCloud = () => {
  const connection = useContext(AppContext).connection;

  const voxelTex = useLoader(TextureLoader, '/assets/voxel-colors.png');
  voxelTex.minFilter = NearestFilter;
  voxelTex.magFilter = NearestFilter;

  const [data, setData] = useState<LidarData | undefined>(undefined);

  useFrame(() => {
    setData(connection.channelByName[topicList.TOPIC_LIDAR]?.lastMessage);
  });

  return (
    <>
      {data?.geometryData ? (
        <group rotation={[Math.PI / -2, 0.0, 0.0, 'ZYX']} position={[data.origin.at(0)!, data.origin.at(2)!, -1 * data.origin.at(1)!]}>
          <mesh scale={data?.resolution ?? 0.05}>
            <bufferGeometry>
              <bufferAttribute args={[data.geometryData.positions || [], 3]} attach="attributes-position" />
              <bufferAttribute args={[data.geometryData.uvs || [], 2, true]} attach="attributes-uv" />
              <bufferAttribute args={[data.geometryData.indices || [], 1]} attach="index" />
            </bufferGeometry>
            <meshStandardMaterial map={voxelTex} transparent={false} side={DoubleSide} />
          </mesh>
        </group>
      ) : (
        ''
      )}
    </>
  );
};
