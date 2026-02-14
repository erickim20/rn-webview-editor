import { defineConfig } from "vite";
import { resolve } from "path";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  root: "editor",
  publicDir: "public",
  build: {
    outDir: resolve(__dirname, "dist-editor"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "editor/index.html"),
    },
  },
  plugins: [viteSingleFile()],
});
