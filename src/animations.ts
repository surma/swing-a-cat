import { Texture, tile, vec2 } from "littlejsengine";
import { gridSize, textures } from "./utils/ldtk";
import { getTilesetTextureIndexByIdent } from "./utils/ldtk";

export interface Animation {
  textureIndex: number;
  totalFrames: number;
  animationSpeed: number;
  startFrame: number;
}

export function makeAnimation(
  textureName: string,
  totalFrames: number,
  animationSpeed: number,
  startFrame: number,
): Animation {
  const textureIndex = getTilesetTextureIndexByIdent(textureName);
  return {
    textureIndex,
    totalFrames,
    animationSpeed,
    startFrame,
  };
}
