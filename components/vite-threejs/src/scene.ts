import GUI from 'lil-gui'
import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  BufferGeometry,
  Clock,
  Color,
  Float32BufferAttribute,
  GridHelper,
  LoadingManager,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  PointLightHelper,
  Quaternion,
  Scene,
  Uint16BufferAttribute,
  Vector3,
  WebGLRenderer,
} from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as animations from './helpers/animations'
import { toggleFullScreen } from './helpers/fullscreen'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'

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
let voxelManager: VoxelManager
let guiCB
let foxglove_config = { url: "ws://localhost:8765" }

Object3D.DEFAULT_UP = new Vector3(0, 0, 1)
const animation = { enabled: true, play: true }

import { LoadingManager } from "three";
import URDFLoader, { URDFRobot } from "urdf-loader";
import { VRButton } from 'three/examples/jsm/Addons.js'
import { init_websocket } from './Websocket'



let randomVoxelInterval = null
let randomVoxelConfig = { delay: 100 }

function randomVoxels(delay = 100) {
  if (randomVoxelInterval) {
    clearInterval(randomVoxelInterval)
  }
  randomVoxelInterval = setInterval(() => {
    const x = Math.random() * 6 - 3;
    const y = Math.random() * 6 - 3;
    const z = Math.random() * 10;
    const strength = Math.random() * 100;
    const factor = 0.1
    voxelManager.addVoxel(x, y, z, strength);
    voxelManager.addVoxel(x, y - 1 * factor, z, strength);
    voxelManager.addVoxel(x, y + 1 * factor, z, strength);
    voxelManager.addVoxel(x, y, z - 1 * factor, strength);
    voxelManager.addVoxel(x, y, z + 1 * factor, strength);
    voxelManager.addVoxel(x - 1 * factor, y, z, strength);
    voxelManager.addVoxel(x + 1 * factor, y, z, strength);

  }, delay);
}

function loadRobot() {
  const manager = new LoadingManager();
  const loader = new URDFLoader(manager);
  // loader.packages = {
  //   packageName: "go2_robot_sdk/dae", // The equivalent of a (list of) ROS package(s):// directory
  // };
  loader.load(
    "./go2.urdf", // The path to the URDF within the package OR absolute
    (r) => {
      robot = r
      // The robot is loaded!
      scene.add(robot);
      // robot.rotateX(270 * Math.PI / 180)
      //robot.rotation.set(-Math.PI / 2, 0, 0)
      robot.translateZ(0.45)
    }
  );
}

function animateJoints() {
  const joints = ["Head_upper_joint",
    "Head_lower_joint",
    "FL_hip_joint",
    "FL_thigh_joint",
    "FL_calf_joint",
    "FL_calflower_joint",
    "FL_calflower1_joint",
    "FL_foot_joint",
    "FR_hip_joint",
    "FR_thigh_joint",
    "FR_calf_joint",
    "FR_calflower_joint",
    "FR_calflower1_joint",
    "FR_foot_joint",
    "RL_hip_joint",
    "RL_thigh_joint",
    "RL_calf_joint",
    "RL_calflower_joint",
    "RL_calflower1_joint",
    "RL_foot_joint",
    "RR_hip_joint",
    "RR_thigh_joint",
    "RR_calf_joint",
    "RR_calflower_joint",
    "RR_calflower1_joint",
    "RR_foot_joint",
    "imu_joint",
    "radar_joint",
  ]
  // for (const x of joints) {
  //   const j = robot.joints[x]
  //   // debugger
  //   if (j.jointValue && j.jointValue[0]) {
  //     robot.setJointValue(x, j.jointValue[0].valueOf() + 0.1);
  //   }
  // }
}

export const subscribe_channels = new Set([
  "/joint_states",
  "/odom",
  "/tf"
])

function transform_cb(p) {
  //console.trace(p)
  const { data, timeStamp } = p
  const msgData = data.messageData
  //debugger
  if (data.channelTopic === "/joint_states") {
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
        const translation = t.transform.translation
        const rotation = t.transform.rotation
        // WORKS but not needed
        // const part = robot.getObjectByName(frame)
        // if (part) {
        //   part.position.(translation.x, translation.y, translation.z)
        //   part.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
        // }  
        // const factor = 100
        // robot.translateX(translation.x/factor)
        // robot.translateY(translation.y/factor)
        // robot.translateZ(translation.z/factor)
        robot.quaternion.copy(new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w))

      }
    }
  } else if (data.channelTopic === "/odom") {
    // console.trace(msgData)



    const r = msgData?.pose?.pose?.oritentation ?? null
    const p = msgData?.pose?.pose?.position ?? null

    // if (r) {
    //   robot.quaternion.copy(new Quaternion(r.x, r.y, r.z, r.w))
    // }
    if (p) {
      robot.position.copy(new Vector3(p.x, p.y, p.z))
    }

    // robot.setRotationFromQuaternion()
    // robot.position.set()
  }
}

