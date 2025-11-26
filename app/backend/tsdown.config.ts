import { defineConfig } from "tsdown";

export default defineConfig({
  format: "esm",
  platform: "node",
  entry: "index.ts",
  outDir: "api",
  outExtensions: ({ format }) => ({ js: format === "es" ? ".js" : ".cjs" }),
});
