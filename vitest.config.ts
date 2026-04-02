import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
   test: {
      environment: "jsdom",
      globals: true,
      include: ["test/**/*.test.ts"],
   },
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "src"),
         buffer: path.resolve(__dirname, "node_modules/buffer/index.js"),
      },
   },
   define: {
      "process.env": {},
      global: "globalThis",
   },
})
