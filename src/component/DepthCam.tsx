import { useContext, useMemo, useRef, useState } from 'react';
import { PointCloud2 } from 'src/model/Go2RobotInterfaces';
import { AppContext } from '../AppContext';
import { useInterval } from '../helper/TimeHooks';
import { topicList } from '../model/Go2RobotTopics';
import './DepthCam.css';

const TARGET_FPS = 30;

const parsePointCloud2 = (msg: PointCloud2) => {
  if (msg?.data) {
    const dv = new DataView(new Uint8Array(msg.data).buffer); // 1 ms
    const points = [];
    const colors = [];
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

      colors.push(dv.getUint8(i + offsets.rgb + 2) / 256);
      colors.push(dv.getUint8(i + offsets.rgb + 1) / 256);
      colors.push(dv.getUint8(i + offsets.rgb + 0) / 256);
    }

    return { points, colors };
  }

  return { points: [], colors: [] };
};

export const DepthCam = () => {
  const connection = useContext(AppContext).connection;

  const [stamp, setStamp] = useState<string>('');
  const [zoom, setZoom] = useState<boolean>(false);

  const wrapper = useRef<HTMLDivElement>(null);

  useInterval(() => {
    const msg = connection.channelByName[topicList.TOPIC_DEPTHCAM]?.lastMessage;
    if (msg && msg.header) {
      setStamp(`${msg.header.stamp.sec}-${msg.header.stamp.nanosec}`);
    }
  }, 1000 / TARGET_FPS);

  useMemo(() => {
    const msg = connection.channelByName[topicList.TOPIC_DEPTHCAM]?.lastMessage;

    console.time('pc2');
    const { points, colors } = parsePointCloud2(msg);
    console.timeEnd('pc2');

    console.log({ p: points.slice(0, 20), c: colors.slice(0, 20) });
  }, [stamp]);

  const changeZoom = () => {
    setZoom(!zoom);
  };

  return (
    <div className={`depthcam ${zoom ? 'zoomed' : ''}`} ref={wrapper} onClick={changeZoom}>
      hey
    </div>
  );
};
