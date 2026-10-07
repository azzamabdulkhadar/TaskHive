import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:    ["react", "react-dom", "react-router-dom"],
          redux:     ["@reduxjs/toolkit", "react-redux", "redux-persist"],
          ui:        ["framer-motion", "lucide-react", "recharts"],
          http:      ["axios", "dayjs"],
        },
      },
    },
  },
});
