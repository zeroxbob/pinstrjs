import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  // GitHub Pages base path - MUST match your repository name!
  // For 'pinstrjs' repo: base = '/pinstrjs/'
  // For 'username.github.io' repo: base = '/'
  base: '/pinstrjs/',
  server: {
    host: "localhost",
    port: 5173, // Changed from 8080 to avoid macOS WebSocket conflicts
    strictPort: false, // Allow fallback to next available port
    // Disable WebSocket compression to prevent RSV1 errors
    ws: {
      perMessageDeflate: false,
      maxPayload: 100 * 1024 * 1024, // 100MB
    },
  },
  plugins: [
    react(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    onConsoleLog(log) {
      return !log.includes("React Router Future Flag Warning");
    },
    env: {
      DEBUG_PRINT_LIMIT: '0', // Suppress DOM output that exceeds AI context windows
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));