import { defineConfig, PluginOption } from "vite";
import { ldtkLoaderPlugin } from "./ldtk/plugin";
import closurePlugin from "./closure.plugin";
import soundPlugin from "./sound.plugin";
import inlinejsPlugin from "./inlinejs.plugin";

export default defineConfig({
  build: {
    modulePreload: {
      polyfill: false,
    },
    assetsInlineLimit: 1e9,
    minify: "terser",
    // minify: false,
    target: "esnext",
    sourcemap: false,
  },
  plugins: [
    ldtkLoaderPlugin(),
    closurePlugin(),
    soundPlugin(),
    inlinejsPlugin(),
  ],
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
  },
});
