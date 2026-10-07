/**
 * @strata-game-library/vite
 *
 * Vite toolchain integration for Strata: shared Vite, Vitest and tsup
 * configuration for Strata packages and the games built on them.
 *
 * Every export is named explicitly rather than re-exported with `export *`,
 * so adding a file here does not silently widen the public API.
 *
 * @packageDocumentation
 */

export type { LibraryBuildOptions } from './tsup.js';
export { libraryBuild } from './tsup.js';
export type { DefineGamePresetOptions, HeavyDepsOptions } from './vite.js';
export { defineGamePreset } from './vite.js';
export type {
  BrowserTestFragment,
  DefineBrowserTestOptions,
  DefineUnitTestOptions,
  PlaywrightBrowserName,
  UnitTestFragment,
} from './vitest.js';
export { defaultBrowserLaunchArgs, defineBrowserTest, defineUnitTest } from './vitest.js';
