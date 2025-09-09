import { tmpdir } from "node:os";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { PluginOption } from "vite";
import { compiler } from "google-closure-compiler";

function rnd() {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

function tempfile() {
  const tmppath = join(tmpdir(), `tmp-closure-${rnd()}`);
  return tmppath;
}

export default function closure(): PluginOption {
  return {
    name: "closure",
    async generateBundle(options, bundle) {
      const tmpfile = tempfile();
      const bundleEntry = Object.entries(bundle).find(([k, v]) =>
        k.endsWith(".js"),
      )!;
      if (!bundleEntry) throw Error("No JS file generated");
      const [name, contents] = bundleEntry;
      if (contents.type !== "chunk") throw Error("Not a JS chunk");
      await mkdir(dirname(tmpfile), { recursive: true });
      await writeFile(tmpfile, contents.code);
      const outfile = tempfile();
      const x = new compiler({
        js: tmpfile,
        js_output_file: outfile,
        compilation_level: "ADVANCED",
        jscomp_off: "*",
      });
      try {
        await new Promise((resolve, reject) => {
          x.run((code, stdout, stderr) => {
            if (code != 0) reject({ code, stdout, stderr });
            resolve({ code, stdout, stderr });
          });
        })
      } catch (e) {
        console.error(e.stderr);
        throw e;
      }
      const newContent = await readFile(outfile, "utf8");
      bundle[name] = {
        ...contents,
        type: "chunk",
        code: newContent,
      };
    },
  };
}
