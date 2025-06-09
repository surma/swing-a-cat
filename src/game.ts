import { KeyboardTracker } from "./input";
import { Entity } from "./scene";

export interface Ctx {
  ctx: CanvasRenderingContext2D;
  input: KeyboardTracker;
  player: Entity;
  scene: Entity;
  frameCount: number;
}
