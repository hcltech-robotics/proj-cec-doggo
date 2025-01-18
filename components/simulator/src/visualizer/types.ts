import {
    AmbientLight,
    AxesHelper,
    GridHelper,
    Material,
    PerspectiveCamera,
    PointLight,
    PointLightHelper,
    Points,
    Scene,
} from 'three'
import { DragControls, OrbitControls } from 'three/examples/jsm/Addons.js'
import { URDFRobot } from 'urdf-loader'

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

export interface Scenes {
    main: MainScene,
    pointcloud: PointcloudScene
}

export interface UserSettings {
    animation: { enabled: boolean, play: boolean }
    apiKey: string
    foxglove_config: { url: string }
}

