import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  base: "./", // giữ nguyên để load đúng trong extension
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"), // app chính
        popup: resolve(__dirname, "popup.html"), // popup React
        secondframe: resolve(__dirname, "secondframe.html"), // secondframe React
      },
      output: {
        manualChunks: {
          opencc: ["opencc-js"], // giữ nguyên tách opencc-js
        },
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
