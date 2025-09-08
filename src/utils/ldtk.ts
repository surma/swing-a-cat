import * as e from "littlejsengine";
import { vec2 } from "littlejsengine";
import { EntityInstance, LayerInstance, Level } from "../../ldtk/ldtk";
import ldtkFile from "../../swingcat-level-playground.ldtk";
import { Maybe, must } from "./types";
import { fromDOMPoint } from "./dommatrix";
import { hexColor } from "./color";
import { error } from "./error";

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
  if (!level) error(`Unknown level ${name}`);
  return level;
}

export function getLayerInstanceFromLevel(level: Level, layerDefUid: number) {
  const layer = level.layerInstances?.find(
    (layer) => layer.layerDefUid == layerDefUid,
  );
  if (!layer) error(`Level has no ${layer} layer`);
  return layer;
}

export function getLayerDefinition(layerName: string) {
  const layerDef = layerDefs[layerName];
  if (!layerDef) error(`Unknown layer ${layerName}`);
  return layerDef;
}

export function getTilesetByUid(tilesetUid: number) {
  const tileset = ldtkFile.defs.tilesets.find((tile) => tile.uid == tilesetUid);
  if (!tileset) error(`Unknown tileset ${tilesetUid}`);
  return tileset;
}

export function getTilesetByIdent(name: string) {
  const tileset = ldtkFile.defs.tilesets.find(
    (tileset) => tileset.identifier === name,
  );
  if (!tileset) error(`Unknown tileset ${name}`);
  return tileset;
}

export function getTilesetTextureIndexByIdent(tilesetName: string): number {
  const tileset = getTilesetByIdent(tilesetName);
  const textureIndex = textures.indexOf(tileset.relPath);
  if (textureIndex === -1)
    error(`Texture not found for tileset ${tilesetName}`);
  return textureIndex;
}

export function getTilesetTextureIndexByUid(tilesetUid: number): number {
  const tileset = getTilesetByUid(tilesetUid);
  const textureIndex = textures.indexOf(tileset.relPath);
  if (textureIndex === -1) error(`Texture not found for tileset ${tilesetUid}`);
  return textureIndex;
}

export function getEntityFromLayer(layer: LayerInstance, entityName: string) {
  return getEntitiesFromLayer(layer, entityName)?.[0];
}

export function getEntitiesFromLayer(layer: LayerInstance, entityName: string) {
  const entityUid = entityDefs[entityName]?.uid;
  if (!entityUid) error(`Unknown entity ${entityName}`);
  const entity = layer.entityInstances.filter(
    (entity) => entity.defUid == entityUid,
  );
  if (!entity) error(`Layer has no ${entityName} entity`);
  return entity;
}

export function ldtkLevel(
  name: string,
  entityMap: Record<string, { new (...a: any[]): any }>,
) {
  const level = getLevel(name);
  const numTiles = vec2(level.pxWid, level.pxHei).divide(vec2(gridSize));
  const structureLayerDef = getLayerDefinition("Structure");
  const entitiesLayerDef = getLayerDefinition("Entities");
  const structureLayer = getLayerInstanceFromLevel(
    level,
    structureLayerDef.uid,
  );
  const entitiesLayer = getLayerInstanceFromLevel(level, entitiesLayerDef.uid);

  const structureTileset = getTilesetByUid(
    must(structureLayerDef.tilesetDefUid),
  );

  const textureIndex = textures.indexOf(structureTileset.relPath);

  const layer = new e.TileLayer(
    vec2(0, 0),
    numTiles,
    new e.TileInfo(vec2(0), vec2(gridSize), textureIndex),
    vec2(1, 1),
    0,
  );

  const m = new DOMMatrix().translateSelf(0, layer.size.y - 1).scaleSelf(1, -1);
  function fromGridToWorld(obj: number[]) {
    return fromDOMPoint(m.transformPoint(vec2(...obj))).add(vec2(0.5, 0.5));
  }

  const entities = entitiesLayer.entityInstances.flatMap((entity) => {
    if (!entity.__tile) return [];
    const textureIndex = getTilesetTextureIndexByUid(entity.__tile.tilesetUid);
    const c = entityMap[entity.__identifier] ?? e.EngineObject;
    const obj: e.EngineObject = new c(fromGridToWorld(entity.__grid), vec2(1));
    obj.tileInfo = new e.TileInfo(
      vec2(entity.__tile.x, entity.__tile.y),
      vec2(gridSize),
      textureIndex,
    );
    return [obj];
  });
  const spawn = getEntityFromLayer(entitiesLayer, "Spawn");
  const spawnPos = fromGridToWorld(spawn.__grid);

  // Process auto-layer tiles if they exist
  for (const idx of structureLayer.autoLayerTiles.px_x.keys()) {
    const autoTile = {
      px: [
        structureLayer.autoLayerTiles.px_x[idx] * 8,
        structureLayer.autoLayerTiles.px_y[idx] * 8,
      ],
      src: [
        structureLayer.autoLayerTiles.src_x[idx] * 8,
        structureLayer.autoLayerTiles.src_y[idx] * 8,
      ],
    };
    const tilePos = vec2(...autoTile.px)
      .scale(1 / gridSize)
      .floor();
    const tileCoordinate = fromGridToWorld([tilePos.x, tilePos.y]);

    const data = layer.getData(tileCoordinate);
    // Calculate tile coordinates in the tileset
    const srcX = autoTile.src[0];
    const srcY = autoTile.src[1];
    const tileX = Math.floor(srcX / gridSize);
    const tileY = Math.floor(srcY / gridSize);
    const tileIndex = tileY * structureTileset.__cWid + tileX;

    data.tile = tileIndex;

    // Set collision for solid tiles
    e.setTileCollisionData(tileCoordinate, 1);
  }

  return { layer, spawnPos, entities };
}
