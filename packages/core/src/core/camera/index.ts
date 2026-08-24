/**
 * Camera rigs and controllers.
 *
 * @packageDocumentation
 */

export type {
  CameraPath,
  CameraShakeConfig,
  CameraShakeType,
  FOVTransitionConfig,
  ScreenShakeIntensity,
} from './camera.js';
export {
  CameraShake,
  CameraShakeCore,
  calculateHeadBob,
  calculateLookAhead,
  calculateScreenShakeIntensity,
  evaluateCatmullRom,
  FOVTransition,
  lerpVector3,
  slerp,
  smoothDampScalar,
  smoothDampVector3,
} from './camera.js';
