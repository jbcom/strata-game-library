/**
 * Built-in material presets for the compositional object system.
 *
 * Provides a registry of pre-configured materials (fur, metal, wood, shell,
 * crystal, organic) that can be referenced by ID when composing creatures,
 * props, and other game objects, together with the trait, procedural-shader,
 * texture-bake, and variant pipelines built on top of them.
 *
 * The implementation is split by responsibility across sibling modules:
 * `presets` (registry + cloning), `traits` (surface characteristics),
 * `procedural` (GLSL layer planning), `bake` (CPU rasterization), `png`
 * (dependency-free encoding), `bake-export` (encoder dispatch), and
 * `variants` (deterministic derivation). This module is the public barrel.
 *
 * @module Materials
 * @category Entities & Simulation
 */

export {
  createMaterialProceduralBakePlan,
  rasterizeMaterialProceduralBakePlan,
} from './bake';
export {
  createMaterialProceduralBakeArtifacts,
  createMaterialProceduralBakeExportPlan,
  encodeMaterialProceduralBakeExportPlan,
} from './bake-export';
export { createMaterialProceduralBakeBasisUniversalKtx2Encoder, createMaterialProceduralBakeBrowserImageEncoder } from "./encoders";
export { createFurMaterial, createMetalMaterial, createOrganicMaterial, createShellMaterial, createVolumetricMaterial, createWoodMaterial } from "./factory";
export type { MaterialDefinition, MaterialPhysics, MaterialProceduralAlgorithm, MaterialProceduralBakeArtifacts, MaterialProceduralBakeBasisUniversalEncoder, MaterialProceduralBakeBasisUniversalKtx2EncoderOptions, MaterialProceduralBakeBrowserImageEncoderOptions, MaterialProceduralBakeCanvas2DContextLike, MaterialProceduralBakeCanvasLike, MaterialProceduralBakeColorSpace, MaterialProceduralBakeEncodedImage, MaterialProceduralBakeExportEncoder, MaterialProceduralBakeExportEncoderFn, MaterialProceduralBakeExportEncoderOptions, MaterialProceduralBakeExportExecutionOptions, MaterialProceduralBakeExportManifest, MaterialProceduralBakeExportManifestTarget, MaterialProceduralBakeExportMimeType, MaterialProceduralBakeExportOptions, MaterialProceduralBakeExportPlan, MaterialProceduralBakeExportRequest, MaterialProceduralBakeExportResult, MaterialProceduralBakeFormat, MaterialProceduralBakeImageDataLike, MaterialProceduralBakeManifest, MaterialProceduralBakeManifestTarget, MaterialProceduralBakeMap, MaterialProceduralBakePlan, MaterialProceduralBakePlanOptions, MaterialProceduralBakeRaster, MaterialProceduralBakeRasterImage, MaterialProceduralBakeTarget, MaterialProceduralColor, MaterialProceduralLayer, MaterialProceduralPlan, MaterialProceduralPlanOptions, MaterialProceduralUniform, MaterialProceduralUniformType, MaterialTrait, MaterialTraitChannel, MaterialTraitInferenceOptions, MaterialTraitOptions, MaterialTraitType, MaterialType, MaterialVariantOptions, MaterialVariantSetOptions, OrganicProperties, ShellPattern, ShellProperties, VolumetricProperties } from "./types";
export {
  encodeMaterialProceduralBakeImagePng,
  encodeMaterialProceduralBakeRasterPng,
} from './png';
export { cloneMaterialDefinition, MATERIALS, resolveMaterialDefinition } from './presets';
export { createMaterialProceduralPlan } from './procedural';
export { createMaterialTrait, inferMaterialTraits } from './traits';
export { createMaterialVariant, createMaterialVariants } from './variants';
