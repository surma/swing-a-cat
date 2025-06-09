import { Component, getComponent } from "../scene";

export interface PositionComponent extends Component {
  type: "position";
  x: number;
  y: number;
}

function tick(entity, ctx) {
  const pos = getComponent<PositionComponent>(entity, "position");
  if (!pos) return;
  entity.transform = new DOMMatrix([1, 0, 0, 1, pos.x, pos.y]);
}

export function positionComponent(x: number, y: number): PositionComponent {
  return {
    type: "position",
    x,
    y,
    tick,
  };
}
