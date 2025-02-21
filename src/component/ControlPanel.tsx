import { Leva, LevaInputs, useControls } from 'leva';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { passwordInput } from './LevaPasswordInput';

export interface Config {
  robotShadow: boolean;
  graphStats: boolean;
  grid: boolean;
  apiKey: string;
  robotWs: string;
}

export const initialConfig: Config = { graphStats: true, grid: true, robotShadow: true, apiKey: '', robotWs: 'ws://127.0.0.1:8765' };

export const ControlPanel = (props: { configChange: Dispatch<SetStateAction<Config>> }) => {
  const [config] = useControls(() => {
    let config: Config = initialConfig;

    try {
      const cfgString = localStorage.getItem('config');
      config = JSON.parse(cfgString ?? '{}');
    } catch (e) {
      console.error('Failed to load config');
    }

    return {
      robotShadow: { label: 'Robot Cast Shadow', type: LevaInputs.BOOLEAN, value: config.robotShadow ?? initialConfig.robotShadow },
      graphStats: { label: 'Stats (FPS)', type: LevaInputs.BOOLEAN, value: config.graphStats ?? initialConfig.graphStats },
      grid: { label: 'Show Grid', type: LevaInputs.BOOLEAN, value: config.grid ?? initialConfig.grid },
      robotWs: { label: 'ROS Connection', type: LevaInputs.STRING, value: config.robotWs ?? initialConfig.robotWs },
      apiKey: passwordInput({ label: 'API Key', value: config.apiKey ?? initialConfig.apiKey }),
    };
  });

  useEffect(() => {
    props.configChange(config);
    localStorage.setItem('config', JSON.stringify(config));
  }, [config]);

  return (
    <>
      <Leva collapsed />
    </>
  );
};
