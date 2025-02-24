import { LoadingManager } from "three";
import { SceneManager } from "../SceneManager";
import URDFLoader, { URDFRobot } from "urdf-loader";


function createRobot(s: SceneManager, content: string) {
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
    "go2_description": import.meta.env.BASE_URL + "go2_robot_sdk",
  };

  const robot = loader.parse(content).translateZ(0.45);

  if (s.scenes.main.userData.robot) {
    s.scenes.main.remove(s.scenes.main.userData.robot);
    s.scenes.main.userData.robot = null;
  }

  s.scenes.main.userData.robot = robot;
  s.scenes.main.add(robot);
}

export { createRobot }
