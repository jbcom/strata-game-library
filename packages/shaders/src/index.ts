/**
 * @strata/shaders
 *
 * GLSL shader collection for Strata 3D.
 * Provides terrain, water, clouds, volumetric effects, and more.
 *
 * These shaders are standalone and can be used with any Three.js project.
 *
 * @packageDocumentation
 * @module strata-shaders
 */

export * from './chunks.js';
// Cloud shaders
export * from './clouds.js';
// Fur/shell shaders
export * from './fur.js';
// God rays and volumetric lighting
export * from './godRays.js';
// Wind animation for instanced vegetation
export * from './instancing-wind.js';
// Material shaders (toon, hologram, dissolve, etc.)
export * from './materials/index.js';
// Raymarching SDF shaders
export * from './raymarching.js';
// Procedural sky and atmosphere
export * from './sky.js';
// Terrain rendering shaders
export * from './terrain.js';
// Common types and chunks
export * from './types.js';

// Volumetric fog and underwater effects
export * from './volumetrics.js';
export * from './volumetrics-components.js';

// Water surface shaders
export * from './water.js';
