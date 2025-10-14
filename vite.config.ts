import { defineConfig, PluginOption } from "vite";
import { ldtkLoaderPlugin } from "./ldtk/plugin";
import closurePlugin from "./closure.plugin";
import soundPlugin from "./sound.plugin";
import inlinejsPlugin from "./inlinejs.plugin";

export default defineConfig(({ command }) => ({
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
  resolve: {
    alias: {
      ...(command == "build"
        ? {
            littlejsengine: new URL(
              "./node_modules/littlejsengine/dist/littlejs.esm.min.js",
              import.meta.url,
            ).pathname,
          }
        : null),
    },
  },
  plugins: [
    ldtkLoaderPlugin(),
    // closurePlugin(),
    soundPlugin(),
    inlinejsPlugin(),
  ],
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: "pla)ywright",
      instances: [{ browser: "chromium" }],
    },
  },
}));
