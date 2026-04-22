/**
 * @fileoverview Strata API Showcase - Complete Example Index
 *
 * This module exports all API examples organized by system.
 * Every example is JSDoc-linked to its corresponding API implementation.
 *
 * @module examples
 */

export * as CompositionExamples from './composition/CompositionExamples';
export { SkyExamples } from './sky/SkyExamples';
export { VegetationExamples } from './vegetation/VegetationExamples';
export { WaterExamples } from './water/WaterExamples';

/**
 * Complete API coverage map
 */
export const API_COVERAGE = {
  vegetation: {
    examples: 8,
    apis: [
      'createGrassInstances',
      'createTreeInstances',
      'createRockInstances',
      'createVegetationMesh',
      'generateInstanceData',
      'createInstancedMesh',
      'BiomeData',
    ],
  },
  water: {
    examples: 8,
    apis: ['Water', 'AdvancedWater', 'createWaterMaterial', 'createAdvancedWaterMaterial'],
  },
  sky: {
    examples: 10,
    apis: [
      'ProceduralSky',
      'createSkyMaterial',
      'createSkyGeometry',
      'createVolumetricFogMeshMaterial',
      'createUnderwaterOverlayMaterial',
      'TimeOfDayState',
      'WeatherState',
    ],
  },
  composition: {
    examples: 3,
    apis: [
      'RuntimeProp',
      'RuntimeCreature',
      'resolvePropComposition',
      'resolveCreatureComposition',
      'createMaterialVariant',
      'createRuntimeCreatureAnimationGraphController',
      'createRuntimeCreatureIKPose',
    ],
  },
};

/**
 * Total example statistics
 */
export const EXAMPLE_STATS = {
  totalExamples: 29,
  totalAPIs: 25,
  categories: {
    basic: 13,
    advanced: 11,
    complete: 5,
  },
};
