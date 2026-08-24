import { libraryBuild } from "@strata-game-library/vite/tsup";

export default libraryBuild({
  name: "@strata-game-library/yuka",
  entry: { index: "src/index.ts" },
  external: ["@react-three/drei", "@react-three/fiber", "react", "three", "yuka"],
  jsx: "automatic",
});
