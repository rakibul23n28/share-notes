import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://192.168.0.108:5000", // Replace with your backend server URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
