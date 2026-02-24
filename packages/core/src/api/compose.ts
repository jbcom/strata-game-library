/**
 * @module Compose
 * @category Compositional Object System
 *
 * Compositional Object System - Materials, Skeletons, Props, and Creatures
 *
 * This system allows you to define complex game objects declaratively by
 * combining materials, skeletons, and coverings.
 *
 * @example
 * ```ts
 * import { MATERIALS, SKELETONS, COVERINGS, CREATURES } from '@jbcom/strata/api/compose';
 *
 * // Access pre-defined otter creature
 * const otter = CREATURES.otter_river;
 *
 * // Create a custom fur material
 * const goldenFur = createFurMaterial('golden_fur', {
 *   baseColor: '#ffd700',
 *   shell: { length: 0.08 }
 * });
 * ```
 */

export {
  type BoneDefinition,
  COVERINGS,
  type CoveringDefinition,
  type CoveringRegion,
  CREATURES,
  type CreatureDefinition,
  createAvianSkeleton,
  createBipedSkeleton,
  // Factories & Presets
  createFurMaterial,
  createMetalMaterial,
  createOrganicMaterial,
  createQuadrupedSkeleton,
  createSerpentineSkeleton,
  createShellMaterial,
  createVolumetricMaterial,
  createWoodMaterial,
  type DropItem,
  type DropTable,
  type IKChainDefinition,
  // Constants
  MATERIALS,
  type MarkingDefinition,
  // Types
  type MaterialDefinition,
  type MaterialPhysics,
  type MaterialType,
  type OrganicProperties,
  type PatternDefinition,
  PROPS,
  type PropComponent,
  type PropDefinition,
  type ShellPattern,
  type ShellProperties,
  SKELETONS,
  type SkeletonDefinition,
  type VolumetricProperties,
} from '../compose';
