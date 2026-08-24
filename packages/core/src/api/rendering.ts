/**
 * @module Rendering
 * @category Rendering Pipeline
 *
 * Rendering Pipeline - Core utilities for shaders, post-processing, and materials.
 *
 * For React Three Fiber components, use @strata-game-library/r3f.
 */

// GLSL Shaders (raw)
export * from '@strata-game-library/shaders';

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