function registerGUIConnector(cb) {
  // INTERACT FROM THREEJS TO REACT STATE
  // useage: call GUICB to show data in the react gui controller part... (it's a state setter function or reducer)
  guiCB = cb
}

document.addEventListener('hackathonGuiEvent', (event) => {
  // INTERACT FROM REACT EVENT HANDLER TO THREEJS
  // usage: dispatch a custom event on the document
  console.log(event.detail)
  console.log(event?.detail?.message ?? "NO MESSAGE FOUND");
})

window.getBinaryData = (filepath) => {

  return fetch(filepath)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => {
      return new Uint8Array(arrayBuffer);
    })
    .catch((error) => {
      throw error;
    });
};

function updateMesh(g) {
  console.log(g)
  const geometryData = g.geometryData
  // // Geometry data from JSON
  // const geometryData = {
  //   "point_count": 24957,
  //   "face_count": 25180,
  //   "positions": {
  //     "0": 26,
  //     "1": 16,
  //   },
  //   "uvs": {
  //     "0": 42,
  //     "1": 0,
  //   },
  //   "indices": {
  //     "0": 0,
  //     "1": 1
  //   },
  //   "resolution": 0.05,
  //   "origin": [
  //     0.225,
  //     -1.375,
  //     -0.575
  //   ]
  // };

  // Extract geometry data
  const positions = Object.values(geometryData.positions);
  const uvs = Object.values(geometryData.uvs);
  const indices = Object.values(geometryData.indices);
  const origin = g.origin;
  const resolution = g.resolution;

  // Create BufferGeometry
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(new Uint16BufferAttribute(indices, 1));

  // Define material
  const material = new MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true
  });

  // Create mesh
  const mesh = new Mesh(geometry, material);
  const res = resolution || 0.1;
  mesh.scale.set(res, res, res);
  // console.log(origin);
  // debugger
  mesh.position.set(origin[0] || 0, origin[1] || 0, origin[2] || 0);
  scene.add(mesh);
}

