export const uInt8ToBase64String = (array: Uint8Array): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const omitPadding = false;
  const length = array.length;

  let result = '';
  let i = 0;
  let triplet: number;

  const at = function (shift: number) {
    return alphabet.charAt((triplet >> (6 * shift)) & 63);
  };

  for (; i + 2 < length; i += 3) {
    triplet = (array[i]! << 16) + (array[i + 1]! << 8) + array[i + 2]!;
    result += at(3) + at(2) + at(1) + at(0);
  }
  if (i + 2 === length) {
    triplet = (array[i]! << 16) + (array[i + 1]! << 8);
    result += at(3) + at(2) + at(1) + (omitPadding ? '' : '=');
  } else if (i + 1 === length) {
    triplet = array[i]! << 16;
    result += at(3) + at(2) + (omitPadding ? '' : '==');
  }

  return result;
};
