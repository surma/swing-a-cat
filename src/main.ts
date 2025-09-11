import * as e from "littlejsengine";
import { vec2, PI, tile, hsl } from "littlejsengine";
import { ldtkLevel, gridSize, textures } from "./utils/ldtk";
import { Maybe } from "./utils/types";
import "./music";
import stateMachine, {
  StateMachine,
  StateMachineInstance,
} from "./state-machine";
import { Action, DEFAULT_KEYMAP, Player } from "./player";
import entities from "./entities";

type State<T, E> = (data: T, input: E) => Maybe<State<T, E>>;

let level: ReturnType<typeof ldtkLevel>;

function gameInit() {
  e.setCameraScale(gridSize * 3);
  // e.setCanvasFixedSize(vec2(384, 216));
  e.setCanvasPixelated(true);
  e.setGravity(-0.018);
  e.setInputWASDEmulateDirection(true);

  document.body.style.background = "#4b6a8bcb";

  // Hardcoding this because this call MUST happen before I create a TileLayer
  // (inside ldtkLevel()), and I don't wanna grab the data manually lol.
  e.initTileCollision(vec2(100, 70));

  level = ldtkLevel("Level_1", entities);
  level.layer.collideRaycast = true;
  level.layer.collideSolidObjects = true;
  level.layer.collideTiles = true;
  level.layer.redraw();

  Player.SINGLETON = new Player(level.spawnPos);
  e.setCameraPos(level.spawnPos);
}

function gameUpdate() {
  updateCamera();
}

function checkDeath() {
  const p = Player.SINGLETON;
  const collisionPoint = e.tileCollisionRaycast(
    p.pos,
    p.pos.subtract(vec2(0, 1)),
  );
  if (!collisionPoint) return;
  const tileData = level.layer.getData(collisionPoint);
  if (tileData.tile == 13) {
    p.pos.set(level.spawnPos.x, level.spawnPos.y);
    p.velocity.set(0, 0);
  }
}

function updateCamera() {
  const CAMERA_LAG = 0.1;
  const toPlayerVec = Player.SINGLETON.pos.subtract(e.cameraPos);
  e.setCameraPos(e.cameraPos.add(toPlayerVec.scale(CAMERA_LAG)));
}

function gameUpdatePost() {
  const p = Player.SINGLETON;
  const KEYS = [...Object.keys(DEFAULT_KEYMAP), "ArrowUp", "ArrowDown"];
  for (const key of KEYS) {
    if (e.keyIsDown(key)) {
      p.action(p.stateMachine.currentState.input(key));
    }
  }

  if (e.mouseWasPressed(0))
    p.action(p.stateMachine.currentState.input("LeftMouse"));
  if (e.mouseWasPressed(2))
    p.action(p.stateMachine.currentState.input("RightMouse"));
  checkDeath();
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
