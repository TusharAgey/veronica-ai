import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import dns from "dns";
import http from "http";

// Ensure Vite resolves to IPv4 scanning first to avoid it waiting for IPv6 timeouts in certain local network setups. (adds about 5 seconds of latency ufh.)
dns.setDefaultResultOrder("ipv4first");

// Only for local development. For production deployment, update these to actual server URIs in utilities/const.ts
const LLAMA_SERVER_HOST_PORT_PROXY = "http://localhost:6792";
const PYTHON_SERVER_HOST_PORT_PROXY = "http://localhost:8080";

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
        agent: new http.Agent({ keepAlive: false }), // Disable keep-alive to prevent hanging connections
      },
      "/api": {
        target: PYTHON_SERVER_HOST_PORT_PROXY, // The HTTP URL of your llama-server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""), // Optional: Removes '/api' before sending to Python
        agent: new http.Agent({ keepAlive: false }), // Disable keep-alive to prevent hanging connections
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    // Vite 8 uses Rolldown. The deprecated `rollupOptions` is replaced by `rolldownOptions`.
    // `manualChunks` is a function in Rolldown, not an object.
    // The recommended approach is `codeSplitting` with `groups` using `test` (regex) and `name`.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor",
              test: /node_modules[\\/](react|react-dom|react-redux|@reduxjs\/toolkit)/,
              priority: 10,
              minSize: 0,
            },
            {
              name: "vendor-animation",
              test: /node_modules[\\/]framer-motion/,
              priority: 10,
              minSize: 0,
            },
            {
              name: "vendor-three",
              test: /node_modules[\\/]three/,
              priority: 10,
              minSize: 0,
            },
            {
              name: "vendor-markdown",
              test: /node_modules[\\/](react-markdown|rehype-highlight|rehype-raw|remark-gfm)/,
              priority: 10,
              minSize: 0,
            },
            {
              name: "vendor-icons",
              test: /node_modules[\\/]lucide-react/,
              priority: 10,
              minSize: 0,
            },
          ],
        },
      },
    },
  },
});
