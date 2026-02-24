/**
 * Vegetation Generation Presets - GPU-instanced nature systems.
 * @packageDocumentation
 * @module presets/vegetation
 */

import type { BiomeData } from '@strata-game-library/core';
import { createInstancedMesh, generateInstanceData } from '@strata-game-library/core';
import * as THREE from 'three';

export type { BiomeData, InstanceData } from '@strata-game-library/core';

export interface VegetationOptions {
  count: number;
  areaSize: number;
  biomes: BiomeData[];
  heightFunction?: (x: number, z: number) => number;
  seed?: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  enableWind?: boolean;
  windStrength?: number;
  lodDistance?: number;
}

/**
 * Create instanced vegetation mesh
 */
export function createVegetationMesh(options: VegetationOptions): THREE.InstancedMesh {
  const { count, areaSize, biomes, heightFunction, seed, geometry, material } = options;

  // Input validation
  if (count <= 0) {
    throw new Error('createVegetationMesh: count must be positive');
  }
  if (areaSize <= 0) {
    throw new Error('createVegetationMesh: areaSize must be positive');
  }
  if (!biomes || biomes.length === 0) {
    throw new Error('createVegetationMesh: biomes array cannot be empty');
  }
  if (!geometry) {
    throw new Error('createVegetationMesh: geometry is required');
  }
  if (!material) {
    throw new Error('createVegetationMesh: material is required');
  }

  // Generate instance data
  // heightFunction is required, provide a default that returns 0 if not specified
  const defaultHeightFunc = heightFunction || ((_x: number, _z: number) => 0);
  const instances = generateInstanceData(
    count,
    areaSize,
    defaultHeightFunc,
    biomes,
    undefined, // allowedBiomes
    seed
  );

  // Create instanced mesh
  return createInstancedMesh({
    geometry,
    material,
    count,
    instances,
  });
}

/**
 * Create grass instances (convenience function)
 */
export function createGrassInstances(
  count: number,
  areaSize: number,
  biomes: BiomeData[],
  options: {
    seed?: number;
    heightFunction?: (x: number, z: number) => number;
    enableWind?: boolean;
    windStrength?: number;
    lodDistance?: number;
  } = {}
): THREE.InstancedMesh {
  const geometry = new THREE.ConeGeometry(0.05, 0.4, 3);
  geometry.translate(0, 0.2, 0); // Pivot at bottom

  const material = new THREE.MeshLambertMaterial({ color: 0x335522 });

  return createVegetationMesh({
    count,
    areaSize,
    biomes,
    heightFunction: options.heightFunction,
    seed: options.seed,
    geometry,
    material,
    enableWind: options.enableWind ?? true,
    windStrength: options.windStrength ?? 0.5,
    lodDistance: options.lodDistance ?? 100,
  });
}

/**
 * Create tree instances (convenience function)
 */
export function createTreeInstances(
  count: number,
  areaSize: number,
  biomes: BiomeData[],
  options: {
    seed?: number;
    heightFunction?: (x: number, z: number) => number;
    enableWind?: boolean;
    windStrength?: number;
    lodDistance?: number;
  } = {}
): THREE.InstancedMesh {
  const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 2, 8);
  const foliageGeometry = new THREE.ConeGeometry(0.8, 1.5, 8);
  foliageGeometry.translate(0, 1.5, 0);

  // Combine geometries (simplified - in production, use BufferGeometryUtils)
  const geometry = trunkGeometry;
  const material = new THREE.MeshStandardMaterial({ color: 0x4a5a3a });

  return createVegetationMesh({
    count,
    areaSize,
    biomes,
    heightFunction: options.heightFunction,
    seed: options.seed,
    geometry,
    material,
    enableWind: options.enableWind ?? true,
    windStrength: options.windStrength ?? 0.3,
    lodDistance: options.lodDistance ?? 150,
  });
}

/**
 * Create rock instances (convenience function)
 */
export function createRockInstances(
  count: number,
  areaSize: number,
  biomes: BiomeData[],
  options: {
    seed?: number;
    heightFunction?: (x: number, z: number) => number;
    lodDistance?: number;
  } = {}
): THREE.InstancedMesh {
  const geometry = new THREE.DodecahedronGeometry(1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.8,
  });

  return createVegetationMesh({
    count,
    areaSize,
    biomes,
    heightFunction: options.heightFunction,
    seed: options.seed,
    geometry,
    material,
    enableWind: false, // Rocks don't sway
    windStrength: 0,
    lodDistance: options.lodDistance ?? 200,
  });
}
