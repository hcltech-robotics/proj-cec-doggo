import { Clock, Vector3, WebGLRenderer } from 'three';
import { FoxgloveClient } from '@foxglove/ws-protocol';
import { createFoxGloveWebsocket, WebSocketEventHandler } from '../robot/foxgloveConnection';
import { initThreeJSBase } from './views/initThreeJs';
import { initLidarWebWorker } from './views/lidarBox/lidarBoxTransformation';
import { transform_cb } from './transformations/ros2transforms';
import { animate } from './renderloop';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {
  MainScene,
  PointcloudScene,
  PointcloudSceneUserData,
  Scenes,
  TopicListCustomEvent,
  UserSettings,
} from './types';
import { Channel } from '@foxglove/ws-protocol';

const CANVAS_ID = 'scene';

class TopicList {
  public selectedTopic: string = '';

  private defaultItem: string = 'No Point Cloud Scene';
  private dropDownItems!: string[];
  private eventTarget: EventTarget = new EventTarget();

  private get items(): string[] {
    return this.dropDownItems.filter((dropDownItem) => dropDownItem !== this.defaultItem);
  }

  constructor() {
    this.init();
  }

  public parse(channels: Channel[]): string[] {
    this.dropDownItems = channels.reduce((acc, curr) => {
      if (curr.schemaName.includes('PointCloud2')) {
        acc.push(curr.topic);
      }
      return acc;
    }, this.dropDownItems);

    this.dispatch('topicsLoaded', this.dropDownItems);

    return this.items;
  }

  public on<T = string[]>(customEvent: TopicListCustomEvent, cb: (data: T) => void): void {
    this.eventTarget.addEventListener(customEvent, (event) => cb((event as CustomEvent).detail));
  }

  public dispatch<T = string[]>(customEvent: TopicListCustomEvent, data?: T): void {
    this.eventTarget.dispatchEvent(new CustomEvent(customEvent, { detail: data }));
  }

  public reset(): void {
    this.init();
  }

  private init(): void {
    this.dropDownItems = [this.defaultItem];
  }
}

class SceneManager {
  canvas: HTMLElement;
  renderer: WebGLRenderer | null;
  clock: Clock;
  stats: Stats;
  scenes: Scenes;
  userSettings: UserSettings<TopicList>;
  client: FoxgloveClient | null;
  foxgloveConnection: Promise<void>;

  private animationFrame: number;

  constructor() {
    this.userSettings = {
      animation: { enabled: true, play: true },
      apiKey: 'defaultapiKey',
      foxglove_config: { url: 'ws://localhost:8765' },
      pointCloudScene: { enabled: true },
      topicList: new TopicList(),
    };
    this.scenes = {
      main: new MainScene(),
      pointcloud: new PointcloudScene(),
    };
    this.canvas = document.querySelector<HTMLElement>(`canvas#${CANVAS_ID}`)!;
    this.renderer = null;
    this.client = null;
    this.clock = new Clock();
    this.stats = new Stats();
    this.foxgloveConnection = Promise.resolve();
    this.animationFrame = 0;
  }

  init(onEvent: WebSocketEventHandler) {
    initThreeJSBase(this, onEvent);
    createFoxGloveWebsocket(transform_cb, this.userSettings.foxglove_config.url, this, onEvent);
    initLidarWebWorker(this);
    this.bindEventListeners();
  }

  reconnectWebsocketConnection(onEvent: WebSocketEventHandler) {
    if (this.client) {
      this.client.close();
      this.client = null;
    }

    createFoxGloveWebsocket(transform_cb, this.userSettings.foxglove_config.url, this, onEvent);
  }

  animate() {
    animate(this);
  }

  bindEventListeners() {
    const { userData } = this.scenes.pointcloud;

    userData.cameraControls?.addEventListener('start', () => {
      cancelAnimationFrame(this.animationFrame);
    });

    userData.domElement?.addEventListener('mouseleave', () => {
      this.resetCameraPosition(userData);
    });
  }

  resetCameraPosition({ camera, cameraControls, resetPosition, lerpSpeed }: PointcloudSceneUserData) {
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

export { type SceneManager, getSceneManager };
