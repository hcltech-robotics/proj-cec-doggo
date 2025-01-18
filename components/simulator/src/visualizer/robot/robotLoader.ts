import { LoadingManager } from "three";
import { SceneManager } from "../SceneManager";
import URDFLoader, { URDFRobot } from "urdf-loader";


function createRobot(s: SceneManager) {
  const manager = new LoadingManager()
  manager.onStart = () => {
    console.log('loading started')
  }
  manager.onProgress = (url, loaded, total) => {
    console.log('loading in progress:')
    console.log(`${url} -> ${loaded} / ${total}`)
  }
  manager.onLoad = () => {
    console.log('loaded!')
  }
  manager.onError = () => {
    console.log('❌ error while loading')
  }

  const loader = new URDFLoader(manager);
  loader.packages = {
    "go2_robot_sdk": import.meta.env.BASE_URL + "go2_robot_sdk",
  };
  loader.load(
    "./go2.urdf",
    (r: URDFRobot) => {
      r.translateZ(0.45)
      s.scenes.main.userData.robot = r
      s.scenes.main.add(r)
    }
  );
}

export { createRobot }