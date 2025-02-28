# Use ROS2 Humble as base image
FROM ros:humble

ARG ELEVENLABS_KEY=""
ENV ELEVENLABS_KEY=${ELEVENLABS_KEY}

# Install foxglove bridge
RUN apt-get update && apt-get install -y \
    ros-humble-foxglove-bridge \
    ros-humble-rosbag2-storage-mcap \
    nlohmann-json3-dev \
    python3-requests \
    python3-pydub

# Create workspace directory
WORKDIR /ros2_ws/src

# Clone the go2_robot repository (tts branch)
RUN git clone -b tts https://github.com/tfoldi/go2_robot.git

# install dep
WORKDIR /ros2_ws
RUN rosdep install --from-paths src --ignore-src -r -y && rm -rf /var/lib/apt/lists/*

# Build the workspace
RUN /bin/bash -c '. /opt/ros/humble/setup.bash && colcon build'

# Create directory for MCAP files
# RUN mkdir -p /data/mcap

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose the Foxglove Bridge port
EXPOSE 8765

# Create a volume for MCAP files
VOLUME /data/mcap

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]
