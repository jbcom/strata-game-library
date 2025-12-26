import { useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { createCrystalMaterial } from '../../shaders/materials';
import type { CrystalMeshProps, CrystalMeshRef } from './types';

/**
 * Shimmering Crystal Material.
 *
 * Simulates a multi-faceted gemstone or crystal with internal refractions,
 * spectral rainbow shimmers, and strong fresnel highlights.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <CrystalMesh
 *   color="#ff0088"
 *   rainbowIntensity={0.5}
 *   fresnelPower={4.0}
 * >
 *   <dodecahedronGeometry />
 * </CrystalMesh>
 * ```
 */
export const CrystalMesh = forwardRef<CrystalMeshRef, CrystalMeshProps>(
    (
        {
            geometry,
            children,
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            scale = 1,
            animate = true,
            ...materialOptions
        },
        ref
    ) => {
        const meshRef = useRef<THREE.Mesh>(null);

        // biome-ignore lint/correctness/useExhaustiveDependencies: materialOptions is spread from props, individual values listed
        const material = useMemo(
            () => createCrystalMaterial(materialOptions),
            [materialOptions.color, materialOptions.fresnelPower, materialOptions.rainbowIntensity]
        );

        useFrame((state) => {
            if (animate && material.uniforms.uTime) {
                material.uniforms.uTime.value = state.clock.elapsedTime;
            }
        });

        useImperativeHandle(ref, () => ({
            mesh: meshRef.current,
            material,
        }));

        const scaleArray = typeof scale === 'number' ? [scale, scale, scale] : scale;

        return (
            <mesh
                ref={meshRef}
                geometry={geometry}
                position={position}
                rotation={rotation}
                scale={scaleArray as [number, number, number]}
            >
                {children}
                <primitive object={material} attach="material" />
            </mesh>
        );
    }
);

CrystalMesh.displayName = 'CrystalMesh';
