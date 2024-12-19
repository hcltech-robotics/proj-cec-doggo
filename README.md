# hackathon-robotics
Go2 visualization

![image](https://github.com/user-attachments/assets/ffc47eb6-c556-4cbc-b85f-6881ba3cf6ea)


setxkbmap -option caps:swapescape

```bash
#termnal1
pyenv shell system
ros2 launch foxglove_bridge foxglove_bridge_launch.xml send_buffer_limit:=100000000
# terminal2
cd components/ros-playback/rosbag2_2024_12_09-18_48_17/
ros2 bag play -s mcap .
# terminal3
foxglove-studio
# terminal4
cd components/vite-threejs
npm run dev
```

```

  "/gpt_cmd",
  "/joy"
    "/cmd_vel"
[
  "/utlidar/foot_position",
  "/utlidar/imu",
  "/gnss",
  "/lowcmd",
  "/sportmodestate",
  "/utlidar/range_info",
  "/uslam/frontend/cloud_world_ds",
  "/gptflowfeedback",
  "/audioreceiver",
  "/mf/sportmodestate",
  "/utlidar/robot_pose",
  "/multiplestate",
  "/parameter_events",
  "/rosout",
  "/uslam/client_command",
  "/public_network_status",
  "/uslam/frontend/odom",
  "/utlidar/mapping_cmd",
  "/wirelesscontroller_unprocessed",
  "/qt_notice",
  "/uslam/cloud_map",
  "/webrtcreq",
  "/rtc/state",
  "/uslam/localization/cloud_world",
  "/rtc_status",
  "/xfk_webrtcreq",
  "/wirelesscontroller",
  "/videohub/inner",
  "/utlidar/voxel_map_compressed",
  "/utlidar/range_map",
  "/utlidar/lidar_state",
  "/uwbstate",
  "/utlidar/height_map_array",
  "/utlidar/grid_map",
  "/utlidar/cloud",
  "/uslam/navigation/global_path",
  "/lowstate",
  "/lio_sam_ros2/mapping/odometry",
  "/xfk_webrtcres",
  "/utlidar/voxel_map",
  "/selftest",
  "/lf/sportmodestate",
  "/gpt_cmd",
  "/gas_sensor",
  "/programming_actuator/feedback",
  "/uwbswitch",
  "/utlidar/switch",
  "/audiosender",
  "/programming_actuator/command",
  "/audiohub/player/state",
  "/uslam/server_log",
  "/utlidar/cloud_deskewed",
  "/uslam/localization/odom",
  "/servicestateactivate",
  "/webrtcres",
  "/utlidar/height_map",
  "/lf/lowstate",
  "/servicestate",
  "/utlidar/robot_odom",
  "/tf",
  "/robot_description",
  "/scan",
  "/joint_states",
  "/tf_static",
  "/clock",
  "/pointcloud",
  "/odom",
  "/joy",
  "/imu",
  "/cmd_vel"
]
```
