import { libraryBuild } from "@jbcom/vite-game-preset/tsup";

// Externals are the declared peerDependencies: bundling either of them would
// ship a second copy of pixi and break `instanceof` against the host's.
export default libraryBuild({
  name: "@strata-game-library/pixi",
  external: [/^@strata-game-library\//, "pixi.js", "@pixi/react", "react"],
  jsx: "automatic",
});
