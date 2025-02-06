import { BufferGeometry, Color, Float32BufferAttribute, Points, PointsMaterial } from 'three';
import { PointCloudData } from './pointCloudTypes';
import { getFieldsMap } from './utils';
import { SceneManager } from '../../SceneManager';

let pointsCloud: Points | null = null
let pointCloudGeometry: BufferGeometry | null = null

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

  // console.log('points', points);
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
    const r = uint8ArrayData[i + fieldsMap["rgb"].offset] / 250;
    const g = uint8ArrayData[i + fieldsMap["rgb"].offset + 1] / 250;
    const b = uint8ArrayData[i + fieldsMap["rgb"].offset + 2] / 250;
    const color = new Color(r, g, b);
    colors.push(color.r, color.g, color.b);
  }

  return colors;
};

function updateCameraDepthColors(s: SceneManager, g: any) {
    if (pointsCloud) {
        if (pointCloudGeometry) { pointCloudGeometry.dispose() }
        s.scenes.pointcloud.remove(pointsCloud)
    }
    const points = parseCameraDepthColorPoints(g);
    const colors = parseCameraDepthColors(g);

    pointCloudGeometry = new BufferGeometry();
    pointCloudGeometry.setAttribute("position", new Float32BufferAttribute(points, 3));
    pointCloudGeometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    pointCloudGeometry.rotateX(Math.PI / 2);
    pointCloudGeometry.rotateY(Math.PI);
    pointCloudGeometry.rotateZ(Math.PI / 2);

    const material = new PointsMaterial({
        size: 0.001,
        vertexColors: true,
    });

    pointsCloud = new Points(pointCloudGeometry, material);
    s.scenes.pointcloud.add(pointsCloud);
}

export { updateCameraDepthColors }
