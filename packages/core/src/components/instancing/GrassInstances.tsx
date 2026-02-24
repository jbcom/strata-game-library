import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { GPUInstancedMesh } from './GPUInstancedMesh';
import { DEFAULT_BIOMES, type VegetationProps } from './types';
import { generateBiomeInstanceData } from './utils';

/**
 * Realistic instanced grass blades with biome-aware placement.
 *
 * Automatically spawns grass primarily in marsh, forest, and savanna biomes.
 * Uses optimized GPU batching for rendering tens of thousands of blades.
 *
 * @category World Building
 *
 * ## Interactive Demos
 * <iframe src="../../demos/vegetation.html" width="100%" height="400px" style="border-radius: 8px; border: 1px solid #1e293b;"></iframe>
 *
 * - 🎮 [Full Screen Vegetation Demo](../../demos/vegetation.html)
 * - 📦 [Vegetation Showcase](https://github.com/jbcom/nodejs-strata/tree/main/examples/vegetation-showcase)
 *
 * @example
 * ```tsx
 * // Lush green field
 * <GrassInstances
 *   count={20000}
 *   areaSize={100}
 *   color="#4a7c23"
 * />
 * ```
 * @see {@link TreeInstances} for forestation
 * @see {@link RockInstances} for detail elements
 */
export function GrassInstances({
  count = 10000,
  areaSize = 100,
  biomes = DEFAULT_BIOMES,
  heightFunc = () => 0,
  height = 1.0,
  color = 0x4a7c23,
}: VegetationProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const h = height;

    const positions = new Float32Array([
      -0.05,
      0,
      0,
      0.05,
      0,
      0,
      0,
      h,
      0,
      0.05,
      0,
      0,
      0.03,
      h,
      0,
      0,
      h,
      0,
    ]);

    const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

    return geo;
  }, [height]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.8,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
  }, [color]);

  const instances = useMemo(() => {
    return generateBiomeInstanceData(count, areaSize, heightFunc, biomes, [
      'marsh',
      'forest',
      'savanna',
      'scrubland',
    ]);
  }, [count, areaSize, biomes, heightFunc]);

  // Cleanup
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <GPUInstancedMesh
      geometry={geometry}
      material={material}
      count={count}
      instances={instances}
      enableWind={true}
      windStrength={0.3}
      lodDistance={80}
      castShadow={false}
      receiveShadow={true}
    />
  );
}
