import GUI from 'lil-gui'
import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Clock,
  DoubleSide,
  GridHelper,
  LoadingManager,
  Material,
  Mesh,
  MeshStandardMaterial,
  NearestFilter,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLight,
  PointLightHelper,
  Quaternion,
  Scene,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as animations from './helpers/animations'
import { toggleFullScreen } from './helpers/fullscreen'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import URDFLoader, { URDFRobot } from "urdf-loader";
import { init_websocket } from './robot/foxgloveConnection'
import { SceneTransformParam } from './types'
// import { VRButton } from 'three/examples/jsm/Addons.js'

const CANVAS_ID = 'scene'

let canvas: HTMLElement
let renderer: WebGLRenderer
let scene: Scene
let loadingManager: LoadingManager
let ambientLight: AmbientLight
let pointLight: PointLight
let cube: Mesh
let camera: PerspectiveCamera
let cameraControls: OrbitControls
let dragControls: DragControls
let axesHelper: AxesHelper
let pointLightHelper: PointLightHelper
let clock: Clock
let stats: Stats
let gui: GUI
let robot: URDFRobot
let threeJSWorker: Worker
let foxglove_config = { url: "ws://localhost:8765" }
let lidarMesh: Mesh
let lidarMaterial: Material

Object3D.DEFAULT_UP = new Vector3(0, 0, 1)
const animation = { enabled: true, play: true }
const userSettings = {
  apiKey: 'defaultapiKey',
};


function loadRobot() {
  const manager = new LoadingManager();
  const loader = new URDFLoader(manager);

  loader.packages = {
    "go2_robot_sdk": import.meta.env.BASE_URL + "go2_robot_sdk",
  };
  loader.load(
    "./go2.urdf",
    (r) => {
      robot = r
      scene.add(robot);
      robot.translateZ(0.45)
    }
  );
}

function transform_cb(p: SceneTransformParam) {
  const { data } = p
  const msgData = data.messageData
  if (data.channelTopic === "/utlidar/voxel_map_compressed") {
    const vertexBinaryData = data.messageData
    threeJSWorker.postMessage({
      resolution: vertexBinaryData.resolution,
      origin: vertexBinaryData.origin,
      width: vertexBinaryData.width,
      data: vertexBinaryData.data,
    });
  }
  else if (data.channelTopic === "/joint_states") {
    for (let i = 0; i < msgData.name.length; i++) {
      const n = msgData.name[i]
      const v = msgData.position[i]
      robot.setJointValue(n, v)
    }
  } else if (data.channelTopic === "/tf") {
    for (let i = 0; i < msgData.transforms.length; i++) {
      const t = msgData.transforms[i]
      const frame = t.child_frame_id
      if (frame === "base_link") {
        const rotation = t.transform.rotation
        robot.quaternion.copy(new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w))

      }
    }
  } else if (data.channelTopic === "/odom") {
    const p = msgData?.pose?.pose?.position ?? null
    if (p) {
      robot.position.copy(new Vector3(p.x, p.y, p.z))
    }
  }
}

const textureLoader = new TextureLoader();
const texture = textureLoader.load(
  import.meta.env.BASE_URL + 'models/axisColor4.png',
  () => {
    console.log('Texture loaded successfully!');
  },
  undefined, // Progress callback (optional)
  (err) => {
    console.error('Error loading texture:', err);
  }
);
// Set filtering options for the texture
texture.magFilter = NearestFilter;  // Mag filter (when zooming in)
texture.minFilter = NearestFilter;

document.addEventListener('hackathonGuiEvent', (event) => {
  // INTERACT FROM REACT EVENT HANDLER TO THREEJS
  // usage: dispatch a custom event on the document
  console.log(event.detail)
  console.log(event?.detail?.message ?? "NO MESSAGE FOUND");
})

function convert(objData) {
  return Uint8Array.from(objData);
}
function convert32(objData) {
  return Uint32Array.from(objData);
}

function updateMesh(g) {
  const geometryData = g.geometryData
  const origin = g.origin;
  const resolution = g.resolution;

  const positions = convert(geometryData.positions);
  const uvs = convert(geometryData.uvs);
  const indices = convert32(geometryData.indices);
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(positions || [], 3)
  );
  geometry.setAttribute(
    "uv",
    new BufferAttribute(uvs || [], 2, !0)
  );
  geometry.setIndex(new BufferAttribute(indices || [], 1));

  if (lidarMesh) {
    lidarMesh.geometry.dispose();
    lidarMesh.material.dispose();
    scene.remove(lidarMesh);
  }

  lidarMesh = new Mesh(geometry, lidarMaterial);
  const res = resolution || 0.1;
  lidarMesh.scale.set(res, res, res);
  lidarMesh.position.set(origin[0] || 0, origin[1] || 0, origin[2] || 0);
  scene.add(lidarMesh);
}



