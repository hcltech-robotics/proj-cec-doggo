import Joystick, { IJoystickChangeValue } from 'rc-joystick';
import { getClient } from '../robot/foxgloveConnection';
import './joy-controller.css';

export interface Point {
  x: number | undefined;
  y: number | undefined;
  z: number | undefined;
}

export interface TwistMessage {
  linear: Point;
  angular: Point;
}

export class JoysToRobot {
  private prevState: boolean = false;

  constructor(
    public linearJoy: JoystickHandler,
    public angularJoy: JoystickHandler,
  ) {
    setInterval(this.checkJoysState, 100);
  }

  public checkJoysState = () => {
    if (this.linearJoy && this.angularJoy && (this.linearJoy.moving || this.angularJoy.moving)) {
      const msg: TwistMessage = {
        linear: { x: this.linearJoy.x, y: this.linearJoy.y, z: 0 },
        angular: { x: 0, y: 0, z: this.angularJoy.y },
      };
      this.sendTwist(msg);
      this.sendTwist(msg, '/cmd_vel');
    }

    if (this.prevState && !(this.linearJoy.moving || this.angularJoy.moving)) {
      this.sendTwist({ angular: { x: 0, y: 0, z: 0 }, linear: { x: 0, y: 0, z: 0 } });
      this.sendTwist({ angular: { x: 0, y: 0, z: 0 }, linear: { x: 0, y: 0, z: 0 } }, '/cmd_vel');
    }

    this.prevState = this.linearJoy.moving || this.angularJoy.moving;
  };

  public sendTwist = (twistMessage: TwistMessage, topic: string = '/turtle1/cmd_vel') => {
    const client = getClient();
    if (!client) {
      console.error('Foxglove client is not available');
      return;
    }
    const channelId = client.advertise({
      topic: topic,
      encoding: 'json',
      schemaName: 'geometry_msgs/msg/Twist',
    });

    const message = new Uint8Array(new TextEncoder().encode(JSON.stringify(twistMessage)));
    client.sendMessage(channelId, message);
  };
}

export class JoystickHandler {
  public x: number | undefined = undefined;
  public y: number | undefined = undefined;
  public moving: boolean = false;

  public handleJoystick = (move: IJoystickChangeValue) => {
    this.moving = !!move.angle;

    if (move.angle) {
      this.x = (Math.sin((move.angle * Math.PI) / 180) * move.distance) / 75;
      this.y = (Math.cos((move.angle * Math.PI) / 180) * move.distance) / -75;
    } else {
      this.x = undefined;
      this.y = undefined;
    }
  };
}

export const JoyController = (props: { joy: JoystickHandler; class: string }) => {
  return (
    <div className={props.class}>
      <Joystick className="joystick-wrapper" controllerClassName="joystick-controller" onChange={props.joy.handleJoystick} />
    </div>
  );
};
