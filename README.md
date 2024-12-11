# hackathon-robotics
Go2 visualization

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