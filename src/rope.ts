import * as e from "littlejsengine";
import { vec2 } from "littlejsengine";
import { Player } from "./player";
import { clamp } from "./utils/helpers";

export class Rope extends e.EngineObject {
  static SHOOT_SPEED = 1;
  private end: e.Vector2;
  public readonly anchor: e.Vector2 | null = null;
  private shootTravel: number = 0;
  private shootDuration: number = 0;
  constructor(
    public readonly start: e.EngineObject,
    direction: e.Vector2,
    public readonly maxLength: number,
  ) {
    super(start.pos, vec2(1, 1));
    direction = direction.normalize();
    this.end = start.pos.add(direction.scale(maxLength));
    this.anchor = e.tileCollisionRaycast(start.pos, this.end);
    if (this.anchor) this.end = this.anchor;
    this.shootDuration = this.end.distance(start.pos) * Rope.SHOOT_SPEED;
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
    return this.end.distance(this.start.pos);
  }

  get direction() {
    if (!this.anchor) return null;
    return this.start.pos.subtract(this.anchor);
  }

  set length(newLength: number) {
    newLength = clamp({ v: newLength, max: this.maxLength });
    if (!this.anchor) throw Error("Trying to set length on a non-hitting rope");
    this.start.pos = this.anchor.add(
      this.direction!.normalize().scale(newLength),
    );
  }

  update(): void {
    this.shootTravel += 1;
  }

  get percentDone() {
    return this.shootTravel / this.shootDuration;
  }

  render(): void {
    e.drawLine(
      this.start.pos,
      this.start.pos.lerp(this.end, this.percentDone),
      0.1,
      e.BLACK,
    );
  }
}
