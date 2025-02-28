#!/bin/bash

source /opt/ros/humble/setup.bash
source /ros2_ws/install/setup.sh

if [ -n "${ELEVENLABS_KEY}" ]; then
    ros2 run go2_tts tts_node --ros-args -p elevenlabs_api_key:=${ELEVENLABS_KEY} -p local_playback:=True &
else
    echo -e "\n\e[37;101m ELEVENLABS_KEY is empty, not starting TTS node \e[0m\n"
fi

ros2 launch foxglove_bridge foxglove_bridge_launch.xml send_buffer_limit:=100000000 &

if [ -n "$(ls -A /data/mcap)" ]; then
    echo "Starting rosbag play..."
    ros2 bag play --loop /data/mcap/*.mcap
else
    echo -e "\n\e[37;101m No mcap folder mounted! Use --volume /path/to/mcap/:/data/mcap \e[0m\n"
fi
