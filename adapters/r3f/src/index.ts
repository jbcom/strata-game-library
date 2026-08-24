/**
 * @strata-game-library/r3f
 *
 * React Three Fiber components for the Strata Game Library.
 * Provides terrain, water, vegetation, sky, volumetrics, physics,
 * animation, audio, camera, input, and UI components.
 *
 * @packageDocumentation
 * @module r3f
 */

// All R3F components
export * from './components/index.js';

// React hooks
export * from './hooks/index.js';
// Canvas mount primitives — parent-sized host contract, phase gating,
// WebGL context recovery. Explicitly named (not `export *`) so adding a
// file under mount/ cannot silently widen the public API.
export {
  STRATA_CANVAS_HOST_CLASS,
  STRATA_CANVAS_HOST_CSS,
  StrataCanvas,
  type StrataCanvasHostProps,
  type StrataCanvasProps,
  type StrataCanvasQuality,
  strataCanvasHostStyle,
} from './mount/index.js';
// StrataGame top-level component
export {
  StrataGame,
  useGame,
  useGameStatus,
  useMode,
  useScene,
  useTransition,
} from './StrataGame.js';
