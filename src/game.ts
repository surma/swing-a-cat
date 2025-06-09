import { KeyboardTracker } from "./input";

export interface Ctx {
  ctx: CanvasRenderingContext2D;
  input: KeyboardTracker;
  player: Entity;
  scene: Entity;
  frameCount: number;
}

export interface BaseEntity {
  type?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  c?: Entity[];
  draw?(entity: Entity, ctx: Ctx): void;
  tick?(entity: Entity, ctx: Ctx): void;
}

export interface Rope extends BaseEntity {
  type: "rope";
  spawnFrame: number;
}

export interface Player extends BaseEntity {
  type: "player";
}

export type Entity = Rope | Player | BaseEntity;
