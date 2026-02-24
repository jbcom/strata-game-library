/**
 * @fileoverview Vegetation API Examples
 *
 * Complete examples for all vegetation-related APIs in Strata.
 * Each example is directly linked to its corresponding API method.
 *
 * @module examples/vegetation
 */

import type { BiomeData } from '@jbcom/strata';
import {
  createGrassInstances,
  createRockInstances,
  createTreeInstances,
  createVegetationMesh,
  generateInstanceData,
} from '@jbcom/strata';
import * as THREE from 'three';

/**
 * Example 1: Basic Grass Instances
 *
 * Demonstrates the simplest usage of the grass instancing system.
 *
 * @example
 * ```tsx
 * import { createGrassInstances } from '@jbcom/strata';
 *
 * const grassMesh = createGrassInstances(1000, 50, biomes);
 * scene.add(grassMesh);
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/vegetation/index.ts#L84 createGrassInstances}
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/core/instancing.ts generateInstanceData}
 *
 * @category Basic
 * @apiExample createGrassInstances
 */
export function Example_BasicGrassInstances() {
  // Define simple biomes
  const biomes: any[] = [
    {
      type: 'forest',
      center: new THREE.Vector2(0, 0),
      radius: 100,
      color: 0x3a5a2a,
      vegetation: 1.0,
    },
  ];

  // Create 1000 grass instances over a 50x50 area
  const grassMesh = createGrassInstances(1000, 50, biomes);

  return {
    mesh: grassMesh,
    description: 'Basic grass instancing with default parameters',
    apiCalls: ['createGrassInstances'],
  };
}

/**
 * Example 2: Advanced Grass with Custom Height Function
 *
 * Shows how to use a custom height function to place grass on terrain.
 * The height function determines the Y position of each instance.
 *
 * @example
 * ```tsx
 * const heightFunction = (x: number, z: number) => {
 *     return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5;
 * };
 *
 * const grassMesh = createGrassInstances(5000, 100, biomes, {
 *     heightFunction,
 *     seed: 42,
 *     enableWind: true,
 *     windStrength: 0.8,
 * });
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/vegetation/index.ts#L84 createGrassInstances}
 * @param heightFunction - Custom function (x, z) => y for terrain following
 * @param seed - Random seed for deterministic placement
 * @param enableWind - Enable wind animation
 * @param windStrength - Wind intensity (0-1)
 *
 * @category Advanced
 * @apiExample createGrassInstances
 */
export function Example_AdvancedGrassWithHeightFunction() {
  const biomes: any[] = [
    {
      type: 'forest',
      center: new THREE.Vector2(0, 0),
      radius: 100,
      color: 0x3a5a2a,
      vegetation: 1.0,
    },
  ];

  // Custom height function for hilly terrain
  const heightFunction = (x: number, z: number): number => {
    return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5 + Math.sin(x * 0.05) * 3;
  };

  const grassMesh = createGrassInstances(5000, 100, biomes, {
    heightFunction,
    seed: 42,
    enableWind: true,
    windStrength: 0.8,
    lodDistance: 150,
  });

  return {
    mesh: grassMesh,
    description: 'Grass following terrain with custom height function and wind',
    apiCalls: ['createGrassInstances'],
    parameters: {
      count: 5000,
      areaSize: 100,
      heightFunction: 'custom terrain-following function',
      seed: 42,
      enableWind: true,
      windStrength: 0.8,
      lodDistance: 150,
    },
  };
}

/**
 * Example 3: Multi-Biome Grass Distribution
 *
 * Demonstrates biome-based vegetation density. Different biomes
 * have different vegetation multipliers, creating natural-looking
 * distribution patterns.
 *
 * @example
 * ```tsx
 * const biomes: any[] = [
 *     {
 *         type: "forest", center: new THREE.Vector2(0, 0), radius: 100, color: 0x3a5a2a,
 *         vegetation: 1.5,  // 150% density
 *     },
 *     {
 *         type: "forest", center: new THREE.Vector2(0, 0), radius: 100, color: 0x2a4a1a,
 *         vegetation: 0.8,  // 80% density (less grass under trees)
 *     },
 *     {
 *         type: "forest", center: new THREE.Vector2(0, 0), radius: 100, color: 0x6a6a5a,
 *         vegetation: 0.2,  // 20% density (sparse on rocks)
 *     },
 * ];
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/core/instancing.ts#L60 generateInstanceData}
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/core/sdf.ts#L280 getBiomeAt}
 *
 * @category Advanced
 * @apiExample BiomeData, createGrassInstances
 */
