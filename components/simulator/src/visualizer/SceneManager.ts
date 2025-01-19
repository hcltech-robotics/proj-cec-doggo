import {
    Clock,
    WebGLRenderer,
} from 'three'
import { initFoxGloveWebsocket } from '../robot/foxgloveConnection'
import { initThreeJSBase } from './views/initThreeJs'
import { initLidarWebWorker } from './views/lidarBox/lidarBoxTransformation'
import { transform_cb } from './transformations/ros2transforms'
import { animate } from './renderloop'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { MainScene, PointcloudScene, Scenes, UserSettings } from './types'


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
            foxglove_config: { url: "ws://localhost:8765" },
            pointCloudScene: { enabled: true }
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

