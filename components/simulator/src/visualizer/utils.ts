function convert(objData) {
    return Uint8Array.from(objData);
}
function convert32(objData) {
    return Uint32Array.from(objData);
}

export {
    convert,
    convert32,
}