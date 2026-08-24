import { libraryBuild } from "@jbcom/vite-game-preset/tsup";

export default libraryBuild({
  name: "@strata-game-library/astro",
  entry: { index: "src/index.ts" },
  external: ["astro", "vite"],
});
