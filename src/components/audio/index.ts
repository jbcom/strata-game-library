/**
 * Audio Components
 *
 * React components for spatial audio in Three.js scenes.
 * @module components/audio
 */

export {
    AudioProvider,
    useAudioContext,
    useAudioManager,
    useSpatialAudio,
    useAudioListener,
} from './context';
export { AudioListener } from './AudioListener';
export { PositionalAudio } from './PositionalAudio';
export { AmbientAudio } from './AmbientAudio';
export { AudioZone } from './AudioZone';
export { AudioEmitter } from './AudioEmitter';
export { AudioEnvironment } from './AudioEnvironment';
export { FootstepAudio } from './FootstepAudio';
export { WeatherAudio } from './WeatherAudio';

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
} from './types';
