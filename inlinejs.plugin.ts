import { tmpdir } from "node:os";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { rimraf } from "rimraf";

import { PluginOption } from "vite";

export default function inlinejs(): PluginOption {
  return {
    name: "inlinejs",
    async writeBundle(options, bundle) {
      const bundleEntry = Object.entries(bundle).find(([k, v]) =>
        k.endsWith(".js"),
      )!;
      if (!bundleEntry) throw Error("No JS file generated");
      const [name, contents] = bundleEntry;
      await rimraf(join(options.dir, "assets"));
      await writeFile(
        join(options.dir, "index.html"),
        `<!doctype html><p><script>${contents.code}</script>`,
      );
    },
  };
}
