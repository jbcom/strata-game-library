/**
 * @module Rendering
 * @category Rendering Pipeline
 *
 * Rendering Pipeline - Core utilities for shaders, post-processing, and materials.
 *
 * For React Three Fiber components, use @strata-game-library/r3f.
 */

// GLSL Shaders (raw)
export { MathChunks, NoiseChunks, ShaderChunks, advancedWaterFragmentShader, advancedWaterVertexShader, atmosphereFragmentShader, atmosphereShader, atmosphereVertexShader, cloudLayerFragmentShader, cloudLayerVertexShader, createAdvancedWaterUniforms, createAtmosphereUniforms, createCloudLayerUniforms, createCrystalMaterial, createDissolveMaterial, createDustParticlesUniforms, createForcefieldMaterial, createFurUniforms, createGlitchMaterial, createGodRaysUniforms, createGradientMaterial, createHologramMaterial, createInstancingWindUniforms, createOutlineMaterial, createRaymarchingUniforms, createScanlineMaterial, createSimpleTerrainUniforms, createSkyUniforms, createTerrainUniforms, createToonMaterial, createUnderwaterOverlayUniforms, createUnderwaterUniforms, createVolumetricCloudUniforms, createVolumetricFogMeshUniforms, createVolumetricFogUniforms, createVolumetricPointLightUniforms, createVolumetricSpotlightUniforms, createWaterUniforms, defaultFurConfig, dustParticlesFragmentShader, dustParticlesShader, dustParticlesVertexShader, furFragmentShader, furVertexShader, godRaysFragmentShader, godRaysVertexShader, instancingWindVertexShader, noiseSnippet, raymarchingFragmentShader, raymarchingVertexShader, simpleTerrainFragmentShader, simpleTerrainVertexShader, skyFragmentShader, skyVertexShader, terrainFragmentShader, terrainVertexShader, underwaterFragmentShader, underwaterOverlayFragmentShader, underwaterOverlayVertexShader, underwaterShader, underwaterVertexShader, volumetricCloudFragmentShader, volumetricCloudVertexShader, volumetricFogFragmentShader, volumetricFogMeshFragmentShader, volumetricFogMeshVertexShader, volumetricFogShader, volumetricFogVertexShader, volumetricPointLightFragmentShader, volumetricPointLightVertexShader, volumetricSpotlightFragmentShader, volumetricSpotlightVertexShader, waterFragmentShader, waterVertexShader } from "@strata-game-library/shaders";
export type { AdvancedWaterUniforms, AtmosphereUniforms, CloudLayerUniforms, ColorRepresentation, CrystalMaterialOptions, DissolveMaterialOptions, DustParticlesUniforms, ForcefieldMaterialOptions, FurConfig, FurUniforms, GlitchMaterialOptions, GodRaysUniforms, GradientMaterialOptions, HologramMaterialOptions, IUniforms, InstancingWindUniforms, OutlineMaterialOptions, RaymarchingUniforms, ScanlineMaterialOptions, SimpleTerrainUniforms, SkyUniforms, TerrainUniforms, ToonMaterialOptions, UnderwaterOverlayUniforms, UnderwaterUniforms, UniformValue, Vector2Representation, Vector3Representation, VolumetricCloudUniforms, VolumetricFogMeshUniforms, VolumetricFogUniforms, VolumetricPointLightUniforms, VolumetricSpotlightUniforms, WaterUniforms } from "@strata-game-library/shaders";

// Core types
export type {
  BloomSettings,
  BrightnessContrastSettings,
  ChromaticAberrationSettings,
  ColorGradingSettings,
  DOFSettings,
  FilmGrainSettings,
  LUTConfig,
  NoiseSettings,
  PostProcessingMood,
  PostProcessingPreset,
  SepiaSettings,
  SSAOSettings,
  ToneMappingSettings,
  VignetteSettings,
} from '../core';

// Core utilities
export {
  apertureToBokehScale,
  blendPostProcessingPresets,
  calculateFocusDistance,
  calculateFocusDistanceToMesh,
  createRaymarchingGeometry,
  createRaymarchingMaterial,
  defaultEffectSettings,
  dofScenarios,
  focalLengthToFOV,
  fovToFocalLength,
  getTimeOfDayEffects,
  lutConfigs,
} from '../core';

// Utilities
export * from '../utils';
