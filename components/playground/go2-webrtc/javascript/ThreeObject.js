import {
  WebGLRenderer,
  Quaternion,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  GridHelper,
  Group,
  Mesh,
  Vector3,
  Object3D,
  Color,
  Fog,
  BoxGeometry,
  MeshBasicMaterial,
  TextureLoader,
  NearestFilter,
  DoubleSide,
  ArrowHelper,
  AnimationMixer,
  EquirectangularReflectionMapping,
  Vector2,
  Euler,
} from "three";

import { VoxelWorld } from "./VoxelWorld.js";
import { Clock } from "./Clock.js";
import { RobotDog } from "./RobotDog.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

class WebGL {
  static isWebGLAvailable() {
    return true;
  }
  static getWebGLErrorMessage() {
    return true;
  }
}

const isNumber = (n) => typeof n === "number" && isFinite(n);
const ToastMsg = (x) => x;
const t = (x) => x;

class Tween {
  constructor(x) {
    console.log(x);
  }
  to(x, time) {
    return this;
  }
  onUpdate(cb) {
    cb();
    return this;
  }
  onComplete(x) {
    return this;
  }
  start() {}
}

const update = () => {
  //console.log("PING");
};

export class ThreeObject {
  renderParent;
  renderer;
  scene;
  camera;
  controls;
  stats;
  gridHelper;
  gridHelperGroup;
  gridHelperSize;
  ambientLight;
  clock;
  mixer;
  animationFrameHandle;
  gridRotateAngle;
  viewType;
  firstViewTargetPoint;
  firstViewTargetPosition;
  currCameraPosition;
  firstCameraPosition;
  thirdViewInitPosition;
  controlListenFn;
  robotModel;
  robotModelOpacity;
  robotModelBodyHeightOffset;
  robotActionMap;
  dogRobot;
  radarTimer;
  pointVoxelWorld;
  pointUpdated;
  viewChanging;
  showStats;
  isLf;
  lfCount;
  moveDirection;
  viewDirection;
  gestureViewDirection;
  keyboardState;
  contextLostCb;
  lastQuaternion = new Quaternion();
  constructor(n) {
    if (
      ((this.renderParent = n),
      (this.renderer = new WebGLRenderer({ antialias: !0, alpha: !0 })),
      (this.scene = new Scene()),
      (this.camera = new PerspectiveCamera(70)),
      (this.controls = new OrbitControls(
        this.camera,
        this.renderer.domElement
      )),
      (this.stats = new Stats()),
      (this.ambientLight = new AmbientLight(16777215)),
      (this.gridHelperSize = 40),
      (this.gridHelper = new GridHelper(
        this.gridHelperSize,
        this.gridHelperSize,
        8947848
      )),
      (this.gridHelperGroup = new Group()),
      (this.clock = new Clock()),
      (this.viewType = 0),
      (this.firstViewTargetPoint = new Mesh()),
      (this.firstViewTargetPosition = new Vector3(4, 0, 0)),
      (this.currCameraPosition = new Vector3(0, 0, 0)),
      (this.firstCameraPosition = new Vector3(-1.2, 0, 1)),
      (this.thirdViewInitPosition = new Vector3(-3, 0, 3)),
      (this.controlListenFn = () => {}),
      (this.animationFrameHandle = 0),
      (this.gridRotateAngle = 0),
      (this.robotModel = new Object3D()),
      (this.robotModelOpacity = 0.5),
      (this.robotModelBodyHeightOffset = -0.3),
      (this.robotActionMap = new Map()),
      (this.dogRobot = new RobotDog()),
      (this.radarTimer = 0),
      (this.isLf = !1),
      (this.lfCount = 0),
      (this.showStats = !1),
      (this.moveDirection = { angle: 0, percentage: 0, stop: !0 }),
      (this.viewDirection = { angle: 0, percentage: 0, stop: !0 }),
      (this.gestureViewDirection = { angle: 0, percentage: 0, stop: !0 }),
      (this.keyboardState = void 0),
      (this.contextLostCb = () => {}),
      WebGL.isWebGLAvailable())
    )
      this.init();
    else {
      const o = WebGL.getWebGLErrorMessage();
      console.error(o);
    }
  }
  init() {
    const {
      renderParent,
      scene,
      renderer,
      camera,
      controls,
      ambientLight,
      gridHelper,
      gridHelperGroup,
      viewType,
      stats,
      showStats,
      currCameraPosition,
      firstViewTargetPoint,
      firstViewTargetPosition,
      firstCameraPosition,
      thirdViewInitPosition,
    } = this;
    if (!renderParent) return;
    // NOTE: POINT UPWARDS
    camera.up.set(0, 0, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)),
      (scene.background = new Color(2631720));
    const A = renderParent.clientWidth || 0,
      O = renderParent.clientHeight || 0;
    renderer.setSize(A, O),
      (renderer.shadowMap.enabled = !0),
      renderParent.appendChild(renderer.domElement),
      (scene.fog = viewType === 1 ? null : new Fog(2631720, 0.015, 20)),
      (camera.aspect = A / O),
      camera.updateProjectionMatrix(),
      viewType === 1 ? camera.position.copy(thirdViewInitPosition) : camera.position.copy(firstCameraPosition),
      currCameraPosition.copy(thirdViewInitPosition),
      scene.add(camera);
    const L = new BoxGeometry(0.1, 0.1, 0.1),
      P = new MeshBasicMaterial({
        color: 16711680,
        transparent: !0,
        opacity: 0,
      });
    (firstViewTargetPoint.geometry = L),
      (firstViewTargetPoint.material = P),
      firstViewTargetPoint.position.copy(firstViewTargetPosition),
      scene.add(firstViewTargetPoint),
      (controls.enableDamping = !0),
      (controls.enabled = viewType === 1),
      (controls.enablePan = !1),
      (controls.minPolarAngle = 0.2),
      (controls.maxPolarAngle = (Math.PI / 4) * 3),
      showStats &&
        (document.body.appendChild(stats.dom),
        (stats.dom.style.top = "80px"),
        (stats.dom.style.left = "115px")),
      gridHelperGroup.add(gridHelper),
      gridHelper.rotateX(Math.PI / 2),
      scene.add(gridHelperGroup),
      scene.add(ambientLight),
      this.loadModel();
    const $ = 32,
      B = 1024,
      F = 32,
      J = new TextureLoader().load("/models/axisColor4.png");
    (J.magFilter = NearestFilter), (J.minFilter = NearestFilter);
    const H = new MeshBasicMaterial({
      map: J,
      side: DoubleSide,
      transparent: !1,
    });
    (this.pointVoxelWorld = new VoxelWorld(scene, {
      tileSize: $,
      tileTextureWidth: B,
      tileTextureHeight: F,
      material: H,
    })),
      (this.pointUpdated = !1),
      window.addEventListener("resize", this.resize.bind(this));
      
  }
  gridAxis() {
    const { scene: n } = this,
      o = new Vector3(0, 0, 0),
      s = new Vector3(1, 0, 0),
      c = new Vector3(0, 1, 0),
      u = new Vector3(0, 0, 1),
      l = new ArrowHelper(s, o, 1, 16711680),
      f = new ArrowHelper(c, o, 1, 65280),
      _ = new ArrowHelper(u, o, 1, 255);
    n.add(l, f, _);
  }
  loadModel() {
    const {
        dogRobot: n,
        scene: o,
        robotActionMap: s,
        robotModelOpacity: c,
      } = this,
      u = `${new URL("/models/Go2.glb", self.location).href}`;
    new GLTFLoader().load(u, (l) => {
      (this.robotModel = l.scene),
        l.scene.traverse(function (_) {
          if (_ instanceof Mesh && _.isMesh) {
            _.castShadow = !0;
            const g = _.material;
            (g.transparent = !0), (g.opacity = c);
          }
        }),
        (this.mixer = new AnimationMixer(this.robotModel)),
        l.animations.forEach((_) => {
          if (this.mixer) {
            const g = this.mixer.clipAction(_);
            (g.weight = _.name === "Playing" ? 1 : 0),
              g.stop(),
              s.set(_.name, g);
          }
        });
      const f = this.robotModel.getObjectByName("ExtendRail");
      f && (f.visible = !1),
        o.add(this.robotModel),
        this.loadRGBE(),
        n.init(o),
        this.startRadar(),
        this.listenControlInit();
    });
  }
  loadRGBE() {
    const { scene: n } = this;
    new RGBELoader().load(
      "/models/venice_sunset_1k.hdr",
      (o) => {
        (o.mapping = EquirectangularReflectionMapping), (n.environment = o);
      },
      () => {},
      (o) => {
        console.log("\u76AE\u80A4\u52A0\u8F7D\u5931\u8D25", o);
      }
    );
  }
  cameraViewInit() {
    const { camera: n } = this,
      o = 2,
      s = new Vector3(n.position.x * o, n.position.y * o, n.position.z * o * 2);
    new Tween(n.position)
      .to(s, 1500)
      .onUpdate((c) => {
        n.position.copy(c);
      })
      .start();
  }
  executeAction() {
    var y;
    const {
        clock: n,
        controls: o,
        robotModel: s,
        moveDirection: c,
        viewDirection: u,
        keyboardState: l,
        gestureViewDirection: f,
        viewType: _,
        firstViewTargetPoint: g,
      } = this,
      v = n.getDelta(),
      T = 3 * v,
      E = (Math.PI / 2) * v;
    if (((y = this.mixer) == null || y.update(v), !(c && !c.stop) && c.stop)) {
      const S = new Vector3(0, 0, 0);
      let C = !0;
      l != null && l.pressed("up")
        ? S.setX(1)
        : l != null && l.pressed("down")
        ? S.setX(-1)
        : l != null && l.pressed("left")
        ? S.setY(1)
        : l != null && l.pressed("right")
        ? S.setY(-1)
        : (C = !1),
        C && this.moveActive(s, S, T);
    }
    (u && !u.stop) ||
      (u.stop &&
        (f.stop
          ? (l != null &&
              l.pressed("arrowLeft") &&
              this.viewActive(s, new Vector3(0, 0, 1), E),
            l != null &&
              l.pressed("arrowRight") &&
              this.viewActive(s, new Vector3(0, 0, 1), -E))
          : (this.viewActive(s, new Vector3(0, 0, 1), f.angle),
            (f.angle = 0)))),
      (o.target = _ === 1 ? s.position : g.position);
  }
  moveActive(n, o, s) {
    const { firstViewTargetPoint: c, cameraActive: u, resetGrid: l } = this;
    n.translateOnAxis(o, s),
      c.translateOnAxis(o, s),
      u.call(this),
      l.call(this);
  }
  resetGrid() {
    const { gridHelperGroup: n, gridHelperSize: o, robotModel: s } = this,
      { x: c, y: u } = n.position,
      { x: l, y: f } = s.position,
      _ = c + o / 8,
      g = c - o / 8,
      v = u + o / 8,
      T = u - o / 8,
      E = new Vector3(0, 0, 0);
    l > _ && E.set(1, 0, 0),
      l < g && E.set(-1, 0, 0),
      f > v && E.set(0, 1, 0),
      f < T && E.set(0, -1, 0),
      this.gridHelperGroup.translateOnAxis(E, o / 8);
  }
  viewActive(n, o, s) {
    n.rotateOnAxis(o, s),
      this.cameraRotateTarget(o, s),
      this.calFirstViewCameraPosition();
  }
  cameraRotateTarget(n, o) {
    const { robotModel: s, firstViewTargetPoint: c } = this,
      u = isNumber(o) ? o : o.z;
    isNumber(o) ? c.rotateOnAxis(n, u) : c.rotation.set(o.x, o.y, o.z);
    const l = this.firstViewTargetPoint.position.clone(),
      f = new Vector3(s.position.x, s.position.y, 1),
      _ = this.rotatePointInPlane(
        new Vector2(l.x, l.y),
        new Vector2(f.x, f.y),
        u
      );
    c.position.set(_.x, _.y, 0);
  }
  rotatePointInPlane(n, o, s) {
    const c = n.x - o.x,
      u = n.y - o.y,
      l = Math.cos(s),
      f = Math.sin(s),
      _ = l * c - f * u,
      g = f * c + l * u;
    return { x: o.x + _, y: o.y + g };
  }
  cameraActive() {
    const { camera: n, robotModel: o, viewType: s } = this;
    if (s === 0) this.calFirstViewCameraPosition();
    else {
      const c = this.currCameraPosition,
        u = o.position.clone().add(c);
      n.position.copy(u), n.lookAt(o.position);
    }
  }
  calFirstViewCameraPosition(n) {
    const { camera: o, firstCameraPosition: s, robotModel: c } = this,
      u = new Vector3(c.position.x, c.position.y, 1),
      l = c.position.clone().add(s),
      f = this.rotatePointInPlane(
        new Vector2(l.x, l.y),
        new Vector2(u.x, u.y),
        c.rotation.z || 0
      );
    return !n && o.position.set(f.x, f.y, l.z), new Vector3(f.x, f.y, l.z);
  }
  listenControlInit() {
    const { controls: n, camera: o, robotModel: s, viewType: c } = this;
    (this.controlListenFn = () => {
      const u = o.position.clone().sub(s.position.clone());
      this.currCameraPosition = u;
    }),
      c === 1 && n.addEventListener("change", this.controlListenFn);
  }
  modelActiveFn(n, o, ...s) {
    const c = new Object3D()[`${n}`];
    o.forEach((u) => {
      c.bind(u)(s[0], s[1]);
    });
  }
  loadPointCloud(n) {
    console.log("DATA loadPointCloud", n);
    const { pointVoxelWorld: o } = this;
    !o || ((o.currCellDataInfo = n), (this.pointUpdated = !0));
  }
  updateRobotDom(n) {
    if (!n) return;
    const {
      robotModel: o,
      robotModelBodyHeightOffset: s,
      firstViewTargetPoint: c,
      firstViewTargetPosition: u,
      viewChanging: l,
      resetGrid: f,
    } = this;
    o.position.set(n.position.x, n.position.y, n.position.z + s),
      f.call(this),
      !l && this.cameraActive();
    const _ = u.clone().add(o.position);
    c.position.set(_.x, _.y, 0);
    const g = new Quaternion(
        n.orientation.x,
        n.orientation.y,
        n.orientation.z,
        n.orientation.w
      ),
      v = this.lerpQuaternion(this.lastQuaternion, g, 0.3),
      T = new Euler().setFromQuaternion(v);
    o.rotation.set(T.x, T.y, T.z),
      this.cameraRotateTarget(new Vector3(0, 0, 1), T),
      (this.lastQuaternion = v);
  }
  lerpQuaternion(n, o, s) {
    return new Quaternion().slerpQuaternions(n, o, s);
  }
  updateRobotBodyHeight(n) {
    console.log("\u673A\u8EAB\u9AD8\u5EA6", n);
  }
  setMoveDirection(n) {
    this.moveDirection = n || { angle: 0, percentage: 0, stop: !0 };
  }
  setViewDirection(n) {
    this.viewDirection = n || { angle: 0, percentage: 0, stop: !0 };
  }
  setModelViewDirection(n) {
    this.viewType !== 1 &&
      (n && !isNaN(n)
        ? ((this.gestureViewDirection.stop = !1),
          (this.gestureViewDirection.angle = n))
        : (this.gestureViewDirection.stop = !0));
  }
  startRadar() {
    console.log("START RADAR");
    const { dogRobot: n } = this;
    this.radarTimer = window.setInterval(() => {
      var o;
      (o = n.radar) == null || o.setAngle(n.radar.angle + Math.PI / 4);
    }, 50);
  }
  stopRadar() {
    this.radarTimer && window.clearInterval(this.radarTimer);
  }
  changeViewType() {
    console.log("changeViewType");
    const {
      scene: n,
      camera: o,
      controls: s,
      robotModel: c,
      currCameraPosition: u,
      viewChanging: l,
      controlListenFn: f,
    } = this;
    if (!l)
      if (((this.viewChanging = !0), this.viewType === 1)) {
        s.removeEventListener("change", f),
          (s.enabled = !1),
          (s.enableDamping = !1);
        const _ = o.position.clone(),
          g = this.calFirstViewCameraPosition(!0),
          v = new Tween(_)
            .to(g, 500)
            .onUpdate((S) => {
              o.position.copy(S);
            })
            .onComplete(() => {
              (n.fog = new Fog(2631720, 0.015, 20)),
                (s.enabled = !1),
                (this.viewType = 0),
                (this.viewChanging = !1),
                ToastMsg(t("toastMsg_4"));
            }),
          T = c.position.clone(),
          E = this.firstViewTargetPoint.position.clone(),
          y = new Tween(T).to(E, 500).onUpdate((S) => {
            s.target = S;
          });
        v.start(), y.start();
      } else {
        const _ = o.position.clone(),
          g = u.clone().add(c.position.clone()),
          v = new Tween(_)
            .to(g, 500)
            .onUpdate((S) => {
              o.position.copy(S);
            })
            .onComplete(() => {
              (n.fog = null),
                (s.enabled = !0),
                (s.enableDamping = !0),
                s.addEventListener("change", f),
                (this.viewType = 1),
                (this.viewChanging = !1),
                ToastMsg(t("toastMsg_5"));
            }),
          T = this.firstViewTargetPoint.position.clone(),
          E = c.position.clone(),
          y = new Tween(T).to(E, 500).onUpdate((S) => {
            s.target = S;
          });
        v.start(), y.start();
      }
  }
  calVector3ChangeUnit(n, o) {
    const s = (o.x - n.x) / 10,
      c = (o.y - n.y) / 10,
      u = (o.z - n.z) / 10;
    return { xUnit: s, yUnit: c, zUnit: u };
  }
  setKeyboardListener(n) {
    this.keyboardState = n;
  }
  resize() {
    const { renderParent: n, renderer: o, camera: s } = this;
    !n ||
      window.setTimeout(() => {
        (s.aspect = n.clientWidth / n.clientHeight),
          s.updateProjectionMatrix(),
          o.setSize(n.clientWidth, n.clientHeight);
      }, 300);
  }
  executeRender() {
    const {
      camera: n,
      controls: o,
      renderParent: s,
      renderer: c,
      scene: u,
      stats: l,
      pointVoxelWorld: f,
    } = this;
    if (s) {
      if (this.isLf)
        if (this.lfCount > 0) {
          this.lfCount = 0;
          return;
        } else this.lfCount = 1;
      this.executeAction(),
        this.pointUpdated &&
          f &&
          (f.updateMeshesForData2(), (this.pointUpdated = !1)),
        update(),
        o.update(),
        l.update(),
        c.render(u, n);
    }
  }
  run() {
    try {
      this.executeRender(),
        (this.animationFrameHandle = requestAnimationFrame(
          this.run.bind(this)
        ));
    } catch (n) {
      console.log("START THREEJS \u6355\u6349\u5230\u9519\u8BEF", n),
        this.contextLostCb();
    }
  }
  switchLfRender(n) {
    this.isLf = n;
  }
  setContextLostCb(n) {
    this.contextLostCb = n;
  }
  dispose() {
    console.log("\u91CA\u653Ethreejs\u5185\u5B58"),
      this.renderer.dispose(),
      this.stopRadar(),
      this.animationFrameHandle &&
        cancelAnimationFrame(this.animationFrameHandle);
  }
  unbindLister() {
    window.removeEventListener("resize", this.resize.bind(this));
  }
}
