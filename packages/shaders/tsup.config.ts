import { libraryBuild } from "@jbcom/vite-game-preset/tsup";
import { globSync } from "glob";
import path from "node:path";

// Every top-level shader module is its own entry so consumers can import one
// shader without pulling the rest into their bundle.
const entry = globSync(["src/*.ts", "src/materials/index.ts"]).reduce<
  Record<string, string>
>((acc, file) => {
  acc[path.relative("src", file).replace(/\\/g, "/").replace(".ts", "")] = file;
  return acc;
}, {});

export default libraryBuild({
  name: "@strata-game-library/shaders",
  entry,
  external: ["three"],
});
