import { libraryBuild } from "@strata-game-library/vite/tsup";

export default libraryBuild({
  name: "@strata-game-library/r3f",
  entry: {
    index: "src/index.ts",
    "components/index": "src/components/index.ts",
    "hooks/index": "src/hooks/index.ts",
    "mount/index": "src/mount/index.ts",
  },
  external: [
    /^@strata-game-library\//,
    /^@react-three\//,
    "react",
    "react-dom",
    "three",
    "postprocessing",
    "zustand",
    "yuka",
    "xstate",
    "@xstate/react",
    "howler",
    "leva",
    "maath",
    "miniplex",
    "miniplex-react",
    "tunnel-rat",
    "zundo",
    "immer",
  ],
  jsx: "automatic",
});
