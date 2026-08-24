import { libraryBuild } from "@jbcom/vite-game-preset/tsup";

/**
 * No `jsx` setting: this package ships transformed JSX.
 *
 * The old config asked for `jsx: "preserve"`, but tsup's `Options` has no
 * `jsx` field, so esbuild never saw it and the JSX was transformed anyway.
 * Once the preset routed the setting through `esbuildOptions` correctly, the
 * build broke — preserved JSX cannot live in a `.js` file, and `package.json`
 * points `main`/`exports` at `dist/index.js`.
 *
 * Transformed output is what this package has always published and what
 * `exports` promises. Switching to preserved JSX would be a breaking change
 * to the artifact, not a bug fix, so the ineffective setting is dropped
 * rather than made to work.
 */
export default libraryBuild({
  name: "@strata-game-library/react-native",
  entry: ["src/index.tsx"],
  external: ["react", "react-native", "@strata-game-library/core"],
});
