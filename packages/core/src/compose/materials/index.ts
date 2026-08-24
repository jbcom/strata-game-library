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
export * from './encoders';
export * from './factory';
export {
  encodeMaterialProceduralBakeImagePng,
  encodeMaterialProceduralBakeRasterPng,
} from './png';
export { cloneMaterialDefinition, MATERIALS, resolveMaterialDefinition } from './presets';
export { createMaterialProceduralPlan } from './procedural';
export { createMaterialTrait, inferMaterialTraits } from './traits';
export * from './types';
export { createMaterialVariant, createMaterialVariants } from './variants';
