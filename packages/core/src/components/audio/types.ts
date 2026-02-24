/**
 * Audio Component Type Definitions.
 *
 * Provides TypeScript interfaces for the spatial audio system, including context
 * providers, positional emitters, environmental effects, and automated footstep logic.
 *
 * @packageDocumentation
 * @module components/audio/types
 * @category Player Experience
 */

import type * as THREE from 'three';
import type {
  DistanceModel,
  EnvironmentPreset,
  SoundManager,
  SpatialAudio,
} from '../../core/audio';

/**
 * Context value provided by the AudioProvider.
 * @category Player Experience
 */
export interface AudioContextValue {
  /** The core SoundManager instance. */
  soundManager: SoundManager | null;
  /** The core SpatialAudio instance for 3D processing. */
  spatialAudio: SpatialAudio | null;
  /** The active Three.js AudioListener attached to the camera. */
  listener: THREE.AudioListener | null;
  /** Whether the audio system has successfully initialized. */
  isReady: boolean;
}

/**
 * Props for the AudioProvider component.
 * @category Player Experience
 */
export interface AudioProviderProps {
  /** Child components. */
  children: React.ReactNode;
  /** Global volume multiplier (0-1). Default: 1.0. */
  masterVolume?: number;
}

/**
 * Props for the AudioListener component.
 * @category Player Experience
 */
export interface AudioListenerProps {
  /** Optional camera override. Defaults to the main scene camera. */
  camera?: THREE.Camera;
}

/**
 * Props for the PositionalAudio component.
 * @category Player Experience
 */
export interface PositionalAudioProps {
  /** URL of the audio resource to load. */
  url: string;
  /** World position [x, y, z]. Default: [0, 0, 0]. */
  position?: [number, number, number];
  /** Whether to loop playback indefinitely. Default: false. */
  loop?: boolean;
  /** Whether to start playing immediately on load. Default: false. */
  autoplay?: boolean;
  /** Local volume multiplier (0-1). Default: 1.0. */
  volume?: number;
  /** Distance at which volume starts to decrease. Default: 1. */
  refDistance?: number;
  /** Maximum distance after which sound is no longer heard. Default: 10000. */
  maxDistance?: number;
  /** Rate of volume falloff with distance. Default: 1.0. */
  rolloffFactor?: number;
  /** Algorithm used for volume attenuation ('linear', 'inverse', 'exponential'). */
  distanceModel?: DistanceModel;
  /** Playback speed multiplier. Default: 1.0. */
  playbackRate?: number;
  /** Callback fired when the audio file is fully loaded. */
  onLoad?: () => void;
  /** Callback fired when playback reaches the end. */
  onEnd?: () => void;
}

/**
 * Ref interface for PositionalAudio imperative control.
 * @category Player Experience
 */
export interface PositionalAudioRef {
  /** Start or resume playback. */
  play: () => void;
  /** Pause playback. */
  pause: () => void;
  /** Stop playback and reset to start. */
  stop: () => void;
  /** Dynamically update the local volume. */
  setVolume: (volume: number) => void;
  /** Teleport the sound source to a new world position. */
  setPosition: (x: number, y: number, z: number) => void;
  /** Whether the sound is currently playing. */
  isPlaying: () => boolean;
}

/**
 * Props for the AmbientAudio component.
 * @category Player Experience
 */
export interface AmbientAudioProps {
  /** URL of the non-positional audio resource. */
  url: string;
  /** Volume multiplier (0-1). Default: 1.0. */
  volume?: number;
  /** Whether to loop the track. Default: true. */
  loop?: boolean;
  /** Whether to start playback on mount. Default: true. */
  autoplay?: boolean;
  /** Duration in seconds for initial fade-in. Default: 2.0. */
  fadeTime?: number;
  /** Callback fired when the resource is loaded. */
  onLoad?: () => void;
}

/**
 * Ref interface for AmbientAudio imperative control.
 * @category Player Experience
 */
export interface AmbientAudioRef {
  /** Trigger playback. */
  play: () => void;
  /** Instantly stop playback. */
  stop: () => void;
  /** Smoothly fade volume up from zero over duration. */
  fadeIn: (duration: number) => void;
  /** Smoothly fade volume down to zero over duration. */
  fadeOut: (duration: number) => void;
  /** Update volume with optional fade transition. */
  setVolume: (volume: number, fadeTime?: number) => void;
  /** Whether the ambient track is active. */
  isPlaying: () => boolean;
}

/**
 * Props for the AudioZone component.
 * @category Player Experience
 */
