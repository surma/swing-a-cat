import * as e from "littlejsengine";

export function fromDOMPoint(p: DOMPoint): e.Vector2 {
  return e.vec2(p.x, p.y);
}
