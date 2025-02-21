import { useContext, useMemo, useRef, useState } from 'react';
import { AppContext } from '../AppContext';
import { useInterval } from '../helper/TimeHooks';
import { topicList } from '../model/Go2RobotTopics';
import './DepthCam.css';

const TARGET_FPS = 30;

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

    if (msg?.header) {
      const points = new Float32Array(msg.points);
      const colors = new Float32Array(msg.colors);

      console.log({ p: points.slice(0, 20), c: colors.slice(0, 20) });
    }
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
