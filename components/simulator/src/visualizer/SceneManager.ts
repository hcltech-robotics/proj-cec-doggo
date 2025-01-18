import {
    AmbientLight,
    AxesHelper,
    Clock,
    GridHelper,
    Material,
    PerspectiveCamera,
    PointLight,
    PointLightHelper,
    Points,
    Scene,
    WebGLRenderer,
} from 'three'
import { initFoxGloveWebsocket } from '../robot/foxgloveConnection'
import { initThreeJSBase } from './threejs-base/threejsInitializer'
import { initLidarWebWorker } from './views/lidarBox/lidarBoxTransformation'
import { transform_cb } from './transformations/ros2transforms'
import { DragControls, OrbitControls } from 'three/examples/jsm/Addons.js'
import { URDFRobot } from 'urdf-loader'
import { animate } from './renderloop'
import Stats from 'three/examples/jsm/libs/stats.module.js'

interface MainSceneUserData {
    camera: PerspectiveCamera | null
    lidarWebWorker: Worker | null
    ambientLight: AmbientLight | null
    pointLight: PointLight | null
    lidarMaterial: Material | null
    gridHelper: GridHelper | null
    cameraControls: OrbitControls | null
    dragControls: DragControls | null
    axesHelper: AxesHelper | null
    pointLightHelper: PointLightHelper | null
    pointsCloud: Points | null
    robot: URDFRobot | null
    domElement: HTMLElement | null
}

export class MainScene extends Scene {
    userData: MainSceneUserData
    constructor() {
        super()
        this.userData = { lidarWebWorker: null, camera: null, ambientLight: null, pointLight: null, lidarMaterial: null, cameraControls: null, dragControls: null, axesHelper: null, pointLightHelper: null, pointsCloud: null, robot: null, domElement: null, gridHelper: null }
    }
}

interface PointcloudSceneUserData {
    camera: PerspectiveCamera | null
    domElement: HTMLElement | null
}

export class PointcloudScene extends Scene {
    userData: PointcloudSceneUserData
    constructor() {
        super()
        this.userData = { camera: null, domElement: null }
    }
}

interface Scenes {
    main: MainScene,
    pointcloud: PointcloudScene
}

interface UserSettings {
    animation: { enabled: boolean, play: boolean }
    apiKey: string
    foxglove_config: { url: string }
}

const CANVAS_ID = 'scene'

class SceneManager {
    canvas: HTMLElement
    renderer: WebGLRenderer | null
    clock: Clock
    stats: Stats
    scenes: Scenes

    userSettings: UserSettings
    constructor() {
        this.userSettings = {
            animation: { enabled: true, play: true },
            apiKey: 'defaultapiKey',
            foxglove_config: { url: "ws://localhost:8765" }
        };
        this.scenes = {
            main: new MainScene(),
            pointcloud: new PointcloudScene(),
        }
        this.canvas = document.querySelector<HTMLElement>(`canvas#${CANVAS_ID}`)!
        this.renderer = null
        this.clock = new Clock()
        this.stats = new Stats()
    }

    init() {
        initThreeJSBase(this)
        initFoxGloveWebsocket(transform_cb, this.userSettings.foxglove_config.url, this);
        initLidarWebWorker(this)
    }

    animate() {
        animate(this)
    }
}

const sceneManager: SceneManager = new SceneManager();
const getSceneManager = () => sceneManager;

export { type SceneManager, getSceneManager }

