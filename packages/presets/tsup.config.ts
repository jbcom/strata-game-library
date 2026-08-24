import { libraryBuild } from "@strata-game-library/vite/tsup";
import { globSync } from "glob";
import path from "node:path";

const entry = globSync(["src/**/index.ts", "src/structures/building.ts"]).reduce<
  Record<string, string>
>((acc, file) => {
  acc[path.relative("src", file).replace(/\\/g, "/").replace(".ts", "")] = file;
  return acc;
}, {});

export default libraryBuild({
  name: "@strata-game-library/presets",
  entry,
  external: [
    "@strata-game-library/core",
    "@strata-game-library/r3f",
    "@react-three/fiber",
    "react",
    "three",
    "yuka",
  ],
  jsx: "automatic",
  // preserveSymlinks: false so dts generation follows the workspace symlink
  // into @strata-game-library/core and resolves its types.
  overrides: { dts: { compilerOptions: { preserveSymlinks: false } } },
});
