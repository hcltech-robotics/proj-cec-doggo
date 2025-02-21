import { Box3, BufferGeometry, Color, Float32BufferAttribute, Points, PointsMaterial, Vector3 } from 'three';
import { PointCloudData } from './pointCloudTypes';
import { getFieldsMap } from './utils';
import { SceneManager } from '../../SceneManager';
import { PointcloudSceneUserData } from '../../types';
import { Lut } from 'three/addons/math/Lut.js';

let pointCloud: Points | null = null;
let pointCloudGeometry: BufferGeometry | null = null;

const lut = new Lut('viridrainbowis', 256);

lut.setMin(0);
lut.setMax(255);

const getPosition = ({ data, point_step, fields, is_bigendian }: PointCloudData) => {
  const points = [];
  const uint8ArrayData = new Uint8Array(data);
  const fieldsMap = getFieldsMap(fields);

  for (let i = 0; i < data.length; i += point_step) {
    const x = new DataView(uint8ArrayData.buffer, i + fieldsMap['x'].offset, 4).getFloat32(0, !is_bigendian);
    const y = new DataView(uint8ArrayData.buffer, i + fieldsMap['y'].offset, 4).getFloat32(0, !is_bigendian);
    const z = new DataView(uint8ArrayData.buffer, i + fieldsMap['z'].offset, 4).getFloat32(0, !is_bigendian);

    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
      points.push(x, y, z);
    }
  }

  return new Float32Array(points);
};

const getColor = ({ data, point_step, fields }: PointCloudData) => {
  const colors: number[] = [];
  const uint8ArrayData = new Uint8Array(data);
  const fieldsMap = getFieldsMap(fields);

  if (!fieldsMap['rgb']) {
    return colors;
  }

  for (let i = 0; i < uint8ArrayData.length; i += point_step) {
    const r = uint8ArrayData[i + fieldsMap['rgb'].offset] / 255;
    const g = uint8ArrayData[i + fieldsMap['rgb'].offset + 1] / 255;
    const b = uint8ArrayData[i + fieldsMap['rgb'].offset + 2] / 255;
    const color = new Color(b, g, r);
    colors.push(color.r, color.g, color.b);
  }

  return colors;
};

const getIntensity = ({ data, point_step, fields, is_bigendian }: PointCloudData) => {
  const intensity: number[] = [];
  const uint8ArrayData = new Uint8Array(data);
  const fieldsMap = getFieldsMap(fields);

  if (!fieldsMap['intensity']) {
    return intensity;
  }

  for (let i = 0; i < data.length; i += point_step) {
    intensity.push(new DataView(uint8ArrayData.buffer, i + fieldsMap['intensity'].offset, 4).getFloat32(0, !is_bigendian));
  }

  return intensity.flatMap((item) => {
    const { r, g, b } = lut.getColor(item);
    return [r, g, b];
  });
};

// const positionCamera = (userdata: PointcloudSceneUserData, pointCloud: Points) => {
//   const box = new Box3().setFromObject(pointCloud); // Bounding box
//   const center = new Vector3(0, 0, 0); // Középpont és méret
//   box.getCenter(center);
//   const size = box.getSize(new Vector3());

//   // Kamera pozicionálása
//   const maxDim = Math.max(size.x, size.y, size.z);
//   const cameraFov = userdata.camera?.fov ?? 50;
//   const fov = cameraFov * (Math.PI / 180);
//   const cameraDistance = maxDim / 2 / Math.tan(fov / 2);

//   // userdata.camera?.position.set(center.x, center.y, center.y + cameraDistance);
//   userdata.camera?.position.set(0, 0, cameraDistance * 1.5);
//   userdata.camera?.lookAt(center);
//   userdata.cameraControls?.target.copy(center);
// };

function updatePointCloud(s: SceneManager, pointCloudData: PointCloudData) {
  if (pointCloud) {
    if (pointCloudGeometry) {
      pointCloudGeometry.dispose();
    }

    s.scenes.pointcloud.remove(pointCloud);
  }
  const position = getPosition(pointCloudData);
  const colors = getColor(pointCloudData);
  const intensity = getIntensity(pointCloudData);

  pointCloudGeometry = new BufferGeometry();

  if (position.length) {
    pointCloudGeometry.setAttribute('position', new Float32BufferAttribute(position, 3));
  }

  if (colors.length) {
    pointCloudGeometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  }

  if (intensity.length) {
    // console.log(intensity);
    pointCloudGeometry.setAttribute('color', new Float32BufferAttribute(intensity, 3));
  }

  pointCloudGeometry.rotateX(Math.PI / 2);
  pointCloudGeometry.rotateY(Math.PI);

  const material = new PointsMaterial({
    size: 0.001,
    vertexColors: true,
  });

  pointCloud = new Points(pointCloudGeometry, material);
  s.scenes.pointcloud.add(pointCloud);

  // positionCamera(s.scenes.pointcloud.userData, pointCloud);
  // (s.scenes.pointcloud.userData.domElement?.parentNode as HTMLElement).classList.remove('hidden');
}

export { updatePointCloud };
