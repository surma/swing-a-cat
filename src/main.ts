import * as e from "littlejsengine";
import { vec2, PI, tile, hsl } from "littlejsengine";
import {
  ldtkLevel,
  gridSize,
  textures,
} from "./utils/ldtk";
import { Maybe } from "./utils/types";
import "./music";
import stateMachine, {
  StateMachine,
  StateMachineInstance,
} from "./state-machine";
import { Action, DEFAULT_KEYMAP, Player } from "./player";

type State<T, E> = (data: T, input: E) => Maybe<State<T, E>>;

let p: Player;

function gameInit() {
  e.setCameraScale(gridSize * 3);
  // e.setCanvasFixedSize(vec2(384, 216));
  e.setCanvasPixelated(true);
  e.setGravity(-0.01);
  e.setInputWASDEmulateDirection(true);

  document.body.style.background = "#4b6a8bcb";

  // Hardcoding this because this call MUST happen before I create a TileLayer
  // (inside ldtkLevel()), and I don't wanna grab the data manually lol.
  e.initTileCollision(vec2(90, 90));

  const { layer, spawnPos } = ldtkLevel("Level_1");
  layer.collideRaycast = true;
  layer.collideSolidObjects = true;
  layer.collideTiles = true;
  layer.redraw();

  p = new Player(spawnPos);
  e.setCameraPos(spawnPos);
}

function gameUpdate() {
  updateCamera();
}

function updateCamera() {
  const CAMERA_LAG = 0.1;
  const toPlayerVec = p.pos.subtract(e.cameraPos);
  e.setCameraPos(e.cameraPos.add(toPlayerVec.scale(CAMERA_LAG)));
}

function gameUpdatePost() {
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
