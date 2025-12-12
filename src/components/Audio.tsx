/**
 * Audio Components
 *
 * React components for spatial audio in Three.js scenes.
 * Provides positional audio, ambient audio, audio zones, and environmental effects.
 *
 * @module components/Audio
 * @deprecated Import from 'components/audio' directly for better tree-shaking.
 */

export type {
    AmbientAudioProps,
    AmbientAudioRef,
    AudioContextValue,
    AudioEmitterProps,
    AudioEmitterRef,
    AudioEnvironmentProps,
    AudioListenerProps,
    AudioProviderProps,
    AudioZoneProps,
    AudioZoneRef,
    FootstepAudioProps,
    FootstepAudioRef,
    PositionalAudioProps,
    PositionalAudioRef,
    WeatherAudioProps,
} from './audio';
export {
    AmbientAudio,
    AudioEmitter,
    AudioEnvironment,
    AudioListener,
    AudioProvider,
    AudioZone,
    FootstepAudio,
    PositionalAudio,
    useAudioContext,
    useAudioListener,
    useAudioManager,
    useSpatialAudio,
    WeatherAudio,
} from './audio';
