/**
 * @module Rendering
 * @category Rendering Pipeline
 *
 * Rendering Pipeline - Shaders, Post-Processing, and Materials
 *
 * Low-level rendering tools for graphics programmers - custom shaders,
 * post-processing effects, and advanced materials.
 *
 * @example
 * ```tsx
 * import { CinematicEffects, ToonMesh, DissolveMesh } from '@jbcom/strata/api/rendering';
 *
 * function StylizedScene() {
 *   return (
 *     <>
 *       <CinematicEffects intensity={0.8} />
 *       <ToonMesh geometry={geometry} outlineWidth={0.02} />
 *       <DissolveMesh progress={0.5} edgeColor="cyan" />
 *     </>
 *   );
 * }
 * ```
 */

// Post-Processing Effects - React components
export {
    EffectStack,
    CinematicEffects,
    DreamyEffects,
    HorrorEffects,
    NeonEffects,
    RealisticEffects,
    VintageEffects,
    DynamicDOF,
    MotionBlurEffect,
} from '../components';

export type {
    EffectStackProps,
    CinematicEffectsProps,
    DreamyEffectsProps,
    HorrorEffectsProps,
    NeonEffectsProps,
    RealisticEffectsProps,
    VintageEffectsProps,
    DynamicDOFProps,
    DynamicDOFRef,
    MotionBlurEffectProps,
} from '../components';

// Post-Processing Effects - Core utilities
export {
    calculateFocusDistance,
    calculateFocusDistanceToMesh,
    focalLengthToFOV,
    fovToFocalLength,
    apertureToBokehScale,
    dofScenarios,
    defaultEffectSettings,
    lutConfigs,
    blendPostProcessingPresets,
    getTimeOfDayEffects,
} from '../core';

export type {
    PostProcessingMood,
    PostProcessingPreset,
    BloomSettings,
    DOFSettings,
    VignetteSettings,
    ChromaticAberrationSettings,
    FilmGrainSettings,
    ColorGradingSettings,
    SSAOSettings,
    ToneMappingSettings,
    NoiseSettings,
    BrightnessContrastSettings,
    SepiaSettings,
    LUTConfig,
} from '../core';

// Stylized Shaders
export {
    ToonMesh,
    HologramMesh,
    DissolveMesh,
    Forcefield,
    Outline,
    GradientMesh,
    GlitchMesh,
    CrystalMesh,
} from '../components';

export type {
    ToonMeshProps,
    ToonMeshRef,
    HologramMeshProps,
    HologramMeshRef,
    DissolveMeshProps,
    DissolveMeshRef,
    ForcefieldProps,
    ForcefieldRef,
    OutlineProps,
    GradientMeshProps,
    GradientMeshRef,
    GlitchMeshProps,
    GlitchMeshRef,
    CrystalMeshProps,
    CrystalMeshRef,
} from '../components';

// Ray Marching - React component
export { Raymarching } from '../components';

// Ray Marching - Core utilities
export { createRaymarchingMaterial, createRaymarchingGeometry } from '../core';

// GLSL Shaders (raw)
export * from '../shaders';

// Utilities
export * from '../utils';
