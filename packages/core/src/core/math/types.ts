/**
 * Type definitions for math utilities
 *
 * @module core/math
 * @public
 */

/**
 * 2D noise function type
 * Returns a value in range [-1, 1]
 */
export type Noise2D = (x: number, y: number) => number;

/**
 * 3D noise function type
 * Returns a value in range [-1, 1]
 */
export type Noise3D = (x: number, y: number, z: number) => number;

/**
 * 4D noise function type
 * Returns a value in range [-1, 1]
 */
export type Noise4D = (x: number, y: number, z: number, w: number) => number;

/**
 * Configuration for Fractal Brownian Motion (FBM) noise
 */
export interface FBMConfig {
  /** Number of noise layers (default: 4) */
  octaves?: number;
  /** Starting frequency multiplier (default: 1) */
  frequency?: number;
  /** Amplitude multiplier per octave (default: 0.5) */
  persistence?: number;
  /** Frequency multiplier per octave (default: 2) */
  lacunarity?: number;
}

/**
 * Terrain noise preset configuration
 */
export interface TerrainNoisePreset {
  /** Preset identifier */
  name: string;
  /** FBM configuration for the preset */
  fbm: Required<FBMConfig>;
  /** Amplitude scaling factor */
  amplitude: number;
  /** Whether to apply domain warping */
  warp?: boolean;
  /** Warp strength if enabled */
  warpStrength?: number;
}

/**
 * Random number generator function type
 */
export type RandomFn = () => number;

/**
 * Easing function type - takes value 0-1, returns 0-1
 */
export type EasingFn = (t: number) => number;

/**
 * Interpolation function type
 */
export type LerpFn = (a: number, b: number, t: number) => number;

/**
 * Vector2-like object
 */
export interface Vec2Like {
  x: number;
  y: number;
}

/**
 * Vector3-like object
 */
export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

/**
 * Vector4-like object
 */
export interface Vec4Like {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * Range definition for remapping values
 */
export interface Range {
  min: number;
  max: number;
}

/**
 * Default FBM configuration values
 */
export const DEFAULT_FBM_CONFIG: Required<FBMConfig> = {
  octaves: 4,
  frequency: 1,
  persistence: 0.5,
  lacunarity: 2,
};