export function Example_MultiBiomeGrassDistribution() {
  const biomes: any[] = [
    {
      type: 'forest',
      center: new THREE.Vector2(0, 0),
      radius: 100,
      color: 0x3a5a2a,
      vegetation: 1.5, // Dense grass in open areas
    },
    {
      type: 'forest',
      center: new THREE.Vector2(0, 0),
      radius: 100,
      color: 0x2a4a1a,
      vegetation: 0.8, // Less grass under tree canopy
    },
    {
      type: 'forest',
      center: new THREE.Vector2(0, 0),
      radius: 100,
      color: 0x6a6a5a,
      vegetation: 0.2, // Sparse grass on rocky terrain
    },
  ];

  const heightFunction = (x: number, z: number): number => {
    return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5;
  };

  const grassMesh = createGrassInstances(8000, 120, biomes, {
    heightFunction,
    seed: 42,
    enableWind: true,
    windStrength: 0.6,
  });

  return {
    mesh: grassMesh,
    description: 'Grass with biome-based density variation',
    apiCalls: ['createGrassInstances', 'BiomeData'],
    biomes,
  };
}

/**
 * Example 4: Tree Instances with Species Variation
 *
 * Creates tree instances using the built-in tree generation.
 * Trees are larger and have different placement patterns than grass.
 *
 * @example
 * ```tsx
 * const treeMesh = createTreeInstances(500, 150, biomes, {
 *     heightFunction,
 *     seed: 1042,
 *     enableWind: true,
 *     windStrength: 0.3,  // Less wind than grass
 *     lodDistance: 200,    // Visible from farther away
 * });
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/vegetation/index.ts#L118 createTreeInstances}
 *
 * @category Basic
 * @apiExample createTreeInstances
 */
export function Example_TreeInstances() {
  const biomes: any[] = [
    {
      type: 'forest',
      center: new THREE.Vector2(0, 0),
      radius: 100,
      color: 0x2a4a1a,
      vegetation: 1.5, // Dense trees
    },
    {
      type: 'forest',
      center: new THREE.Vector2(0, 0),
      radius: 100,
      color: 0x3a5a2a,
      vegetation: 0.3, // Scattered trees
    },
  ];

  const heightFunction = (x: number, z: number): number => {
    return Math.sin(x * 0.08) * Math.cos(z * 0.08) * 6;
  };

  const treeMesh = createTreeInstances(500, 150, biomes, {
    heightFunction,
    seed: 1042,
    enableWind: true,
    windStrength: 0.3,
    lodDistance: 200,
  });

  return {
    mesh: treeMesh,
    description: 'Tree instances with forest-biome preference',
    apiCalls: ['createTreeInstances'],
    parameters: {
      count: 500,
      areaSize: 150,
      seed: 1042,
      windStrength: 0.3,
    },
  };
}

/**
 * Example 5: Rock Instances for Environmental Detail
 *
 * Rocks add environmental detail and don't animate (no wind).
 * Useful for rocky biomes, mountain areas, or general decoration.
 *
 * @example
 * ```tsx
 * const rockMesh = createRockInstances(200, 120, biomes, {
 *     heightFunction,
 *     seed: 2042,
 *     lodDistance: 250,
 * });
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/vegetation/index.ts#L155 createRockInstances}
 *
 * @category Basic
 * @apiExample createRockInstances
 */
