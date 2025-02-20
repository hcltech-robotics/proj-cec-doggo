import { useContext, useMemo, useRef, useState } from 'react';
import { AppContext } from '../AppContext';
import { useInterval } from '../helper/TimeHooks';
import { useObjectURL } from '../helper/UInt8ToImageUrl';
import { topicList } from '../model/Go2RobotTopics';
import './CameraSnapshot.css';

const TARGET_FPS = 30;

export const CameraSnapshot = () => {
  const connection = useContext(AppContext).connection;
  const { objectURL, setObject } = useObjectURL(null);

  const [stamp, setStamp] = useState<string>('');
  const [zoom, setZoom] = useState<boolean>(false);

  const wrapper = useRef<HTMLDivElement>(null);

  useInterval(() => {
    const msg = connection.channelByName[topicList.TOPIC_CAMERA]?.lastMessage;
    if (msg && msg.header) {
      setStamp(`${msg.header.stamp.sec}-${msg.header.stamp.nanosec}`);
    }
  }, 1000 / TARGET_FPS);

  useMemo(() => {
    const msg = connection.channelByName[topicList.TOPIC_CAMERA]?.lastMessage;
    if (msg) {
      const blob = new Blob([msg.data], { type: 'image/jpeg' });
      setObject(blob);
    }
  }, [stamp]);

  const changeZoom = () => {
    setZoom(!zoom);
  };

  return (
    <div className={`camera ${zoom ? 'zoomed' : ''}`} ref={wrapper} onClick={changeZoom}>
      {objectURL ? <img src={objectURL} /> : <img src="/assets/spinner.svg" />}
    </div>
  );
};
