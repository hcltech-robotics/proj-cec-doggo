import GUI from "lil-gui";
import { SceneManager } from "./SceneManager";
import { initFoxGloveWebsocket } from "../robot/foxgloveConnection";
import { transform_cb } from "./transformations/ros2transforms";


function initSettings(s: SceneManager) {
     // ==== 🐞 DEBUG GUI ====
  const gui = new GUI({ title: '🐞 Debug GUI', width: 300 })


    const foxglove = gui.addFolder('Foxglove')
    foxglove.add(s.userSettings.foxglove_config, 'url').onFinishChange(() => {
      initFoxGloveWebsocket(transform_cb, s.userSettings.foxglove_config.url)
    })
    
    const apiFolder = gui.addFolder('API')
    const pwd = apiFolder.add(s.userSettings, 'apiKey').name('apiKey').onChange((value) => {
    })
    for (let inp of pwd.domElement.getElementsByTagName("input")) {
      inp.setAttribute("type", "password")
    }

    const lightsFolder = gui.addFolder('Lights')
    lightsFolder.add(s.pointLight, 'visible').name('point light')
    lightsFolder.add(s.ambientLight, 'visible').name('ambient light')

    const helpersFolder = gui.addFolder('Helpers')
    helpersFolder.add(s.axesHelper, 'visible').name('axes')
    helpersFolder.add(s.pointLightHelper, 'visible').name('pointLight')

    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(s.cameraControls, 'autoRotate')

    // persist GUI state in local storage on changes
    gui.onFinishChange(() => {
      const guiState = gui.save()
      localStorage.setItem('guiState', JSON.stringify(guiState))
    })

    // load GUI state if available in local storage
    const guiState = localStorage.getItem('guiState')
    if (guiState) gui.load(JSON.parse(guiState))

    // reset GUI state button
    const resetGui = () => {
      localStorage.removeItem('guiState')
      gui.reset()
    }
    gui.add({ resetGui }, 'resetGui').name('RESET')

    gui.close()
}

export { initSettings }