import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    hmr: {
      // Increase timeout to handle large file streaming
      timeout: 30000,
      // Use overlay only for errors, not warnings
      overlay: true,
      // Fix for WebSocket errors: explicitly set client port
      clientPort: 3000,
    },
    // Increase watch options timeout
    watch: {
      usePolling: false,
    },
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:3001",
        changeOrigin: true,
        secure: true,
      },
      "/health": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:3001",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
