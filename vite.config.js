import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isLibBuild = process.env.BUILD_LIB === 'true';

// https://vite.dev/config/
export default defineConfig({
  base: '/map_kepler/',
  plugins: [react()],
  define: {
    // Node.js globals für Browser ersetzen
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": JSON.stringify({}),
    "process": JSON.stringify({ env: { NODE_ENV: "production" } }),
  },
  build: isLibBuild ? {
    lib: {
      entry: "src/litter-app.js",
      name: "LitterApp",
      fileName: "litter-app",
    },
    rollupOptions: {
      external: [],
    },
  } : {
    // Regular app build for GitHub Pages
    rollupOptions: {
      external: [],
    },
  },
});
