import * as e from "littlejsengine";
import { vec2, PI, tile, hsl } from "littlejsengine";
import { ldtkLevel } from "./utils/ldtk";

function gameInit() {
  e.setCameraScale(8);
  e.setCanvasFixedSize(vec2(384, 216));
  e.setCanvasPixelated(true);
  e.setEnablePhysicsSolver(true);
  e.setGravity(-0.01);
  e.setInputWASDEmulateDirection(true);
  e.initTileCollision(vec2(32, 32));

  const { layer, spawnPos } = ldtkLevel("Level_1");
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

function gameUpdatePost() {}

function gameRender() {}

function gameRenderPost() {}

const cvs = new OffscreenCanvas(1, 1);
const ctx = cvs.getContext("2d")!;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 1, 1);
const emptyTexture = await cvs.convertToBlob({ type: "image/png" });
const emptyTextureUrl = URL.createObjectURL(emptyTexture);
const imageSources = [emptyTextureUrl];
e.engineInit(
  gameInit,
  gameUpdate,
  gameUpdatePost,
  gameRender,
  gameRenderPost,
  imageSources,
);
