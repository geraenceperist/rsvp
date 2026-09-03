import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        gallery: resolve(import.meta.dirname, "index.html"),
        afterglow: resolve(import.meta.dirname, "afterglow.html"),
        glasshouse: resolve(import.meta.dirname, "glasshouse.html"),
        electric: resolve(import.meta.dirname, "electric.html"),
        aeterna: resolve(import.meta.dirname, "aeterna.html"),
        jinxi: resolve(import.meta.dirname, "jinxi.html"),
      },
    },
  },
});
