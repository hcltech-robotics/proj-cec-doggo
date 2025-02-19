import { Quaternion, Vector3 } from "three";
import { SceneTransformParam } from "../../types";
import { SceneManager } from "../SceneManager";
import { updatePointCloud } from "../views/pointCloud/pointCloudTransformation";
import { updateCameraDepthColors } from '../views/pointCloud/cameraDepthColorPointsTransformation';


function transform_cb(p: SceneTransformParam, s: SceneManager) {
  const { data } = p
  const msgData = data.messageData

  if (data.channelTopic === '/pointcloud') {
    updatePointCloud(s, data.messageData);
  } else if (data.channelTopic === '/camera/depth/color/points') {
    updateCameraDepthColors(s, data.messageData);
  } else if (data.channelTopic === "/utlidar/voxel_map_compressed") {
    const vertexBinaryData = data.messageData
    s.scenes.main.userData.lidarWebWorker?.postMessage({
      resolution: vertexBinaryData.resolution,
      origin: vertexBinaryData.origin,
      width: vertexBinaryData.width,
      data: vertexBinaryData.data,
    });
  } else if (data.channelTopic === "/joint_states") {
    for (let i = 0; i < msgData.name.length; i++) {
      const n = msgData.name[i]
      const v = msgData.position[i]
      s.scenes.main.userData.robot?.setJointValue(n, v)
    }
  } else if (data.channelTopic === "/tf") {
    for (let i = 0; i < msgData.transforms.length; i++) {
      const t = msgData.transforms[i]
      const frame = t.child_frame_id
      if (frame === "base_link") {
        const rotation = t.transform.rotation
        s.scenes.main.userData.robot?.quaternion.copy(new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w))

      }
    }
  } else if (data.channelTopic === "/odom") {
    const p = msgData?.pose?.pose?.position ?? null
    if (p) {
      s.scenes.main.userData.robot?.position.copy(new Vector3(p.x, p.y, p.z))
    }
  }
}

export { transform_cb }
