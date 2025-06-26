import * as e from "littlejsengine";
import { vec2, PI, tile, hsl } from "littlejsengine";
import { ldtkLevel, gridSize, textures } from "./utils/ldtk";
import ldtkFile from "../swingcat-level-playground.ldtk";

class Player extends e.EngineObject {
  speed: number = 0.09;
  constructor(pos: e.Vector2) {
    super(pos);
    this.size = vec2(2, 1);
    this.color = hsl(0.5, 1, 0.5);
    this.collideTiles = true;
    // this.collideSolidObjects = true;
    this.collideRaycast = false;
  }
}

const p = new Player(vec2(4, 10));

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

  const particleEmitter = new e.ParticleEmitter(
    spawnPos.add(vec2(2.5, 3.5)),
    0, // emitPos, emitAngle
    0,
    0,
    500,
    PI, // emitSize, emitTime, emitRate, emitCone
    tile(0, 16), // tileIndex, tileSize
    hsl(0, 1, 0.5),
    hsl(2 / 3, 1, 0.5), // colorStartA, colorStartB
    hsl(0, 0, 0, 0),
    hsl(0, 0, 0, 0), // colorEndA, colorEndB
    2,
    0.2,
    0.2,
    0.1,
    0.05, // time, sizeStart, sizeEnd, speed, angleSpeed
    0.99,
    1,
    1,
    PI, // damping, angleDamping, gravityScale, cone
    0.05,
    0.5,
    true,
    true, // fadeRate, randomness, collide, additive
  );
  particleEmitter.elasticity = 0.3; // bounce when it collides
  particleEmitter.trailScale = 2; // stretch in direction of motion
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
