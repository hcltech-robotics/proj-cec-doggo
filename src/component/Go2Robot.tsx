import { useFrame, useLoader } from '@react-three/fiber';
import { useContext, useEffect, useMemo, useState } from 'react';
import { RobotCommunicationService } from 'src/service/RobotCommunicationService';
import { LoadingManager, Vector3, Vector4 } from 'three';
import URDFLoader, { URDFRobot } from 'urdf-loader';
import { AppContext } from '../AppContext';
import { initialJointState, initialPosition, packageOverrides } from '../model/Go2RobotInterfaces';
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
  const [robotXml, setRobotXml] = useState<string | null>(null);

  let robotMesh = useLoader(URDFLoader as any, '/assets/go2.urdf', (loader) => {
    loader.packages = packageOverrides;
  }) as URDFRobot;

  useEffect(() => {
    const handleRobotMessage = (e: Event) => {
      const event = e as CustomEvent<{ topic: string }>;
      if (event.detail.topic === topicList.TOPIC_ROBOT_DESCRIPTION) {
        const robotDescription = connection.channelByName[topicList.TOPIC_ROBOT_DESCRIPTION]?.lastMessage;
        if (robotDescription?.data) {
          setRobotXml(robotDescription.data);
        }
      }
    };

    document.addEventListener('robotMessage', handleRobotMessage);

    return () => {
      document.removeEventListener('robotMessage', handleRobotMessage);
    };
  }, [connection]);

  useMemo(() => {
    if (robotXml) {
      try {
        const manager = new LoadingManager();
        const loader = new URDFLoader(manager);
        loader.packages = packageOverrides;
        robotMesh = loader.parse(robotXml);
      } catch (e) {
        console.error('Robot mesh loading from direct XML failed:', e);
      }
    }
  }, [robotXml]);

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
      {robotMesh && <primitive object={robotMesh} />}
    </group>
  );
};
