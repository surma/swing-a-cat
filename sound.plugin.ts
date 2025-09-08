import { PluginOption } from "vite";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const keys = [
  "volume",
  "randomness",
  "frequency",
  "attack",
  "sustain",
  "release",
  "shape",
  "shapeCurve",
  "slide",
  "deltaSlide",
  "pitchJump",
  "pitchJumpTime",
  "repeatTime",
  "noise",
  "modulation",
  "bitCrush",
  "delay",
  "sustainVolume",
  "decay",
  "tremolo",
  "filter",
];

const PREFIX = "sound:";
export default function SoundPlugin(_opts = {}): PluginOption {
  return {
    name: "sound-plugin",
    async resolveId(id, importer) {
      if (!id.startsWith(PREFIX)) return;
      const realId = id.slice(PREFIX.length);
      const result = await this.resolve(realId, importer);
      if (!result) return null;
      return PREFIX + result.id.slice(0, ".json".length * -1);
    },
    async load(id, _options) {
      if (!id.startsWith(PREFIX)) return;
      const realId = id.slice(PREFIX.length);

      const rawContent = await readFile(realId + ".json", "utf8");
      const content = JSON.parse(rawContent);

      content.sounds = content.sounds.map((sound) =>
        keys.map((key) => sound[key]),
      );
      return `export default ${JSON.stringify(content.sounds)}`;
    },
  };
}
