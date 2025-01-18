import { BufferAttribute, BufferGeometry, Mesh } from "three/webgpu";
import { SceneManager } from "../../SceneManager";
import { convert, convert32 } from "../../utils";

import { DoubleSide, MeshStandardMaterial, NearestFilter, TextureLoader } from "three";

export function initLidarWebWorker(s: SceneManager) {
  //Object3D.DEFAULT_UP = new Vector3(0, 0, 1)
  const threeJSWorker = new Worker(
    new URL("/assets/three.worker.js", import.meta.url)
  );
  //window._threejsworker = threeJSWorker;
  threeJSWorker.onmessage = (re) => {
    updateMesh(s, re.data)
  };
  s.scenes.main.userData.lidarWebWorker = threeJSWorker;
}

const textureLoader = new TextureLoader();
const texture = textureLoader.load(
  import.meta.env.BASE_URL + 'models/axisColor4.png',
  () => {
    console.log('Texture loaded successfully!');
  },
  undefined, // Progress callback (optional)
  (err) => {
    console.error('Error loading texture:', err);
  }
);

texture.magFilter = NearestFilter;
texture.minFilter = NearestFilter;
const lidarMaterial = new MeshStandardMaterial({
  map: texture,
  side: DoubleSide,
  transparent: false,
});

let lidarMesh: Mesh | null = null;

function updateMesh(s: SceneManager, g: any) {
  const geometryData = g.geometryData
  const origin = g.origin;
  const resolution = g.resolution;

  const positions = convert(geometryData.positions);
  const uvs = convert(geometryData.uvs);
  const indices = convert32(geometryData.indices);
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(positions || [], 3)
  );
  geometry.setAttribute(
    "uv",
    new BufferAttribute(uvs || [], 2, !0)
  );
  geometry.setIndex(new BufferAttribute(indices || [], 1));

  if (lidarMesh) {
    lidarMesh.geometry.dispose();
    //lidarMesh.material.dispose();
    s.scenes.main.remove(lidarMesh);
  }

  lidarMesh = new Mesh(geometry, lidarMaterial);
  const res = resolution || 0.1;
  lidarMesh.scale.set(res, res, res);
  lidarMesh.position.set(origin[0] || 0, origin[1] || 0, origin[2] || 0);
  s.scenes.main.add(lidarMesh);
}

export { updateMesh }