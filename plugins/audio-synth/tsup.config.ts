import { libraryBuild } from "@jbcom/vite-game-preset/tsup";

export default libraryBuild({
  name: "@strata-game-library/audio-synth",
  entry: {
    index: "src/index.ts",
    core: "src/core/index.ts",
    components: "src/components/index.ts",
    presets: "src/presets/index.ts",
  },
  external: ["tone", "react", "react-dom", "three", "@react-three/fiber"],
  // Splitting on: the four entries share substantial core code, and chunking
  // it means a consumer importing one entry does not duplicate the others.
  overrides: { splitting: true },
});
