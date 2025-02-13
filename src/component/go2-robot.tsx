import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect } from 'react';
import { JointState, Odometry, Transform } from 'src/model/unitree-go2.model';
import { RobotCommunication } from 'src/service/robot-communication.service';
import { Vector3, Vector4 } from 'three';
import URDFLoader, { URDFRobot } from 'urdf-loader';
import { TOPIC_JOINT_STATES, TOPIC_ODOM, TOPIC_TRANSFORM } from '../model/channels.model';

const initialJointState = {
  FL_hip_joint: 0.02,
  FR_hip_joint: 0.07,
  RL_hip_joint: 0.02,
  RR_hip_joint: 0.12,
  FL_thigh_joint: 0.75,
  FR_thigh_joint: 0.75,
  RL_thigh_joint: 0.75,
  RR_thigh_joint: 0.75,
  FL_calf_joint: -1.55,
  FR_calf_joint: -1.55,
  RL_calf_joint: -1.55,
  RR_calf_joint: -1.55,
};

const initialPosition = {
  x: 0,
  y: 0,
  z: 0.375,
};

const setJoints = (joints: Record<string, number>, mesh: URDFRobot) => {
  Object.keys(joints).forEach((joint) => {
    mesh.joints[joint]!.setJointValue(joints[joint]!);
  });
};

const updateJoints = (connection: RobotCommunication, mesh: URDFRobot) => {
  const jointState = connection.channelByName[TOPIC_JOINT_STATES]?.lastMessage as JointState;
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

const updatePosition = (connection: RobotCommunication, mesh: URDFRobot) => {
  const odom = connection.channelByName[TOPIC_ODOM]?.lastMessage as Odometry;
  if (odom && odom.pose) {
    setPosition(odom.pose.pose.position, mesh);
  }
};

const setRotation = (rotation: Vector4, mesh: URDFRobot) => {
  mesh.quaternion.copy(rotation);
};

const updateRotation = (connection: RobotCommunication, mesh: URDFRobot) => {
  const transform = connection.channelByName[TOPIC_TRANSFORM]?.lastMessage as Transform;
  if (transform.transforms) {
    const base = transform.transforms.find((t) => t.child_frame_id === 'base_link');
    if (base) {
      setRotation(base?.transform.rotation, mesh);
    }
  }
};

export const Go2Robot = (props: { connection: RobotCommunication; castShadow: boolean }) => {
  const robotMesh = useLoader(URDFLoader as any, '/assets/go2.urdf') as URDFRobot;

  useEffect(() => {
    robotMesh.traverse((c) => (c.castShadow = props.castShadow));
    setJoints(initialJointState, robotMesh);
    setPosition(new Vector3(...Object.values(initialPosition)), robotMesh);
  }, [props.castShadow]);

  useFrame(() => {
    updateJoints(props.connection, robotMesh);
    updatePosition(props.connection, robotMesh);
    updateRotation(props.connection, robotMesh);
  });

  return <primitive object={robotMesh} />;
};
