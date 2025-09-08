import { PluginOption } from "vite";
import * as types from "./ldtk";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { pick } from "../src/utils/helpers";

function texturePlaceholder(id: number): string {
  return `__TEXTURE_PLACEHOLDER_${id}`;
}

function processTextures(content: types.LdtkFile): string[] {
  const textures = new Set<string>();

  for (const tileset of content.defs.tilesets) {
    if (!tileset.relPath) {
      console.log("Unhandled tileset type");
      continue;
    }
    const texturePath = `./${tileset.relPath}`;
    textures.add(texturePath);

    const id = Array.from(textures).indexOf(texturePath);
    tileset.relPath = texturePlaceholder(id);
  }

  const imports = [...textures].map(
    (texture, i) => `import texture_${i} from ${JSON.stringify(texture)};`,
  );

  return imports;
}

function generateModuleCode(file: types.LdtkFile, imports: string[]): string {
  const subsetLevel = {
    defaultGridSize: file.defaultGridSize,
    defs: {
      layers: file.defs.layers.map((layer) =>
        pick(layer, "identifier", "uid", "tilesetDefUid"),
      ),
      entities: file.defs.entities.map((entity) =>
        pick(entity, "uid", "identifier"),
      ),
      tilesets: file.defs.tilesets.map((tileset) =>
        pick(tileset, "uid", "identifier", "relPath", "__cHei", "__cWid"),
      ),
    },
    levels: file.levels.map((level) => ({
      ...pick(level, "uid", "identifier", "pxWid", "pxHei"),
      layerInstances: (level.layerInstances ?? []).map((layerInstance) => ({
        ...pick(layerInstance, "layerDefUid"),
        // This is the least compressible data structure. Turn the Array of Structs into a struct
        // of arrays to make gzip happy.
        autoLayerTiles: {
          px_x: layerInstance.autoLayerTiles
            .map((tileInstance) => tileInstance.px[0] / 8)
            .flat(),
          px_y: layerInstance.autoLayerTiles
            .map((tileInstance) => tileInstance.px[1] / 8)
            .flat(),
          src_x: layerInstance.autoLayerTiles
            .map((tileInstance) => tileInstance.src[0] / 8)
            .flat(),
          src_y: layerInstance.autoLayerTiles
            .map((tileInstance) => tileInstance.src[1] / 8)
            .flat(),
        },
        entityInstances: layerInstance.entityInstances.map(
          (entityInstance) => ({
            ...pick(
              entityInstance,
              "defUid",
              "__grid",
              "__tile",
              "__identifier",
            ),
          }),
        ),
      })),
    })),
  };

  let jsonString = JSON.stringify(subsetLevel);
  // Replace the placeholder strings with actual import references
  for (const idx of imports.keys()) {
    jsonString = jsonString.replace(
      JSON.stringify(texturePlaceholder(idx)),
      `texture_${idx}`,
    );
  }

  return `
    ${imports.join("\n")}
    export default ${jsonString}
  `;
}

export function ldtkLoaderPlugin(_opts = {}): PluginOption {
  return {
    name: "ldtk-loader",
    async load(id, _options) {
      if (!id.endsWith(".ldtk")) return;

      const rawContent = await readFile(id, "utf8");
      const content = JSON.parse(rawContent) as types.LdtkFile;

      const imports = processTextures(content);
      return generateModuleCode(content, imports);
    },
  };
}
