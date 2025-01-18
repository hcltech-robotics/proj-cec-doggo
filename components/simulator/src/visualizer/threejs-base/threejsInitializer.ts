import { AmbientLight, AxesHelper, GridHelper, Mesh, MeshStandardMaterial, Object3D, PCFSoftShadowMap, PerspectiveCamera, PointLight, PointLightHelper, Vector3, WebGLRenderer } from "three"
import { SceneManager } from "../SceneManager"
import { createRobot } from "../robot/robotLoader"
import { DragControls, OrbitControls } from "three/examples/jsm/Addons.js"
import { toggleFullScreen } from "../../helpers/fullscreen"
import { createLidarBox } from "../views/lidarBox/initLidarBox"
import { initSettings } from "./settings"
import { MainScene } from "../types"


function initThreeJSBase(s: SceneManager) {
  Object3D.DEFAULT_UP = new Vector3(0, 0, 1)
  createCanvas(s)
  createLights(s)
  createHelpers(s)
  createRobot(s)
  createCameraControls(s)
  createDomModifications(s)

  createLidarBox(s)

  initSettings(s)

  console.log("READY1?", s.scenes.main.userData)
  console.log("READY2?", s.scenes.pointcloud.userData)
}

function createCanvas(s: SceneManager) {
  const canvas = s.canvas
  s.canvas = canvas
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true; // Enable WebXR
  document.body.appendChild(renderer.domElement);
  s.renderer = renderer

  // Add an Enter VR button
  // document.body.appendChild(VRButton.createButton(renderer));
  const scene = new MainScene()
  s.scenes.main = scene
  const views = document.getElementById("views")!
  const mainView = document.createElement("div")
  mainView.className = "main-view"
  views.appendChild(mainView)
  const sceneView = document.createElement("div")
  mainView.appendChild(sceneView)
  scene.userData.domElement = mainView

}

function createHelpers(s: SceneManager) {
  const axesHelper = new AxesHelper(4)
  axesHelper.visible = false

  s.scenes.main.userData.axesHelper = axesHelper
  s.scenes.main.add(axesHelper)
  const pointLightHelper = new PointLightHelper(s.scenes.main.userData.pointLight!, undefined, 'orange')
  pointLightHelper.visible = false
  s.scenes.main.userData.pointLightHelper = pointLightHelper
  s.scenes.main.add(pointLightHelper)
  const gridHelper = new GridHelper(50, 20, 'teal', 'darkgray')
  gridHelper.position.y = -0.01
  gridHelper.rotateX(Math.PI / 2);
  s.scenes.main.userData.gridHelper = gridHelper
  s.scenes.main.add(gridHelper)
}

function createLights(s: SceneManager) {
  const ambientLight = new AmbientLight('white', 2)
  const pointLight = new PointLight('white', 20, 100)
  pointLight.position.set(-2, 2, 2)
  pointLight.castShadow = true
  pointLight.shadow.radius = 4
  pointLight.shadow.camera.near = 0.5
  pointLight.shadow.camera.far = 4000
  pointLight.shadow.mapSize.width = 2048
  pointLight.shadow.mapSize.height = 2048
  s.scenes.main.add(ambientLight)
  s.scenes.main.userData.ambientLight = ambientLight
  s.scenes.main.add(pointLight)
  s.scenes.main.userData.pointLight = pointLight

  return { pointLight, ambientLight }
}

function createCameraControls(s: SceneManager) {
  const canvas = s.canvas
  const renderer = s.renderer!
  const camera = new PerspectiveCamera(50, s.canvas.clientWidth / s.canvas.clientHeight, 0.1, 100)
  camera.position.set(-2.13, 5, 2.5)
  s.scenes.main.userData.camera = camera
  
  const cameraControls = new OrbitControls(camera, canvas)
  cameraControls.enableDamping = true
  cameraControls.autoRotate = false
  cameraControls.update()
  s.scenes.main.userData.cameraControls = cameraControls

  const dragControls = new DragControls([], camera, renderer.domElement)
  dragControls.addEventListener('hoveron', (event) => {
    const mesh = event.object as Mesh
    const material = mesh.material as MeshStandardMaterial
    material.emissive.set('orange')
  })
  dragControls.addEventListener('hoveroff', (event) => {
    const mesh = event.object as Mesh
    const material = mesh.material as MeshStandardMaterial
    material.emissive.set('black')
  })
  dragControls.addEventListener('dragstart', (event) => {
    const mesh = event.object as Mesh
    const material = mesh.material as MeshStandardMaterial
    cameraControls.enabled = false
    s.userSettings.animation.play = false
    material.emissive.set('black')
    material.opacity = 0.7
    material.needsUpdate = true
  })
  dragControls.addEventListener('dragend', (event) => {
    cameraControls.enabled = true
    s.userSettings.animation.play = true
    const mesh = event.object as Mesh
    const material = mesh.material as MeshStandardMaterial
    material.emissive.set('black')
    material.opacity = 1
    material.needsUpdate = true
  })
  dragControls.enabled = false
}

function createDomModifications(s: SceneManager) {
  // Full screen
  window.addEventListener('dblclick', (event) => {
    if (s.canvas && event.target === s.canvas) {
      toggleFullScreen(s.canvas)
    }
  })

  document.body.appendChild(s.stats.dom)
}

export { initThreeJSBase }