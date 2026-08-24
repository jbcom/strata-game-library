/**
 * @strata-game-library/presets
 *
 * Generic, composable preset system for game assets.
 *
 * PHILOSOPHY:
 * - Define ALL the knobs for each asset type
 * - Provide FORMS as suggested starting points
 * - Apply THEMES for colors
 * - Everything is customizable
 *
 * @example
 * ```typescript
 * import {
 *   createQuadruped,
 *   createBuilding,
 *   createCollectible,
 *   createObstacle,
 *   ALL_THEMES,
 *   generateCreaturePrompt
 * } from '@strata-game-library/presets';
 *
 * // Create a baby otter with arctic theme
 * const otter = createQuadruped('otter', { age: 'baby', furLength: 1.4 });
 * const prompt = generateCreaturePrompt(otter, ALL_THEMES.arctic, 'otter');
 *
 * // Create a temple building
 * const temple = createBuilding('temple', { floors: 2, wear: 0.3 });
 *
 * // Create a rare gem collectible
 * const gem = createCollectible('gem', 'rare', { size: 1.5 });
 *
 * // Create a moving spike obstacle
 * const spike = createObstacle('spike', 'severe', { moving: true });
 * ```
 */

export type { CollectibleForm, CollectibleParams, RarityTier } from './collectibles';
// Collectibles (coins, gems, etc.)
export {
  COLLECTIBLE_DEFAULTS,
  COLLECTIBLE_FORMS,
  createCollectible,
  RARITY_MODIFIERS,
} from './collectibles';
export type {
  CoatMorphology,
  CreatureTheme,
  DetailedMorphology,
  EarMorphology,
  EyeMorphology,
  FormName,
  MountParams,
  PawMorphology,
  QuadrupedParams,
  SnoutMorphology,
  TailMorphology,
  WhiskerMorphology,
} from './creatures';
export {
  ALL_THEMES,
  createCustomQuadruped,
  createMorphology,
  createMount,
  createQuadruped,
  FANTASY_THEMES,
  generateCreaturePrompt,
  generateMountPrompt,
  getFantasyThemes,
  getNaturalThemes,
  getThemesByTag,
  MORPHOLOGY_DEFAULTS,
  MOUNT_DEFAULTS,
  NATURAL_THEMES,
  QUADRUPED_DEFAULTS,
  QUADRUPED_FORMS,
  quadrupedToMorphology,
  SPECIES_MORPHOLOGY,
  suggestGameplayStats,
} from './creatures';
export type { EquipmentForm, EquipmentParams } from './equipment';
export {
  createEquipment,
  EQUIPMENT_DEFAULTS,
  EQUIPMENT_FORMS,
  generateEquipmentPrompt,
  suggestEquipmentStats,
} from './equipment';
export type { HazardLevel, ObstacleForm, ObstacleParams } from './obstacles';
export { createObstacle, HAZARD_MODIFIERS, OBSTACLE_DEFAULTS, OBSTACLE_FORMS } from './obstacles';
export type { BuildingForm, BuildingParams } from './structures/building';
export { BUILDING_DEFAULTS, BUILDING_FORMS, createBuilding } from './structures/building';
export type { BiomeData, InstanceData, VegetationOptions } from './vegetation';
export {
  createGrassInstances,
  createRockInstances,
  createTreeInstances,
  createVegetationMesh,
} from './vegetation';
export type { VehicleForm, VehicleParams } from './vehicles';
export { createVehicle, generateVehiclePrompt, VEHICLE_DEFAULTS, VEHICLE_FORMS } from './vehicles';