function initWebWorker() {
  // let to = new ThreeObject(document.body)

  Object3D.DEFAULT_UP = new Vector3(0, 0, 0)
  const threeJSWorker = new Worker(
    new URL("/assets/three.worker.js", import.meta.url)
  );
  window._threejsworker = threeJSWorker;
  threeJSWorker.onmessage = (re) => {
    console.log("Binary Data", re, re.data);
    updateMesh(re.data)
    // to.loadPointCloud(re.data)
  };

  const getData = () => {
    try {
      console.warn("TICK");
      window.getBinaryData(`/example.bin`).then((vortexBinaryData) => {
        const _jsonLength = vortexBinaryData[0];
        const _jsonOffset = 4;
        const _jsonString = String.fromCharCode.apply(
          null,
          vortexBinaryData.slice(_jsonOffset, _jsonOffset + _jsonLength)
        );
        const jsonOBJ = JSON.parse(_jsonString);
        threeJSWorker.postMessage({
          resolution: jsonOBJ.data.resolution,
          origin: jsonOBJ.data.origin,
          width: jsonOBJ.data.width,
          data: vortexBinaryData.slice(_jsonOffset + _jsonLength),
        });
      });
    } catch (e) {
      console.error("ERROR DURING VERTEX LOAD", e);
    }
  }

  setInterval(getData, 10000);
  setTimeout(getData, 500)
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
    document.body.appendChild(VRButton.createButton(renderer));
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
    ambientLight = new AmbientLight('white', 0.4)
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

    const planeGeometry = new PlaneGeometry(3, 3)
    const planeMaterial = new MeshLambertMaterial({
      color: 'gray',
      emissive: 'teal',
      emissiveIntensity: 0.2,
      side: 2,
      transparent: true,
      opacity: 0.4,
    })
    const plane = new Mesh(planeGeometry, planeMaterial)
    //plane.rotateX(Math.PI / 2)
    plane.receiveShadow = true

    voxelManager = new VoxelManager(scene);
    // Add random voxels every 100ms
    randomVoxels()

    // scene.add(cube)
    scene.add(plane)
  }

  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.set(-2.13, 5, 2.5)
    window.camera = camera
    //camera.up.set(0,0,1)
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
    //gridHelper.rotation.set(0,1,0)
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

    // cubeFolder.add(cube.position, 'x').min(-5).max(5).step(0.5).name('pos x')
    // cubeFolder
    //   .add(cube.position, 'y')
    //   .min(-5)
    //   .max(5)
    //   .step(1)
    //   .name('pos y')
    //   .onChange(() => (animation.play = false))
    //   .onFinishChange(() => (animation.play = true))
    // cubeFolder.add(cube.position, 'z').min(-5).max(5).step(0.5).name('pos z')

    cubeFolder.add(cube.material, 'wireframe')
    cubeFolder.add(voxelManager, 'fadeRate', 0.0001, 0.1, 0.0001)
    cubeFolder.add(randomVoxelConfig, 'delay', 100, 10000, 10).onFinishChange(() => (randomVoxels(randomVoxelConfig.delay)))
    // cubeFolder.addColor(cube.material, 'color')
    // cubeFolder.add(cube.material, 'metalness', 0, 1, 0.1)
    // cubeFolder.add(cube.material, 'roughness', 0, 1, 0.1)

    // cubeFolder
    //   .add(cube.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    //   .name('rotate x')
    // cubeFolder
    //   .add(cube.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    //   .name('rotate y')
    //   .onChange(() => (animation.play = false))
    //   .onFinishChange(() => (animation.play = true))
    // cubeFolder
    //   .add(cube.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    //   .name('rotate z')

    // cubeFolder.add(animation, 'enabled').name('animated')

    const controlsFolder = gui.addFolder('Controls')
    controlsFolder.add(dragControls, 'enabled').name('drag controls')

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
  voxelManager.fadeVoxels();

  stats.update()
  if (guiCB) {
    //console.log(guiCB)
    // guiCB(Math.random())
  }

  // animateJoints()
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


class VoxelManager {
  constructor(scene, fadeRate = 0.01) {
    this.scene = scene;
    this.voxels = new Map();
    this.fadeRate = fadeRate;
    this.materials = {};
  }

  addVoxel(x, y, z, strength) {
    const key = `${x},${y},${z}`;

    if (this.voxels.has(key)) {
      const voxelData = this.voxels.get(key);
      voxelData.strength = Math.max(voxelData.strength, strength);
      voxelData.alpha = 1.0;
    } else {
      const color = this._getColorByStrength(strength);
      const material = this._getMaterial(color);
      const geometry = new BoxGeometry(0.1, 0.1, 0.1);
      const voxel = new Mesh(geometry, material);

      voxel.position.set(x, y, z);

      this.scene.add(voxel);
      this.voxels.set(key, { voxel, strength, alpha: 1.0 });
    }
  }

  fadeVoxels() {
    for (const [key, voxelData] of this.voxels) {
      voxelData.alpha -= this.fadeRate;
      if (voxelData.alpha <= 0) {
        this.scene.remove(voxelData.voxel);
        this.voxels.delete(key);
      } else {
        voxelData.voxel.material.transparent = true;
        voxelData.voxel.material.opacity = voxelData.alpha;
      }
    }
  }

  _getMaterial(color) {
    const colorKey = color.getHexString();
    if (!this.materials[colorKey]) {
      this.materials[colorKey] = new MeshStandardMaterial({
        color,
        metalness: 0.5,
        roughness: 0.7,
        wireframe: cube.material.wireframe,
      })
    }
    return this.materials[colorKey];
  }

  // _getColorByStrength(strength) {
  //   const color = new Color();
  //   color.setHSL((strength /100), 1.0, 0.5);
  //   return color;
  // }
  _getColorByStrength(strength) {
    const colors = [
      new Color(0xff0000), // Red
      new Color(0xffa500), // Orange
      new Color(0xffff00), // Yellow
      new Color(0x008000), // Green
      new Color(0x0000ff)  // Blue
    ];

    const index = Math.min(Math.floor(strength / 20), colors.length - 1);
    return colors[index];
  }
}

export {
  animate, init, transform_cb, registerGUIConnector
}