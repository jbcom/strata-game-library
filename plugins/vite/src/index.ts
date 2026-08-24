/**
 * @strata-game-library/vite
 *
 * Opinionated Vite and Vitest configuration for TypeScript browser games.
 *
 * Extracted from a private fleet preset. Only the genuinely generic half moved:
 * the Capacitor wiring, CLI, and private-registry release machinery stayed
 * behind, because they encode one organisation's publishing choices rather
 * than anything a stranger could use.
 */

export {
  libraryBuild,
} from './tsup.js';
export type {
  LibraryBuildOptions,
} from './tsup.js';
export {
  defineGamePreset,
} from './vite.js';
export type {
  DefineGamePresetOptions,
  HeavyDepsOptions,
} from './vite.js';
export {
  defaultBrowserLaunchArgs,
  defineBrowserTest,
  defineUnitTest,
} from './vitest.js';
export type {
  BrowserTestFragment,
  DefineBrowserTestOptions,
  DefineUnitTestOptions,
  PlaywrightBrowserName,
  UnitTestFragment,
} from './vitest.js';
