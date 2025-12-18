/**
 * Noise utilities wrapping simplex-noise library
 *
 * Provides thin wrappers around simplex-noise with Strata-specific
 * utilities like FBM and terrain noise presets.
 *
 * @module core/math/noise
 * @public
 */

import {
    createNoise2D as simplexNoise2D,
    createNoise3D as simplexNoise3D,
    createNoise4D as simplexNoise4D,
} from 'simplex-noise';
import type { FBMConfig, Noise2D, Noise3D, Noise4D, RandomFn, TerrainNoisePreset } from './types';
import { DEFAULT_FBM_CONFIG } from './types';

/**
 * Creates a 2D simplex noise function
 *
 * @param random - Optional random number generator for seeding
 * @returns A 2D noise function returning values in [-1, 1]
 *
 * @example
 * ```typescript
 * const noise = createNoise2D();
 * const value = noise(1.5, 2.3); // Returns value in [-1, 1]
 *
 * // With custom seed
 * const seededNoise = createNoise2D(() => 0.5);
 * ```
 */
export function createNoise2D(random?: RandomFn): Noise2D {
    return simplexNoise2D(random);
}

/**
 * Creates a 3D simplex noise function
 *
 * @param random - Optional random number generator for seeding
 * @returns A 3D noise function returning values in [-1, 1]
 *
 * @example
 * ```typescript
 * const noise = createNoise3D();
 * const value = noise(1.0, 2.0, 3.0);
 * ```
 */
export function createNoise3D(random?: RandomFn): Noise3D {
    return simplexNoise3D(random);
}

/**
 * Creates a 4D simplex noise function
 *
 * @param random - Optional random number generator for seeding
 * @returns A 4D noise function returning values in [-1, 1]
 *
 * @example
 * ```typescript
 * const noise = createNoise4D();
 * const value = noise(1.0, 2.0, 3.0, time);
 * ```
 */
export function createNoise4D(random?: RandomFn): Noise4D {
    return simplexNoise4D(random);
}

// Internal implementation to avoid object allocation in hot paths
function fbm2DInternal(
    noise: Noise2D,
    x: number,
    y: number,
    octaves: number,
    frequency: number,
    persistence: number,
    lacunarity: number
): number {
    let value = 0;
    let amplitude = 1;
    let freq = frequency;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
        value += amplitude * noise(x * freq, y * freq);
        maxValue += amplitude;
        amplitude *= persistence;
        freq *= lacunarity;
    }

    return value / maxValue;
}

/**
 * Computes Fractal Brownian Motion (FBM) using 2D noise
 *
 * FBM layers multiple octaves of noise at different frequencies
 * to create natural-looking patterns.
 *
 * @param noise - The base 2D noise function
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param config - FBM configuration
 * @returns Normalized noise value in approximately [-1, 1]
 *
 * @throws {Error} When octaves is less than 1
 *
 * @example
 * ```typescript
 * const noise = createNoise2D();
 * const value = fbm2D(noise, 1.0, 2.0, { octaves: 6 });
 * ```
 */
export function fbm2D(noise: Noise2D, x: number, y: number, config: FBMConfig = {}): number {
    const octaves = config.octaves ?? DEFAULT_FBM_CONFIG.octaves;

    if (octaves < 1) {
        throw new Error('fbm2D: octaves must be at least 1');
    }

    return fbm2DInternal(
        noise,
        x,
        y,
        octaves,
        config.frequency ?? DEFAULT_FBM_CONFIG.frequency,
        config.persistence ?? DEFAULT_FBM_CONFIG.persistence,
        config.lacunarity ?? DEFAULT_FBM_CONFIG.lacunarity
    );
}

// Internal implementation to avoid object allocation in hot paths
function fbm3DInternal(
    noise: Noise3D,
    x: number,
    y: number,
    z: number,
    octaves: number,
    frequency: number,
    persistence: number,
    lacunarity: number
): number {
    let value = 0;
    let amplitude = 1;
    let freq = frequency;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
        value += amplitude * noise(x * freq, y * freq, z * freq);
        maxValue += amplitude;
        amplitude *= persistence;
        freq *= lacunarity;
    }

    return value / maxValue;
}

/**
 * Computes Fractal Brownian Motion (FBM) using 3D noise
 *
 * @param noise - The base 3D noise function
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @param config - FBM configuration
 * @returns Normalized noise value in approximately [-1, 1]
 *
 * @throws {Error} When octaves is less than 1
 *
 * @example
 * ```typescript
 * const noise = createNoise3D();
 * const value = fbm3D(noise, 1.0, 2.0, 3.0, {
 *   octaves: 4,
 *   persistence: 0.5,
 *   lacunarity: 2.0
 * });
 * ```
 */
export function fbm3D(
    noise: Noise3D,
    x: number,
    y: number,
    z: number,
    config: FBMConfig = {}
): number {
    const octaves = config.octaves ?? DEFAULT_FBM_CONFIG.octaves;

    if (octaves < 1) {
        throw new Error('fbm3D: octaves must be at least 1');
    }

    return fbm3DInternal(
        noise,
        x,
        y,
        z,
        octaves,
        config.frequency ?? DEFAULT_FBM_CONFIG.frequency,
        config.persistence ?? DEFAULT_FBM_CONFIG.persistence,
        config.lacunarity ?? DEFAULT_FBM_CONFIG.lacunarity
    );
}

/**
 * Applies domain warping to create more organic noise patterns
 *
 * @param noise - The base 2D noise function
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param strength - Warp strength (default: 0.5)
 * @param config - FBM configuration for final output
 * @returns Warped noise value
 *
 * @example
 * ```typescript
 * const noise = createNoise2D();
 * const organic = warpedNoise2D(noise, x, y, 0.8);
 * ```
 */
