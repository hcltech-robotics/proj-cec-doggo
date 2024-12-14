# Get data from rosbag

```bash
ros2 bag --help
ros2 bag play <path_to_rosbag>
ros2 topic list
# e.g. /unitree_go2/joint_states

pip install foxglove-bridge
foxglove-bridge
wscat -c ws://localhost:8765

```

```json
{
    "op": "subscribe",
    "id": "1",
    "topic": "/unitree_go2/joint_states"
}

```

## WS client

```js
const socket = new WebSocket('ws://localhost:8765');

socket.onopen = () => {
    socket.send(JSON.stringify({
        op: "subscribe",
        id: "1",
        topic: "/unitree_go2/joint_states"
    }));
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.topic === '/unitree_go2/joint_states') {
        updateURDF(data.message);
    }
};

function updateURDF(jointState) {
    // Handle URDF updates here
    console.log(jointState);
}
```

## Threejs joints

```js
function updateURDF(jointState) {
    if (!robot) return;

    const jointNames = jointState.name;
    const jointPositions = jointState.position;

    for (let i = 0; i < jointNames.length; i++) {
        const jointName = jointNames[i];
        const jointValue = jointPositions[i];

        const joint = robot.getObjectByName(jointName);
        if (joint) {
            joint.setJointValue(jointValue);
        }
    }
}
```

```bash
pip install mcap
mcap info <filename>.mcap
mcap cat --output-format=rosbag <filename>.mcap > output.bag

mcap cat --output-format=rosbag <filename>.mcap > output.bag
ros2 bag play output.bag

mcap info <filename>.mcap
```
## Install and validate tools
```bash
sudo apt install npm
sudo npm install -g wscat
wscat --version

pip install foxglove-bridge
foxglove-bridge --help


pip install mcap
mcap --version
pip install mcap-ros2-support
pip install foxglove-bridge

wscat -c ws://echo.websocket.org
http://localhost:8765
mcap info <your_file>.mcap

sudo apt install ros-rolling-rosbag2-storage-mcap
pip install mcap-ros2-support
sudo apt install ros-humble-rosbag2-storage-mcap

https://docs.foxglove.dev/docs/connecting-to-data/ros-foxglove-bridge/
sudo apt install ros-$ROS_DISTRO-foxglove-bridge
sudo snap install foxglove-studio
foxglove-studio
```


## Playground

```bash
# ros2 bag play -s mcap ./rosbag2_2024_12_09-18_48_17_0.mcap 
ros2 bag play -s mcap .

ros2 launch foxglove_bridge foxglove_bridge_launch.xml send_buffer_limit:=100000000
```

```bash
ros topic list
```