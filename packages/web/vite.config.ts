import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@fontops/core": path.resolve(__dirname, "../core/src/index.ts"),
    },
  },
  worker: {
    format: "es",
  },
  build: {
    target: "es2022",
  },
  optimizeDeps: {
    exclude: ["hb-subset-wasm", "woff2-encoder"],
  },
  assetsInclude: ["**/*.wasm"],
});
