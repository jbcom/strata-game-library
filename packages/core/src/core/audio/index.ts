/**
 * Immersive 3D Spatial Audio Engine.
 *
 * Provides a managed system for audio playback, combining the reliability of
 * Howler.js with advanced spatial 3D audio features and environmental reverb.
 *
 * @packageDocumentation
 * @module core/audio
 * @category Player Experience
 *
 * @example
 * ```typescript
 * const soundManager = createSoundManager();
 * soundManager.play('music_bg', { volume: 0.5, loop: true });
 * ```
 */

export { Howl, Howler } from 'howler';
export {
  getAudioContext,
  isAudioContextUnlocked,
  resumeAudioContext,
  setupAutoUnlock,
  suspendAudioContext,
  unlockAudioContext,
} from './adapters/web';
export { createSoundManager, SoundManager } from './sound-manager';
export { createSpatialAudio, SpatialAudio } from './spatial';
export type {
  AudioBus,
  AudioConfig,
  AudioFormat,
  AudioListenerState,
  AudioMixer,
  DistanceModel,
  EnvironmentEffectConfig,
  EnvironmentPreset,
  SoundConfig,
  SpatialConfig,
} from './types';
export { DEFAULT_SPATIAL_CONFIG, ENVIRONMENT_PRESETS } from './types';
