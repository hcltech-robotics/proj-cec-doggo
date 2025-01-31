# Use ROS2 Humble as base image
FROM ros:humble

ENV ELEVENLABS_KEY=""

# Install foxglove bridge
RUN apt-get update && apt-get install -y \
    ros-humble-foxglove-bridge \
    ros-humble-rosbag2-storage-mcap \
    nlohmann-json3-dev

# Create workspace directory
WORKDIR /ros2_ws/src

# Clone the go2_robot repository (tts branch)
RUN git clone -b tts https://github.com/tfoldi/go2_robot.git
#RUN git clone -b humble https://github.com/ros2/rosidl_dds


# install dep
WORKDIR /ros2_ws
RUN rosdep install --from-paths src --ignore-src -r -y && rm -rf /var/lib/apt/lists/*

# Build the workspace
RUN /bin/bash -c '. /opt/ros/humble/setup.bash && colcon build'


# Create directory for MCAP files
RUN mkdir -p /data/mcap

# Create a simple entrypoint script
RUN echo '#!/bin/bash\n\
source /opt/ros/humble/setup.bash\n\
source /ros2_ws/install/setup.sh\n\
\n\
# Start ros2 bag play in background\n\
if [ -n "$(ls -A /data/mcap)" ]; then\n\
    echo "Starting rosbag play..."\n\
    ros2 bag play --loop /data/mcap/*.mcap  &\n\
fi\n\
\n\
ros2 run go2_tts tts_node --ros-args -p elevenlabs_api_key:='$ELEVENLABS_KEY' -p local_playback:=True &\n\
# Start Foxglove Bridge\n\
ros2 launch foxglove_bridge foxglove_bridge_launch.xml send_buffer_limit:=100000000\n'\
> /entrypoint.sh && chmod +x /entrypoint.sh

# Expose the Foxglove Bridge port
EXPOSE 8765

# Create a volume for MCAP files
VOLUME /data/mcap

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]
