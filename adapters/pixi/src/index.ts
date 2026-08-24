/**
 * @arcade-cabinet/pixi-mount — public API.
 *
 * Framework-agnostic Pixi 8 Application mount/unmount lifecycle. The
 * optional React hook lives at `@arcade-cabinet/pixi-mount/react` so the
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
