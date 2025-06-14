import { PluginOption } from "vite";
import * as types from "./ldtk";
import { readFile } from "node:fs/promises";

export function ldtkLoaderPlugin(_opts = {}): PluginOption {
  return {
    name: "ldtk-loader",
    async load(id, _options) {
      if (!id.endsWith(".ldtk")) return;
      const rawContent = await readFile(id, "utf8");
      const content = JSON.parse(rawContent) as types.LdtkFile;
      return `
          export default ${JSON.stringify(
            {
              ...content,
            },
            null,
            2,
          )}
        `;
    },
  };
}
