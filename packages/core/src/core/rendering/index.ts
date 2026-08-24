/**
 * Rendering effects layered on top of the renderer: atmosphere, water,
 * weather, decals, level-of-detail, and post-processing.
 *
 * These were loose files at the package root. They share a concern — they all
 * change how a scene is drawn rather than what is in it — so they are grouped
 * rather than left to accumulate.
 *
 * @packageDocumentation
 */

export type {
  CloudLayerConfig,
  CloudMaterialOptions,
  CloudSkyConfig,
  DayNightConfig,
  VolumetricCloudOptions,
  WindConfig,
} from './clouds.js';
export {
  adaptCloudColorsForTimeOfDay,
  calculateWindOffset,
  createCloudLayerGeometry,
  createCloudLayerMaterial,
  createDefaultCloudSkyConfig,
  createVolumetricCloudGeometry,
  createVolumetricCloudMaterial,
  fbmNoise2D,
  sampleCloudDensity,
} from './clouds.js';
export type {
  BillboardConfig,
  DecalInstance,
  DecalProjectorConfig,
  SpriteAnimationState,
  SpriteSheetConfig,
} from './decals.js';
export {
  applySpriteSheetFrame,
  createBillboardMatrix,
  createBloodSplatterTexture,
  createBulletHoleTexture,
  createDecalTexture,
  createFootprintTexture,
  createScorchMarkTexture,
  createSpriteSheetAnimation,
  createSpriteSheetMaterial,
  createWaterPuddleTexture,
  DecalProjector,
  getSpriteSheetUVs,
  sortBillboardsByDepth,
  updateBillboardRotation,
  updateSpriteSheetAnimation,
} from './decals.js';
export type {
  GodRaysMaterialOptions,
  VolumetricPointLightMaterialOptions,
  VolumetricSpotlightMaterialOptions,
} from './godRays.js';
export {
  blendGodRayColors,
  calculateGodRayIntensityFromAngle,
  calculateScatteringIntensity,
  createGodRaysMaterial,
  createPointLightSphereGeometry,
  createSpotlightConeGeometry,
  createVolumetricPointLightMaterial,
  createVolumetricSpotlightMaterial,
  getLightScreenPosition,
} from './godRays.js';
export type {
  ImpostorConfig,
  LODConfig,
  LODLevel,
  LODState,
  SimplificationOptions,
  VegetationLODConfig,
} from './lod.js';
export {
  batchLODObjects,
  calculateImpostorAngle,
  calculateLODLevel,
  calculateScreenSpaceSize,
  calculateVegetationDensity,
  createDitherPattern,
  createImpostorGeometry,
  createImpostorTexture,
  createLODLevels,
  createVegetationLODLevels,
  generateLODGeometries,
  interpolateLODMaterials,
  LODManager,
  shouldUseLOD,
  simplifyGeometry,
  updateImpostorUV,
} from './lod.js';
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
} from './postProcessing.js';
export {
  apertureToBokehScale,
  blendPostProcessingPresets,
  calculateFocusDistance,
  calculateFocusDistanceToMesh,
  defaultEffectSettings,
  dofScenarios,
  focalLengthToFOV,
  fovToFocalLength,
  getTimeOfDayEffects,
  lutConfigs,
} from './postProcessing.js';
export type { RaymarchingMaterialOptions } from './raymarching.js';
export { createRaymarchingGeometry, createRaymarchingMaterial } from './raymarching.js';
export type {
  AnimationChunk,
  ColorChunk,
  EffectsChunk,
  LightingChunk,
  NoiseChunk,
  ShaderChunkCategory,
  ShaderUniform,
  ShaderUniforms,
  UVChunk,
} from './shaders.js';
export {
  animationSnippet,
  buildFragmentShader,
  buildVertexShader,
  colorSnippet,
  composeShaderChunks,
  createColorUniform,
  createProgressUniform,
  createTimeUniform,
  createVector2Uniform,
  createVector3Uniform,
  lightingSnippet,
  noiseSnippet,
  ShaderChunks,
} from './shaders.js';
export type {
  SkyMaterialOptions,
  TimeOfDayState,
  TimeOfDayStateCore,
  WeatherState,
  WeatherStateCore,
} from './sky.js';
export { createSkyGeometry, createSkyMaterial } from './sky.js';
export type {
  UnderwaterOverlayMaterialOptions,
  VolumetricFogMeshMaterialOptions,
} from './volumetrics.js';
export { createUnderwaterOverlayMaterial, createVolumetricFogMeshMaterial } from './volumetrics.js';
export type { AdvancedWaterMaterialOptions, WaterMaterialOptions } from './water.js';
export { createAdvancedWaterMaterial, createWaterGeometry, createWaterMaterial } from './water.js';
export type {
  TemperatureConfig,
  WeatherStateConfig,
  WeatherSystemType,
  WeatherTransition,
  WeatherType,
  WindSimulationConfig,
} from './weather.js';
export {
  calculateTemperature,
  createWeatherSystem,
  createWindSimulation,
  getPrecipitationType,
  WeatherSystem,
  WeatherSystemCore,
  WindSimulation,
} from './weather.js';