export function warpedNoise2D(
    noise: Noise2D,
    x: number,
    y: number,
    strength: number = 0.5,
    config: FBMConfig = {}
): number {
    const frequency = config.frequency ?? DEFAULT_FBM_CONFIG.frequency;
    const persistence = config.persistence ?? DEFAULT_FBM_CONFIG.persistence;
    const lacunarity = config.lacunarity ?? DEFAULT_FBM_CONFIG.lacunarity;

    const wx =
        x +
        fbm2DInternal(noise, x + 0.0, y + 0.0, 2, frequency, persistence, lacunarity) * strength;
    const wy =
        y +
        fbm2DInternal(noise, x + 5.2, y + 1.3, 2, frequency, persistence, lacunarity) * strength;
    return fbm2D(noise, wx, wy, config);
}

/**
 * Applies domain warping to 3D noise
 *
 * @param noise - The base 3D noise function
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @param strength - Warp strength (default: 0.5)
 * @param config - FBM configuration for final output
 * @returns Warped noise value
 */
export function warpedNoise3D(
    noise: Noise3D,
    x: number,
    y: number,
    z: number,
    strength: number = 0.5,
    config: FBMConfig = {}
): number {
    const frequency = config.frequency ?? DEFAULT_FBM_CONFIG.frequency;
    const persistence = config.persistence ?? DEFAULT_FBM_CONFIG.persistence;
    const lacunarity = config.lacunarity ?? DEFAULT_FBM_CONFIG.lacunarity;

    const wx =
        x +
        fbm3DInternal(
            noise,
            x + 0.0,
            y + 0.0,
            z + 0.0,
            2,
            frequency,
            persistence,
            lacunarity
        ) *
            strength;
    const wy =
        y +
        fbm3DInternal(
            noise,
            x + 5.2,
            y + 1.3,
            z + 2.8,
            2,
            frequency,
            persistence,
            lacunarity
        ) *
            strength;
    const wz =
        z +
        fbm3DInternal(
            noise,
            x + 9.1,
            y + 4.7,
            z + 3.4,
            2,
            frequency,
            persistence,
            lacunarity
        ) *
            strength;
    return fbm3D(noise, wx, wy, wz, config);
}

/**
 * Terrain noise presets for common terrain types
 */
export const TERRAIN_PRESETS: Record<string, TerrainNoisePreset> = {
    mountains: {
        name: 'mountains',
        fbm: { octaves: 6, frequency: 0.03, persistence: 0.5, lacunarity: 2.1 },
        amplitude: 25,
        warp: true,
        warpStrength: 0.3,
    },
    hills: {
        name: 'hills',
        fbm: { octaves: 4, frequency: 0.05, persistence: 0.45, lacunarity: 2.0 },
        amplitude: 8,
        warp: false,
    },
    plains: {
        name: 'plains',
        fbm: { octaves: 3, frequency: 0.02, persistence: 0.4, lacunarity: 2.0 },
        amplitude: 2,
        warp: false,
    },
    desert: {
        name: 'desert',
        fbm: { octaves: 4, frequency: 0.08, persistence: 0.5, lacunarity: 2.2 },
        amplitude: 5,
        warp: true,
        warpStrength: 0.2,
    },
    tundra: {
        name: 'tundra',
        fbm: { octaves: 3, frequency: 0.04, persistence: 0.35, lacunarity: 2.0 },
        amplitude: 3,
        warp: false,
    },
    archipelago: {
        name: 'archipelago',
        fbm: { octaves: 5, frequency: 0.015, persistence: 0.55, lacunarity: 2.0 },
        amplitude: 15,
        warp: true,
        warpStrength: 0.4,
    },
};

/**
 * Creates a terrain height function from a preset
 *
 * @param preset - Terrain preset name or custom preset configuration
 * @param random - Optional random function for seeding
 * @returns A function that returns terrain height at (x, z) coordinates
 *
 * @throws {Error} When preset name is not found
 *
 * @example
 * ```typescript
 * const getHeight = createTerrainNoise('mountains');
 * const height = getHeight(100, 200);
 *
 * // With custom preset
 * const customHeight = createTerrainNoise({
 *   name: 'custom',
 *   fbm: { octaves: 5, frequency: 0.02, persistence: 0.5, lacunarity: 2 },
 *   amplitude: 20,
 *   warp: true,
 *   warpStrength: 0.3
 * });
 * ```
 */
export function createTerrainNoise(
    preset: string | TerrainNoisePreset,
    random?: RandomFn
): (x: number, z: number) => number {
    const config = typeof preset === 'string' ? TERRAIN_PRESETS[preset] : preset;

    if (!config) {
        throw new Error(`createTerrainNoise: unknown preset "${preset}"`);
    }

    const noise = createNoise2D(random);

    return (x: number, z: number): number => {
        let value: number;

        if (config.warp && config.warpStrength) {
            value = warpedNoise2D(noise, x, z, config.warpStrength, config.fbm);
        } else {
            value = fbm2D(noise, x, z, config.fbm);
        }

        return (value * 0.5 + 0.5) * config.amplitude;
    };
}

/**
 * Creates ridged noise useful for mountain ridges
 *
 * @param noise - Base noise function
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param config - FBM configuration
 * @returns Ridged noise value in [0, 1]
 *
 * @example
 * ```typescript
 * const noise = createNoise2D();
 * const ridge = ridgedNoise2D(noise, x, y, { octaves: 4 });
 * ```
 */
export function ridgedNoise2D(
    noise: Noise2D,
    x: number,
    y: number,
    config: FBMConfig = {}
): number {
    const value = fbm2D(noise, x, y, config);
    return 1 - Math.abs(value);
}
