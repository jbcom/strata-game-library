import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { GPUInstancedMesh } from './GPUInstancedMesh';
import { DEFAULT_BIOMES, type VegetationProps } from './types';
import { generateBiomeInstanceData } from './utils';

/**
 * Procedural instanced forest system.
 *
 * Spawns pine-like tree models primarily in forest and tundra biomes.
 * Designed for background and midground density with minimal performance impact.
 *
 * @category World Building
 * @example
 * ```tsx
 * // Dense pine forest
 * <TreeInstances
 *   count={1000}
 *   areaSize={200}
 * />
 * ```
 * @see {@link GrassInstances} for ground coverage
 */
export function TreeInstances({
  count = 500,
  areaSize = 100,
  biomes = DEFAULT_BIOMES,
  heightFunc = () => 0,
}: VegetationProps) {
  const geometry = useMemo(() => {
    // Simple tree geometry - cone for foliage
    return new THREE.ConeGeometry(1, 3, 6);
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x2d5a27,
      roughness: 0.85,
      metalness: 0.0,
    });
  }, []);

  const instances = useMemo(() => {
    return generateBiomeInstanceData(count, areaSize, heightFunc, biomes, ['forest', 'tundra']);
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
      windStrength={0.15}
      lodDistance={150}
      castShadow={true}
      receiveShadow={true}
    />
  );
}
