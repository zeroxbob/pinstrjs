import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      // Use polling instead of WebSocket to avoid browser extension conflicts
      // This prevents "RSV1 must be clear" errors caused by extensions
      protocol: 'ws',
      host: 'localhost',
      port: 8080,
    },
    // Disable WebSocket compression
    ws: {
      perMessageDeflate: false,
    },
    // Watch files using polling as a fallback
    watch: {
      usePolling: true,
      interval: 1000,
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