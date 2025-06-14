import * as e from "littlejsengine";
import { vec2 } from "littlejsengine";
import { LayerInstance, Level } from "../../ldtk/ldtk";
import ldtkFile from "../../swingcat-level-playground.ldtk";
import { must } from "./types";
import { fromDOMPoint } from "./dommatrix";
import { hexColor } from "./color";

export const gridSize = ldtkFile.defaultGridSize;
export const layerDefs = Object.fromEntries(
  ldtkFile.defs.layers.map((l) => [l.identifier, l]),
);
export const entityDefs = Object.fromEntries(
  ldtkFile.defs.entities.map((ent) => [ent.identifier, ent]),
);

export function getLevel(name: string) {
  const level = ldtkFile.levels.find((level) => level.identifier == name);
  if (!level) throw Error(`Unknown level ${name}`);
  return level;
}

export function getLayerFromLevel(level: Level, layerName: string) {
  const layerUid = layerDefs[layerName]?.uid;
  if (!layerUid) throw Error(`Unknown layer ${layerName}`);
  const layer = level.layerInstances?.find(
    (layer) => layer.layerDefUid == layerUid,
  );
  if (!layer) throw Error(`Level has no ${layer} layer`);
  return layer;
}

export function getEntityFromLayer(layer: LayerInstance, entityName: string) {
  const entityUid = entityDefs[entityName]?.uid;
  if (!entityUid) throw Error(`Unknown entity ${entityName}`);
  const entity = layer.entityInstances.find(
    (entity) => entity.defUid == entityUid,
  );
  if (!entity) throw Error(`Layer has no ${entityName} entity`);
  return entity;
}

export function ldtkLevel(name: string) {
  const level = getLevel(name);
  const structureLayer = getLayerFromLevel(level, "Structure");
  const entitiesLayer = getLayerFromLevel(level, "Entities");
  const spawn = getEntityFromLayer(entitiesLayer, "Spawn");

  const layer = new e.TileLayer(
    vec2(0, 0),
    vec2(level.pxWid / gridSize, level.pxHei / gridSize),
    new e.TileInfo(vec2(0, 0), vec2(gridSize, gridSize)),
    vec2(1, 1),
    0,
  );

  const m = new DOMMatrix().translateSelf(0, layer.size.y - 1).scaleSelf(1, -1);

  const spawnPos = fromDOMPoint(m.transformPoint(vec2(...spawn.__grid)));

  let c = 0;
  for (let y = 0; y < layer.size.y; y++) {
    for (let x = 0; x < layer.size.x; x++, c++) {
      const ldtkCoordinate = vec2(x, y);
      const tileGridCoordinate = fromDOMPoint(m.transformPoint(ldtkCoordinate));
      const data = layer.getData(tileGridCoordinate);
      const idx = structureLayer?.intGridCsv[c];
      // 0 means empty in LDTK
      if (idx == 0) {
        // @ts-ignore
        data.tile = undefined;
        continue;
      }
      e.setTileCollisionData(tileGridCoordinate, 1);
      const gridValue = must(
        layerDefs["Structure"].intGridValues.find((v) => v.value == idx),
      );
      data.tile = 0;
      data.color = hexColor(gridValue.color);
    }
  }
  return { layer, spawnPos };
}
