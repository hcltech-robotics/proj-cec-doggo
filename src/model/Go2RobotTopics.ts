import { EnrichedChannel } from './FoxgloveBasics';
import { JointState, LidarFrame, Odometry, Transform } from './Go2RobotInterfaces';

export const topicList = {
  TOPIC_JOINT_STATES: '/joint_states',
  TOPIC_ODOM: '/odom',
  TOPIC_TRANSFORM: '/tf',
  TOPIC_LIDAR: '/utlidar/voxel_map_compressed',
} as const;

export type TopicListName = (typeof topicList)[keyof typeof topicList];

export const interestingTopics = [topicList.TOPIC_JOINT_STATES, topicList.TOPIC_ODOM, topicList.TOPIC_TRANSFORM, topicList.TOPIC_LIDAR];

export interface TypedChannels {
  [topicList.TOPIC_JOINT_STATES]: EnrichedChannel<JointState>;
  [topicList.TOPIC_ODOM]: EnrichedChannel<Odometry>;
  [topicList.TOPIC_TRANSFORM]: EnrichedChannel<Transform>;
  [topicList.TOPIC_LIDAR]: EnrichedChannel<LidarFrame>;
}
