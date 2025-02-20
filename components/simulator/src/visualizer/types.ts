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
    Vector3,
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

export interface PointcloudSceneUserData {
    camera: PerspectiveCamera | null
    domElement: HTMLElement | null
    cameraControls: OrbitControls | null
    resetPosition: Vector3
    lerpSpeed: number
}

export class PointcloudScene extends Scene {
    userData: PointcloudSceneUserData
    constructor() {
        super()
        this.userData = { camera: null, domElement: null, cameraControls: null, resetPosition: new Vector3(0, 1, 0), lerpSpeed: 0.05 }
    }
}

export interface CameraDepthSceneUserData {
  camera: PerspectiveCamera | null
  domElement: HTMLElement | null
  cameraControls: OrbitControls | null
  resetPosition: Vector3
  lerpSpeed: number
}

export class CameraDepthScene extends Scene {
  userData: CameraDepthSceneUserData
  constructor() {
      super()
      this.userData = { camera: null, domElement: null, cameraControls: null, resetPosition: new Vector3(0, 1, 0), lerpSpeed: 0.1 }
  }
}

export interface Scenes {
    main: MainScene,
    pointcloud: PointcloudScene,
    cameraDepth: CameraDepthScene,
}

export interface UserSettings {
    animation: { enabled: boolean, play: boolean }
    apiKey: string
    foxglove_config: { url: string }
    pointCloudScene: { enabled: boolean }
    cameraDepthScene: { enabled: boolean }
    selectedMiniScene: string
    topics: string[]
}

