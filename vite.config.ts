import { defineConfig, PluginOption } from "vite";
import { ldtkLoaderPlugin } from "./ldtk/plugin";
import closurePlugin from "./closure.plugin";

export default defineConfig({
  build: {
    modulePreload: {
      polyfill: false,
    },
    assetsInlineLimit: 0,
    minify: "terser",
    // minify: false,
    target: "esnext",
    sourcemap: true,
  },
  plugins: [ldtkLoaderPlugin(), closurePlugin()],
  resolve: {
    alias: {
      littlejsengine: new URL("./littlejs.esm.js", import.meta.url).pathname,
    },
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
  },
});
