import { Vector3, Vector4 } from 'three';

export const initialJointState = {
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

export const initialPosition = {
  x: 0,
  y: 0,
  z: 0.375,
};

export interface TwistMessage {
  linear: Vector3;
  angular: Vector3;
}

export interface JointState {
  header: { stamp: { sec: number; nanosec: number }; frame_id: string };
  name: string[];
  position: Record<number, number>;
  velocity: any;
  effort: any;
}

export interface Odometry {
  header: { stamp: { sec: number; nanosec: number }; frame_id: string };
  child_frame_id: string;
  pose: {
    pose: {
      position: Vector3;
      orientation: Vector3;
    };
    covariance: Record<string, number>;
  };
  twist: {
    twist: TwistMessage;
    covariance: Record<string, number>;
  };
}

export interface Transform {
  transforms: {
    header: { stamp: { sec: number; nanosec: number }; frame_id: string };
    child_frame_id: string;
    transform: { translation: Vector3; rotation: Vector4 };
  }[];
}

export interface LidarFrame {
  data: Uint8Array;
  frame_id: string;
  origin: Float64Array;
  resolution: number;
  src_size: BigInt;
  stamp: number;
  width: Int16Array;
}

export interface LidarData {
  geometryData: {
    point_count: number;
    face_count: number;
    positions: Uint8Array;
    uvs: Uint8Array;
    indices: Uint32Array;
  };
  resolution: number;
  origin: Float64Array;
}
