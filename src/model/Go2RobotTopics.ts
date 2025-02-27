import { ClientChannelWithoutId } from '@foxglove/ws-protocol';
import { EnrichedChannel } from './FoxgloveBasics';
import { CompressedImageData, JointState, LidarData, Odometry, ParsedPointCloud2, Transform } from './Go2RobotInterfaces';

export const topicList = {
  TOPIC_JOINT_STATES: '/joint_states',
  TOPIC_ODOM: '/odom',
  TOPIC_TRANSFORM: '/tf',
  TOPIC_LIDAR: '/utlidar/voxel_map_compressed',
  TOPIC_CAMERA: '/camera/compressed',
  TOPIC_DEPTHCAM: '/camera/depth/color/points',
  TOPIC_ROBOT_DESCRIPTION: '/robot_description',
} as const;

export type TopicListName = (typeof topicList)[keyof typeof topicList];

export const subscribedTopics: TopicListName[] = [
  topicList.TOPIC_JOINT_STATES,
  topicList.TOPIC_ODOM,
  topicList.TOPIC_TRANSFORM,
  topicList.TOPIC_LIDAR,
  topicList.TOPIC_CAMERA,
  topicList.TOPIC_DEPTHCAM,
  topicList.TOPIC_ROBOT_DESCRIPTION,
];

export interface TypedChannels {
  [topicList.TOPIC_JOINT_STATES]: EnrichedChannel<JointState>;
  [topicList.TOPIC_ODOM]: EnrichedChannel<Odometry>;
  [topicList.TOPIC_TRANSFORM]: EnrichedChannel<Transform>;
  [topicList.TOPIC_LIDAR]: EnrichedChannel<LidarData>;
  [topicList.TOPIC_CAMERA]: EnrichedChannel<CompressedImageData>;
  [topicList.TOPIC_DEPTHCAM]: EnrichedChannel<ParsedPointCloud2>;
  [topicList.TOPIC_ROBOT_DESCRIPTION]: EnrichedChannel<any>;
}

export const publishTopics = {
  TOPIC_VELOCITY: '/cmd_vel',
  TOPIC_WEBRTC: '/webrtc_req',
  TOPIC_TTS: '/tts',
} as const;

export type PublishTopicListName = (typeof publishTopics)[keyof typeof publishTopics];

export const schemaNames = {
  TWIST: 'geometry_msgs/msg/Twist',
  WEBRTC: 'unitree_go/msg/WebRtcReq',
  TTS: 'go2_tts_msgs/msg/TTSRequest',
};

export const channelDefinitions: Record<PublishTopicListName, ClientChannelWithoutId> = {
  [publishTopics.TOPIC_VELOCITY]: {
    topic: publishTopics.TOPIC_VELOCITY,
    encoding: 'json',
    schemaName: schemaNames.TWIST,
  },
  [publishTopics.TOPIC_WEBRTC]: {
    topic: publishTopics.TOPIC_WEBRTC,
    encoding: 'json',
    schemaName: schemaNames.WEBRTC,
  },
  [publishTopics.TOPIC_TTS]: {
    topic: publishTopics.TOPIC_TTS,
    encoding: 'json',
    schemaName: schemaNames.TTS,
  },
};
