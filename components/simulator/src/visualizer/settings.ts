import GUI from 'lil-gui';
import { SceneManager } from './SceneManager';
import { createFoxGloveWebsocket, WebSocketEventHandler } from '../robot/foxgloveConnection';
import { transform_cb } from './transformations/ros2transforms';

function initSettings(s: SceneManager, onEvent: WebSocketEventHandler) {
  const gui = new GUI({ title: '⚙️ Configuration', width: 300 });
  const foxglove = gui.addFolder('Foxglove');
  foxglove.add(s.userSettings.foxglove_config, 'url').onFinishChange(() => {
    createFoxGloveWebsocket(transform_cb, s.userSettings.foxglove_config.url, s, onEvent);
  });

  const apiFolder = gui.addFolder('API');
  const pwd = apiFolder
    .add(s.userSettings, 'apiKey')
    .name('apiKey')
    .onChange(() => {});
  for (let inp of pwd.domElement.getElementsByTagName('input')) {
    inp.setAttribute('type', 'password');
  }

  // const toggleVisibility = (value: boolean, sceneName: 'pointcloud') => {
  const toggleVisibility = (sceneName: 'pointcloud') => {
    // const sceneWrapper = (s.scenes[sceneName].userData.domElement as HTMLElement).parentElement;
    const sceneWrapper = s.scenes[sceneName]?.userData.domElement as HTMLElement;
    console.log(sceneWrapper);
    // sceneWrapper?.classList.remove('hidden');
    // if (value) {
    //   sceneWrapper?.classList.remove('hidden');
    // } else {
    //   sceneWrapper?.classList.add('hidden');
    // }
  };

  const topicNamesFolder = gui.addFolder('TopicNames');
  const selectedMiniSceneController = topicNamesFolder.add(s.userSettings.topicList, 'selectedTopic', []).name('Selected Scene');

  const lightsFolder = gui.addFolder('Lights');
  lightsFolder.add(s.scenes.main?.userData.pointLight!, 'visible').name('point light');
  lightsFolder.add(s.scenes.main?.userData.ambientLight!, 'visible').name('ambient light');

  const helpersFolder = gui.addFolder('Helpers');
  helpersFolder.add(s.scenes.main?.userData.axesHelper!, 'visible').name('axes');
  helpersFolder.add(s.scenes.main?.userData.pointLightHelper!, 'visible').name('pointLight');
  helpersFolder.add(s.scenes.main?.userData.gridHelper!, 'visible').name('gridHelper');

  const cameraFolder = gui.addFolder('Camera');
  cameraFolder.add(s.scenes.main?.userData.cameraControls!, 'autoRotate');

  // const toggleVisibility = (value: boolean, sceneName: 'pointcloud') => {
  //   const sceneWrapper = (s.scenes[sceneName].userData.domElement as HTMLElement).parentElement;
  //   if (value) {
  //     sceneWrapper?.classList.remove('hidden');
  //   } else {
  //     sceneWrapper?.classList.add('hidden');
  //   }
  // };

  const saveGuiState = (gui: GUI) => {
    const initialGuiState = gui.save();
    localStorage.setItem('guiState', JSON.stringify(initialGuiState));
  };

  const loadGuiState = () => {
    // Load the GUI state from localStorage if available
    const storedGuiState = localStorage.getItem('guiState');
    if (storedGuiState) {
      gui.load(JSON.parse(storedGuiState));
    } else {
      saveGuiState(gui);
    }
  };

  gui.onFinishChange(() => saveGuiState(gui));

  loadGuiState();

  s.userSettings.topicList.on('topicsLoaded', (dropDownItems) => {
    loadGuiState();
    // const selectedMiniSceneState = Object.values<number>(getGuiState('TopicNames'))[0];
    const selectedMiniSceneState = Object.values<string>(getGuiState('TopicNames'))[0];
    // const dropDownValues = Object.values(dropDownItems ?? {});
    // const [dropDownValuesPrompt, dropDownValuesFirstItem] = dropDownValues;
    const [dropDownValuesPrompt, dropDownValuesFirstItem] = dropDownItems;

    selectedMiniSceneController.options(dropDownItems);

    // if (!dropDownValues.includes(selectedMiniSceneState)) {
    if (!dropDownItems.includes(selectedMiniSceneState)) {
      selectedMiniSceneController.setValue(dropDownValuesFirstItem || dropDownValuesPrompt);
      saveGuiState(gui);
    } else {
      selectedMiniSceneController.setValue(selectedMiniSceneState);
    }

    selectedMiniSceneController.updateDisplay();
  });

  // reset GUI state button
  const resetGui = () => {
    localStorage.removeItem('guiState');
    gui.reset();
  };
  gui.add({ resetGui }, 'resetGui').name('RESET');

  gui.close();
}

function getGuiState(folderName: string = '') {
  try {
    const guiStateLocal = localStorage.getItem('guiState');
    const guiState = guiStateLocal ? JSON.parse(guiStateLocal) : {};

    return folderName ? guiState.folders[folderName].controllers : guiState;
  } catch (error) {
    console.error(error);
    return {};
  }
}

export { initSettings, getGuiState };
