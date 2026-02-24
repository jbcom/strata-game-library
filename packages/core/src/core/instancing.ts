/**
 * GPU-Accelerated Instancing - Render millions of objects efficiently.
 *
 * Instance tens of thousands of vegetation, rocks, or props with minimal performance cost.
 * Perfect for massive forests, grass fields, and detail-rich environments.
 *
 * @packageDocumentation
 * @module core/instancing
 * @category Rendering Pipeline
 *
 * ## Interactive Demos
 * - 🎮 [Vegetation Showcase](https://github.com/jbcom/nodejs-strata/tree/main/examples/vegetation-showcase)
 *
 * ## Why Instancing?
 * Traditional rendering creates a new draw call per object. GPU instancing sends geometry once,
 * then renders thousands of copies with different transforms in a single draw call.
 *
 * @example
 * ```typescript
 * // Scatter 10,000 rocks across terrain
 * import { generateInstanceData, createInstancedMesh } from '@jbcom/strata/core/instancing';
 *
 * const biomes = [{ type: 'mountain', center: new Vector2(0, 0), radius: 100 }];
 * const instances = generateInstanceData(
 *   10000,
 *   200,
 *   (x, z) => getTerrainHeight(x, z, biomes)
 * );
 *
 * const rockMesh = createInstancedMesh({
 *   geometry: rockGeometry,
 *   material: rockMaterial,
 *   count: 10000,
 *   instances
 * });
 * ```
 */

import * as THREE from 'three';

/**
 * Data for a single instance.
 * @category Rendering Pipeline
 */
export interface InstanceData {
  /** World position vector. */
  position: THREE.Vector3;
  /** Local rotation euler. */
  rotation: THREE.Euler;
  /** Local scale vector. */
  scale: THREE.Vector3;
}

/**
 * Biome data for instancing.
 * Compatible with SDF BiomeData but used for instance placement.
 * Import BiomeData from './sdf' instead.
 */
import type { BiomeData } from './sdf';
export type { BiomeData };

/**
 * Options for creating an instanced mesh.
 * @category Rendering Pipeline
 */
export interface InstancingOptions {
  /** The base geometry to instance. */
  geometry: THREE.BufferGeometry;
  /** The material to use for all instances. */
  material: THREE.Material;
  /** Maximum number of instances to render. */
  count: number;
  /** Array of instance transform data. */
  instances: InstanceData[];
  /** Whether to enable GPU wind animation (requires compatible shader). Default: true. */
  enableWind?: boolean;
  /** Strength of wind animation. Default: 0.5. */
  windStrength?: number;
  /** Distance at which LOD transitions occur in world units. */
  lodDistance?: number;
  /** Whether to enable frustum culling. Default: true. */
  frustumCulled?: boolean;
  /** Whether instances cast shadows. Default: true. */
  castShadow?: boolean;
  /** Whether instances receive shadows. Default: true. */
  receiveShadow?: boolean;
}

/**
 * Seeded random number generator for deterministic instance generation
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

/**
 * Generate instance data for vegetation/objects.
 * Pure TypeScript - no React dependencies.
 *
 * @category Rendering Pipeline
 * @param count - Number of instances to generate
 * @param areaSize - Size of the area to place instances in
 * @param heightFunc - Function to get terrain height at (x, z)
 * @param biomes - Optional biome data for filtering
 * @param allowedBiomes - Optional list of allowed biome types
 * @param seed - Optional seed for deterministic generation (default: random)
 * @param getBiomeAt - Optional biome lookup function
 * @param noise3D - Optional 3D noise function
 * @param fbm - Optional FBM function
 * @returns Array of InstanceData
 */
