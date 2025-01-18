import { BufferGeometry, Color, Float32BufferAttribute, Points, PointsMaterial } from "three";
import { SceneManager } from "../../SceneManager";

interface PointCloudData {
    data: Uint8Array;
    point_step: number;
    fields: { name: string, offset: Uint8Array }[];
    is_bigendian: boolean;
}

const parsePointCloud = ({ data, point_step, fields, is_bigendian }: PointCloudData) => {
    const points = [];
    const intensity = [];
    const fieldsMap = fields.reduce((acc, { name, ...rest }) => {
        acc[name] = { ...rest };
        return acc;
    }, {});
    const uint8ArrayData = new Uint8Array(data);

    for (let i = 0; i < data.length; i += point_step) {
        const x = new DataView(uint8ArrayData.buffer, i + fieldsMap['x'].offset, 4).getFloat32(0, !is_bigendian);
        const y = new DataView(uint8ArrayData.buffer, i + fieldsMap['y'].offset, 4).getFloat32(0, !is_bigendian);
        const z = new DataView(uint8ArrayData.buffer, i + fieldsMap['z'].offset, 4).getFloat32(0, !is_bigendian);

        // console.log(`Point ${i / point_step}: x=${x}, y=${y}, z=${z}`, data[i], data[i + 1], data[i + 2], data[i + 3]);

        // if (isNaN(x) || isNaN(y) || isNaN(z) || !isFinite(x) || !isFinite(y) || !isFinite(z)) {
        //   console.log('x', data.buffer, i, 4);
        //   console.log('y', data.buffer, i + 4, 4);
        //   console.log('z', data.buffer, i + 8, 4);
        //   console.log(new DataView(data.buffer, i, 4).getFloat32(0, true));
        //   console.warn(`Hibás adat a(z) ${i / point_step}. pontnál: x=${x}, y=${y}, z=${z}`);
        //   console.log(new DataView(data.buffer, i, 4).getFloat32(0, true));
        //   console.log("Raw data segment:", data.slice(i, i + point_step));
        //   continue;
        // }

        // if (data.length % point_step !== 0) {
        //   console.warn("Adathossz nem osztható a point_step értékkel.");
        // }

        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
            points.push(x, y, z);
            intensity.push(new DataView(uint8ArrayData.buffer, i + fieldsMap['intensity'].offset, 4).getFloat32(0, !is_bigendian));
        }
    }

    // console.log(points);
    return {
        points: new Float32Array(points),
        intensity: new Float32Array(intensity),
    };
}

let pointsCloud: Points | null = null
let pointCloudGeometry: BufferGeometry | null = null

function updatePointCloud(s:SceneManager, g) {
    // console.log(g);
    if (pointsCloud) {
        if (pointCloudGeometry) {pointCloudGeometry.dispose()}
        s.removeFromScene("pointcloud", pointsCloud)
    }
    const positions = parsePointCloud(g);


    pointCloudGeometry = new BufferGeometry();
    pointCloudGeometry.setAttribute("position", new Float32BufferAttribute(positions.points, 3));
    pointCloudGeometry.setAttribute("intensity", new Float32BufferAttribute(positions.intensity, 1));
    // geometry.rotateX(Math.PI);

    const material = new PointsMaterial({
        size: 0.1,
        vertexColors: true
    });

    // Convert intensity to colors
    const colors = [];
    for (let i = 0; i < positions.intensity.length; i++) {
        const intensity = positions.intensity[i];
        // Normalize intensity to 0-1 range if needed
        const normalizedIntensity = intensity / 255;
        const color = new Color(normalizedIntensity, normalizedIntensity, normalizedIntensity);
        colors.push(color.r, color.g, color.b);
    }

    pointCloudGeometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

    pointsCloud = new Points(pointCloudGeometry, material);
    s.addToScene("pointcloud", pointsCloud);
}

export { updatePointCloud }