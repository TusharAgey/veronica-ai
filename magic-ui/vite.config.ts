import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import {
  LLAMA_SERVER_HOST_PORT_PROXY,
  PYTHON_SERVER_HOST_PORT_PROXY,
} from "./src/utilities/const";

export default defineConfig({
  base: "/veronica-ai/",
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    // Add the proxy configuration here
    proxy: {
      "/llama": {
        target: LLAMA_SERVER_HOST_PORT_PROXY, // The HTTP URL of your Python server
        changeOrigin: true,
        secure: false, // <--- CRITICAL: Tells Vite to ignore that the target is HTTP
        rewrite: (path) => path.replace(/^\/llama/, ""), // Optional: Removes '/api' before sending to Python
      },
      "/api": {
        target: PYTHON_SERVER_HOST_PORT_PROXY, // The HTTP URL of your llama-server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""), // Optional: Removes '/api' before sending to Python
      },
    },
  },
});
