// import { PerspectiveCamera } from "three";
import { SceneManager } from "./SceneManager";
import { resizeRendererToDisplaySize } from "../helpers/responsiveness";

function animate(s: SceneManager) {
  requestAnimationFrame(animate.bind(null, s))
  s.stats.update()

  const renderer = s.renderer!
  // renderer.setClearColor(0xffffff);
  renderer.setScissorTest(false);
  renderer.clear();

  // renderer.setClearColor(0xe0e0e0);
  renderer.setScissorTest(true);

  if (!renderer.xr.isPresenting) {
    s.scenes.main.userData.cameraControls?.update();
    // const c: PerspectiveCamera = s.scenes.pointcloud.userData.camera!
    // c.copy(s.scenes.main.userData.camera!)
  }
  const needResize = resizeRendererToDisplaySize(renderer)
  for (let curr of [s.scenes.main, s.scenes.pointcloud, s.scenes.cameraDepth]) {
    if (
      (!s.userSettings.pointCloudScene.enabled && curr === s.scenes.pointcloud) ||
      (!s.userSettings.cameraDepthScene.enabled && curr === s.scenes.cameraDepth)
    ) {
      continue;
    }
    if (needResize) {
      const canvas = renderer.domElement
      curr.userData.camera!.aspect = canvas.clientWidth / canvas.clientHeight
      curr.userData.camera!.updateProjectionMatrix()
    }
    // get its position relative to the page's viewport
    const rect = curr.userData.domElement!.getBoundingClientRect();

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
    renderer.render(curr, curr.userData.camera!)
  }


}

export { animate }
