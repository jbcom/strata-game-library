/**
 * Audio Components
 *
 * React components for spatial audio in Three.js scenes.
 * @module components/audio
 */

export { AmbientAudio } from './AmbientAudio';
export { AudioEmitter } from './AudioEmitter';
export { AudioEnvironment } from './AudioEnvironment';
export { AudioListener } from './AudioListener';
export { AudioZone } from './AudioZone';
export {
    AudioProvider,
    useAudioContext,
    useAudioListener,
    useAudioManager,
    useSpatialAudio,
} from './context';
export { FootstepAudio } from './FootstepAudio';
export { PositionalAudio } from './PositionalAudio';
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
} from './types';
export { WeatherAudio } from './WeatherAudio';
