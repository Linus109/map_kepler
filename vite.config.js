import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Node.js globals für Browser ersetzen
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": JSON.stringify({}),
    "process": JSON.stringify({ env: { NODE_ENV: "production" } }),
  },
  build: {
    lib: {
      entry: "src/litter-app.js",
      name: "LitterApp",
      fileName: "litter-app",
    },
    rollupOptions: {
      // Keine externen Dependencies - alles bundlen
      external: [],
    },
  },
});
