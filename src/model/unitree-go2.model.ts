import { Vector3, Vector4 } from 'three';

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
