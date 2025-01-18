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
    Points,
    Quaternion,
    Scene,
    TextureLoader,
    Vector3,
    WebGLRenderer,
} from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as animations from '../helpers/animations'
import { toggleFullScreen } from '../helpers/fullscreen'
import { resizeRendererToDisplaySize } from '../helpers/responsiveness'
import URDFLoader, { URDFRobot } from "urdf-loader";
import { initFoxGloveWebsocket } from '../robot/foxgloveConnection'
import { SceneTransformParam } from '../types'
import { initThreeJSBase } from './threejs-base/threejsInitializer'
import { initLidarWebWorker } from './views/lidarBox/lidarBoxLoader'
import { transform_cb } from './transformations/ros2transforms'

class SceneManager {
    canvas: HTMLElement
    renderer: WebGLRenderer
    sceneMain: Scene
    scenePointcloud: Scene
    loadingManager: LoadingManager
    ambientLight: AmbientLight
    pointLight: PointLight
    cube: Mesh
    camera: PerspectiveCamera
    cameraControls: OrbitControls
    dragControls: DragControls
    axesHelper: AxesHelper
    pointLightHelper: PointLightHelper
    clock: Clock
    stats: Stats
    pointsCloud: Points
    lidarMaterial: Material
    
    userSettings: any
    constructor() {
        this.sceneMain = new Scene();
        this.userSettings = {
            animation: { enabled: true, play: true },
            apiKey: 'defaultapiKey',
            foxglove_config: { url: "ws://localhost:8765" }
        };
    }

    init() {
        initThreeJSBase(this)
        initFoxGloveWebsocket(transform_cb, this.userSettings.foxglove_config.url);
        initLidarWebWorker(this)
    }

    animate() {

    }

    addToScene(name: "main" | "pointcloud", obj: Object3D) {
        if (name === "main") {
            this.sceneMain.add(obj)
        } else if (name === "pointcloud") {
            this.scenePointcloud.add(obj)
        } else {
            console.error("Invalid scene name: %s", name)
        }
    }
    removeFromScene(name: "main" | "pointcloud", obj: Object3D) {
        if (name === "main") {
            this.sceneMain.remove(obj)
        } else if (name === "pointcloud") {
            this.scenePointcloud.remove(obj)
        } else {
            console.error("Invalid scene name: %s", name)
        }
    }

    saveInScene(name: "main" | "pointcloud", objName: string, obj: Object3D | HTMLElement | Worker) {
        if (name === "main") {
            this.sceneMain.userData[objName] = obj
        } else if (name === "pointcloud") {
            this.scenePointcloud.userData[objName] = obj
        } else {
            console.error("Invalid scene name: %s", name)
        }
    }
}

const sceneManager: SceneManager = new SceneManager();
const getSceneManager = () => sceneManager;

export { type SceneManager, getSceneManager }

