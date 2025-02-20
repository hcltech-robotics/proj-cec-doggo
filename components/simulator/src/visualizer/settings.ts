import GUI from "lil-gui";
import { SceneManager } from "./SceneManager";
import { initFoxGloveWebsocket } from "../robot/foxgloveConnection";
import { transform_cb } from "./transformations/ros2transforms";

function initSettings(s: SceneManager) {
  const gui = new GUI({ title: '⚙️ Configuration', width: 300 })
  const foxglove = gui.addFolder('Foxglove')
  foxglove.add(s.userSettings.foxglove_config, 'url').onFinishChange(() => {
    initFoxGloveWebsocket(transform_cb, s.userSettings.foxglove_config.url, s)
  })

  const apiFolder = gui.addFolder('API')
  const pwd = apiFolder.add(s.userSettings, 'apiKey').name('apiKey').onChange(() => { })
  for (let inp of pwd.domElement.getElementsByTagName("input")) {
    inp.setAttribute("type", "password")
  }

  const topicNamesFolder = gui.addFolder('TopicNames');
  topicNamesFolder.add(s.userSettings.topicNames, 'pointcloud').name('pointcloud').onFinishChange(() => {
    initFoxGloveWebsocket(transform_cb, s.userSettings.foxglove_config.url, s)
  });
  topicNamesFolder.add(s.userSettings.topicNames, 'cameraDepth').name('cameraDepth').onFinishChange(() => {
    initFoxGloveWebsocket(transform_cb, s.userSettings.foxglove_config.url, s)
  });

  const lightsFolder = gui.addFolder('Lights')
  lightsFolder.add(s.scenes.main?.userData.pointLight!, 'visible').name('point light')
  lightsFolder.add(s.scenes.main?.userData.ambientLight!, 'visible').name('ambient light')

  const helpersFolder = gui.addFolder('Helpers')
  helpersFolder.add(s.scenes.main?.userData.axesHelper!, 'visible').name('axes')
  helpersFolder.add(s.scenes.main?.userData.pointLightHelper!, 'visible').name('pointLight')
  helpersFolder.add(s.scenes.main?.userData.gridHelper!, 'visible').name('gridHelper')

  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(s.scenes.main?.userData.cameraControls!, 'autoRotate')

  const toggleVisibility = (value: boolean, sceneName: 'pointcloud' | 'cameraDepth') => {
    const sceneWrapper = (s.scenes[sceneName].userData.domElement as HTMLElement).parentElement;
    if (value) {
      sceneWrapper?.classList.remove('hidden');
    } else {
      sceneWrapper?.classList.add('hidden');
    }
  };

  const topicsFolder = gui.addFolder('Topics')
  topicsFolder.add(s.userSettings.pointCloudScene, 'enabled').name('/pointcloud').onChange((value: boolean) => {
    toggleVisibility(value, 'pointcloud');
  });
  topicsFolder.add(s.userSettings.cameraDepthScene, 'enabled').name('/camera/depth/color/points').onChange((value: boolean) => {
    toggleVisibility(value, 'cameraDepth');
  });

  // persist GUI state in local storage on changes
  gui.onFinishChange(() => {
    const guiState = gui.save()
    localStorage.setItem('guiState', JSON.stringify(guiState))
  })

  // load GUI state if available in local storage
  const guiState = localStorage.getItem('guiState')
  if (guiState) gui.load(JSON.parse(guiState))

  // save GUI state to localstorage if not available yet
  if (!guiState) {
    const guiState = gui.save();
    localStorage.setItem('guiState', JSON.stringify(guiState))
  }

  // reset GUI state button
  const resetGui = () => {
    localStorage.removeItem('guiState')
    gui.reset()
  }
  gui.add({ resetGui }, 'resetGui').name('RESET')

  gui.close()
}

function getGuiState(folderName: string = '') {
  try {
    const guiStateLocal = localStorage.getItem('guiState');
    const guiState = guiStateLocal ? JSON.parse(guiStateLocal) : {};

    return folderName?  guiState.folders[folderName].controllers : guiState;

  } catch (error) {
    console.error(error);
    return {};
  }
}

export { initSettings, getGuiState }
