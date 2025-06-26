import * as e from "littlejsengine";
import { vec2, PI, tile, hsl } from "littlejsengine";
import {
  ldtkLevel,
  gridSize,
  textures,
  getTilesetTextureIndex,
} from "./utils/ldtk";


class Player extends e.EngineObject {
  speed: number = 0.09;
  lastPos: [e.Vector2, e.Vector2];

  shouldMirror() {
    const [prev, now] = this.lastPos;
    return Math.sign(now.subtract(prev).x);
  }

  updateLastPos() {
    const [p1, p2] = this.lastPos;
    this.lastPos = [p2, this.pos.copy()];
  }

  updateMirror() {
    const oldMirror = this.shouldMirror();
    this.updateLastPos();
    const newMirror = this.shouldMirror();
    if (newMirror === 0) return;
    this.mirror = newMirror == -1;
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

    const particleEmitter = new e.ParticleEmitter(
      vec2(0, 0), // emitPos,
      0, //emitAngle
      0, // size
      0, // time
      5000, // rate
      0.5, // cone
      tile(0, 16), // tileIndex, tileSize
      hsl(0, 1, 0.5),
      hsl(2 / 3, 1, 0.5), // colorStartA, colorStartB
      hsl(0, 0, 0, 0),
      hsl(0, 0, 0, 0), // colorEndA, colorEndB
      2, //time
      0.2, // size start
      0.2, // size end
      0.1, // speed
      0.05, // angleSpeed
      0.99, // damping
      1, // angle damping
      0, // gravity scle
      PI, //cone
      0.05, // fade rate
      0.5, // randmness
      true, // collide
      true, //  additive
    );
    particleEmitter.elasticity = 0.3; // bounce when it collides
    particleEmitter.trailScale = 2; // stretch in direction of motion

    this.addChild(particleEmitter, vec2(-0.5, -0.2), -PI / 2);
  }

  update(): void {
    super.update();
    this.updateMirror();
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

function gameUpdatePost() {
  p.velocity.x = 0;

  if (e.keyIsDown("ArrowRight")) {
    p.velocity.x = p.speed;
  }
  if (e.keyIsDown("ArrowLeft")) {
    p.velocity.x = -p.speed;
  }

  if (e.keyWasPressed("Space")) {
    p.applyAcceleration(vec2(0, 0.3));
  }
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
