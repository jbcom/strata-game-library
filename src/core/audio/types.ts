/**
 * Audio System Type Definitions
 *
 * Types for 2D audio (Howler) and 3D spatial audio (Three.js).
 *
 * @module core/audio
 * @public
 */

import type { Vector3 } from 'three';

/**
 * Distance attenuation model for spatial audio.
 */
export type DistanceModel = 'linear' | 'inverse' | 'exponential';

/**
 * Supported audio file formats.
 */
export type AudioFormat = 'mp3' | 'ogg' | 'wav' | 'webm' | 'aac' | 'flac';

/**
 * Environment preset names for reverb/effects.
 */
export type EnvironmentPreset =
    | 'outdoor'
    | 'indoor'
    | 'cave'
    | 'underwater'
    | 'hall'
    | 'studio'
    | 'none';

/**
 * Configuration for creating an audio manager.
 *
 * @example
 * ```typescript
 * const config: AudioConfig = {
 *   masterVolume: 0.8,
 *   muted: false,
 *   preloadSounds: ['bgm', 'sfx'],
 * };
 * ```
 */
export interface AudioConfig {
    masterVolume?: number;
    muted?: boolean;
    preloadSounds?: string[];
    autoUnlock?: boolean;
    html5PoolSize?: number;
}

/**
 * Configuration for a sound effect or music track.
 *
 * @example
 * ```typescript
 * const soundConfig: SoundConfig = {
 *   src: ['/audio/explosion.mp3', '/audio/explosion.ogg'],
 *   volume: 0.7,
 *   loop: false,
 *   rate: 1.0,
 * };
 * ```
 */
export interface SoundConfig {
    src: string | string[];
    volume?: number;
    loop?: boolean;
    rate?: number;
    sprite?: Record<string, [number, number] | [number, number, boolean]>;
    preload?: boolean;
    autoplay?: boolean;
    mute?: boolean;
    html5?: boolean;
    pool?: number;
    format?: AudioFormat[];
}

/**
 * Configuration for 3D spatial audio sources.
 *
 * @example
 * ```typescript
 * const spatialConfig: SpatialConfig = {
 *   refDistance: 1,
 *   maxDistance: 100,
 *   rolloffFactor: 1,
 *   distanceModel: 'inverse',
 *   coneInnerAngle: 360,
 * };
 * ```
 */
export interface SpatialConfig {
    refDistance?: number;
    maxDistance?: number;
    rolloffFactor?: number;
    distanceModel?: DistanceModel;
    coneInnerAngle?: number;
    coneOuterAngle?: number;
    coneOuterGain?: number;
    panningModel?: 'HRTF' | 'equalpower';
}

/**
 * Audio bus for grouping and controlling multiple sounds.
 *
 * @example
 * ```typescript
 * const musicBus: AudioBus = {
 *   id: 'music',
 *   volume: 0.5,
 *   muted: false,
 *   sounds: ['bgm-main', 'bgm-combat'],
 * };
 * ```
 */
export interface AudioBus {
    id: string;
    volume: number;
    muted: boolean;
    sounds: string[];
}

/**
 * Audio mixer interface for managing multiple buses.
 *
 * @example
 * ```typescript
 * const mixer: AudioMixer = {
 *   buses: {
 *     master: { id: 'master', volume: 1, muted: false, sounds: [] },
 *     music: { id: 'music', volume: 0.7, muted: false, sounds: [] },
 *     sfx: { id: 'sfx', volume: 0.9, muted: false, sounds: [] },
 *   },
 *   masterVolume: 1,
 * };
 * ```
 */
export interface AudioMixer {
    buses: Record<string, AudioBus>;
    masterVolume: number;
}

/**
 * Environment audio effect settings.
 */
export interface EnvironmentEffectConfig {
    preset: EnvironmentPreset;
    wetLevel?: number;
    dryLevel?: number;
    decay?: number;
}

/**
 * Listener position and orientation for 3D audio.
 */
export interface AudioListenerState {
    position: Vector3;
    forward: Vector3;
    up: Vector3;
}

/**
 * Predefined environment effect configurations.
 */
export const ENVIRONMENT_PRESETS: Record<EnvironmentPreset, EnvironmentEffectConfig> = {
    outdoor: { preset: 'outdoor', wetLevel: 0.1, dryLevel: 0.9, decay: 0.5 },
    indoor: { preset: 'indoor', wetLevel: 0.3, dryLevel: 0.7, decay: 1.5 },
    cave: { preset: 'cave', wetLevel: 0.5, dryLevel: 0.5, decay: 4.0 },
    underwater: { preset: 'underwater', wetLevel: 0.4, dryLevel: 0.6, decay: 2.0 },
    hall: { preset: 'hall', wetLevel: 0.4, dryLevel: 0.6, decay: 2.5 },
    studio: { preset: 'studio', wetLevel: 0.2, dryLevel: 0.8, decay: 0.8 },
    none: { preset: 'none', wetLevel: 0, dryLevel: 1, decay: 0 },
};

/**
 * Default spatial audio configuration.
 */
export const DEFAULT_SPATIAL_CONFIG: Required<SpatialConfig> = {
    refDistance: 1,
    maxDistance: 10000,
    rolloffFactor: 1,
    distanceModel: 'inverse',
    coneInnerAngle: 360,
    coneOuterAngle: 360,
    coneOuterGain: 0,
    panningModel: 'HRTF',
};