export function Example_RockInstances() {
  const biomes: any[] = [
    {
      type: 'forest',
      center: new THREE.Vector2(0, 0),
      radius: 100,
      color: 0x7a7a6a,
      vegetation: 2.0, // High rock density
    },
    {
      type: 'forest',
      center: new THREE.Vector2(0, 0),
      radius: 100,
      color: 0x3a5a2a,
      vegetation: 0.3, // Scattered rocks
    },
  ];

  const heightFunction = (x: number, z: number): number => {
    return Math.sin(x * 0.08) * Math.cos(z * 0.08) * 6;
  };

  const rockMesh = createRockInstances(200, 120, biomes, {
    heightFunction,
    seed: 2042,
    lodDistance: 250,
  });

  return {
    mesh: rockMesh,
    description: 'Rock instances for environmental detail',
    apiCalls: ['createRockInstances'],
  };
}

/**
 * Example 6: Custom Vegetation with createVegetationMesh
 *
 * Create custom vegetation types using your own geometry and material.
 * This is the most flexible approach for specialized vegetation.
 *
 * @example
 * ```tsx
 * // Create custom flower geometry
 * const flowerGeometry = new THREE.ConeGeometry(0.1, 0.3, 6);
 * const flowerMaterial = new THREE.MeshStandardMaterial({
 *     type: "forest", center: new THREE.Vector2(0, 0), radius: 100, color: 0xff69b4,
 *     emissive: 0x330011,
 * });
 *
 * const flowerMesh = createVegetationMesh({
 *     count: 2000,
 *     areaSize: 100,
 *     biomes,
 *     heightFunction,
 *     seed: 3042,
 *     geometry: flowerGeometry,
 *     material: flowerMaterial,
 *     enableWind: true,
 *     windStrength: 1.0,  // Flowers sway more
 * });
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/vegetation/index.ts#L29 createVegetationMesh}
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/core/instancing.ts#L85 createInstancedMesh}
 *
 * @category Advanced
 * @apiExample createVegetationMesh
 */
export function Example_CustomVegetation() {
  const biomes: any[] = [
    {
      type: 'forest',
      center: new THREE.Vector2(0, 0),
      radius: 100,
      color: 0x4a7a3a,
      vegetation: 1.8, // Dense flowers
    },
  ];

  const heightFunction = (x: number, z: number): number => {
    return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 3;
  };

  // Custom flower geometry
  const flowerGeometry = new THREE.ConeGeometry(0.1, 0.3, 6);
  flowerGeometry.translate(0, 0.15, 0);

  const flowerMaterial = new THREE.MeshStandardMaterial({
    color: 0xff69b4,
    emissive: 0x330011,
    emissiveIntensity: 0.2,
  });

  const flowerMesh = createVegetationMesh({
    count: 2000,
    areaSize: 100,
    biomes,
    heightFunction,
    seed: 3042,
    geometry: flowerGeometry,
    material: flowerMaterial,
    enableWind: true,
    windStrength: 1.0,
    lodDistance: 80,
  });

  return {
    mesh: flowerMesh,
    description: 'Custom flower vegetation with pink color and swaying',
    apiCalls: ['createVegetationMesh'],
    customization: {
      geometry: 'ConeGeometry (custom flower shape)',
      material: 'MeshStandardMaterial with emissive glow',
      windStrength: 1.0,
    },
  };
}

/**
 * Example 7: Direct Instance Data Generation
 *
 * For maximum control, generate instance data directly and use it
 * however you need. This gives you access to raw position/rotation data.
 *
 * @example
 * ```tsx
 * const instances = generateInstanceData(
 *     1000,              // count
 *     50,                // areaSize
 *     heightFunction,    // height function
 *     biomes,            // biome array
 *     ['forest'],        // only spawn in 'forest' biome
 *     42                 // seed
 * );
 *
 * // instances is an array of { position, rotation, scale }
 * // Use this data for custom rendering or physics objects
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/core/instancing.ts#L60 generateInstanceData}
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/core/instancing.ts#L85 createInstancedMesh}
 *
 * @category Advanced
 * @apiExample generateInstanceData
 */
