import * as e from "littlejsengine";
import { vec2, PI, tile, hsl } from "littlejsengine";
import {
  ldtkLevel,
  gridSize,
  textures,
  getTilesetTextureIndex,
} from "./utils/ldtk";
import { Maybe } from "./utils/types";
import "./music";
import stateMachine, {
  StateMachine,
  StateMachineInstance,
} from "./state-machine";
import { dictMap } from "./utils/helpers";

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

  // Rope physics properties
  ropeAngle: number = 0; // Current angle of the rope (0 = straight down)
  ropeAngularVelocity: number = 0; // Angular velocity of the pendulum
  ropeLength: number = 0; // Length of the rope

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

  /**
   * @returns {boolean} True if the rope hit something
   */
  shootRope() {
    this.detachRope();
    const dir = e.mousePos.subtract(p.pos).normalize();
    const ropeAnchor = e.tileCollisionRaycast(p.pos, p.pos.add(dir.scale(100)));
    if (!ropeAnchor) return false;
    this.rope = new Rope(ropeAnchor);
    return true;
  }

  constructor(pos: e.Vector2) {
    super(pos);

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
            if (action == Action.Jump) return "jump";

            p.velocity = vec2(0);
            p.tileInfo = tile(0, vec2(gridSize), p.textureIndex, 1);

            p.mirror = action == Action.Left;
            if (action == Action.Left) return "walk";
            if (action == Action.Right) return "walk";
          },
        },

        walk: {
          update(data, action: Action) {
            data.update();
            if (action == Action.ShootRope) return "rope";
            if (action == Action.None) return "idle";
            if (action == Action.Jump) return "jump";

            p.velocity.x =
              dictMap(
                { [Action.Left]: -1, [Action.Right]: 1, default: 0 },
                action,
              ) * p.speed;
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
          enter({ player }, action) {
            player.applyAcceleration(vec2(0, 0.3));
          },
          update(data, action: Action) {
            return "falling";
          },
        },
        falling: {
          update({ update }, action: Action) {
            update();
            if (action == Action.ShootRope) return "rope";
            if (p.groundObject) return "idle";

            p.tileInfo = tile(0, vec2(gridSize), p.textureIndex, 1);

            p.velocity.x =
              dictMap(
                { [Action.Left]: -1, [Action.Right]: 1, default: 0 },
                action,
              ) *
              p.speed *
              0.5;
          },
        },
        rope: {
          enter({ player }, action) {
            if (!player.shootRope()) return "falling";
            player.snapPosition();

            // Initialize rope physics
            const ropeVector = player.pos.subtract(player.rope!.pos);
            player.ropeLength = ropeVector.length();
            player.ropeAngle = Math.atan2(ropeVector.x, -ropeVector.y);

            // Convert current velocity to angular velocity
            const tangentialVelocity =
              player.velocity.x * Math.cos(player.ropeAngle) -
              player.velocity.y * Math.sin(player.ropeAngle);
            player.ropeAngularVelocity = tangentialVelocity / player.ropeLength;
          },
          update(data, action: Action) {
            if (action == Action.ReleaseRope) return "falling";

            // Manual pendulum physics
            const gravity = 0.01; // Same as game gravity but positive
            const damping = 0.99; // Slight damping to make it feel realistic

            // Calculate angular acceleration (pendulum equation)
            const angularAcceleration =
              -(gravity / p.ropeLength) * Math.sin(p.ropeAngle);

            // Update angular velocity and angle
            p.ropeAngularVelocity += angularAcceleration;
            p.ropeAngularVelocity *= damping;
            p.ropeAngle += p.ropeAngularVelocity;

            // Handle player input for swing control
            const swingForce = 0.001;
            p.ropeAngularVelocity +=
              dictMap(
                { [Action.Left]: -1, [Action.Right]: 1, default: 0 },
                action,
              ) * swingForce;

            // Calculate new position based on rope angle
            const newPos = vec2(
              p.rope!.pos.x + p.ropeLength * Math.sin(p.ropeAngle),
              p.rope!.pos.y - p.ropeLength * Math.cos(p.ropeAngle),
            );

            // Check for tile collisions
            const oldPos = p.pos.copy();
            p.pos = newPos;

            const collision = e.tileCollisionRaycast(oldPos, p.pos);
            if (collision) {
              p.pos = oldPos;
              p.ropeAngularVelocity *= -1;
            }

            // Calculate linear velocity for when rope is released
            p.velocity.x =
              p.ropeLength * p.ropeAngularVelocity * Math.cos(p.ropeAngle);
            p.velocity.y =
              p.ropeLength * p.ropeAngularVelocity * Math.sin(p.ropeAngle);
          },
          exit({ player }, action) {
            player.detachRope();
            player.groundObject = null;
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
  constructor(pos: e.Vector2) {
    super(pos, vec2(1, 1));
  }

  update(): void {}

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
