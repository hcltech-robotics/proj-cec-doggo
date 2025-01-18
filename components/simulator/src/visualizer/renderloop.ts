
function animate() {
  requestAnimationFrame(animate)
  stats.update()

  // renderer.setClearColor(0xffffff);
  renderer.setScissorTest(false);
  renderer.clear();

  // renderer.setClearColor(0xe0e0e0);
  renderer.setScissorTest(true);

  if (!renderer.xr.isPresenting) {
    cameraControls.update();
    const c: PerspectiveCamera = pointcloudScene.userData.camera
    c.copy(scene.userData.camera)
  }
  const needResize = resizeRendererToDisplaySize(renderer)
  for (let s of [scene, pointcloudScene]) {
    if (needResize) {
      const canvas = renderer.domElement
      s.userData.camera.aspect = canvas.clientWidth / canvas.clientHeight
      s.userData.camera.updateProjectionMatrix()
    }
    // get its position relative to the page's viewport
    const rect = s.userData.domElement.getBoundingClientRect();

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
    renderer.render(s, s.userData.camera)
  }


}