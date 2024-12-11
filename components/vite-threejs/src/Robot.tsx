import { LoadingManager } from "three";
import URDFLoader from "urdf-loader";

// ...init three.js scene...

const manager = new LoadingManager();
const loader = new URDFLoader(manager);
loader.packages = {
  packageName: "", // The equivalent of a (list of) ROS package(s):// directory
};
loader.load(
  "T12/urdf/T12.URDF", // The path to the URDF within the package OR absolute
  (robot) => {
    // The robot is loaded!
    scene.add(robot);
  }
);
