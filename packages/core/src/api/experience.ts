/**
 * @module Experience
 * @category Player Experience
 *
 * Player Experience - Cameras, Input, Audio, and UI
 *
 * Everything that connects the player to your game - how they see it,
 * how they control it, what they hear, and what information they receive.
 *
 * @example
 * ```tsx
 * import { FollowCamera, AudioProvider, HealthBar } from '@jbcom/strata/api/experience';
 *
 * function Game() {
 *   return (
 *     <AudioProvider>
 *       <FollowCamera target={playerRef} distance={5} />
 *       <HealthBar current={75} max={100} />
 *     </AudioProvider>
 *   );
 * }
 * ```
 */

// Note: React components (FollowCamera, AudioProvider, etc.) are now in @strata-game-library/r3f.
export type {
  AudioBus,
  AudioConfig,
  AudioFormat,
  AudioListenerState,
  AudioMixer,
  CameraPath,
  CameraShakeConfig,
  CrosshairConfig,
  DamageNumberConfig,
  DialogChoice,
  DialogConfig,
  DialogLine,
  DistanceModel,
  DragState,
  EnvironmentEffectConfig,
  EnvironmentPreset,
  FOVTransitionConfig,
  GamepadState,
  HapticPattern,
  InputAxis,
  InputEvent,
  InputManagerConfig,
  InventoryConfig,
  InventorySlot,
  MinimapConfig,
  MinimapMarker,
  NameplateConfig,
  NotificationConfig,
  PointerState,
  ProgressBarConfig,
  ScreenPosition,
  ScreenShakeIntensity,
  SoundConfig,
  SpatialConfig,
  TextDirection,
  TooltipConfig,
  UIAnchor,
} from '../core';
// Camera Systems - Core utilities
// Input Handling - Core utilities
// Audio System - Core utilities
// Game UI - Core utilities
export {
  angleToAxis,
  axisToAngle,
  axisToMagnitude,
  CameraShake as CoreCameraShake,
  calculateFade,
  calculateHeadBob,
  calculateLookAhead,
  calculateScreenShakeIntensity,
  clampAxis,
  clampProgress,
  createDefaultCrosshair,
  createDefaultDamageNumber,
  createDefaultDialog,
  createDefaultInventory,
  createDefaultMinimap,
  createDefaultNameplate,
  createDefaultNotification,
  createDefaultProgressBar,
  createDefaultTooltip,
  createInputManager,
  createSoundManager,
  createSpatialAudio,
  DEFAULT_SPATIAL_CONFIG,
  ENVIRONMENT_PRESETS,
  easeInCubic,
  easeInOutCubic,
  evaluateCatmullRom,
  FOVTransition,
  formatNumber,
  formatProgressText,
  getAnchorOffset,
  getAudioContext,
  getDamageNumberColor,
  getNotificationColor,
  getNotificationIcon,
  getTextDirection,
  HapticFeedback,
  Howl,
  Howler,
  InputManager,
  InputStateMachine,
  isAudioContextUnlocked,
  lerp,
  lerpVector3,
  normalizeAxisValue,
  resumeAudioContext,
  SoundManager,
  SpatialAudio,
  screenToWorld,
  setupAutoUnlock,
  slerp,
  smoothDamp,
  smoothDampScalar,
  smoothDampVector3,
  suspendAudioContext,
  unlockAudioContext,
  worldToScreen,
} from '../core';
