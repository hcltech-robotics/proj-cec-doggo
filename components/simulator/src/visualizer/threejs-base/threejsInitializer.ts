import { AmbientLight, AxesHelper, DoubleSide, GridHelper, Mesh, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, PointLight, PointLightHelper, Scene, WebGLRenderer } from "three"
import { SceneManager } from "../SceneManager"
import { createRobot } from "../robot/robotLoader"
import { DragControls, OrbitControls } from "three/examples/jsm/Addons.js"
import { toggleFullScreen } from "../../helpers/fullscreen"

const CANVAS_ID = 'scene'


function initThreeJSBase(sceneManager: SceneManager) {
  createCanvas(sceneManager)
  const { pointLight } = createLights(sceneManager)
  createHelpers(sceneManager, pointLight)
  createRobot(sceneManager)

  createCameraControls(sceneManager)

  // Full screen
  window.addEventListener('dblclick', (event) => {
    if (event.target === canvas) {
      toggleFullScreen(canvas)
    }
  })

  const lidarMaterial = new MeshStandardMaterial({
    map: texture,
    side: DoubleSide,  // Render both sides of the geometry
    transparent: false,  // Disable transparency
  });
}



// ===== 📈 STATS & CLOCK =====
{
  clock = new Clock()
  stats = new Stats()
  document.body.appendChild(stats.dom)
}

function createCanvas(s: SceneManager) {
    const canvas = document.querySelector(`canvas#${CANVAS_ID}`)!

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Enable WebXR
    document.body.appendChild(renderer.domElement);

    // Add an Enter VR button
    // document.body.appendChild(VRButton.createButton(renderer));
    const scene = new Scene()
    s.sceneMain = scene
    const views = document.getElementById("views")!
    const mainView = document.createElement("div")
    mainView.className = "main-view"
    views.appendChild(mainView)
    const sceneView = document.createElement("div")
    mainView.appendChild(sceneView)
    s.saveInScene("main", "domElement", mainView)

}

function createHelpers(s: SceneManager, pointLight: PointLight) {
  // ===== 🪄 HELPERS =====
  const axesHelper = new AxesHelper(4)
  axesHelper.visible = false
  s.addToScene("main", axesHelper)

  const pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange')
  pointLightHelper.visible = false
  s.addToScene("main", pointLightHelper)

  const gridHelper = new GridHelper(50, 20, 'teal', 'darkgray')
  gridHelper.position.y = -0.01
  gridHelper.rotateX(Math.PI / 2);
  s.addToScene("main", gridHelper)

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
  s.addToScene("main", ambientLight)
  s.addToScene("main", pointLight)

  return { pointLight, ambientLight }
}

function createCameraControls(s: SceneManager) {
  const canvas = s.canvas
  const renderer = s.renderer
  const camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
  camera.position.set(-2.13, 5, 2.5)
  s.saveInScene("main", "camera", camera)

  const cameraControls = new OrbitControls(camera, canvas)
  //cameraControls.target = cube.position.clone()
  cameraControls.enableDamping = true
  cameraControls.autoRotate = false
  cameraControls.update()

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
    userSettings.animation.play = false
    material.emissive.set('black')
    material.opacity = 0.7
    material.needsUpdate = true
  })
  dragControls.addEventListener('dragend', (event) => {
    cameraControls.enabled = true
    userSettings.animation.play = true
    const mesh = event.object as Mesh
    const material = mesh.material as MeshStandardMaterial
    material.emissive.set('black')
    material.opacity = 1
    material.needsUpdate = true
  })
  dragControls.enabled = false
}

export { initThreeJSBase }