import * as e from "littlejsengine";
import { vec2, PI, tile, hsl } from "littlejsengine";
import {
  ldtkLevel,
  gridSize,
  textures,
  getTilesetTextureIndex,
} from "./utils/ldtk";
import { Maybe } from "./utils/types";
import stateMachine, {
  StateMachine,
  StateMachineInstance,
} from "./state-machine";

type State<T, E> = (data: T, input: E) => Maybe<State<T, E>>;

enum Action {
  None,
  Left,
  Right,
  Jump,
  ShootRope,
  ReleaseRope,
}

class Player extends e.EngineObject {
  rope: Rope | null = null;
  textureIndex = getTilesetTextureIndex("Cat");
  speed: number = 0.09;
  lastPos: [e.Vector2, e.Vector2];
  animationFrame: number = 0;
  animationTimer: number = 0;
  animationSpeed: number = 0.1; // seconds per frame
  totalFrames: number = 4; // number of frames in the sprite sheet
  isMoving: boolean = false;
  nextAction: Maybe<Action> = null;

  stateMachine: StateMachineInstance<{ update: () => void }, Action> =
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

  detachRope() {
    if (!this.rope) return;
    this.rope.destroy();
    this.rope = null;
  }

  shootRope() {
    this.detachRope();
    this.rope = new Rope(p.pos);
  }

  constructor(pos: e.Vector2) {
    super(pos);

    // this.initStateMachine();
    this.lastPos = [pos.copy(), pos.copy()];
    this.size = vec2(1, 1);

    // Get Cat tileset texture index and create tile reference
    const catTextureIndex = getTilesetTextureIndex("Cat");
    this.tileInfo = tile(0, vec2(gridSize), catTextureIndex, 1);

    this.collideTiles = true;
    // this.collideSolidObjects = true;
    this.collideRaycast = false;

    // const particleEmitter = new e.ParticleEmitter(
    //   vec2(0, 0), // emitPos,
    //   0, //emitAngle
    //   0, // size
    //   0, // time
    //   1000, // rate
    //   0.5, // cone
    //   tile(0, 16), // tileIndex, tileSize
    //   hsl(0, 1, 0.5),
    //   hsl(2 / 3, 1, 0.5), // colorStartA, colorStartB
    //   hsl(0, 0, 0, 0),
    //   hsl(0, 0, 0, 0), // colorEndA, colorEndB
    //   2, //time
    //   0.2, // size start
    //   0.2, // size end
    //   0.1, // speed
    //   0.05, // angleSpeed
    //   0.99, // damping
    //   1, // angle damping
    //   0, // gravity scle
    //   PI, //cone
    //   0.05, // fade rate
    //   0.5, // randmness
    //   true, // collide
    //   true, //  additive
    // );
    // particleEmitter.elasticity = 0.3; // bounce when it collides
    // particleEmitter.trailScale = 2; // stretch in direction of motion

    // this.addChild(particleEmitter, vec2(-0.5, -0.2), -PI / 2);
  }

  initStateMachine() {
    return stateMachine(
      {
        idle: {
          update(data, action) {
            data.update();
            if (action == Action.ShootRope) return "rope";
            p.velocity = vec2(0);
            p.tileInfo = tile(0, vec2(gridSize), p.textureIndex, 1);
            if (action == Action.Left) {
              p.mirror = true;
              return "walk";
            } else if (action == Action.Right) {
              p.mirror = false;
              return "walk";
            } else if (action == Action.Jump) {
              p.applyAcceleration(vec2(0, 0.3));
              return "jump";
            }
            return null;
          },
        },

        walk: {
          update(data, action: Action) {
            data.update();
            if (action == Action.ShootRope) return "rope";

            if (action == Action.Left) {
              p.velocity.x = -1 * p.speed;
            } else if (action == Action.Right) {
              p.velocity.x = p.speed;
            } else if (action == Action.None) {
              return "idle";
            } else if (action == Action.Jump) {
              p.applyAcceleration(vec2(0, 0.3));
              return "jump";
            }
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
          update(data, action: Action) {
            data.update();
            if (action == Action.ShootRope) return "rope";
            p.tileInfo = tile(0, vec2(gridSize), p.textureIndex, 1);
            if (action == Action.Left) {
              p.velocity.x = -1 * p.speed * 0.5;
            } else if (action == Action.Right) {
              p.velocity.x = p.speed * 0.5;
            }
            if (p.groundObject) {
              return "idle";
            }
          },
        },
        rope: {
          enter(data, action) {
            data.player.shootRope();
          },
          update(data, action) {
            if (action == Action.ReleaseRope) {
              return "idle";
            }
          },
          exit(data, action) {
            data.player.detachRope();
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
    // super.update();
    this.snapPosition();
    this.updateLastPos();
    this.updateMirror();
  }

  snapPosition(): void {
    const MAX_LENGTH = 6;
    if (!this.rope) return;
    const dir = p.pos.subtract(this.rope.pos);
    if (dir.length() < MAX_LENGTH) return;
    p.pos = this.rope.pos.add(dir.normalize().scale(MAX_LENGTH));
  }
}

let p: Player;

function gameInit() {
  e.setCameraScale(gridSize * 3);
  // e.setCanvasFixedSize(vec2(384, 216));
  e.setCanvasPixelated(true);
  // e.setEnablePhysicsSolver(true);
  e.setGravity(-0.01);
  e.setInputWASDEmulateDirection(true);
  e.initTileCollision(vec2(32, 32));

  const { layer, spawnPos } = ldtkLevel("Level_1");
  // layer.size = layer.size.multiply(vec2(8));
  // layer.scale = layer.scale.multiply(vec2(8));
  e.setCameraPos(layer.size.scale(0.5));
  layer.redraw();

  p = new Player(vec2(4, 10));
  p.pos = vec2(spawnPos);
}

function gameUpdate() {}

class Rope extends e.EngineObject {
  // anchor: e.Vector2;

  constructor(currentPos: e.Vector2) {
    const dir = e.mousePos.subtract(p.pos).normalize();
    const pos = e.tileCollisionRaycast(currentPos, p.pos.add(dir.scale(100)));
    super(pos, vec2(1, 1));
  }

  update(): void {
    // e.drawLine(p.pos, this.pos, .1, e.RED);
    // e.drawCircle(this.pos, 1, e.RED, 1);
  }

  render(): void {
    e.drawLine(p.pos, this.pos, 0.1, e.RED);
  }
}

function gameUpdatePost() {
  if (e.keyIsDown("ArrowRight")) {
    p.action(Action.Right);
  }
  if (e.keyIsDown("ArrowLeft")) {
    p.action(Action.Left);
  }
  if (e.keyWasPressed("Space")) {
    p.action(Action.Jump);
  }
  if (e.keyWasPressed("KeyE")) {
    p.action(Action.ShootRope);
  }

  if (e.keyWasPressed("KeyQ")) {
    p.action(Action.ReleaseRope);
  }

  // e.mainCanvas.draw
  // console.log(r)
  // p.action(Action.Jump);
}

function gameRender() {}

function gameRenderPost() {}

e.engineInit(
  gameInit,
  gameUpdate,
  gameUpdatePost,
  gameRender,
  gameRenderPost,
  textures,
);
