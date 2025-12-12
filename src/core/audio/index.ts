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

export { SoundManager, createSoundManager } from './sound-manager';
export { SpatialAudio, createSpatialAudio } from './spatial';

export type {
    AudioConfig,
    SoundConfig,
    SpatialConfig,
    AudioBus,
    AudioMixer,
    DistanceModel,
    AudioFormat,
    EnvironmentPreset,
    EnvironmentEffectConfig,
    AudioListenerState,
} from './types';

export { ENVIRONMENT_PRESETS, DEFAULT_SPATIAL_CONFIG } from './types';

export {
    isAudioContextUnlocked,
    unlockAudioContext,
    setupAutoUnlock,
    getAudioContext,
    suspendAudioContext,
    resumeAudioContext,
} from './adapters/web';
