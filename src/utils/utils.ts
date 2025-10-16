export function rotateArray(arr: Array<any>, count: number) {
  const len = arr.length;
  const offset = ((count % len) + len) % len; // handles negative values too
  return arr.slice(offset).concat(arr.slice(0, offset));
}
