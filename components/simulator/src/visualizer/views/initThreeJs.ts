import { SceneManager } from '../SceneManager';
import { initSettings } from '../settings';
import { createCustomGUITransforms } from '../transformations/customGuiTransforms';
import { createPointCloudScene } from './pointCloud/initPointCloud';
import { createCameraDepthScene } from './pointCloud/initCameraDepth';
import {
  createCameraControls,
  createCanvas,
  createDomModifications,
  createHelpers,
  createLights,
  createMainScene,
} from './main/initializers';
import { WebSocketEventHandler } from '../../robot/foxgloveConnection';

function initThreeJSBase(sceneManager: SceneManager, onEvent: WebSocketEventHandler) {
  createCanvas(sceneManager);
  createMainScene(sceneManager);
  createPointCloudScene(sceneManager);
  createCameraDepthScene(sceneManager);
  createLights(sceneManager);
  createHelpers(sceneManager);
  createCameraControls(sceneManager);
  createDomModifications(sceneManager);
  createCustomGUITransforms(sceneManager);

  initSettings(sceneManager, onEvent);

  // console.log("READY1?", s.scenes.main.userData)
  // console.log("READY2?", s.scenes.pointcloud.userData)
}

export { initThreeJSBase };
