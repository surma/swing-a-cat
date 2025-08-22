import * as e from "littlejsengine";
import { vec2 } from "littlejsengine";

export class Rope extends e.EngineObject {
  constructor(
    pos: e.Vector2,
    private player: e.EngineObject,
  ) {
    super(pos, vec2(1, 1));
  }

  update(): void {}

  render(): void {
    e.drawLine(this.player.pos, this.pos, 0.1, e.RED);
  }
}
