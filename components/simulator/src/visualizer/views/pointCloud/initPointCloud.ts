import { AxesHelper, Color, DirectionalLight, GridHelper, HemisphereLight, PerspectiveCamera, Vector3 } from "three";
import { SceneManager } from "../../SceneManager";
import { PointcloudScene } from "../../types";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { createMockLidarData } from "./mockData";

const pointCloudSceneSize = {
  width: 320,
  height: 180,
}

const createCameraControls = (camera: PerspectiveCamera, canvas: HTMLElement, s: SceneManager): OrbitControls => {
  const cameraControls = new OrbitControls(camera, canvas);
  cameraControls.enableDamping = true;
  cameraControls.update();

  return cameraControls;
};

const createGridHelper = (scene: PointcloudScene) => {
  const gridHelper = new GridHelper(50, 20, 'teal', 'darkgray')
  gridHelper.position.y = -0.01;
  gridHelper.rotateX(Math.PI / 2);
  scene.add(gridHelper);
};

const createAxesHelper = (scene: PointcloudScene) => {
  scene.add(new AxesHelper(10));
};

function createPointCloudScene(s:SceneManager) {
  const pointcloudScene = new PointcloudScene();
  s.scenes.pointcloud = pointcloudScene
  const element = document.createElement('div');
  element.className = `pointcloud-view ${s.userSettings.pointCloudScene.enabled ? '' : 'hidden'}`;

  element.style.setProperty('--pointcloud-view-width', `${pointCloudSceneSize.width}px`);
  element.style.setProperty('--pointcloud-view-height', `${pointCloudSceneSize.height}px`);
  const sceneElement = document.createElement('div');
  sceneElement.className = 'pointcloud-view-scene';
  element.appendChild(sceneElement)
  element.addEventListener('dblclick', (event: MouseEvent) => {
    const target = event.currentTarget as Element;
    target?.classList.toggle('zoom');
  });
  const views = document.getElementById("views")
  const sideViews = document.getElementById("side-views")
  if (views) {
    views.appendChild(element)
  }

  if (sideViews) {
    sideViews.appendChild(element)
  }
  const aspectRatio = pointCloudSceneSize.width / pointCloudSceneSize.height
  const pointcloudCamera = new PerspectiveCamera(50, aspectRatio, 0.1, 100)
  pointcloudCamera.position.copy(s.scenes.pointcloud.userData.resetPosition);
  pointcloudScene.userData.camera = pointcloudCamera
  pointcloudScene.userData.domElement = sceneElement
  // NOTE: this is useful for debugging
  //const cameraHelper = new CameraHelper(pointcloudCamera)
  //scene.add(cameraHelper)
  s.scenes.pointcloud.userData.camera = pointcloudCamera
  s.scenes.pointcloud.userData.domElement = sceneElement;
  pointcloudScene.add(new HemisphereLight(0xaaaaaa, 0x444444, 3));

  const light = new DirectionalLight(0xffffff, 1.5);
  light.position.set(1, 1, 1);
  pointcloudScene.add(light);
  pointcloudScene.background = new Color().setHex(0x112233);

  // createMockLidarData(s)

  s.scenes.pointcloud.userData.cameraControls = createCameraControls(pointcloudCamera, sceneElement, s);
  createGridHelper(s.scenes.pointcloud);
  createAxesHelper(s.scenes.pointcloud);
}

export { createPointCloudScene }
