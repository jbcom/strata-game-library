/**
 * Audio Module
 *
 * Re-exports Howler.js for 2D audio and Strata wrappers for
 * managed audio playback with spatial 3D audio support.
 *
 * @module core/audio
 * @public
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
