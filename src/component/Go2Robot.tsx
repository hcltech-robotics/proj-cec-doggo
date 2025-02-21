import { useFrame, useLoader } from '@react-three/fiber';
import { useContext, useEffect } from 'react';
import { RobotCommunicationService } from 'src/service/RobotCommunicationService';
import { Vector3, Vector4 } from 'three';
import URDFLoader, { URDFRobot } from 'urdf-loader';
import { AppContext } from '../AppContext';
import { initialJointState, initialPosition } from '../model/Go2RobotInterfaces';
import { topicList } from '../model/Go2RobotTopics';

const setJoints = (joints: Record<string, number>, mesh: URDFRobot) => {
  Object.keys(joints).forEach((joint) => {
    mesh.joints[joint]!.setJointValue(joints[joint]!);
  });
};

const updateJoints = (connection: RobotCommunicationService, mesh: URDFRobot) => {
  const jointState = connection.channelByName[topicList.TOPIC_JOINT_STATES]?.lastMessage;
  if (jointState && jointState.name) {
    const joints = jointState.name.reduce((acc, joint, idx) => {
      acc[joint] = jointState.position[idx]!;
      return acc;
    }, {} as Record<string, number>);

    setJoints(joints, mesh);
  }
};

const setPosition = (position: Vector3, mesh: URDFRobot) => {
  mesh.position.copy(position);
};

const updatePosition = (connection: RobotCommunicationService, mesh: URDFRobot) => {
  const odom = connection.channelByName[topicList.TOPIC_ODOM]?.lastMessage;
  if (odom && odom.pose) {
    setPosition(odom.pose.pose.position, mesh);
  }
};

const setRotation = (rotation: Vector4, mesh: URDFRobot) => {
  mesh.quaternion.copy(rotation);
};

const updateRotation = (connection: RobotCommunicationService, mesh: URDFRobot) => {
  const transform = connection.channelByName[topicList.TOPIC_TRANSFORM]?.lastMessage;
  if (transform?.transforms) {
    const base = transform.transforms.find((t) => t.child_frame_id === 'base_link');
    if (base) {
      setRotation(base?.transform.rotation, mesh);
    }
  }
};

export const Go2Robot = (props: { castShadow: boolean }) => {
  const connection = useContext(AppContext).connection;
  const robotMesh = useLoader(URDFLoader as any, '/assets/go2.urdf') as URDFRobot;

  useEffect(() => {
    robotMesh.traverse((c) => (c.castShadow = props.castShadow));
    setJoints(initialJointState, robotMesh);
    setPosition(new Vector3(...Object.values(initialPosition)), robotMesh);
  }, [props.castShadow]);

  useFrame(() => {
    updateJoints(connection, robotMesh);
    updatePosition(connection, robotMesh);
    updateRotation(connection, robotMesh);
  });

  return (
    <group rotation={[Math.PI / -2, 0.0, 0.0, 'ZYX']} position={[0.0, -0.04, 0.0]}>
      <primitive object={robotMesh} />
    </group>
  );
};