function initWebWorker() {
  Object3D.DEFAULT_UP = new Vector3(0, 0, 0)
  threeJSWorker = new Worker(
    new URL("/assets/three.worker.js", import.meta.url)
  );
  window._threejsworker = threeJSWorker;
  threeJSWorker.onmessage = (re) => {
    updateMesh(re.data)
  };
}

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Enable WebXR
    document.body.appendChild(renderer.domElement);

    // Add an Enter VR button
    // document.body.appendChild(VRButton.createButton(renderer));
    scene = new Scene()
    loadRobot()
  }

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  {
    loadingManager = new LoadingManager()

    loadingManager.onStart = () => {
      console.log('loading started')
    }
    loadingManager.onProgress = (url, loaded, total) => {
      console.log('loading in progress:')
      console.log(`${url} -> ${loaded} / ${total}`)
    }
    loadingManager.onLoad = () => {
      console.log('loaded!')
    }
    loadingManager.onError = () => {
      console.log('❌ error while loading')
    }
  }

  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('white', 2)
    pointLight = new PointLight('white', 20, 100)
    pointLight.position.set(-2, 2, 2)
    pointLight.castShadow = true
    pointLight.shadow.radius = 4
    pointLight.shadow.camera.near = 0.5
    pointLight.shadow.camera.far = 4000
    pointLight.shadow.mapSize.width = 2048
    pointLight.shadow.mapSize.height = 2048
    scene.add(ambientLight)
    scene.add(pointLight)
  }

  // ===== 📦 OBJECTS =====
  {
    const sideLength = 1
    const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
    const cubeMaterial = new MeshStandardMaterial({
      color: '#f69f1f',
      metalness: 0.5,
      roughness: 0.7,
    })
    cube = new Mesh(cubeGeometry, cubeMaterial)
    cube.castShadow = true
    cube.position.y = 0.5
  }

  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.set(-2.13, 5, 2.5)
  }

  // ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(camera, canvas)
    cameraControls.target = cube.position.clone()
    cameraControls.enableDamping = true
    cameraControls.autoRotate = false
    cameraControls.update()

    dragControls = new DragControls([cube], camera, renderer.domElement)
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
      animation.play = false
      material.emissive.set('black')
      material.opacity = 0.7
      material.needsUpdate = true
    })
    dragControls.addEventListener('dragend', (event) => {
      cameraControls.enabled = true
      animation.play = true
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('black')
      material.opacity = 1
      material.needsUpdate = true
    })
    dragControls.enabled = false

    // Full screen
    window.addEventListener('dblclick', (event) => {
      if (event.target === canvas) {
        toggleFullScreen(canvas)
      }
    })

    lidarMaterial = new MeshStandardMaterial({
      map: texture,
      side: DoubleSide,  // Render both sides of the geometry
      transparent: false,  // Disable transparency
    });

    init_websocket(transform_cb, foxglove_config.url);
  }

  // ===== 🪄 HELPERS =====
  {
    axesHelper = new AxesHelper(4)
    axesHelper.visible = false
    scene.add(axesHelper)

    pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange')
    pointLightHelper.visible = false
    scene.add(pointLightHelper)

    const gridHelper = new GridHelper(50, 20, 'teal', 'darkgray')
    gridHelper.position.y = -0.01
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper)
  }

  // ===== 📈 STATS & CLOCK =====
  {
    clock = new Clock()
    stats = new Stats()
    document.body.appendChild(stats.dom)
  }

  // ==== ⚙️ Configuration ====
  {
    gui = new GUI({ title: '⚙️ Configuration', width: 300 });


    const foxglove = gui.addFolder('Foxglove')
    foxglove.add(foxglove_config, 'url').onFinishChange(() => {
      init_websocket(transform_cb, foxglove_config.url)
    })
    const cubeFolder = gui.addFolder('Cubes')

    cubeFolder.add(cube.material, 'wireframe')

    const controlsFolder = gui.addFolder('Controls')
    controlsFolder.add(dragControls, 'enabled').name('drag controls')


    const pwd = controlsFolder.add(userSettings, 'apiKey').name('apiKey').onChange((value) => {
    })
    for (let inp of pwd.domElement.getElementsByTagName("input")) {
      inp.setAttribute("type", "password")
    }

    const lightsFolder = gui.addFolder('Lights')
    lightsFolder.add(pointLight, 'visible').name('point light')
    lightsFolder.add(ambientLight, 'visible').name('ambient light')

    const helpersFolder = gui.addFolder('Helpers')
    helpersFolder.add(axesHelper, 'visible').name('axes')
    helpersFolder.add(pointLightHelper, 'visible').name('pointLight')

    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(cameraControls, 'autoRotate')

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
    initWebWorker()
  }
}

function animate() {
  requestAnimationFrame(animate)
  stats.update()

  if (animation.enabled && animation.play) {
    animations.rotate(cube, clock, Math.PI / 3)
    animations.bounce(cube, clock, 1, 0.5, 0.5)
  }

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  if (!renderer.xr.isPresenting) {
    cameraControls.update(); // Update OrbitControls only when not in VR
  }

  renderer.render(scene, camera)
}

export {
  animate, init, transform_cb
}
