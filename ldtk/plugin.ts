import { PluginOption } from "vite";
import * as types from "./ldtk";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";


function texturePlaceholder(id: number): string {
  return `__TEXTURE_PLACEHOLDER_${id}`;
}

function processTextures(content: types.LdtkFile): string[] {
  const textures = new Set<string>();

  for (const tileset of content.defs.tilesets) {
    if (!tileset.relPath) {
      console.log("Unhandled tileset type");
      continue;
    } else {
      textures.add(`./${tileset.relPath}`);
    }

    const id = Array.from(textures).indexOf(tileset.relPath);
    tileset.relPath = texturePlaceholder(id);
  }

  const imports = [...textures].map((texture, i) => `import texture_${i} from ${JSON.stringify(texture)};`);

  return imports;
}

function generateModuleCode(
  file: types.LdtkFile,
  imports: string[],
): string {
  let jsonString = JSON.stringify({
    ...file
  }, null, 2);

  // Replace the placeholder strings with actual import references
  for (const idx of imports.keys()) {
    jsonString = jsonString.replace(
      JSON.stringify(texturePlaceholder(idx)),
      `texture_${idx}`
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
