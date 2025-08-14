import { defineConfig, PluginOption } from "vite";
import { ldtkLoaderPlugin } from "./ldtk/plugin";

export default defineConfig({
  build: {
    minify: "terser",
    target: "esnext",
  },
  plugins: [
    ldtkLoaderPlugin(),
    // 234
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
