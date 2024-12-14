import { Vector3, Euler } from "three";

class RobotBody {
    bodyNode
    initialQuaternion
    constructor(n) {
      (this.bodyNode = n.getObjectByName("BodyBone")),
        (this.initialQuaternion = this.bodyNode.quaternion.clone());
    }
    rpy(n, o, s) {
      this.bodyNode.setRotationFromEuler(new Euler(n, s, o, "YZX")),
        this.bodyNode.quaternion.premultiply(this.initialQuaternion);
    }
  }

class Joint {
    jointNode
    initialQuaternion
    nodeAxis
    axis
    angle
    initialAngle
    affectedJoint
    constructor(n, o, s, c) {
      (this.jointNode = n.getObjectByName(o)),
        (this.initialQuaternion = this.jointNode.quaternion.clone()),
        (this.axis = s),
        (this.nodeAxis = s.clone()),
        (this.angle = c),
        (this.initialAngle = c);
    }
    setAngle(n) {
      this.jointNode.quaternion
        .setFromAxisAngle(this.nodeAxis, n - this.initialAngle)
        .premultiply(this.initialQuaternion),
        (this.angle = n),
        this.affectedJoint &&
          this.affectedJoint.setAngle(this.affectedJoint.angle);
    }
  }
  class CalfJoint extends Joint {
      rodJoint1
      rodJoint2
      thighJoint
    constructor(o, s, c, u, l, f, _) {
      super(o, s, c, u);
      (this.thighJoint = l),
        (this.rodJoint1 = new Joint(
          o,
          f,
          c.clone().multiplyScalar(-1),
          this.thighJoint.initialAngle + u
        )),
        (this.rodJoint2 = new Joint(
          o,
          _,
          c.clone().multiplyScalar(-1),
          -u
        ));
    }
    setAngle(o) {
      super.setAngle(o),
        this.rodJoint1.setAngle(this.thighJoint.angle + o),
        this.rodJoint2.setAngle(-o);
    }
  }
  const generateJointsMap = (r) => {
    const n = new Map();
    return (
      ["FL", "FR", "RL", "RR"].forEach((o) => {
        const s = new Joint(r, "HipBone" + o, new Vector3(1, 0, 0), 0),
          c = new Joint(
            r,
            "ThighBone" + o,
            new Vector3(0, 0, 1),
            Math.PI / 4
          ),
          u = new CalfJoint(
            r,
            "CalfBone" + o,
            new Vector3(0, 0, 1),
            -Math.PI / 2,
            c,
            "RodBone" + o + "1",
            "RodBone" + o + "2"
          );
        (c.affectedJoint = u),
          n.set("hip" + o, s),
          n.set("thigh" + o, c),
          n.set("calf" + o, u);
      }),
      n.set("radar", new Joint(r, "RadarBone", new Vector3(0, -1, 0), 0)),
      n
    );
  };
export  class RobotDog {
      body
      radar
      map
      hipFL
      hipFR
      hipRL
      hipRR
      thighFL
      thighFR
      thighRL
      thighRR
      calfFL
      calfFR
      calfRL
      calfRR
    constructor(n) {
      n && this.init(n);
    }
    init(n) {
      (this.body = new RobotBody(n)),
        (this.radar = new Joint(n, "RadarBone", new Vector3(0, -1, 0), 0));
      const o = generateJointsMap(n);
      (this.map = o),
        (this.hipFL = o.get("hipFL")),
        (this.hipFR = o.get("hipFR")),
        (this.hipRL = o.get("hipRL")),
        (this.hipRR = o.get("hipRR")),
        (this.thighFL = o.get("thighFL")),
        (this.thighFR = o.get("thighFR")),
        (this.thighRL = o.get("thighRL")),
        (this.thighRR = o.get("thighRR")),
        (this.calfFL = o.get("calfFL")),
        (this.calfFR = o.get("calfFR")),
        (this.calfRL = o.get("calfRL")),
        (this.calfRR = o.get("calfRR"));
    }
  }