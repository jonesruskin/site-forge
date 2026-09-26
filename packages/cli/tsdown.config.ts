import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "create-site": "src/bin/create-site.ts",
    site: "src/bin/site.ts",
  },
  format: "esm",
  platform: "node",
  target: "node20",
  clean: true,
  dts: false,
  sourcemap: false,
});
