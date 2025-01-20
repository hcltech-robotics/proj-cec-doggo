function convert(objData: Iterable<number>) {
    return Uint8Array.from(objData);
}
function convert32(objData: Iterable<number>) {
    return Uint32Array.from(objData);
}

export {
    convert,
    convert32,
}