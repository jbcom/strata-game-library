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

export { MathChunks, NoiseChunks } from './chunks.js';
export type { CloudLayerUniforms, VolumetricCloudUniforms } from './clouds.js';
export {
  cloudLayerFragmentShader,
  cloudLayerVertexShader,
  createCloudLayerUniforms,
  createVolumetricCloudUniforms,
  volumetricCloudFragmentShader,
  volumetricCloudVertexShader,
} from './clouds.js';
export type { FurConfig, FurUniforms } from './fur.js';
export { createFurUniforms, defaultFurConfig, furFragmentShader, furVertexShader } from './fur.js';
export type {
  GodRaysUniforms,
  VolumetricPointLightUniforms,
  VolumetricSpotlightUniforms,
} from './godRays.js';
export {
  createGodRaysUniforms,
  createVolumetricPointLightUniforms,
  createVolumetricSpotlightUniforms,
  godRaysFragmentShader,
  godRaysVertexShader,
  volumetricPointLightFragmentShader,
  volumetricPointLightVertexShader,
  volumetricSpotlightFragmentShader,
  volumetricSpotlightVertexShader,
} from './godRays.js';
export type { InstancingWindUniforms } from './instancing-wind.js';
export { createInstancingWindUniforms, instancingWindVertexShader } from './instancing-wind.js';
export type {
  CrystalMaterialOptions,
  DissolveMaterialOptions,
  ForcefieldMaterialOptions,
  GlitchMaterialOptions,
  GradientMaterialOptions,
  HologramMaterialOptions,
  OutlineMaterialOptions,
  ScanlineMaterialOptions,
  ToonMaterialOptions,
} from './materials/index.js';
export {
  createCrystalMaterial,
  createDissolveMaterial,
  createForcefieldMaterial,
  createGlitchMaterial,
  createGradientMaterial,
  createHologramMaterial,
  createOutlineMaterial,
  createScanlineMaterial,
  createToonMaterial,
  noiseSnippet,
  ShaderChunks,
} from './materials/index.js';
export type { RaymarchingUniforms } from './raymarching.js';
export {
  createRaymarchingUniforms,
  raymarchingFragmentShader,
  raymarchingVertexShader,
} from './raymarching.js';
export type { SkyUniforms } from './sky.js';
export { createSkyUniforms, skyFragmentShader, skyVertexShader } from './sky.js';
export type { SimpleTerrainUniforms, TerrainUniforms } from './terrain.js';
export {
  createSimpleTerrainUniforms,
  createTerrainUniforms,
  simpleTerrainFragmentShader,
  simpleTerrainVertexShader,
  terrainFragmentShader,
  terrainVertexShader,
} from './terrain.js';
export type {
  ColorRepresentation,
  IUniforms,
  UniformValue,
  Vector2Representation,
  Vector3Representation,
} from './types.js';
export type {
  AtmosphereUniforms,
  DustParticlesUniforms,
  UnderwaterUniforms,
  VolumetricFogUniforms,
} from './volumetrics.js';
export {
  atmosphereFragmentShader,
  atmosphereShader,
  atmosphereVertexShader,
  createAtmosphereUniforms,
  createDustParticlesUniforms,
  createUnderwaterUniforms,
  createVolumetricFogUniforms,
  dustParticlesFragmentShader,
  dustParticlesShader,
  dustParticlesVertexShader,
  underwaterFragmentShader,
  underwaterShader,
  underwaterVertexShader,
  volumetricFogFragmentShader,
  volumetricFogShader,
  volumetricFogVertexShader,
} from './volumetrics.js';
export type {
  UnderwaterOverlayUniforms,
  VolumetricFogMeshUniforms,
} from './volumetrics-components.js';
export {
  createUnderwaterOverlayUniforms,
  createVolumetricFogMeshUniforms,
  underwaterOverlayFragmentShader,
  underwaterOverlayVertexShader,
  volumetricFogMeshFragmentShader,
  volumetricFogMeshVertexShader,
} from './volumetrics-components.js';
export type { AdvancedWaterUniforms, WaterUniforms } from './water.js';
export {
  advancedWaterFragmentShader,
  advancedWaterVertexShader,
  createAdvancedWaterUniforms,
  createWaterUniforms,
  waterFragmentShader,
  waterVertexShader,
} from './water.js';
// Cloud shaders
// Fur/shell shaders
// God rays and volumetric lighting
// Wind animation for instanced vegetation
// Material shaders (toon, hologram, dissolve, etc.)
// Raymarching SDF shaders
// Procedural sky and atmosphere
// Terrain rendering shaders
// Common types and chunks

// Volumetric fog and underwater effects

// Water surface shaders
