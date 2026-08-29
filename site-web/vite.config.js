import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // The demo talks to the text server in dev; in production both sit behind
    // the same hostname so /api/demo needs no rewriting.
    proxy: { "/api": { target: "http://localhost:3101", changeOrigin: true } },
  },
  build: { outDir: "build", sourcemap: false },
});
