import { libraryBuild } from "@strata-game-library/vite/tsup";

export default libraryBuild({
  name: "@strata-game-library/reactylon",
  entry: { index: "src/index.ts", "mount/index": "src/mount/index.ts" },
  external: [/^@strata-game-library\//, /^@babylonjs\//, "react", "reactylon"],
  jsx: "automatic",
});
