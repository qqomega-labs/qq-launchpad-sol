import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig({
   plugins: [react(), tailwindcss()],
   build: {
      target: "es2020",
      // Meteora SDK is ~700 kB minified - inherent to the dependency, cannot be reduced
      chunkSizeWarningLimit: 750,
      rollupOptions: {
         output: {
            manualChunks(id) {
               if (id.includes("react-dom")) return "vendor-react"
               if (id.includes("@solana/web3.js")) return "solana"
               if (id.includes("@jup-ag/wallet-adapter") || id.includes("@solana/wallet-adapter")) return "wallet"
               if (id.includes("@meteora-ag")) return "meteora"
               if (id.includes("lightweight-charts")) return "chart"
            },
         },
      },
   },
   define: {
      "process.env": {},
      global: "globalThis",
   },
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "src"),
         buffer: "buffer",
      },
   },
})
