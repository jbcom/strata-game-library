/**
 * @strata-game-library/vite
 *
 * Vite toolchain integration for Strata: shared Vite, Vitest and tsup
 * configuration for Strata packages and the games built on them.
 *
 * Extracted from a private fleet preset. Only the genuinely generic half moved:
 * the Capacitor wiring, CLI, and private-registry release machinery stayed
 * behind, because they encode one organisation's publishing choices rather
 * than anything a stranger could use.
 *
 * Every export is named explicitly rather than re-exported with `export *`,
 * so adding a file here does not silently widen the public API.
 *
 * @packageDocumentation
 */

export { defineGamePreset } from "./vite.js";
export type { DefineGamePresetOptions, HeavyDepsOptions } from "./vite.js";

export { defaultBrowserLaunchArgs, defineBrowserTest, defineUnitTest } from "./vitest.js";
export type {
  BrowserTestFragment,
  DefineBrowserTestOptions,
  DefineUnitTestOptions,
  PlaywrightBrowserName,
  UnitTestFragment,
} from "./vitest.js";

export { libraryBuild } from "./tsup.js";
export type { LibraryBuildOptions } from "./tsup.js";
