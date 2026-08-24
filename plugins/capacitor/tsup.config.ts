import { libraryBuild } from "@jbcom/vite-game-preset/tsup";

export default libraryBuild({
  name: "@strata-game-library/capacitor",
  entry: { index: "src/index.ts", "react/index": "src/react/index.ts" },
  external: ["@capacitor/core", "react"],
  jsx: "automatic",
  // ES2020, not the preset's ES2022: this ships into Capacitor WebViews, whose
  // floor is older than a modern browser's.
  overrides: { target: "es2020", splitting: true },
});
