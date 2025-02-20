import Joystick, { Direction, IJoystickChangeValue } from 'rc-joystick';
import { useContext } from 'react';
import { TwistMessage } from 'src/model/Go2RobotInterfaces';
import { AppContext } from '../AppContext';
import { useInterval } from '../helper/TimeHooks';
import './JoyController.css';

let linearMovement: IJoystickChangeValue = { angle: undefined, direction: Direction.Center, distance: 0 };
let angularMovement: IJoystickChangeValue = { angle: undefined, direction: Direction.Center, distance: 0 };
let prevMoving: boolean = false;

export const JoyController = () => {
  const connection = useContext(AppContext).connection;

  const handleLinearChange = (move: IJoystickChangeValue) => {
    linearMovement = move;
  };

  const handleAngularChange = (move: IJoystickChangeValue) => {
    angularMovement = move;
  };

  const getXY = (move: IJoystickChangeValue) => {
    if (move.angle) {
      return {
        x: (Math.sin((move.angle * Math.PI) / 180) * move.distance) / 75,
        y: (Math.cos((move.angle * Math.PI) / 180) * move.distance) / -75,
      };
    }

    return { x: 0, y: 0 };
  };

  const checkJoyState = () => {
    const isMoving = linearMovement.direction !== Direction.Center || angularMovement.direction !== Direction.Center;

    if (isMoving) {
      const linear = getXY(linearMovement);
      const angular = getXY(angularMovement);

      const msg: TwistMessage = {
        linear: { x: linear.x, y: linear.y, z: 0 },
        angular: { x: 0, y: angular.x, z: angular.y },
      };

      connection.twistMessage(msg);
    }

    if (prevMoving && !isMoving) {
      const msg: TwistMessage = {
        angular: { x: 0, y: 0, z: 0 },
        linear: { x: 0, y: 0, z: 0 },
      };

      connection.twistMessage(msg);
    }

    prevMoving = isMoving;
  };

  useInterval(() => {
    checkJoyState();
  }, 100);

  return (
    <>
      <div className="joy-linear">
        <Joystick throttle={100} className="joystick-wrapper" controllerClassName="joystick-controller" onChange={handleLinearChange} />
      </div>
      <div className="joy-angular">
        <Joystick throttle={100} className="joystick-wrapper" controllerClassName="joystick-controller" onChange={handleAngularChange} />
      </div>
    </>
  );
};
