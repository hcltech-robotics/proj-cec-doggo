import { Quaternion, Vector3 } from "three";
import { SceneTransformParam } from "../../types";
import { SceneManager } from "../SceneManager";


function transform_cb(p: SceneTransformParam,s:SceneManager) {
  const { data } = p
  const msgData = data.messageData
  if (data.channelTopic === '/pointcloud') {
    updatePointCloud(data.messageData);
  }
  if (data.channelTopic === "/utlidar/voxel_map_compressed") {
    const vertexBinaryData = data.messageData
    threeJSWorker.postMessage({
      resolution: vertexBinaryData.resolution,
      origin: vertexBinaryData.origin,
      width: vertexBinaryData.width,
      data: vertexBinaryData.data,
    });
  }
  else if (data.channelTopic === "/joint_states") {
    for (let i = 0; i < msgData.name.length; i++) {
      const n = msgData.name[i]
      const v = msgData.position[i]
      s.robot.setJointValue(n, v)
    }
  } else if (data.channelTopic === "/tf") {
    for (let i = 0; i < msgData.transforms.length; i++) {
      const t = msgData.transforms[i]
      const frame = t.child_frame_id
      if (frame === "base_link") {
        const rotation = t.transform.rotation
        robot.quaternion.copy(new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w))

      }
    }
  } else if (data.channelTopic === "/odom") {
    const p = msgData?.pose?.pose?.position ?? null
    if (p) {
      robot.position.copy(new Vector3(p.x, p.y, p.z))
    }
  }
}

export {transform_cb}