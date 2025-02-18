import { LevaInputs, useControls } from 'leva';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { passwordInput } from './LevaPasswordInput';

export interface Config {
  robotShadow: boolean;
  graphStats: boolean;
  grid: boolean;
  apiKey: string;
}

const initialConfig: Config = { graphStats: true, grid: true, robotShadow: true, apiKey: '' };

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
      robotShadow: { label: 'Robot Cast Shadow', type: LevaInputs.BOOLEAN, value: config.robotShadow ?? true },
      graphStats: { label: 'Stats (FPS)', type: LevaInputs.BOOLEAN, value: config.graphStats ?? true },
      grid: { label: 'Show Grid', type: LevaInputs.BOOLEAN, value: config.grid ?? true },
      apiKey: passwordInput({ label: 'API Key', value: config.apiKey ?? '' }),
    };
  });

  useEffect(() => {
    props.configChange(config);
    localStorage.setItem('config', JSON.stringify(config));
  }, [config]);

  return <></>;
};