export function Example_DirectInstanceGeneration() {
  const biomes: any[] = [
    {
      type: 'forest',
      center: new THREE.Vector2(0, 0),
      radius: 100,
      color: 0x2a4a1a,
      vegetation: 1.0,
    },
    {
      type: 'forest',
      center: new THREE.Vector2(0, 0),
      radius: 100,
      color: 0x3a5a2a,
      vegetation: 0.5,
    },
  ];

  const heightFunction = (x: number, z: number): number => {
    return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5;
  };

  // Generate raw instance data
  const instances = generateInstanceData(
    1000,
    50,
    heightFunction,
    biomes,
    ['forest'], // Only place in forest biome
    42
  );

  // Now you can use this data for:
  // - Custom rendering
  // - Physics objects (each tree is a collider)
  // - Spawning game entities
  // - Procedural placement of any objects

  return {
    instances,
    description: 'Raw instance data for custom usage',
    apiCalls: ['generateInstanceData'],
    dataStructure: {
      count: instances.length,
      properties: 'position (Vector3), rotation (Euler), scale (Vector3)',
      usage: 'Can be used for custom rendering, physics, or game logic',
    },
  };
}

/**
 * Example 8: Complete Vegetation Scene
 *
 * Combines all vegetation types in a realistic scene setup.
 * Shows best practices for layering different vegetation types.
 *
 * @example
 * ```tsx
 * // Layer 1: Ground cover (grass) - highest density
 * const grass = createGrassInstances(10000, 200, grassBiomes, {
 *     heightFunction,
 *     seed: 1,
 *     windStrength: 0.6,
 * });
 *
 * // Layer 2: Small vegetation (flowers, shrubs)
 * const flowers = createVegetationMesh({ ... });
 *
 * // Layer 3: Trees - medium density
 * const trees = createTreeInstances(600, 200, forestBiomes, {
 *     heightFunction,
 *     seed: 2,
 * });
 *
 * // Layer 4: Environmental detail (rocks)
 * const rocks = createRockInstances(150, 200, rockyBiomes, {
 *     heightFunction,
 *     seed: 3,
 * });
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/vegetation/index.ts Vegetation API}
 *
 * @category Complete
 * @apiExample Multi-layer vegetation scene
 */
export function Example_CompleteVegetationScene() {
  const areaSize = 200;

  // Define comprehensive biome system
  const grassBiomes: BiomeData[] = [];

  const forestBiomes: BiomeData[] = [];

  const rockyBiomes: BiomeData[] = [];

  const heightFunction = (x: number, z: number): number => {
    return (
      Math.sin(x * 0.08) * Math.cos(z * 0.08) * 8 + Math.sin(x * 0.04) * Math.sin(z * 0.04) * 4
    );
  };

  // Create all vegetation layers
  const grass = createGrassInstances(10000, areaSize, grassBiomes, {
    heightFunction,
    seed: 1,
    enableWind: true,
    windStrength: 0.6,
  });

  const trees = createTreeInstances(600, areaSize, forestBiomes, {
    heightFunction,
    seed: 2,
    enableWind: true,
    windStrength: 0.3,
  });

  const rocks = createRockInstances(150, areaSize, rockyBiomes, {
    heightFunction,
    seed: 3,
  });

  return {
    layers: {
      grass,
      trees,
      rocks,
    },
    description: 'Complete multi-layer vegetation scene with 10,750 total instances',
    apiCalls: ['createGrassInstances', 'createTreeInstances', 'createRockInstances'],
    statistics: {
      totalInstances: 10750,
      grassInstances: 10000,
      treeInstances: 600,
      rockInstances: 150,
    },
  };
}

/**
 * All vegetation examples exported for showcase
 */
export const VegetationExamples = {
  Example_BasicGrassInstances,
  Example_AdvancedGrassWithHeightFunction,
  Example_MultiBiomeGrassDistribution,
  Example_TreeInstances,
  Example_RockInstances,
  Example_CustomVegetation,
  Example_DirectInstanceGeneration,
  Example_CompleteVegetationScene,
};
