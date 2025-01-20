import { BufferGeometry, Color, Float32BufferAttribute, Points, PointsMaterial } from "three";
import { SceneManager } from "../../SceneManager";
import { PointCloudData, FieldsMap } from './pointCloudTypes';

const parsePointCloud = ({ data, point_step, fields, is_bigendian }: PointCloudData) => {
    const points = [];
    const intensity = [];
    const uint8ArrayData = new Uint8Array(data);
    const fieldsMap: FieldsMap = fields.reduce((acc, { name, ...rest }) => {
        acc[name as keyof FieldsMap] = { ...rest };
        return acc;
    }, {} as FieldsMap);

    for (let i = 0; i < data.length; i += point_step) {
        const x = new DataView(uint8ArrayData.buffer, i + fieldsMap['x'].offset, 4).getFloat32(0, !is_bigendian);
        const y = new DataView(uint8ArrayData.buffer, i + fieldsMap['y'].offset, 4).getFloat32(0, !is_bigendian);
        const z = new DataView(uint8ArrayData.buffer, i + fieldsMap['z'].offset, 4).getFloat32(0, !is_bigendian);

        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
            points.push(x, y, z);
            intensity.push(new DataView(uint8ArrayData.buffer, i + fieldsMap['intensity'].offset, 4).getFloat32(0, !is_bigendian));
        }
    }

    return {
        points: new Float32Array(points),
        intensity: new Float32Array(intensity),
    };
}

let pointsCloud: Points | null = null
let pointCloudGeometry: BufferGeometry | null = null

function updatePointCloud(s: SceneManager, g: any) {
    if (pointsCloud) {
        if (pointCloudGeometry) { pointCloudGeometry.dispose() }
        s.scenes.pointcloud.remove(pointsCloud)
    }
    const positions = parsePointCloud(g);


    pointCloudGeometry = new BufferGeometry();
    pointCloudGeometry.setAttribute("position", new Float32BufferAttribute(positions.points, 3));
    pointCloudGeometry.setAttribute("intensity", new Float32BufferAttribute(positions.intensity, 1));

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
    s.scenes.pointcloud.add(pointsCloud);
}

export { updatePointCloud }
