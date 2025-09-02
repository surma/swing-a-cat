import * as e from "littlejsengine";
import { Rope } from "./rope";
import { getTilesetTextureIndex, gridSize } from "./utils/ldtk";
import { Maybe } from "./utils/types";
import stateMachine, { StateMachineInstance } from "./state-machine";
import { tile, vec2 } from "littlejsengine";
import { match } from "./utils/helpers";

export enum Action {
  None,
  Left,
  Right,
  Up,
  Down,
  Jump,
  ShootRope,
  ReleaseRope,
  ShortenRope,
  LengthenRope,
}

interface FsmData {
  player: Player;
  update: () => void;
}

interface ExtraStateMethods {
  input(input: string): Action;
}

export const DEFAULT_KEYMAP = {
  ArrowRight: Action.Right,
  ArrowLeft: Action.Left,
  Space: Action.Jump,
  KeyE: Action.ShootRope,
  LeftMouse: Action.ShootRope,
  RightMouse: Action.ReleaseRope,
  default: Action.None,
};
export class Player extends e.EngineObject {
  rope: Rope | null = null;
  textureIndex = getTilesetTextureIndex("Cat");
  SPEED: number = 0.12;
  AIR_CONTROL: number = 0.005;
  lastPos: [e.Vector2, e.Vector2];
  animationFrame: number = 0;
  animationTimer: number = 0;
  animationSpeed: number = 0.1;
  totalFrames: number = 4;
  isMoving: boolean = false;
  nextAction: Maybe<Action> = null;

  ropeAngle: number = 0;
  ropeAngularVelocity: number = 0;
  ropeLength: number = 0;

  stateMachine: StateMachineInstance<FsmData, Action, ExtraStateMethods> =
    this.initStateMachine();

  shouldMirror() {
    const [prev, now] = this.lastPos;
    return Math.sign(now.subtract(prev).x);
  }

  updateLastPos() {
    const [p1, p2] = this.lastPos;
    this.lastPos = [p2, this.pos.copy()];
  }

  updateMirror() {
    this.mirror = this.shouldMirror() == -1;
  }

  releaseRope() {
    if (!this.rope) return;
    this.rope.destroy();
    this.rope = null;
  }

  shootRope() {
    if (this.rope) return;
    this.rope = new Rope(this, e.mousePos.subtract(this.pos), 10);
  }

  constructor(pos: e.Vector2) {
    super(pos);

    this.lastPos = [pos.copy(), pos.copy()];
    this.size = vec2(1, 1);

    // Get Cat tileset texture index and create tile reference
    const catTextureIndex = getTilesetTextureIndex("Cat");
    this.tileInfo = tile(0, vec2(gridSize), catTextureIndex, 1);

    this.collideTiles = true;
    this.collideRaycast = false;
  }

