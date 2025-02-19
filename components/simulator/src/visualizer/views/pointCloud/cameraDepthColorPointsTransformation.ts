import { BufferGeometry, Color, Float32BufferAttribute, Points, PointsMaterial } from 'three';
import { PointCloudData } from './pointCloudTypes';
import { getFieldsMap } from './utils';
import { SceneManager } from '../../SceneManager';

let cameraDepth: Points | null = null
let cameraDepthGeometry: BufferGeometry | null = null

const parseCameraDepthColorPoints = ({
  data,
  point_step,
  fields,
  is_bigendian,
}: PointCloudData) => {
  const points = [];
  const uint8ArrayData = new Uint8Array(data);
  const fieldsMap = getFieldsMap(fields);

  for (let i = 0; i < data.length; i += point_step) {
    const x = new DataView(
      uint8ArrayData.buffer,
      i + fieldsMap["x"].offset,
      4
    ).getFloat32(0, !is_bigendian);
    const y = new DataView(
      uint8ArrayData.buffer,
      i + fieldsMap["y"].offset,
      4
    ).getFloat32(0, !is_bigendian);
    const z = new DataView(
      uint8ArrayData.buffer,
      i + fieldsMap["z"].offset,
      4
    ).getFloat32(0, !is_bigendian);

    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
      points.push(x, y, z);
    }
  }

  return new Float32Array(points);
};

const parseCameraDepthColors = ({
  data,
  point_step,
  fields,
}: PointCloudData) => {
  const colors = [];
  const uint8ArrayData = new Uint8Array(data);
  const fieldsMap = getFieldsMap(fields);

  for (let i = 0; i < uint8ArrayData.length; i += point_step) {
    const r = uint8ArrayData[i + fieldsMap["rgb"].offset] / 255;
    const g = uint8ArrayData[i + fieldsMap["rgb"].offset + 1] / 255;
    const b = uint8ArrayData[i + fieldsMap["rgb"].offset + 2] / 255;
    const color = new Color(r, g, b);
    colors.push(color.r, color.g, color.b);
  }

  return colors;
};

function updateCameraDepthColors(s: SceneManager, g: any) {
    if (cameraDepth) {
        if (cameraDepthGeometry) { cameraDepthGeometry.dispose() }
        s.scenes.cameraDepth.remove(cameraDepth)
    }
    const points = parseCameraDepthColorPoints(g);
    const colors = parseCameraDepthColors(g);

    cameraDepthGeometry = new BufferGeometry();
    cameraDepthGeometry.setAttribute("position", new Float32BufferAttribute(points, 3));
    cameraDepthGeometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    cameraDepthGeometry.rotateX(Math.PI / 2);
    cameraDepthGeometry.rotateY(Math.PI);

    const material = new PointsMaterial({
        size: 0.001,
        vertexColors: true,
    });

    cameraDepth = new Points(cameraDepthGeometry, material);
    s.scenes.cameraDepth.add(cameraDepth);
    // (s.scenes.cameraDepth.userData.domElement?.parentNode as HTMLElement).classList.remove('hidden');
}

export { updateCameraDepthColors }
