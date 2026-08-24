import { libraryBuild } from "@strata-game-library/vite/tsup";

export default libraryBuild({
  name: "@strata-game-library/astro",
  entry: { index: "src/index.ts" },
  external: ["astro", "vite"],
});
