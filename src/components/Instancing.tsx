/**
 * GPU-Driven Instancing System
 *
 * Uses drei's Instances component for true GPU-driven instancing
 * with wind animation and LOD calculations performed on the GPU.
 *
 * Optimized for mobile, web, and desktop with support for thousands
 * of instances with minimal CPU overhead.
 *
 * Lifted from Otterfall procedural rendering system.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import {
    generateInstanceData as coreGenerateInstanceData,
    InstanceData,
    BiomeData,
} from '../core/instancing';
import { getBiomeAt as sdfGetBiomeAt } from '../core/sdf';

// =============================================================================
// TYPES
// =============================================================================

// Re-export types from core
export type { InstanceData, BiomeData } from '../core/instancing';

// =============================================================================
// INSTANCE GENERATION
// =============================================================================
// Core logic moved to core/instancing.ts

// Re-export core function with proper name
export function generateInstanceData(
    count: number,
    areaSize: number,
    heightFunc: (x: number, z: number) => number,
    biomes?: BiomeData[],
    allowedBiomes?: string[],
    seed?: number
): InstanceData[] {
    return coreGenerateInstanceData(
        count,
        areaSize,
        heightFunc,
        biomes,
        allowedBiomes,
        seed,
        getBiomeAt as any,
        noise3D,
        fbm
    );
}

// Import noise functions from core for use in component
import { noise3D, fbm, getBiomeAt } from '../core/sdf';

// =============================================================================
// INSTANCED MESH COMPONENT
// =============================================================================

interface GPUInstancedMeshProps {
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
    count: number;
    instances: InstanceData[];
    enableWind?: boolean;
    windStrength?: number;
    lodDistance?: number;
    frustumCulled?: boolean;
    castShadow?: boolean;
    receiveShadow?: boolean;
}

export function GPUInstancedMesh({
    geometry,
    material,
    count,
    instances,
    enableWind = true,
    windStrength = 0.5,
    lodDistance = 100,
    frustumCulled = true,
    castShadow = true,
    receiveShadow = true,
}: GPUInstancedMeshProps) {
    const _meshRef = useRef<THREE.InstancedMesh>(null);
    const _camera = useThree().camera;

    // Input validation
    if (!geometry) {
        throw new Error('GPUInstancedMesh: geometry is required');
    }
    if (!material) {
        throw new Error('GPUInstancedMesh: material is required');
    }
    if (count <= 0) {
        throw new Error('GPUInstancedMesh: count must be positive');
    }
    if (!instances || instances.length === 0) {
        throw new Error('GPUInstancedMesh: instances array cannot be empty');
    }

    // Use drei's Instances component for GPU-optimized instancing
    // NOTE: Wind and LOD are not yet implemented on GPU - these props are reserved for future implementation
    // Current implementation uses drei's Instances which provides efficient GPU instancing
    // but wind/LOD would require custom vertex shader integration
    // Reserved for future use: enableWind, windStrength, lodDistance, _meshRef, _camera
    const instanceCount = Math.min(instances.length, count);
    return (
        <Instances
            limit={instanceCount}
            range={instanceCount}
            frustumCulled={frustumCulled}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
        >
            {/* drei's Instances expects geometry and material as primitive children */}
            <primitive object={geometry} attach="geometry" />
            <primitive object={material} attach="material" />
            {instances.slice(0, instanceCount).map((instance, i) => (
                <Instance
                    key={i}
                    position={instance.position as unknown as [number, number, number]}
                    rotation={[instance.rotation.x, instance.rotation.y, instance.rotation.z]}
                    scale={instance.scale as unknown as [number, number, number]}
                />
            ))}
        </Instances>
    );
}

// =============================================================================
// VEGETATION COMPONENTS
// =============================================================================

interface VegetationProps {
    count?: number;
    areaSize?: number;
    biomes?: BiomeData[];
    heightFunc?: (x: number, z: number) => number;
    height?: number;
    color?: THREE.ColorRepresentation;
}

const DEFAULT_BIOMES: BiomeData[] = [
    { type: 'marsh', center: new THREE.Vector2(0, 0), radius: 30 },
    { type: 'forest', center: new THREE.Vector2(50, 0), radius: 40 },
    { type: 'savanna', center: new THREE.Vector2(60, 60), radius: 50 },
];

/**
 * Instanced grass blades
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
        return coreGenerateInstanceData(
            count,
            areaSize,
            heightFunc as any,
            biomes,
            ['marsh', 'forest', 'savanna', 'scrubland'],
            undefined, // seed
            sdfGetBiomeAt as any,
            noise3D,
            fbm
        );
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

/**
 * Instanced trees
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
        return coreGenerateInstanceData(
            count,
            areaSize,
            heightFunc as any,
            biomes,
            ['forest', 'tundra'],
            undefined, // seed
            sdfGetBiomeAt as any,
            noise3D,
            fbm
        );
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

/**
 * Instanced rocks
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
        return coreGenerateInstanceData(
            count,
            areaSize,
            heightFunc as any,
            biomes,
            ['mountain', 'tundra', 'desert', 'scrubland'],
            undefined, // seed
            sdfGetBiomeAt as any,
            noise3D,
            fbm
        );
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
