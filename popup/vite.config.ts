import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";

// Uncomment visualizer to see bundle size
// import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    legalComments: "external",
  },
  plugins: [
    react(),
    // Uncomment visualizer to see bundle size
    // visualizer({ open: true })
  ] as PluginOption[],
});
