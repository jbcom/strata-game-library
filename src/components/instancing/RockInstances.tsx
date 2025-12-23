import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { GPUInstancedMesh } from './GPUInstancedMesh';
import { DEFAULT_BIOMES, type VegetationProps } from './types';
import { generateBiomeInstanceData } from './utils';

/**
 * Biome-integrated instanced rock system.
 *
 * Scatters irregular rocks in mountain, tundra, and desert biomes.
 * Adds visual detail and realism to procedural landscapes.
 *
 * @category World Building
 * @example
 * ```tsx
 * // Mountain debris
 * <RockInstances
 *   count={300}
 *   areaSize={100}
 * />
 * ```
 */
export function RockInstances({
    count = 200,
    areaSize = 100,
    biomes = DEFAULT_BIOMES,
    heightFunc = () => 0,
}: VegetationProps) {
    const geometry = useMemo(() => {
        // Irregular rock geometry
        return new THREE.DodecahedronGeometry(0.5, 0);
    }, []);

    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x696969,
            roughness: 0.9,
            metalness: 0.1,
        });
    }, []);

    const instances = useMemo(() => {
        return generateBiomeInstanceData(count, areaSize, heightFunc, biomes, [
            'mountain',
            'tundra',
            'desert',
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
            enableWind={false}
            lodDistance={120}
            castShadow={true}
            receiveShadow={true}
        />
    );
}
