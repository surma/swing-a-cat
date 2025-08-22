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
import { Action, Player } from "./player";

type State<T, E> = (data: T, input: E) => Maybe<State<T, E>>;

let p: Player;

function gameInit() {
  e.setCameraScale(gridSize * 3);
  // e.setCanvasFixedSize(vec2(384, 216));
  e.setCanvasPixelated(true);
  e.setGravity(-0.01);
  e.setInputWASDEmulateDirection(true);

  document.body.style.background = "#B8D1EB";

  // Hardcoding this because this call MUST happen before I create a TileLayer
  // (inside ldtkLevel()), and I don't wanna grab the data manually lol.
  e.initTileCollision(vec2(90, 90));

  const { layer, spawnPos } = ldtkLevel("Level_1");
  e.setCameraPos(layer.size.scale(0.5));
  layer.collideRaycast = true;
  layer.collideSolidObjects = true;
  layer.collideTiles = true;
  layer.redraw();

  p = new Player(spawnPos);
}

function gameUpdate() {}

function gameUpdatePost() {
  const KEYS = ["ArrowRight", "ArrowLeft", "Space", "KeyE", "KeyQ"];
  for (const key of KEYS) {
    if (e.keyIsDown(key)) {
      p.action(p.stateMachine.currentState.input(key));
    }
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
