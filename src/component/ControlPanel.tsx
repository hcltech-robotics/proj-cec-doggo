import { PresetsType } from '@react-three/drei/helpers/environment-assets';
import { button, folder, Leva, LevaInputs, useControls } from 'leva';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { passwordInput } from './LevaPasswordInput';

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
  showCamera: boolean;
  showDepthCam: boolean;
  joystick: boolean;
  depthCamTopic: string;
  cameraTopic: string;
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
  showCamera: true,
  showDepthCam: true,
  joystick: true,
  depthCamTopic: '/camera/depth/color/points',
  cameraTopic: '/camera/compressed',
  envBackground: 'none',
};

export const ControlPanel = (props: {
  configChange: Dispatch<SetStateAction<Config>>;
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [config] = useControls(() => {
    let config: Config = initialConfig;

    try {
      const cfgString = localStorage.getItem('config');
      config = JSON.parse(cfgString ?? '{}');
    } catch (e) {
      console.error('Failed to load config');
    }

    return {
      'Pause': button(() => props.setPaused(true), { disabled: props.paused }),
      'Unpause': button(() => props.setPaused(false), { disabled: !props.paused }),
      'Connections': folder({
        robotWs: { label: 'Foxglove', type: LevaInputs.STRING, value: config.robotWs ?? initialConfig.robotWs },
        apiKey: passwordInput({ label: 'OpenAI API key', value: config.apiKey ?? initialConfig.apiKey }),
        Topics: folder(
          {
            cameraTopic: { label: 'Camera', type: LevaInputs.STRING, value: config.cameraTopic ?? initialConfig.cameraTopic },
            depthCamTopic: { label: 'Depth Cam', type: LevaInputs.STRING, value: config.depthCamTopic ?? initialConfig.depthCamTopic },
          },
          { collapsed: true },
        ),
      }),
      'Visuals': folder({
        robotShadow: { label: 'Robot Cast Shadow', type: LevaInputs.BOOLEAN, value: config.robotShadow ?? initialConfig.robotShadow },
        envBackground: {
          label: 'Environment',
          type: LevaInputs.SELECT,
          options: backgroundOptions,
          value:
            config.envBackground && backgroundOptions.includes(config.envBackground) ? config.envBackground : initialConfig.envBackground,
        },
        autoRotateMain: {
          label: 'Auto-rotate Main Scene',
          type: LevaInputs.BOOLEAN,
          value: config.autoRotateMain ?? initialConfig.autoRotateMain,
        },
      }),
      'Helpers': folder({
        graphStats: { label: 'Stats (FPS)', type: LevaInputs.BOOLEAN, value: config.graphStats ?? initialConfig.graphStats },
        grid: { label: 'Show Grid', type: LevaInputs.BOOLEAN, value: config.grid ?? initialConfig.grid },
      }),
      'Robot Controls': folder({
        volume: { label: 'Robot Volume', type: LevaInputs.NUMBER, value: config.volume ?? initialConfig.volume, min: 0, max: 100 },
        joystick: { label: 'Joystick controls', type: LevaInputs.BOOLEAN, value: config.joystick ?? initialConfig.joystick },
      }),
      'Views': folder({
        showCamera: { label: 'Camera', type: LevaInputs.BOOLEAN, value: config.showCamera ?? initialConfig.showCamera },
        showDepthCam: { label: 'Depth Cam', type: LevaInputs.BOOLEAN, value: config.showDepthCam ?? initialConfig.showDepthCam },
      }),
    };
  }, [props.paused]);

  useEffect(() => {
    props.configChange(config as Config);
    localStorage.setItem('config', JSON.stringify(config));
  }, [config]);

  return (
    <>
      <Leva collapsed titleBar={{ title: 'Configuration' }} />
    </>
  );
};
