import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect } from 'react';
import { JointState, Odometry, Transform } from 'src/model/unitree-go2.model';
import { RobotCommunication } from 'src/service/robot-communication.service';
import URDFLoader from 'urdf-loader';
import { TOPIC_JOINT_STATES, TOPIC_ODOM, TOPIC_TRANSFORM } from '../model/channels.model';

const updateJoints = (connection: RobotCommunication, mesh: any) => {
  const jointState = connection.channelByName[TOPIC_JOINT_STATES]?.lastMessage as JointState;
  if (jointState && jointState.name) {
    const joints = jointState?.name.reduce((acc, joint, idx) => {
      acc[joint] = jointState.position[idx]!;
      return acc;
    }, {} as Record<string, number>);

    Object.keys(joints).forEach((joint) => {
      mesh.joints[joint].setJointValue(joints![joint]);
    });
  }
};

const updatePosition = (connection: RobotCommunication, mesh: any) => {
  const odom = connection.channelByName[TOPIC_ODOM]?.lastMessage as Odometry;
  if (odom && odom.pose) {
    mesh.position.copy(odom.pose.pose.position);
  }
};

const updateRotation = (connection: RobotCommunication, mesh: any) => {
  const transform = connection.channelByName[TOPIC_TRANSFORM]?.lastMessage as Transform;
  if (transform.transforms) {
    const base = transform.transforms.find((t) => t.child_frame_id === 'base_link');
    if (base) {
      mesh.quaternion.copy(base?.transform.rotation);
    }

  }
};

export const Go2Robot = (props: { connection: RobotCommunication; joints?: Record<string, number> }) => {
  const robotMesh = useLoader(URDFLoader as any, '/assets/go2.urdf');

  useEffect(() => {
    robotMesh.eulerOrder = 'YXZ';
    robotMesh.rotateX(Math.PI / -4);
  }, []);

  useFrame(() => {
    updateJoints(props.connection, robotMesh);
    updatePosition(props.connection, robotMesh);
    updateRotation(props.connection, robotMesh);
  });

  if (props.joints) {
    Object.keys(props.joints).forEach((joint) => {
      robotMesh.joints[joint].setJointValue(props.joints![joint]);
    });
  }

  return <primitive object={robotMesh} />;
};
