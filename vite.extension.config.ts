import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const extensionDir = path.resolve(__dirname, "extension");

export default defineConfig({
  root: extensionDir,
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          config: path.resolve(__dirname, "tailwind.config.ts"),
        }),
        autoprefixer(),
      ],
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(extensionDir, "popup.html"),
        content: path.resolve(extensionDir, "src/content.ts"),
        injected: path.resolve(extensionDir, "src/injected.ts"),
        background: path.resolve(extensionDir, "src/background.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@ext": path.resolve(extensionDir, "src"),
    },
  },
});
