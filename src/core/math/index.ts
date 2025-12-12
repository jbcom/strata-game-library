/**
 * Math module - Strata math utilities and noise functions
 *
 * This module provides:
 * - Re-exports from maath library (easing, buffer, misc, random)
 * - Simplex noise wrappers with FBM support
 * - Game-specific math helpers
 * - Terrain noise presets
 *
 * @module core/math
 * @public
 *
 * @example
 * ```typescript
 * import {
 *   createNoise2D,
 *   fbm2D,
 *   createTerrainNoise,
 *   lerp,
 *   clamp,
 *   easing
 * } from '@jbcom/strata/core/math';
 *
 * // Create noise function
 * const noise = createNoise2D();
 *
 * // Use FBM for terrain
 * const height = fbm2D(noise, x, z, { octaves: 6 });
 *
 * // Or use preset
 * const getHeight = createTerrainNoise('mountains');
 *
 * // Use math helpers
 * const value = lerp(0, 100, 0.5); // 50
 * const clamped = clamp(value, 0, 80); // 50
 * ```
 */

export * as buffer from 'maath/buffer';
export * as easing from 'maath/easing';
export * as triangle from 'maath/triangle';

export {
    createNoise2D,
    createNoise3D,
    createNoise4D,
    createTerrainNoise,
    fbm2D,
    fbm3D,
    ridgedNoise2D,
    TERRAIN_PRESETS,
    warpedNoise2D,
    warpedNoise3D,
} from './noise';
export type {
    EasingFn,
    FBMConfig,
    LerpFn,
    Noise2D,
    Noise3D,
    Noise4D,
    RandomFn,
    Range,
    TerrainNoisePreset,
    Vec2Like,
    Vec3Like,
    Vec4Like,
} from './types';
export { DEFAULT_FBM_CONFIG } from './types';
export {
    approximately,
    clamp,
    clamp01,
    degToRad,
    deltaAngle,
    distanceSquared2D,
    distanceSquared3D,
    inverseLerp,
    lerp,
    lerpAngle,
    misc,
    moveTowards,
    pingPong,
    radToDeg,
    random,
    remap,
    remapRange,
    smoothDamp,
    smootherstep,
    smoothstep,
    wrapAngle,
} from './utils';
