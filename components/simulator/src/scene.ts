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
  Float32BufferAttribute,
  PointsMaterial,
  Points,
  Color,
  DirectionalLight,
  HemisphereLight,
  CameraHelper,
} from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
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
let lidarScene: Scene
let loadingManager: LoadingManager
let ambientLight: AmbientLight
let pointLight: PointLight
let cube: Mesh
let camera: PerspectiveCamera
let cameraControls: OrbitControls
let dragControls: DragControls
let axesHelper: AxesHelper
let cameraHelper: CameraHelper
let pointLightHelper: PointLightHelper
let clock: Clock
let stats: Stats
let gui: GUI
let robot: URDFRobot
let threeJSWorker: Worker
let foxglove_config = { url: "ws://localhost:8765" }
let lidarMesh: Mesh
let pointsCloud: Points
let lidarMaterial: Material
let pointCloudGeometry: BufferGeometry

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
  if (data.channelTopic === '/pointcloud') {
    updatePointCloud(data.messageData);
  }
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

const parsePointCloud = ({ data, point_step, fields, is_bigendian }) => {
  const points = [];
  const intensity = [];
  const fieldsMap = fields.reduce((acc, { name, ...rest }) => {
    acc[name] = { ...rest };
    return acc;
  }, {});
  const uint8ArrayData = new Uint8Array(data);

  for (let i = 0; i < data.length; i += point_step) {
    const x = new DataView(uint8ArrayData.buffer, i + fieldsMap['x'].offset, 4).getFloat32(0, !is_bigendian);
    const y = new DataView(uint8ArrayData.buffer, i + fieldsMap['y'].offset, 4).getFloat32(0, !is_bigendian);
    const z = new DataView(uint8ArrayData.buffer, i + fieldsMap['z'].offset, 4).getFloat32(0, !is_bigendian);

    // console.log(`Point ${i / point_step}: x=${x}, y=${y}, z=${z}`, data[i], data[i + 1], data[i + 2], data[i + 3]);

    // if (isNaN(x) || isNaN(y) || isNaN(z) || !isFinite(x) || !isFinite(y) || !isFinite(z)) {
    //   console.log('x', data.buffer, i, 4);
    //   console.log('y', data.buffer, i + 4, 4);
    //   console.log('z', data.buffer, i + 8, 4);
    //   console.log(new DataView(data.buffer, i, 4).getFloat32(0, true));
    //   console.warn(`Hibás adat a(z) ${i / point_step}. pontnál: x=${x}, y=${y}, z=${z}`);
    //   console.log(new DataView(data.buffer, i, 4).getFloat32(0, true));
    //   console.log("Raw data segment:", data.slice(i, i + point_step));
    //   continue;
    // }

    // if (data.length % point_step !== 0) {
    //   console.warn("Adathossz nem osztható a point_step értékkel.");
    // }

    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
      points.push(x, y, z);
      intensity.push(new DataView(uint8ArrayData.buffer, i + fieldsMap['intensity'].offset, 4).getFloat32(0, !is_bigendian));
    }
  }

  // console.log(points);
  return {
    points: new Float32Array(points),
    intensity: new Float32Array(intensity),
  };
}

function updatePointCloud(g) {
  // console.log(g);
  if (pointsCloud) {
    pointCloudGeometry.dispose();
    lidarScene.remove(pointsCloud)
  }
  const positions = parsePointCloud(g);


  pointCloudGeometry = new BufferGeometry();
  pointCloudGeometry.setAttribute("position", new Float32BufferAttribute(positions.points, 3));
  pointCloudGeometry.setAttribute("intensity", new Float32BufferAttribute(positions.intensity, 1));
  // geometry.rotateX(Math.PI);

  const material = new PointsMaterial({
    size: 0.1,
    vertexColors: true
  });

  // Convert intensity to colors
  const colors = [];
  for (let i = 0; i < positions.intensity.length; i++) {
    const intensity = positions.intensity[i];
    // Normalize intensity to 0-1 range if needed
    const normalizedIntensity = intensity / 255;
    const color = new Color(normalizedIntensity, normalizedIntensity, normalizedIntensity);
    colors.push(color.r, color.g, color.b);
  }

  pointCloudGeometry.setAttribute("color", new Float32BufferAttribute(colors, 3));



  pointsCloud = new Points(pointCloudGeometry, material);
  lidarScene.add(pointsCloud);
}



