import { AxesHelper, Color, DirectionalLight, GridHelper, HemisphereLight, PerspectiveCamera } from 'three';
import { SceneManager } from '../../SceneManager';
import { CameraDepthScene } from '../../types';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const cameraDepthSceneSize = {
  width: 320,
  height: 180,
};

const createCameraControls = (camera: PerspectiveCamera, canvas: HTMLElement): OrbitControls => {
  const cameraControls = new OrbitControls(camera, canvas);
  cameraControls.enableDamping = true;
  cameraControls.update();

  return cameraControls;
};

const createGridHelper = (scene: CameraDepthScene) => {
  const gridHelper = new GridHelper(50, 20, 'teal', 'darkgray');
  gridHelper.position.y = -0.01;
  gridHelper.rotateX(Math.PI / 2);
  scene.add(gridHelper);
};

const createAxesHelper = (scene: CameraDepthScene) => {
  scene.add(new AxesHelper(10));
};

function createCameraDepthScene(s: SceneManager) {
  const cameraDepthScene = new CameraDepthScene();
  s.scenes.cameraDepth = cameraDepthScene;
  const element = document.createElement('div');
  element.className = `camera-depth-view ${s.userSettings.cameraDepthScene.enabled ? '' : 'hidden'}`;

  element.style.setProperty('--camera-depth-view-width', `${cameraDepthSceneSize.width}px`);
  element.style.setProperty('--camera-depth-view-height', `${cameraDepthSceneSize.height}px`);
  const sceneElement = document.createElement('div');
  sceneElement.className = 'camera-depth-view-scene';
  element.appendChild(sceneElement);

  element.addEventListener('dblclick', (event: MouseEvent) => {
    const target = event.currentTarget as Element;
    target?.classList.toggle('zoom');
  });

  const sideViews = document.getElementById('side-views');
  if (sideViews) {
    sideViews.appendChild(element);
  }
  const aspectRatio = cameraDepthSceneSize.width / cameraDepthSceneSize.height;
  const cameraDepthCamera = new PerspectiveCamera(30, aspectRatio, 0.1, 100);
  cameraDepthCamera.position.copy(s.scenes.cameraDepth.userData.resetPosition);
  cameraDepthScene.userData.camera = cameraDepthCamera;
  cameraDepthScene.userData.domElement = sceneElement;
  s.scenes.cameraDepth.userData.camera = cameraDepthCamera;
  s.scenes.cameraDepth.userData.domElement = sceneElement;
  cameraDepthScene.add(new HemisphereLight(0xaaaaaa, 0x444444, 3));

  const light = new DirectionalLight(0xffffff, 1.5);
  light.position.set(1, 1, 1);
  cameraDepthScene.add(light);
  cameraDepthScene.background = new Color().setHex(0x112233);

  s.scenes.cameraDepth.userData.cameraControls = createCameraControls(cameraDepthCamera, sceneElement);
  createGridHelper(s.scenes.cameraDepth);
  createAxesHelper(s.scenes.cameraDepth);
}

export { createCameraDepthScene };
