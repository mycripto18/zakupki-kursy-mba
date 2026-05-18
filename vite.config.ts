import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Plugin: after build, move SPA index.html → panel.html
// so static public/index.html is preserved as the real index.html
function staticIndexPlugin(): Plugin {
  return {
    name: "static-index",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      const builtIndex = path.join(dist, "index.html");
      const panelHtml = path.join(dist, "panel.html");

      if (fs.existsSync(builtIndex)) {
        // The built index.html is the SPA entry — rename to panel.html
        fs.renameSync(builtIndex, panelHtml);
      }

      // public/index.html was already copied to dist/ by Vite,
      // but got overwritten by the SPA build. We need to re-copy it.
      const staticSource = path.resolve(__dirname, "public", "index.html");
      if (fs.existsSync(staticSource)) {
        fs.copyFileSync(staticSource, builtIndex);
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    staticIndexPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/app.js",
      },
    },
  },
}));