function initWebWorker() {
  Object3D.DEFAULT_UP = new Vector3(0, 0, 0)
  threeJSWorker = new Worker(
    new URL("/assets/three.worker.js", import.meta.url)
  );
  window._threejsworker = threeJSWorker;
  threeJSWorker.onmessage = (re) => {
    // updateMesh(re.data)
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
    const views = document.getElementById("views")!
    const mainView = document.createElement("div")
    mainView.className = "main-view"
    views.appendChild(mainView)
    const sceneView = document.createElement("div")
    mainView.appendChild(sceneView)
    scene.userData.camera = camera
    scene.userData.domElement = mainView
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
    scene.userData.camera = camera
  }

  // ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(scene.userData.camera, canvas)
    cameraControls.target = cube.position.clone()
    cameraControls.enableDamping = true
    cameraControls.autoRotate = false
    cameraControls.update()

    dragControls = new DragControls([cube], scene.userData.camera, renderer.domElement)
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

  // ===== Small scene ====
  {
    lidarScene = new Scene();
    const element = document.createElement('div');
    element.className = 'lidar-view';
    const sceneElement = document.createElement('div');
    element.appendChild(sceneElement)
    const views = document.getElementById("views")
    if (views) {
      views.appendChild(element)
    }

    const lidarCamera = new PerspectiveCamera(50, 250 / 150, 0.1, 10)
    lidarCamera.zoom = 1
    lidarCamera.position.set(0, 0, 10)
    lidarScene.userData.camera = lidarCamera
    lidarScene.userData.domElement = sceneElement
    // NOTE: this is useful for debugging
    //cameraHelper = new CameraHelper(lidarCamera)
    //scene.add(cameraHelper)

    lidarScene.add(new HemisphereLight(0xaaaaaa, 0x444444, 3));

    const light = new DirectionalLight(0xffffff, 1.5);
    light.position.set(1, 1, 1);
    lidarScene.add(light);
    lidarScene.background = new Color().setHex(0x112233);
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

  // ==== 🐞 DEBUG GUI ====
  {
    gui = new GUI({ title: '🐞 Debug GUI', width: 300 })


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

  // renderer.setClearColor(0xffffff);
  renderer.setScissorTest(false);
  renderer.clear();

  // renderer.setClearColor(0xe0e0e0);
  renderer.setScissorTest(true);

  if (!renderer.xr.isPresenting) {
    cameraControls.update();
    const c: PerspectiveCamera = lidarScene.userData.camera
    c.copy(scene.userData.camera)
  }
  const needResize = resizeRendererToDisplaySize(renderer)
  for (let s of [scene, lidarScene]) {
    if (needResize) {
      const canvas = renderer.domElement
      s.userData.camera.aspect = canvas.clientWidth / canvas.clientHeight
      s.userData.camera.updateProjectionMatrix()
    }
    // get its position relative to the page's viewport
    const rect = s.userData.domElement.getBoundingClientRect();

    // check if it's offscreen. If so skip it
    if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
      rect.right < 0 || rect.left > renderer.domElement.clientWidth) {

      return; // it's off screen
    }

    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const left = rect.left;
    const bottom = renderer.domElement.clientHeight - rect.bottom;
    renderer.setViewport(left, bottom, width, height);
    renderer.setScissor(left, bottom, width, height);
    renderer.render(s, s.userData.camera)
  }


}

export {
  animate, init, transform_cb
}