export interface AudioZoneProps {
  /** Center position of the trigger volume. Default: [0, 0, 0]. */
  position?: [number, number, number];
  /** Geometric primitive for the zone ('box' or 'sphere'). */
  geometry: 'box' | 'sphere';
  /** Dimensions for 'box' geometry [width, height, depth]. Default: [10, 10, 10]. */
  size?: [number, number, number];
  /** Radius for 'sphere' geometry. Default: 5. */
  radius?: number;
  /** URL of the audio to play when inside the zone. */
  audioUrl?: string;
  /** Volume for the zone audio. Default: 1.0. */
  audioVolume?: number;
  /** Whether the zone audio should loop. Default: true. */
  audioLoop?: boolean;
  /** Cross-fade duration when entering or exiting the zone. Default: 0.5. */
  fadeTime?: number;
  /** Callback fired when the listener enters the zone. */
  onEnter?: () => void;
  /** Callback fired when the listener exits the zone. */
  onExit?: () => void;
  /** Whether to show a wireframe gizmo for the zone. Default: false. */
  debug?: boolean;
  /** Optional child components. */
  children?: React.ReactNode;
}

/**
 * Ref interface for AudioZone.
 * @category Player Experience
 */
export interface AudioZoneRef {
  /** Whether the listener is currently inside the zone boundaries. */
  isInside: () => boolean;
  /** Access the underlying AmbientAudio controller for the zone. */
  getAudio: () => AmbientAudioRef | null;
}

/**
 * Props for the AudioEmitter component.
 * @category Player Experience
 */
export interface AudioEmitterProps {
  /** URL of the positional audio resource. */
  url: string;
  /** Initial world position. Default: [0, 0, 0]. */
  position?: [number, number, number];
  /** Reference to an Object3D to track automatically. */
  follow?: React.RefObject<THREE.Object3D>;
  /** Whether to loop the sound. Default: false. */
  loop?: boolean;
  /** Whether to autoplay on load. Default: false. */
  autoplay?: boolean;
  /** Local volume multiplier. Default: 1.0. */
  volume?: number;
  /** Minimum distance for falloff. Default: 1. */
  refDistance?: number;
  /** Maximum hearing distance. Default: 10000. */
  maxDistance?: number;
  /** Rolloff rate. Default: 1.0. */
  rolloffFactor?: number;
  /** Attenuation algorithm. */
  distanceModel?: DistanceModel;
  /** Callback fired when resource is loaded. */
  onLoad?: () => void;
}

/**
 * Ref interface for AudioEmitter.
 * @category Player Experience
 */
export interface AudioEmitterRef {
  /** Start playback. */
  play: () => void;
  /** Stop playback. */
  stop: () => void;
  /** Pause playback. */
  pause: () => void;
  /** Update local volume. */
  setVolume: (volume: number) => void;
  /** Teleport the emitter. */
  setPosition: (x: number, y: number, z: number) => void;
  /** Whether currently playing. */
  isPlaying: () => boolean;
}

/**
 * Props for the AudioEnvironment component.
 * @category Player Experience
 */
export interface AudioEnvironmentProps {
  /** Preset name defining reverb and filtering parameters. */
  type: EnvironmentPreset;
  /** Length of the reverb tail in seconds. */
  reverbDecay?: number;
  /** Mix level between processed and original audio (0-1). */
  reverbWet?: number;
  /** High-frequency cutoff level. */
  lowpassFrequency?: number;
  /** Low-frequency cutoff level. */
  highpassFrequency?: number;
}

/**
 * Props for the FootstepAudio component.
 * @category Player Experience
 */
export interface FootstepAudioProps {
  /**
   * Map of surface names to audio file URLs or sound IDs.
   * Keys should match detected surface names (e.g., 'grass', 'wood').
   */
  surfaces: Record<string, string>;
  /** Fallback surface name if detection fails. Default: 'default'. */
  defaultSurface?: string;
  /** Playback volume multiplier. Default: 1.0. */
  volume?: number;
  /** Maximum number of concurrent step sounds. Default: 5. */
  poolSize?: number;
  /** Minimum interval between steps in milliseconds. Default: 50. */
  throttleMs?: number;
}

/**
 * Ref interface for FootstepAudio.
 * @category Player Experience
 */
export interface FootstepAudioRef {
  /** Trigger a footstep sound for a specific surface. */
  playFootstep: (surface?: string, position?: THREE.Vector3) => void;
}

/**
 * Props for the WeatherAudio component.
 * @category Player Experience
 */
export interface WeatherAudioProps {
  /** URL for looping rain ambience. */
  rainUrl?: string;
  /** URL for one-shot thunder sound effect. */
  thunderUrl?: string;
  /** URL for looping wind ambience. */
  windUrl?: string;
  /** Volume intensity for rain (0-1). Default: 0. */
  rainIntensity?: number;
  /** Volume intensity for wind (0-1). Default: 0. */
  windIntensity?: number;
  /** Whether thunder events are enabled. Default: false. */
  thunderActive?: boolean;
  /** Duration for volume transition fades. Default: 1.0. */
  fadeTime?: number;
}
