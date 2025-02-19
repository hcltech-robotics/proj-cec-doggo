import {
    Clock,
    PerspectiveCamera,
    Vector3,
    WebGLRenderer,
} from 'three'
import { initFoxGloveWebsocket } from '../robot/foxgloveConnection'
import { initThreeJSBase } from './views/initThreeJs'
import { initLidarWebWorker } from './views/lidarBox/lidarBoxTransformation'
import { transform_cb } from './transformations/ros2transforms'
import { animate } from './renderloop'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { CameraDepthScene, CameraDepthSceneUserData, MainScene, PointcloudScene, PointcloudSceneUserData, Scenes, UserSettings } from './types'


const CANVAS_ID = 'scene'

class SceneManager {
    canvas: HTMLElement
    renderer: WebGLRenderer | null
    clock: Clock
    stats: Stats
    scenes: Scenes

    userSettings: UserSettings

    get miniScenes() {
      return [this.scenes.pointcloud, this.scenes.cameraDepth];
    }

    private animationFrame: number

    constructor() {
        this.userSettings = {
            animation: { enabled: true, play: true },
            apiKey: 'defaultapiKey',
            foxglove_config: { url: "ws://localhost:8765" },
            pointCloudScene: { enabled: true },
            cameraDepthScene: { enabled: true },
        };
        this.scenes = {
            main: new MainScene(),
            pointcloud: new PointcloudScene(),
            cameraDepth: new CameraDepthScene(),
        }
        this.canvas = document.querySelector<HTMLElement>(`canvas#${CANVAS_ID}`)!
        this.renderer = null
        this.clock = new Clock()
        this.stats = new Stats()
        this.animationFrame = 0;
    }

    init() {
        initThreeJSBase(this)
        initFoxGloveWebsocket(transform_cb, this.userSettings.foxglove_config.url, this);
        initLidarWebWorker(this)
        this.bindEventListeners();
    }

    animate() {
        animate(this)
    }

    bindEventListeners() {
      this.miniScenes.forEach(({ userData }) => {
        userData.cameraControls?.addEventListener('start', () => {
          cancelAnimationFrame(this.animationFrame);
        });

        userData.domElement?.addEventListener('mouseleave', () => {
          this.resetCameraPosition(userData);
        });
      });
    }

    resetCameraPosition({ camera, cameraControls, resetPosition, lerpSpeed }: PointcloudSceneUserData | CameraDepthSceneUserData) {
      if (!camera || !cameraControls) {
        return;
      }

      const update = () => {
        if (camera.position.distanceTo(resetPosition) > 0.0001) {
          camera.position.lerp(resetPosition, lerpSpeed);
          cameraControls.target.lerp(new Vector3(0, 0, 0), lerpSpeed);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          cameraControls.update();

          this.animationFrame = requestAnimationFrame(update);
        } else {
          cancelAnimationFrame(this.animationFrame);
        }
      };

      update();
    }
}

const sceneManager: SceneManager = new SceneManager();
const getSceneManager = () => sceneManager;

export { type SceneManager, getSceneManager }

