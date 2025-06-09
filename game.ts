import { KeyboardTracker } from "./input";

export interface Ctx {
  ctx: CanvasRenderingContext2D;
  input: KeyboardTracker;
  player: Player;
}

interface Player {
  x: number;
  y: number;
}
