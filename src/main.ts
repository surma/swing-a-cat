import * as e from "littlejsengine";
import { vec2, PI, tile, hsl } from "littlejsengine";
import { ldtkLevel, gridSize, textures } from "./utils/ldtk";
import { Maybe } from "./utils/types";
import "./music";
import { splash } from "./sounds";
import stateMachine, {
  StateMachine,
  StateMachineInstance,
} from "./state-machine";
import { Action, DEFAULT_KEYMAP, Player } from "./player";
import * as entities from "./entities";

const KILL_TILES = [19, 20];

type State<T, E> = (data: T, input: E) => Maybe<State<T, E>>;

let level: ReturnType<typeof ldtkLevel>;

function gameInit() {
  e.setCameraScale(gridSize * 3);
  // e.setCanvasFixedSize(vec2(384, 216));
  e.setCanvasPixelated(true);
  e.setGravity(-0.018);
  e.setInputWASDEmulateDirection(true);

  document.body.style.background = "#506d8bff";

  // Hardcoding this because this call MUST happen before I create a TileLayer
  // (inside ldtkLevel()), and I don't wanna grab the data manually lol.
  e.initTileCollision(vec2(200, 200));

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
  const killDirections = [vec2(0, 0.51), vec2(0.6, 0), vec2(-0.6, 0)];
  const hitTiles = killDirections
    .map((dir) => e.tileCollisionRaycast(p.pos, p.pos.subtract(dir)))
    .filter((p) => !!p)
    .map((p) => level.layer.getData(p));
  if (hitTiles.some((t) => KILL_TILES.includes(t.tile))) {
    p.reset();
    splash.play();
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
      const action = p.stateMachine.currentState.input(key);
      if (action) p.action(action);
    }
  }

  if (e.mouseWasPressed(0))
    p.action(p.stateMachine.currentState.input("LeftMousePress"));
  if (e.mouseWasReleased(0))
    p.action(p.stateMachine.currentState.input("LeftMouseRelease"));
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
