/**
 * Root umbrella surface for the single-package install.
 *
 * Keep the main entrypoint runtime-light and framework-agnostic.
 * Optional runtime adapters stay on explicit subpaths such as
 * `strata-game-library/r3f` and `strata-game-library/reactylon`.
 */
export * from './api';
export * as Compose from './compose';
export * as Core from './core';
export * as Game from './game';
export * from './presets';
export * as Presets from './presets';
export * from './shaders';
export * as Shaders from './shaders';
export * as Utils from './utils';
export * as World from './world';
