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