import { Leva, LevaInputs, useControls } from 'leva';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { passwordInput } from './LevaPasswordInput';
import { PresetsType } from '@react-three/drei/helpers/environment-assets';

export type SceneEnvironment = 'none' | PresetsType;

const backgroundOptions: SceneEnvironment[] = [
  'none',
  'apartment',
  'city',
  'dawn',
  'forest',
  'lobby',
  'night',
  'park',
  'studio',
  'sunset',
  'warehouse',
];

export interface Config {
  robotShadow: boolean;
  graphStats: boolean;
  grid: boolean;
  apiKey: string;
  robotWs: string;
  volume: number;
  autoRotateMain: boolean;
  envBackground: SceneEnvironment;
}

export const initialConfig: Config = {
  graphStats: true,
  grid: true,
  robotShadow: true,
  apiKey: '',
  robotWs: 'ws://127.0.0.1:8765',
  volume: 50,
  autoRotateMain: true,
  envBackground: 'none',
};

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
      volume: { label: 'Robot Volume', type: LevaInputs.NUMBER, value: config.volume ?? initialConfig.volume, min: 0, max: 100 },
      autoRotateMain: {
        label: 'Auto-rotate Main Scene',
        type: LevaInputs.BOOLEAN,
        value: config.autoRotateMain ?? initialConfig.autoRotateMain,
      },
      envBackground: {
        label: 'Environment',
        type: LevaInputs.SELECT,
        options: backgroundOptions,
        value:
          config.envBackground && backgroundOptions.includes(config.envBackground) ? config.envBackground : initialConfig.envBackground,
      },
    };
  });

  useEffect(() => {
    props.configChange(config as Config);
    localStorage.setItem('config', JSON.stringify(config));
  }, [config]);

  return (
    <>
      <Leva collapsed />
    </>
  );
};
