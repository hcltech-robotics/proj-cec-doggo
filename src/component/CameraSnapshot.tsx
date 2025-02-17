import { useEffect, useMemo, useState } from 'react';
import { RobotCommunication } from 'src/service/RobotCommunicationService';
import { topicList } from '../model/Go2RobotTopics';

import './CameraSnapshot.css';

const useObjectURL = (initialObject: null | File | Blob | MediaSource) => {
  const [objectURL, setObjectURL] = useState<null | string>(null);

  const [object, setObject] = useState<null | File | Blob | MediaSource>(initialObject);

  useEffect(() => {
    if (!object) {
      return;
    }

    const objectURL = URL.createObjectURL(object);
    setObjectURL(objectURL);

    return () => {
      URL.revokeObjectURL(objectURL);
      setObjectURL(null);
    };
  }, [object]);

  return {
    objectURL,
    object,
    setObject,
  };
};

export const CameraSnapshot = (props: { connection: RobotCommunication }) => {
  const TARGET_FPS = 30;
  const { objectURL, setObject } = useObjectURL(null);
  const [timer, setTimer] = useState<NodeJS.Timeout>();
  const [stamp, setStamp] = useState<string>('');

  useEffect(() => {
    clearInterval(timer);

    setTimer(
      setInterval(() => {
        const msg = props.connection.channelByName[topicList.TOPIC_CAMERA]?.lastMessage;
        if (msg && msg.header) {
          setStamp(`${msg.header.stamp.sec}-${msg.header.stamp.nanosec}`);
        }
      }, 1000 / TARGET_FPS),
    );
  }, []);

  useMemo(() => {
    const msg = props.connection.channelByName[topicList.TOPIC_CAMERA]?.lastMessage;
    if (msg) {
      const blob = new Blob([msg.data], { type: 'image/jpeg' });
      setObject(blob);
    }
  }, [stamp]);

  return <div className="camera">{objectURL ? <img src={objectURL} /> : ''}</div>;
};
