import { ROBOT_CMD } from '../helpers/interact-with-ai';
import { getClient } from '../robot/foxgloveConnection';
import './joy-controller.css';

declare const applyGamePadDeadzeone: (a: any, b: any) => number;
declare const JoyStick: any;

const turtleControl = (nav: { x: number; y: number; z: number }) => {
  const client = getClient();
  if (!client) {
    console.error('Foxglove client is not available');
    return;
  }
  const channelId = client.advertise({
    topic: '/turtle1/cmd_vel',
    encoding: 'json',
    schemaName: 'geometry_msgs/msg/Twist',
  });

  const message = new Uint8Array(
    new TextEncoder().encode(JSON.stringify({ linear: { x: nav.x, y: nav.y, z: 0 }, angular: { x: 0, y: 0, z: nav.z } })),
  );
  client.sendMessage(channelId, message);
};

const robotControl = (nav: { x: number; y: number; z: number }) => {
  const uniqID = (new Date().valueOf() % 2147483648) + Math.floor(Math.random() * 1e3);
  const commandId = ROBOT_CMD.Move;

  const client = getClient();
  if (!client) {
    console.error('Foxglove client is not available');
    return;
  }
  const channelId = client.advertise({
    topic: '/rt/api/sport/request',
    encoding: 'json',
    schemaName: '-TBD-',
  });

  const message = new Uint8Array(
    new TextEncoder().encode(
      JSON.stringify({
        header: { identity: { id: uniqID, api_id: commandId } },
        parameter: JSON.stringify(nav),
      }),
    ),
  );
  client.sendMessage(channelId, message);
};

const joystickToRobot = (nav: { x: number; y: number; z: number }) => {
  console.log(nav);
  turtleControl(nav);
  robotControl(nav);
};

export function joystickTick(joyLeft: any, joyRight: any) {
  let x,
    y,
    z = 0;

  y = (-1 * (joyRight.GetPosX() - 100)) / 50;
  x = (-1 * (joyLeft.GetPosY() - 100)) / 50;
  z = (-1 * (joyLeft.GetPosX() - 100)) / 50;

  if (x === 0 && y === 0 && z === 0) {
    return;
  }

  if (x == undefined || y == undefined || z == undefined) {
    return;
  }

  joystickToRobot({ x: x, y: y, z: z });
}

export const joySetup = () => {
  console.log('yeah');

  const joyConfig = {
    internalFillColor: '#FFFFFF',
    internalLineWidth: 2,
    internalStrokeColor: 'rgba(240, 240, 240, 0.3)',
    externalLineWidth: 1,
    externalStrokeColor: '#FFFFFF',
  };

  var joyLeft = new JoyStick('joy-left', joyConfig);
  var joyRight = new JoyStick('joy-right', joyConfig);

  setInterval(joystickTick, 100, joyLeft, joyRight);
};

export const JoyController = () => {
  return (
    <div>
      <div id="joy-left" className="corner-div bottom-left"></div>
      <div id="joy-right" className="corner-div bottom-right"></div>
    </div>
  );
};
