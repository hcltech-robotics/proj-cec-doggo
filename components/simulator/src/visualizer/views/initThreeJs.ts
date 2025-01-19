import { createRobot } from "../robot/robotLoader"
import { SceneManager } from "../SceneManager"
import { initSettings } from "../settings"
import { createCustomGUITransforms } from "../transformations/customGuiTransforms"
import { createLidarBox } from "./lidarBox/initLidarBox"
import { createCameraControls, createCanvas, createDomModifications, createHelpers, createLights } from "./main/initializers"

function initThreeJSBase(s: SceneManager) {
    createCanvas(s)
    createLights(s)
    createHelpers(s)
    createRobot(s)
    createCameraControls(s)
    createDomModifications(s)
    createCustomGUITransforms(s)
  
    createLidarBox(s)
    initSettings(s)
  
    // console.log("READY1?", s.scenes.main.userData)
    // console.log("READY2?", s.scenes.pointcloud.userData)
  }

  export { initThreeJSBase }