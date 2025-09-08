import * as e from "littlejsengine";
import { Rope } from "./rope";
import { getTilesetTextureIndexByIdent, gridSize } from "./utils/ldtk";
import { Maybe } from "./utils/types";
import stateMachine, { StateMachineInstance } from "./state-machine";
import { tile, vec2 } from "littlejsengine";
import { leap, meow, clover } from "./sounds";
import { clamp, match, remap } from "./utils/helpers";

export enum Action {
  None,
  Left,
  Right,
  Up,
  Down,
  Jump,
  Rope,
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
  KeyE: Action.Rope,
  KeyK: Action.Rope,
  LeftMouse: Action.Rope,
  default: Action.None,
};
export class Player extends e.EngineObject {
  static SINGLETON: Player;
  rope: Rope | null = null;
  textureIndex = getTilesetTextureIndexByIdent("All_images");
  SPEED: number = 0.12;
  AIR_CONTROL: number = 0.15;
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

  maxRopeLength = 4;

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
    if (this.isRopeActive) return;
    this.rope = new Rope(
      this,
      e.mousePos.subtract(this.pos),
      this.maxRopeLength,
    );
  }

  constructor(pos: e.Vector2) {
    super(pos);

    this.lastPos = [pos.copy(), pos.copy()];
    this.size = vec2(1, 1);

    // Get Cat tileset texture index and create tile reference
    const catTextureIndex = getTilesetTextureIndexByIdent("All_images");
    this.tileInfo = tile(0, vec2(gridSize), catTextureIndex, 1);

    this.collideTiles = true;
    this.collideRaycast = false;
  }

  get isRopeActive() {
    return this.rope && this.rope.hasHit;
  }

  get canShootRope() {
    return !this.rope;
  }

  changeRope(delta: number) {
    if (!this.isRopeActive) return;

    const dir = this.rope!.direction!.normalize();
    let nextPos = this.pos.add(dir.scale(delta));
    while (e.tileCollisionTest(nextPos, vec2(1.5))) {
      nextPos = nextPos.subtract(dir.scale(0.1));
    }

    this.rope!.length = this.rope!.anchor!.distance(nextPos);
    this.snapPositionToRope();
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
            if (action == Action.Rope && p.canShootRope) p.shootRope();
            else if (action == Action.Rope && p.isRopeActive) p.releaseRope();
            if (action == Action.Jump) return "jump";
            if (!p.groundObject) return "falling";

            p.velocity = vec2(0);
            p.tileInfo = tile(15, vec2(gridSize), p.textureIndex, 0);

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
            if (action == Action.Rope && p.canShootRope) p.shootRope();
            else if (action == Action.Rope && p.isRopeActive) p.releaseRope();
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
              15 + p.animationFrame,
              vec2(gridSize),
              p.textureIndex,
              0,
            );
          },
        },

        jump: {
          input(input): Action {
            return match(DEFAULT_KEYMAP, input);
          },
          enter({ player: p }, action) {
            leap.play();
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
            if (action == Action.Rope && p.canShootRope) p.shootRope();
            else if (action == Action.Rope && p.isRopeActive) p.releaseRope();
            if (p.groundObject) return "idle";

            p.tileInfo = tile(15, vec2(gridSize), p.textureIndex, 0);

            const factor = match(
              { [Action.Left]: -1, [Action.Right]: 1, default: 0 },
              action,
            );
            p.applyForce(
              vec2(
                factor *
                  remap({
                    vin: { min: 0, max: factor },
                    vout: { min: p.AIR_CONTROL, max: 0 },
                    v: p.velocity.x / p.AIR_CONTROL,
                  }),
                0,
              ),
            );
          },
        },
        rope: {
          input(input): Action {
            return match(
              {
                ...DEFAULT_KEYMAP,
                ArrowUp: Action.ShortenRope,
                ArrowDown: Action.LengthenRope,
                Space: Action.Rope,
              },
              input,
            );
          },
          enter({ player: p }, action) {
            // Changing the length rope by 0 triggeres
            // the code that makes sure we are not colliding
            p.changeRope(0);

            const ropeVector = p.pos.subtract(p.rope!.anchor!);
            p.ropeAngle = Math.atan2(ropeVector.x, -ropeVector.y);

            const tangent = ropeVector.normalize().rotate(-90);
            p.velocity = p.velocity.normalize().scale(p.velocity.dot(tangent));
          },
          update({ player: p }, action: Action) {
            if (action == Action.Rope) return "falling";

            if (action == Action.ShortenRope) p.changeRope(-0.1);
            if (action == Action.LengthenRope) p.changeRope(0.1);

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
            const collision = e.tileCollisionTest(p.pos, vec2(1.5));
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
