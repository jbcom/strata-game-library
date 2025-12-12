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

export type {
    CinematicEffectsProps,
    CrystalMeshProps,
    CrystalMeshRef,
    DissolveMeshProps,
    DissolveMeshRef,
    DreamyEffectsProps,
    DynamicDOFProps,
    DynamicDOFRef,
    EffectStackProps,
    ForcefieldProps,
    ForcefieldRef,
    GlitchMeshProps,
    GlitchMeshRef,
    GradientMeshProps,
    GradientMeshRef,
    HologramMeshProps,
    HologramMeshRef,
    HorrorEffectsProps,
    MotionBlurEffectProps,
    NeonEffectsProps,
    OutlineProps,
    RealisticEffectsProps,
    ToonMeshProps,
    ToonMeshRef,
    VintageEffectsProps,
} from '../components';
// Post-Processing Effects - React components
// Stylized Shaders
// Ray Marching - React component
export {
    CinematicEffects,
    CrystalMesh,
    DissolveMesh,
    DreamyEffects,
    DynamicDOF,
    EffectStack,
    Forcefield,
    GlitchMesh,
    GradientMesh,
    HologramMesh,
    HorrorEffects,
    MotionBlurEffect,
    NeonEffects,
    Outline,
    Raymarching,
    RealisticEffects,
    ToonMesh,
    VintageEffects,
} from '../components';
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
// Post-Processing Effects - Core utilities
// Ray Marching - Core utilities
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

// GLSL Shaders (raw)
export * from '../shaders';

// Utilities
export * from '../utils';
