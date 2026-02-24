import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    core: "src/core/index.ts",
    components: "src/components/index.ts",
    presets: "src/presets/index.ts",
  },
  format: ["esm"],
  target: "es2022",
  dts: true,
  splitting: true,
  clean: true,
  external: ["tone", "react", "react-dom", "three", "@react-three/fiber"],
});
