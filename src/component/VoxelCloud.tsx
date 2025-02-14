import { useFrame, useLoader } from '@react-three/fiber';
import { useState } from 'react';
import { LidarData } from 'src/model/Go2RobotInterfaces';
import { RobotCommunication } from 'src/service/RobotCommunicationService';
import { DoubleSide, NearestFilter, TextureLoader } from 'three';
import { topicList } from '../model/Go2RobotTopics';

export const VoxelCloud = (props: { connection: RobotCommunication }) => {
  const voxelTex = useLoader(TextureLoader, '/assets/voxel-colors.png');
  voxelTex.minFilter = NearestFilter;
  voxelTex.magFilter = NearestFilter;

  const [data, setData] = useState<LidarData | undefined>(undefined);

  useFrame(() => {
    setData(props.connection.channelByName[topicList.TOPIC_LIDAR]?.lastMessage);
  });

  return (
    <>
      {data?.geometryData ? (
        <group rotation={[-3.14 / 2, 0.0, 0.0, 'ZYX']} position={[data.origin.at(0)!, data.origin.at(2)!, -1 * data.origin.at(1)!]}>
          <mesh scale={data?.resolution ?? 0.05} receiveShadow>
            <bufferGeometry>
              <bufferAttribute args={[data.geometryData.positions || [], 3]} attach="attributes-position" />
              <bufferAttribute args={[data.geometryData.uvs || [], 2, true]} attach="attributes-uv" />
              <bufferAttribute args={[data.geometryData.indices || [], 1]} attach="index" />
            </bufferGeometry>
            <meshStandardMaterial side={DoubleSide} map={voxelTex} transparent={false} vertexColors />
          </mesh>
        </group>
      ) : (
        <mesh castShadow>
          <sphereGeometry args={[0.4, 36, 36]} />
          <meshStandardMaterial side={DoubleSide} map={voxelTex} transparent={false} />
        </mesh>
      )}
    </>
  );
};
