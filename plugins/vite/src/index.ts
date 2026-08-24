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

export * from './tsup.js';
export * from './vite.js';
export * from './vitest.js';