  initStateMachine() {
    return stateMachine<FsmData, Action, ExtraStateMethods>(
      {
        idle: {
          input(input): Action {
            return match(DEFAULT_KEYMAP, input);
          },
          update({ player: p, update }, action) {
            update();
            if (p.rope?.hasHit) return "rope";
            if (action == Action.ShootRope) p.shootRope();
            if (action == Action.ReleaseRope) p.releaseRope();
            if (action == Action.Jump) return "jump";
            if (!p.groundObject) return "falling";

            p.velocity = vec2(0);
            p.tileInfo = tile(0, vec2(gridSize), p.textureIndex, 1);

            p.mirror = action == Action.Left;
            if (action == Action.Left) return "walk";
            if (action == Action.Right) return "walk";
          },
        },

        walk: {
          input(input): Action {
            return match(DEFAULT_KEYMAP, input);
          },
          update({ player: p, update }, action: Action) {
            update();
            if (p.rope?.hasHit) return "rope";
            if (action == Action.ShootRope) p.shootRope();
            if (action == Action.ReleaseRope) p.releaseRope();
            if (action == Action.None) return "idle";
            if (action == Action.Jump) return "jump";
            if (!p.groundObject) return "falling";

            p.velocity.x =
              match(
                { [Action.Left]: -1, [Action.Right]: 1, default: 0 },
                action,
              ) * p.SPEED;
            p.animationTimer += e.timeDelta;

            if (p.animationTimer >= p.animationSpeed) {
              p.animationTimer = 0;
              p.animationFrame = (p.animationFrame + 1) % p.totalFrames;
            }
            p.tileInfo = tile(
              p.animationFrame,
              vec2(gridSize),
              p.textureIndex,
              1,
            );
          },
        },

        jump: {
          input(input): Action {
            return match(DEFAULT_KEYMAP, input);
          },
          enter({ player: p }, action) {
            p.applyAcceleration(vec2(0, 0.3));
          },
          update(data, action: Action) {
            return "falling";
          },
        },
        falling: {
          input(input): Action {
            return match(DEFAULT_KEYMAP, input);
          },
          update({ player: p, update }, action: Action) {
            update();
            if (p.rope?.hasHit) return "rope";
            if (action == Action.ShootRope) p.shootRope();
            if (action == Action.ReleaseRope) p.releaseRope();
            if (p.groundObject) return "idle";

            p.tileInfo = tile(0, vec2(gridSize), p.textureIndex, 1);

            p.velocity.x +=
              match(
                { [Action.Left]: -1, [Action.Right]: 1, default: 0 },
                action,
              ) * p.AIR_CONTROL;
          },
        },
        rope: {
          input(input): Action {
            return match(
              {
                ...DEFAULT_KEYMAP,
                ArrowUp: Action.ShortenRope,
                ArrowDown: Action.LengthenRope,
                Space: Action.ReleaseRope,
                LeftMouse: Action.ReleaseRope,
              },
              input,
            );
          },
          enter({ player: p }, action) {
            p.snapPositionToRope();

            const ropeVector = p.pos.subtract(p.rope!.anchor!);
            p.ropeAngle = Math.atan2(ropeVector.x, -ropeVector.y);

            const tangent = ropeVector.normalize().rotate(-90);
            p.velocity = p.velocity.normalize().scale(p.velocity.dot(tangent));
          },
          update({ player: p }, action: Action) {
            if (action == Action.ReleaseRope) return "falling";

            if (action == Action.ShortenRope) p.rope!.length -= 0.1;
            if (action == Action.LengthenRope) p.rope!.length += 0.1;
            if (action == Action.ShortenRope || action == Action.LengthenRope)
              p.snapPositionToRope();

            const damping = 0.99;
            const angularAcceleration =
              -((-1 * e.gravity) / p.rope!.length) * Math.sin(p.ropeAngle);

            p.ropeAngularVelocity += angularAcceleration;
            p.ropeAngularVelocity *= damping;
            p.ropeAngle += p.ropeAngularVelocity;

            const swingForce = 0.001;
            p.ropeAngularVelocity +=
              match(
                { [Action.Left]: -1, [Action.Right]: 1, default: 0 },
                action,
              ) * swingForce;

            const newPos = vec2(
              p.rope!.anchor!.x + p.rope!.length * Math.sin(p.ropeAngle),
              p.rope!.anchor!.y - p.rope!.length * Math.cos(p.ropeAngle),
            );

            const oldPos = p.pos.copy();
            p.pos = newPos;
            const collision = e.tileCollisionRaycast(oldPos, p.pos);
            if (collision) {
              p.pos = oldPos;
              p.ropeAngularVelocity *= -1;
            }

            p.velocity = p.pos.subtract(oldPos);
          },
          exit({ player }, action) {
            player.releaseRope();
          },
        },
      },
      { player: this, update: () => super.update.call(this) },
    );
  }

  action(action: Action) {
    this.nextAction = action;
  }

  update(): void {
    this.stateMachine.action(this.nextAction ?? Action.None);
    this.nextAction = null;
    if (this.rope?.hasMissed) this.releaseRope();
    this.updateLastPos();
    this.updateMirror();
  }

  snapPositionToRope(): void {
    if (!this.rope?.hasHit) return;
    const dir = this.pos.subtract(this.rope.anchor!);
    this.pos = this.rope.anchor!.add(dir.normalize().scale(this.rope.length));
  }
}
