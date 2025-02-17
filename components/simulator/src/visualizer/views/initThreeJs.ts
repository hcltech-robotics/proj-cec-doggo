import { createRobot } from "../robot/robotLoader"
import { SceneManager } from "../SceneManager"
import { initSettings } from "../settings"
import { createCustomGUITransforms } from "../transformations/customGuiTransforms"
import { createPointCloudScene } from "./pointCloud/initPointCloud"
import { createCameraDepthScene } from './pointCloud/initCameraDepth'
import { createCameraControls, createCanvas, createDomModifications, createHelpers, createLights, createMainScene } from "./main/initializers"

function initThreeJSBase(s: SceneManager) {
    createCanvas(s)
    createMainScene(s)
    createPointCloudScene(s)
    createCameraDepthScene(s)
    createLights(s)
    createHelpers(s)
    createRobot(s)
    createCameraControls(s)
    createDomModifications(s)
    createCustomGUITransforms(s)
  
    initSettings(s)
  
    // console.log("READY1?", s.scenes.main.userData)
    // console.log("READY2?", s.scenes.pointcloud.userData)
  }

  export { initThreeJSBase }