import { ThreeObject } from "./ThreeObject.js";
import * as THREE from "three";

import { KeyboardState } from "./KeyboardState.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

window.getBinaryData = (filepath) => {

    return fetch(filepath)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => {
            return new Uint8Array(arrayBuffer);
        })
        .catch((error) => {
            throw error;
        });
};



const scene = new THREE.Scene();
scene.rotation.x -= Math.PI / 2;

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    100
);
camera.position.z = 10;

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// const controls = new OrbitControls(camera, renderer.domElement);

// window.addEventListener(
//   "resize",
//   function () {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     // render();
//   },
//   false
// );

const stats = Stats();
// document.body.appendChild(stats.dom);

const gui = new GUI();
const cameraFolder = gui.addFolder("Camera");
cameraFolder.add(camera.position, "z", 0, 10);
cameraFolder.open();







let to = new ThreeObject(document.body)

THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0,0,0)
const threeJSWorker = new Worker(
    new URL("/assets/three.worker.js", self.location)
);
window._threejsworker = threeJSWorker;
threeJSWorker.onmessage = (re) => {
    console.log("Binary Data", re);
    to.loadPointCloud(re.data)
};


to.setKeyboardListener(KeyboardState())
to.setContextLostCb(() => {
    console.log(
        "Context lost"
    )
})
to.setMoveDirection({ angle: 50, percentage: 0, stop: true })
to.setViewDirection({ angle: 50, percentage: 0, stop: true })


to.run()

const getData = () => {
    try {
        console.warn("TICK");
        window.getBinaryData(`/assets/example.bin`).then((vortexBinaryData) => {
            const _jsonLength = vortexBinaryData[0];
            const _jsonOffset = 4;
            const _jsonString = String.fromCharCode.apply(
                null,
                vortexBinaryData.slice(_jsonOffset, _jsonOffset + _jsonLength)
            );
            const jsonOBJ = JSON.parse(_jsonString);
            threeJSWorker.postMessage({
                resolution: jsonOBJ.data.resolution,
                origin: jsonOBJ.data.origin,
                width: jsonOBJ.data.width,
                data: vortexBinaryData.slice(_jsonOffset + _jsonLength),
            });
        });
    } catch (e) {
        console.error("ERROR DURING VERTEX LOAD", e);
    }
}

setInterval(getData, 10000);
setTimeout(getData, 500)
window._threeobj = to;