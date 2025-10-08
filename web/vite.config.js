import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Checker from "vite-plugin-checker";

export default defineConfig({
  plugins: [
    react(),
    Checker({
      typescript: false, // ou false, se não usar TS
      overlay: true,
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  server: {
    host: true, // Permite conexões externas (essencial para Docker)
    port: 5173,
    watch: {
      usePolling: true, // Necessário para hot reload no Docker Windows
      interval: 100, // Intervalo de polling em ms
    },
    hmr: {
      port: 5173, // Porta para Hot Module Replacement
    },
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        // Não force Access-Control-Allow-Origin='*' pois quebra cookies com credentials
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          antd: ["antd"],
          router: ["react-router-dom"],
          utils: ["axios", "jwt-decode", "moment"],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
