import { defineConfig } from "tsdown"

export default defineConfig({
  format: "esm",
  platform: "node",
  entry: "index.ts",
  outDir: "dist",
  outExtensions: ({ format }) => ({ js: format === "es" ? ".js" : ".cjs" }),
});
