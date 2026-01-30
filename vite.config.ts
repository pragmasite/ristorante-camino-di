import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// Project root is passed via environment variable from the CLI,
// or defaults to cwd (for running vite directly from siteforge dir)
const projectRoot = process.env.SITEFORGE_PROJECT_ROOT || process.cwd();
const assetsDir = path.resolve(projectRoot, "assets");
const distDir = path.resolve(projectRoot, "dist");

// Plugin to copy assets directory to dist/assets during build
function copyAssetsPlugin() {
  return {
    name: "copy-assets",
    closeBundle() {
      const targetDir = path.join(distDir, "assets");
      if (fs.existsSync(assetsDir)) {
        fs.cpSync(assetsDir, targetDir, { recursive: true });
        console.log(`[copy-assets] Copied assets/ to dist/assets/`);
      }
    },
  };
}

// Plugin to serve assets during dev
function serveAssetsPlugin() {
  return {
    name: "serve-assets",
    configureServer(server) {
      server.middlewares.use("/assets", (req, res, next) => {
        const filePath = path.join(assetsDir, req.url || "");
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader("Content-Type", getMimeType(filePath));
          fs.createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });
    },
  };
}

function getMimeType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".pdf": "application/pdf",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), serveAssetsPlugin(), copyAssetsPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // @config alias points to the resolved JSON config in .generated/
      "@config": path.resolve(projectRoot, ".generated/site-config.json"),
    },
  },
  // Don't use publicDir - we handle assets manually to preserve the assets/ prefix
  publicDir: false,
  // Handle SPA routing for language-prefixed URLs
  build: {
    // Output to project root's dist/ directory
    outDir: distDir,
    emptyOutDir: true,
    // Put build artifacts in _build/ to avoid conflicts with user assets/
    assetsDir: "_build",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-slot",
            "@radix-ui/react-tooltip",
          ],
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
  },
});
