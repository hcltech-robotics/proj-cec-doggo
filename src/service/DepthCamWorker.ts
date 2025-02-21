import { ParsedPointCloud2, PointCloud2 } from 'src/model/Go2RobotInterfaces';

export const depthCamWorker = () => {
  self.addEventListener('message', (event) => {
    const data = event.data;
    // console.time('pc2');
    const result = parsePointCloud2(data);
    // console.timeEnd('pc2');
    self.postMessage(result);
  });

  const parsePointCloud2 = (msg: PointCloud2): ParsedPointCloud2 => {
    const points = [];
    const colors = [];
    let header = { frame_id: '', stamp: { sec: 0, nanosec: 0 } };

    if (msg?.data) {
      const dv = new DataView(new Uint8Array(msg.data).buffer); // 1 ms
      const littleEndian = !msg.is_bigendian;
      const count = msg.data.length;

      const offsets = {
        x: msg.fields.find((f) => f.name === 'x')!.offset,
        y: msg.fields.find((f) => f.name === 'y')!.offset,
        z: msg.fields.find((f) => f.name === 'z')!.offset,
        rgb: msg.fields.find((f) => f.name === 'rgb')!.offset,
      };

      for (let i = 0; i < count; i += msg.point_step) {
        points.push(dv.getFloat32(i + offsets.x, littleEndian));
        points.push(dv.getFloat32(i + offsets.y, littleEndian));
        points.push(dv.getFloat32(i + offsets.z, littleEndian));

        colors.push(dv.getUint8(i + offsets.rgb + 2) / 255);
        colors.push(dv.getUint8(i + offsets.rgb + 1) / 255);
        colors.push(dv.getUint8(i + offsets.rgb + 0) / 255);
      }

      header = msg.header;
    }

    return { points: new Float32Array(points), colors: new Float32Array(colors), header };
  };
};
