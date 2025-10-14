import * as e from "littlejsengine";
import { vec2 } from "littlejsengine";
import { Player } from "./player";
import { meow } from "./sounds";
import { error } from "./utils/error";
import { Vector2 } from "../littlejs.esm";

export class Rope extends e.EngineObject {
  static SHOOT_SPEED = 1;
  private end: e.Vector2;
  public readonly anchor: e.Vector2 | null = null;
  private shootTravel: number = 0;
  private shootDuration: number = 0;
  constructor(
    public readonly p: Player,
    direction: e.Vector2,
    public readonly maxLength: number,
  ) {
    super(p.pos, vec2(1, 1));
    direction = direction.normalize();
    this.end = p.pos.add(direction.scale(maxLength));
    this.anchor = e.tileCollisionRaycast(p.pos, this.end);
    if (this.anchor) this.end = this.anchor;
    this.shootDuration = this.end.distance(p.pos) * Rope.SHOOT_SPEED;
    meow.play();
  }

  get willHit(): boolean {
    return !!this.anchor;
  }

  get hasHit(): boolean {
    return this.willHit && this.percentDone >= 1;
  }

  get hasMissed(): boolean {
    return !this.willHit && this.percentDone >= 1;
  }

  get length(): number {
    return this.end.distance(this.p.pos);
  }

  get direction() {
    if (!this.anchor) return null;
    return this.p.pos.subtract(this.anchor);
  }

  set length(newLength: number) {
    newLength = e.clamp(newLength, 0, this.maxLength);
    if (!this.anchor) error("Trying to set length on a non-hitting rope");
    this.p.pos = this.anchor.add(this.direction!.normalize().scale(newLength));
  }

  update(): void {
    this.shootTravel += 1;
  }

  get percentDone() {
    return this.shootTravel / this.shootDuration;
  }

  render(): void {
    const f = this.p.pos.add(
      vec2(0.4, 0)
        .scale(this.p.mirror ? 1 : -1)
        .add(vec2(0, -0.1)),
    );
    e.drawLine(
      f,
      f.lerp(this.end, this.percentDone),
      0.1,
      new e.Color(64 / 255, 54 / 255, 52 / 255),
    );
  }
}
