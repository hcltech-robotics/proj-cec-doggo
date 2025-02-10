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
  private channels: Record<string, any> = {};

  constructor(
    public linearJoy: JoystickHandler,
    public angularJoy: JoystickHandler,
  ) {
    setInterval(this.checkJoysState, 100);
  }

  public checkJoysState = () => {
    if (!this.linearJoy || !this.angularJoy) {
      console.error('Joystick handlers are not initialized');
      return;
    }

    const topics = ['/turtle1/cmd_vel', '/cmd_vel'];
    const isMoving = this.linearJoy.moving || this.angularJoy.moving;

    if (isMoving) {
      const msg: TwistMessage = {
        linear: { x: this.linearJoy.x, y: this.linearJoy.y, z: 0 },
        angular: { x: 0, y: 0, z: this.angularJoy.y },
      };
      topics.forEach((topic) => this.sendTwist(msg, topic));
    }

    if (this.prevState && !isMoving) {
      const stopMsg: TwistMessage = {
        angular: { x: 0, y: 0, z: 0 },
        linear: { x: 0, y: 0, z: 0 },
      };
      topics.forEach((topic) => this.sendTwist(stopMsg, topic));
    }

    this.prevState = isMoving;
  };

  public sendTwist = (twistMessage: TwistMessage, topic: string = '/turtle1/cmd_vel') => {
    const client = getClient();
    if (!client) {
      console.error('Foxglove client is not available');
      return;
    }

    if (!this.channels[topic]) {
      this.channels[topic] = client.advertise({
        topic: topic,
        encoding: 'json',
        schemaName: 'geometry_msgs/msg/Twist',
      });
    }

    const message = new Uint8Array(new TextEncoder().encode(JSON.stringify(twistMessage)));
    client.sendMessage(this.channels[topic], message);
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
