import * as e from "littlejsengine";

export function remap(v, inMin, inMax, outMin, outMax) {
  let p = e.clamp((v - inMin) / (inMax - inMin), 0, 1);
  if (Number.isNaN(p)) {
    p = 0;
  }
  return (outMax - outMin) * p + outMin;
}
