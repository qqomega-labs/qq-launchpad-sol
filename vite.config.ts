import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

/**
 * @dev Appends `globalThis.Buffer = Buffer` to the buffer module itself, so the
 * polyfill runs the moment any chunk first imports buffer - not in the app entry.
 * Fixes "Can't find variable: Buffer" where wallet/meteora chunks initialize
 * before the main entry body executes.
 */
function bufferGlobalPlugin(): Plugin {
   return {
      name: "buffer-global",
      transform(code, id) {
         if (id.includes("node_modules/buffer/index.js")) {
            return code + "\nglobalThis.Buffer = Buffer;\n"
         }
      },
   }
}

export default defineConfig({
   plugins: [react(), tailwindcss(), bufferGlobalPlugin()],
   server: {
      proxy: {
         "/gt-proxy": {
            target: "https://api.geckoterminal.com",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/gt-proxy/, "/api/v2"),
         },
      },
   },
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
   optimizeDeps: {
      include: ["buffer"],
   },
   define: {
      "process.env": {},
      global: "globalThis",
   },
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "src"),
         // Absolute path forces Vite 8 to treat this as an npm package,
         // bypassing the Node.js built-in externalization check.
         buffer: path.resolve(__dirname, "node_modules/buffer/index.js"),
      },
   },
})
