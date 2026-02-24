import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm"],
  dts: true,
  target: "es2022",
  jsx: "preserve",
  external: ["react", "react-native", "@strata-game-library/core"],
  clean: true,
  sourcemap: true,
});
