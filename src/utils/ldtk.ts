import * as e from "littlejsengine";
import { vec2 } from "littlejsengine";
import { LayerInstance, Level } from "../../ldtk/ldtk";
import ldtkFile from "../../swingcat-level-playground.ldtk";
import { Maybe, must } from "./types";
import { fromDOMPoint } from "./dommatrix";
import { hexColor } from "./color";

export const gridSize = ldtkFile.defaultGridSize;
export const textures: Maybe<string>[] = ldtkFile.defs.tilesets.map(
  (t) => t.relPath,
);

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

export function getLayerInstanceFromLevel(level: Level, layerDefUid: number) {
  const layer = level.layerInstances?.find(
    (layer) => layer.layerDefUid == layerDefUid,
  );
  if (!layer) throw Error(`Level has no ${layer} layer`);
  return layer;
}

export function getLayerDefinition(layerName: string) {
  const layerDef = layerDefs[layerName];
  if (!layerDef) throw Error(`Unknown layer ${layerName}`);
  return layerDef;
}

export function getTileset(tilesetUid: number) {
  const tileset = ldtkFile.defs.tilesets.find((tile) => tile.uid == tilesetUid);
  if (!tileset) throw Error(`Unknown tileset ${tilesetUid}`);
  return tileset;
}

export function getTilesetByName(name: string) {
  const tileset = ldtkFile.defs.tilesets.find(
    (tileset) => tileset.identifier === name,
  );
  if (!tileset) throw Error(`Unknown tileset ${name}`);
  return tileset;
}

export function getTilesetTextureIndex(tilesetName: string): number {
  const tileset = getTilesetByName(tilesetName);
  const textureIndex = textures.indexOf(tileset.relPath);
  if (textureIndex === -1)
    throw Error(`Texture not found for tileset ${tilesetName}`);
  return textureIndex;
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
  const numTiles = vec2(level.pxWid, level.pxHei).divide(vec2(gridSize));
  const structureLayerDef = getLayerDefinition("Structure");
  const entitiesLayerDef = getLayerDefinition("Entities");
  const structureLayer = getLayerInstanceFromLevel(
    level,
    structureLayerDef.uid,
  );
  const entitiesLayer = getLayerInstanceFromLevel(level, entitiesLayerDef.uid);
  const spawn = getEntityFromLayer(entitiesLayer, "Spawn");

  const structureTileset = getTileset(must(structureLayerDef.tilesetDefUid));

  const textureIndex = textures.indexOf(structureTileset.relPath);

  const layer = new e.TileLayer(
    vec2(0, 0),
    numTiles,
    new e.TileInfo(vec2(0), vec2(gridSize), textureIndex),
    vec2(1, 1),
    0,
  );

  const m = new DOMMatrix().translateSelf(0, layer.size.y - 1).scaleSelf(1, -1);

  const spawnPos = fromDOMPoint(m.transformPoint(vec2(...spawn.__grid))).add(
    vec2(0.5, 0.5),
  );

  // Process auto-layer tiles if they exist
  if (!(structureLayer.autoLayerTiles?.length > 0))
    throw Error("Structure layer does not have auto tiles");
  for (const autoTile of structureLayer.autoLayerTiles) {
    const tilePosX = Math.floor(autoTile.px[0] / gridSize);
    const tilePosY = Math.floor(autoTile.px[1] / gridSize);
    const ldtkCoordinate = vec2(tilePosX, tilePosY);
    const tileGridCoordinate = fromDOMPoint(m.transformPoint(ldtkCoordinate));
    const centerBasedCoordinate = tileGridCoordinate.add(vec2(0.5, 0.5));

    const data = layer.getData(centerBasedCoordinate);
    // Calculate tile coordinates in the tileset
    const srcX = autoTile.src[0];
    const srcY = autoTile.src[1];
    const tileX = Math.floor(srcX / gridSize);
    const tileY = Math.floor(srcY / gridSize);
    const tileIndex = tileY * structureTileset.__cWid + tileX;

    data.tile = tileIndex;

    // Set collision for solid tiles
    e.setTileCollisionData(centerBasedCoordinate, 1);
  }

  return { layer, spawnPos };
}
