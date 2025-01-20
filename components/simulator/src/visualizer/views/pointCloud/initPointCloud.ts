import { Color, DirectionalLight, HemisphereLight, PerspectiveCamera } from "three";
import { SceneManager } from "../../SceneManager";
import { PointcloudScene } from "../../types";
// import { createMockLidarData } from "./mockData";

const pointCloudSceneSize = {
  width: 250,
  height: 150,
}

function createPointCloudScene(s:SceneManager) {
  const pointcloudScene = new PointcloudScene();
  s.scenes.pointcloud = pointcloudScene
  const element = document.createElement('div');
  element.className = 'pointcloud-view';

  element.style.setProperty('--pointcloud-view-width', `${pointCloudSceneSize.width}px`);
  element.style.setProperty('--pointcloud-view-height', `${pointCloudSceneSize.height}px`);
  const sceneElement = document.createElement('div');
  element.appendChild(sceneElement)
  const views = document.getElementById("views")
  if (views) {
    views.appendChild(element)
  }
  const aspectRatio = pointCloudSceneSize.width / pointCloudSceneSize.height
  const pointcloudCamera = new PerspectiveCamera(50, aspectRatio, 0.1, 10)
  pointcloudScene.userData.camera = pointcloudCamera
  pointcloudScene.userData.domElement = sceneElement
  // NOTE: this is useful for debugging
  //const cameraHelper = new CameraHelper(pointcloudCamera)
  //scene.add(cameraHelper)
  s.scenes.pointcloud.userData.camera = pointcloudCamera
  pointcloudScene.add(new HemisphereLight(0xaaaaaa, 0x444444, 3));

  const light = new DirectionalLight(0xffffff, 1.5);
  light.position.set(1, 1, 1);
  pointcloudScene.add(light);
  pointcloudScene.background = new Color().setHex(0x112233);

  // createMockLidarData(s)
}

export { createPointCloudScene }