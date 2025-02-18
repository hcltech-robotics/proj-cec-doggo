import { Vector3, Vector4 } from 'three';

export const robotCommands = {
  Damp: 1001,
  BalanceStand: 1002,
  StopMove: 1003,
  StandUp: 1004,
  StandDown: 1005,
  RecoveryStand: 1006,
  Euler: 1007,
  Move: 1008,
  Sit: 1009,
  RiseSit: 1010,
  SwitchGait: 1011,
  Trigger: 1012,
  BodyHeight: 1013,
  FootRaiseHeight: 1014,
  SpeedLevel: 1015,
  Hello: 1016,
  Stretch: 1017,
  TrajectoryFollow: 1018,
  ContinuousGait: 1019,
  Content: 1020,
  Wallow: 1021,
  Dance1: 1022,
  Dance2: 1023,
  GetBodyHeight: 1024,
  GetFootRaiseHeight: 1025,
  GetSpeedLevel: 1026,
  SwitchJoystick: 1027,
  Pose: 1028,
  Scrape: 1029,
  FrontFlip: 1030,
  FrontJump: 1031,
  FrontPounce: 1032,
  WiggleHips: 1033,
  GetState: 1034,
  EconomicGait: 1035,
  FingerHeart: 1036,
  Handstand: 1301,
  CrossStep: 1302,
  OnesidedStep: 1303,
  Bound: 1304,
  MoonWalk: 1305,
  StandOut: 1039,
  FreeWalk: 1045,
  Standup: 1050,
  CrossWalk: 1051,
} as const;

export type RobotCommand = (typeof robotCommands)[keyof typeof robotCommands];

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

export interface Point {
  x: number | undefined;
  y: number | undefined;
  z: number | undefined;
}

export interface TwistMessage {
  linear: Point;
  angular: Point;
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

export interface CompressedImageData {
  data: Uint8Array;
  format: string;
  header: { stamp: { sec: number; nanosec: number }; frame_id: string };
}

export interface WebRtcMessage {
  api_id: number;
  topic: string;
}
