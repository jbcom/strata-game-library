import { libraryBuild } from "@strata-game-library/vite/tsup";

// The `./clients/*` subpath is declared in package.json's exports map, so each
// client module must be emitted as its own entry — otherwise the declared
// subpath resolves to nothing for a consumer.
export default libraryBuild({
  name: "@strata-game-library/model-synth",
  entry: {
    index: "src/index.ts",
    "clients/animations": "src/clients/animations.ts",
    "clients/base": "src/clients/base.ts",
    "clients/retexture": "src/clients/retexture.ts",
    "clients/rigging": "src/clients/rigging.ts",
    "clients/text-to-3d": "src/clients/text-to-3d.ts",
  },
});
