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

export {
  MathChunks,
  NoiseChunks,
} from './chunks.js';
export type {
  CloudLayerUniforms,
  VolumetricCloudUniforms,
} from './clouds.js';
// Cloud shaders
export {
  cloudLayerFragmentShader,
  cloudLayerVertexShader,
  createCloudLayerUniforms,
  createVolumetricCloudUniforms,
  volumetricCloudFragmentShader,
  volumetricCloudVertexShader,
} from './clouds.js';
export type {
  FurConfig,
  FurUniforms,
} from './fur.js';
// Fur/shell shaders
export {
  createFurUniforms,
  defaultFurConfig,
  furFragmentShader,
  furVertexShader,
} from './fur.js';
export type {
  GodRaysUniforms,
  VolumetricPointLightUniforms,
  VolumetricSpotlightUniforms,
} from './godRays.js';
// God rays and volumetric lighting
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
// Wind animation for instanced vegetation
export {
  createInstancingWindUniforms,
  instancingWindVertexShader,
} from './instancing-wind.js';
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
// Material shaders (toon, hologram, dissolve, etc.)
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
// Raymarching SDF shaders
export {
  createRaymarchingUniforms,
  raymarchingFragmentShader,
  raymarchingVertexShader,
} from './raymarching.js';
export type { SkyUniforms } from './sky.js';
// Procedural sky and atmosphere
export {
  createSkyUniforms,
  skyFragmentShader,
  skyVertexShader,
} from './sky.js';
export type {
  SimpleTerrainUniforms,
  TerrainUniforms,
} from './terrain.js';
// Terrain rendering shaders
export {
  createSimpleTerrainUniforms,
  createTerrainUniforms,
  simpleTerrainFragmentShader,
  simpleTerrainVertexShader,
  terrainFragmentShader,
  terrainVertexShader,
} from './terrain.js';
// Common types and chunks
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
// Volumetric fog and underwater effects
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
export type {
  AdvancedWaterUniforms,
  WaterUniforms,
} from './water.js';
// Water surface shaders
export {
  advancedWaterFragmentShader,
  advancedWaterVertexShader,
  createAdvancedWaterUniforms,
  createWaterUniforms,
  waterFragmentShader,
  waterVertexShader,
} from './water.js';
