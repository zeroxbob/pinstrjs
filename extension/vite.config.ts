import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const rootDir = path.resolve(__dirname, "..");

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "popup.html"),
        content: path.resolve(__dirname, "src/content.ts"),
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
      "@": path.resolve(rootDir, "src"),
      "@ext": path.resolve(__dirname, "src"),
    },
  },
  // Resolve node_modules from the parent directory
  optimizeDeps: {
    include: [
      "@noble/hashes/utils",
      "@noble/hashes/sha2",
      "@noble/hashes/argon2",
      "@noble/ciphers/aes",
      "@noble/ciphers/utils",
    ],
  },
});