export function generateInstanceData(
  count: number,
  areaSize: number,
  heightFunc: (x: number, z: number) => number,
  biomes?: BiomeData[],
  allowedBiomes?: string[],
  seed?: number,
  getBiomeAt?: (x: number, z: number, biomes: BiomeData[]) => BiomeData,
  _noise3D?: (x: number, y: number, z: number) => number,
  fbm?: (x: number, y: number, z: number, octaves?: number) => number
): InstanceData[] {
  // Input validation
  if (count <= 0) {
    throw new Error('generateInstanceData: count must be positive');
  }
  if (areaSize <= 0) {
    throw new Error('generateInstanceData: areaSize must be positive');
  }
  if (biomes && biomes.length === 0 && allowedBiomes && allowedBiomes.length > 0) {
    throw new Error(
      'generateInstanceData: biomes array cannot be empty when allowedBiomes is specified'
    );
  }

  // Initialize seeded random or use Math.random
  const rng = seed !== undefined ? new SeededRandom(seed) : null;
  const random = rng ? () => rng.next() : Math.random;
  const instances: InstanceData[] = [];

  // Default implementations if not provided
  const defaultGetBiomeAt =
    getBiomeAt ||
    ((x: number, z: number, biomes: BiomeData[]) => {
      if (biomes.length === 0) {
        throw new Error('getBiomeAt: biomes array cannot be empty');
      }
      let closest = biomes[0];
      let closestDist = Infinity;
      for (const biome of biomes) {
        const dist = Math.sqrt((x - biome.center.x) ** 2 + (z - biome.center.y) ** 2);
        if (dist < closestDist) {
          closestDist = dist;
          closest = biome;
        }
      }
      return closest;
    });

  const defaultFbm =
    fbm ||
    ((x: number, _y: number, z: number, octaves: number = 4) => {
      // Simple FBM fallback
      let value = 0;
      let amplitude = 0.5;
      let frequency = 1;
      for (let i = 0; i < octaves; i++) {
        value += amplitude * Math.sin(x * frequency) * Math.cos(z * frequency);
        amplitude *= 0.5;
        frequency *= 2;
      }
      return value;
    });

  let attempts = 0;
  const maxAttempts = count * 10;

  while (instances.length < count && attempts < maxAttempts) {
    attempts++;

    // Random position (using seeded or Math.random)
    const x = (random() - 0.5) * areaSize;
    const z = (random() - 0.5) * areaSize;

    // Check biome if provided
    if (biomes && allowedBiomes && biomes.length > 0) {
      const biome = defaultGetBiomeAt(x, z, biomes);
      if (!allowedBiomes.includes(biome.type)) continue;
    }

    // Get terrain height
    const y = heightFunc(x, z);

    // Skip underwater
    if (y < 0) continue;

    // Add some clustering using noise
    const densityNoise = defaultFbm(x * 0.05, 0, z * 0.05, 2);
    if (random() > densityNoise * 1.5) continue;

    // Random rotation and scale (using seeded or Math.random)
    const rotation = new THREE.Euler(
      (random() - 0.5) * 0.2,
      random() * Math.PI * 2,
      (random() - 0.5) * 0.2
    );

    const baseScale = 0.8 + random() * 0.4;
    const scale = new THREE.Vector3(baseScale, baseScale, baseScale);

    instances.push({
      position: new THREE.Vector3(x, y, z),
      rotation,
      scale,
    });
  }

  return instances;
}

/**
 * Create instanced mesh with instance matrices (pure TypeScript).
 * Returns THREE.InstancedMesh ready for use with any framework.
 *
 * @category Rendering Pipeline
 * @param options - Configuration options
 * @returns THREE.InstancedMesh
 */
export function createInstancedMesh(options: InstancingOptions): THREE.InstancedMesh {
  const {
    geometry,
    material,
    count,
    instances,
    frustumCulled = true,
    castShadow = true,
    receiveShadow = true,
  } = options;

  // Input validation
  if (!geometry) {
    throw new Error('createInstancedMesh: geometry is required');
  }
  if (!material) {
    throw new Error('createInstancedMesh: material is required');
  }
  if (count <= 0) {
    throw new Error('createInstancedMesh: count must be positive');
  }
  if (!instances || instances.length === 0) {
    throw new Error('createInstancedMesh: instances array cannot be empty');
  }

  const instanceCount = Math.min(instances.length, count);
  const mesh = new THREE.InstancedMesh(geometry, material, instanceCount);

  mesh.frustumCulled = frustumCulled;
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;

  // Set instance matrices
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();

  for (let i = 0; i < instanceCount; i++) {
    const instance = instances[i];
    quaternion.setFromEuler(instance.rotation);
    matrix.compose(instance.position, quaternion, instance.scale);
    mesh.setMatrixAt(i, matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  mesh.count = instanceCount;

  // Attach custom properties for future GPU implementation or shader use
  if (options.enableWind !== undefined) (mesh as any).enableWind = options.enableWind;
  if (options.windStrength !== undefined) (mesh as any).windStrength = options.windStrength;
  if (options.lodDistance !== undefined) (mesh as any).lodDistance = options.lodDistance;

  return mesh;
}
