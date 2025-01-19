import { SceneManager } from "../../SceneManager";

const getBinaryData = (filepath: string) => {
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

const getMockData = (s: SceneManager) => {
    try {
        console.warn("TICK");
        getBinaryData(`/example.bin`).then((vertexBinaryData) => {
            const _jsonLength = vertexBinaryData[0];
            const _jsonOffset = 4;
            const _jsonString = String.fromCharCode.apply(
                null,
                vertexBinaryData.slice(_jsonOffset, _jsonOffset + _jsonLength)
            );
            const jsonOBJ = JSON.parse(_jsonString);
            s.scenes.main.userData.lidarWebWorker?.postMessage({
                resolution: jsonOBJ.data.resolution,
                origin: jsonOBJ.data.origin,
                width: jsonOBJ.data.width,
                data: vertexBinaryData.slice(_jsonOffset + _jsonLength),
            });
        });
    } catch (e) {
        console.error("ERROR DURING VERTEX LOAD", e);
    }
}

function createMockLidarData(s: SceneManager) {
    setInterval(() => getMockData(s), 10000);
    setTimeout(() => getMockData(s), 500)
}

export {
    createMockLidarData
}