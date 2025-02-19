import { getGuiState } from '../visualizer/settings';

export const getSubscribeChannels = () => {
  return new Set([
    '/joint_states',
    '/odom',
    '/camera/compressed',
    '/tf',
    '/utlidar/voxel_map_compressed',
    '/gpt_cmd',
    '/cmd_vel',
    '/tts',
    ...Object.values(getGuiState('TopicNames')),
  ]);
};
