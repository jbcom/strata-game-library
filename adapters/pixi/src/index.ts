/**
 * Pixi adapter public API.
 *
 * Framework-agnostic Pixi 8 Application mount/unmount lifecycle. The
 * optional React hook lives in the separate React module so the
 * core entry never touches react.
 */

export { applyFilterResolutionFix } from './filter-resolution-fix.js';
export {
  detectReduceMotion,
  getDpr,
  type MountOptions,
  mountPixi,
  type PixiMountHandle,
} from './mount.js';
