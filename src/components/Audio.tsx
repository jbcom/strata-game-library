/**
 * Audio Components
 *
 * React components for spatial audio in Three.js scenes.
 * Provides positional audio, ambient audio, audio zones, and environmental effects.
 *
 * @module components/Audio
 * @deprecated Import from 'components/audio' directly for better tree-shaking.
 */

export {
    AudioProvider,
    useAudioContext,
    useAudioManager,
    useSpatialAudio,
    useAudioListener,
    AudioListener,
    PositionalAudio,
    AmbientAudio,
    AudioZone,
    AudioEmitter,
    AudioEnvironment,
    FootstepAudio,
    WeatherAudio,
} from './audio';

export type {
    AudioContextValue,
    AudioProviderProps,
    AudioListenerProps,
    PositionalAudioProps,
    PositionalAudioRef,
    AmbientAudioProps,
    AmbientAudioRef,
    AudioZoneProps,
    AudioZoneRef,
    AudioEmitterProps,
    AudioEmitterRef,
    AudioEnvironmentProps,
    FootstepAudioProps,
    FootstepAudioRef,
    WeatherAudioProps,
} from './audio';
