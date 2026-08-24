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

// Collectibles (coins, gems, etc.)
export { COLLECTIBLE_DEFAULTS, COLLECTIBLE_FORMS, RARITY_MODIFIERS, createCollectible } from "./collectibles";
export type { CollectibleForm, CollectibleParams, RarityTier } from "./collectibles";
export { ALL_THEMES, FANTASY_THEMES, MORPHOLOGY_DEFAULTS, MOUNT_DEFAULTS, NATURAL_THEMES, QUADRUPED_DEFAULTS, QUADRUPED_FORMS, SPECIES_MORPHOLOGY, createCustomQuadruped, createMorphology, createMount, createQuadruped, generateCreaturePrompt, generateMountPrompt, getFantasyThemes, getNaturalThemes, getThemesByTag, quadrupedToMorphology, suggestGameplayStats } from "./creatures";
export type { CoatMorphology, CreatureTheme, DetailedMorphology, EarMorphology, EyeMorphology, FormName, MountParams, PawMorphology, QuadrupedParams, SnoutMorphology, TailMorphology, WhiskerMorphology } from "./creatures";
export { EQUIPMENT_DEFAULTS, EQUIPMENT_FORMS, createEquipment, generateEquipmentPrompt, suggestEquipmentStats } from "./equipment";
export type { EquipmentForm, EquipmentParams } from "./equipment";
export { HAZARD_MODIFIERS, OBSTACLE_DEFAULTS, OBSTACLE_FORMS, createObstacle } from "./obstacles";
export type { HazardLevel, ObstacleForm, ObstacleParams } from "./obstacles";
export { BUILDING_DEFAULTS, BUILDING_FORMS, createBuilding } from "./structures/building";
export type { BuildingForm, BuildingParams } from "./structures/building";
export { createGrassInstances, createRockInstances, createTreeInstances, createVegetationMesh } from "./vegetation";
export type { BiomeData, InstanceData, VegetationOptions } from "./vegetation";
export { VEHICLE_DEFAULTS, VEHICLE_FORMS, createVehicle, generateVehiclePrompt } from "./vehicles";
export type { VehicleForm, VehicleParams } from "./vehicles";
