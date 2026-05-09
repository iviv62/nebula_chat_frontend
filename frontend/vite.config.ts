import { defineConfig } from "vite";

const backendTarget = "http://127.0.0.1:8000";

export default defineConfig({
  server: {
    proxy: {
      "/auth": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/rooms": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/conversations": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/voice": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/upload": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/notifications": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/ws": {
        target: backendTarget,
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
