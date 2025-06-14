import * as e from "littlejsengine";
import { vec2 } from "littlejsengine";
import ldtkFile from "../swingcat-level-playground.ldtk";
import { LdtkFile } from "../ldtk/ldtk";
import { hexColor } from "./utils/color";
import { must } from "./utils/types";

const gridSize = ldtkFile.defaultGridSize;

function ldtkLevelLayer(root: LdtkFile, name: string): e.TileLayer {
  const structureLayerDef = must(
    root.defs.layers.find((layerDef) => layerDef.identifier == "Structure"),
  );
  const level = root.levels.find((level) => level.identifier == name);
  if (!level) throw Error(`Unknown level ${name}`);
  const structureLayer = level.layerInstances?.find(
    (layer) => layer.layerDefUid == structureLayerDef.uid,
  );

  const layer = new e.TileLayer(
    vec2(0, 0),
    vec2(level.pxWid / gridSize, level.pxHei / gridSize),
    new e.TileInfo(vec2(0, 0), vec2(gridSize, gridSize)),
    vec2(1, 1),
    0,
  );

  let c = 0;
  for (let y = layer.size.y - 1; y >= 0; y--) {
    for (let x = 0; x < layer.size.x; x++, c++) {
      const data = layer.getData(vec2(x, y));
      const idx = structureLayer?.intGridCsv[c];
      // 0 means empty in LDTK
      if (idx == 0) {
        // @ts-ignore
        data.tile = undefined;
        continue;
      }
      const gridValue = must(
        structureLayerDef.intGridValues.find((v) => v.value == idx),
      );
      data.tile = 0;
      data.color = hexColor(gridValue.color);
    }
  }
  return layer;
}

function gameInit() {
  e.setCameraScale(8);
  e.setCanvasFixedSize(vec2(384, 216));
  e.setCanvasPixelated(true);
  e.setEnablePhysicsSolver(true);
  e.setGravity(-10);
  e.initTileCollision(vec2(gridSize, gridSize));
  e.setInputWASDEmulateDirection(true);

  const layer = ldtkLevelLayer(ldtkFile, "Level_1");
  e.setCameraPos(layer.size.scale(0.5));
  layer.redraw();
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
