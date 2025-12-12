/**
 * Audio Component Types
 *
 * Shared type definitions for audio components.
 * @module components/audio
 */

import type * as THREE from 'three';
import type {
    SoundManager,
    SpatialAudio,
    DistanceModel,
    EnvironmentPreset,
} from '../../core/audio';

/**
 * Context value provided by AudioProvider
 */
export interface AudioContextValue {
    soundManager: SoundManager | null;
    spatialAudio: SpatialAudio | null;
    listener: THREE.AudioListener | null;
    isReady: boolean;
}

/**
 * Props for the AudioProvider component
 */
export interface AudioProviderProps {
    children: React.ReactNode;
    masterVolume?: number;
}

/**
 * Props for the AudioListener component
 */
export interface AudioListenerProps {
    camera?: THREE.Camera;
}

/**
 * Props for the PositionalAudio component
 */
export interface PositionalAudioProps {
    url: string;
    position?: [number, number, number];
    loop?: boolean;
    autoplay?: boolean;
    volume?: number;
    refDistance?: number;
    maxDistance?: number;
    rolloffFactor?: number;
    distanceModel?: DistanceModel;
    playbackRate?: number;
    onLoad?: () => void;
    onEnd?: () => void;
}

/**
 * Ref interface for PositionalAudio imperative control
 */
export interface PositionalAudioRef {
    play: () => void;
    pause: () => void;
    stop: () => void;
    setVolume: (volume: number) => void;
    setPosition: (x: number, y: number, z: number) => void;
    isPlaying: () => boolean;
}

/**
 * Props for the AmbientAudio component
 */
export interface AmbientAudioProps {
    url: string;
    volume?: number;
    loop?: boolean;
    autoplay?: boolean;
    fadeTime?: number;
    onLoad?: () => void;
}

/**
 * Ref interface for AmbientAudio imperative control
 */
export interface AmbientAudioRef {
    play: () => void;
    stop: () => void;
    fadeIn: (duration: number) => void;
    fadeOut: (duration: number) => void;
    setVolume: (volume: number, fadeTime?: number) => void;
    isPlaying: () => boolean;
}

/**
 * Props for the AudioZone component
 */
export interface AudioZoneProps {
    position?: [number, number, number];
    geometry: 'box' | 'sphere';
    size?: [number, number, number];
    radius?: number;
    audioUrl?: string;
    audioVolume?: number;
    audioLoop?: boolean;
    fadeTime?: number;
    onEnter?: () => void;
    onExit?: () => void;
    debug?: boolean;
    children?: React.ReactNode;
}

/**
 * Ref interface for AudioZone
 */
export interface AudioZoneRef {
    isInside: () => boolean;
    getAudio: () => AmbientAudioRef | null;
}

/**
 * Props for the AudioEmitter component
 */
export interface AudioEmitterProps {
    url: string;
    position?: [number, number, number];
    follow?: React.RefObject<THREE.Object3D>;
    loop?: boolean;
    autoplay?: boolean;
    volume?: number;
    refDistance?: number;
    maxDistance?: number;
    rolloffFactor?: number;
    distanceModel?: DistanceModel;
    onLoad?: () => void;
}

/**
 * Ref interface for AudioEmitter
 */
export interface AudioEmitterRef {
    play: () => void;
    stop: () => void;
    pause: () => void;
    setVolume: (volume: number) => void;
    setPosition: (x: number, y: number, z: number) => void;
    isPlaying: () => boolean;
}

/**
 * Props for the AudioEnvironment component
 */
export interface AudioEnvironmentProps {
    type: EnvironmentPreset;
    reverbDecay?: number;
    reverbWet?: number;
    lowpassFrequency?: number;
    highpassFrequency?: number;
}

/**
 * Props for the FootstepAudio component
 */
export interface FootstepAudioProps {
    surfaces: Record<string, string>;
    defaultSurface?: string;
    volume?: number;
    poolSize?: number;
    /** Minimum time between footstep sounds in milliseconds (default: 50) */
    throttleMs?: number;
}

/**
 * Ref interface for FootstepAudio
 */
export interface FootstepAudioRef {
    playFootstep: (surface?: string, position?: THREE.Vector3) => void;
}

/**
 * Props for the WeatherAudio component
 */
export interface WeatherAudioProps {
    rainUrl?: string;
    thunderUrl?: string;
    windUrl?: string;
    rainIntensity?: number;
    windIntensity?: number;
    thunderActive?: boolean;
    fadeTime?: number;
}
