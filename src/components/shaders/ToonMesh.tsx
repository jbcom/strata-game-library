import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { createOutlineMaterial, createToonMaterial } from '../../shaders/materials';
import type { ToonMeshProps, ToonMeshRef } from './types';

/**
 * Cel-Shaded Toon Mesh.
 *
 * Provides a stylized non-photorealistic (NPR) look with discrete lighting
 * levels, rim lighting, and a silhouette outline. Perfect for anime or
 * comic-style games.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <ToonMesh
 *   color="orange"
 *   levels={3}
 *   rimColor="white"
 *   showOutline={true}
 * >
 *   <boxGeometry />
 * </ToonMesh>
 * ```
 */
export const ToonMesh = forwardRef<ToonMeshRef, ToonMeshProps>(
    (
        {
            geometry,
            children,
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            scale = 1,
            showOutline = true,
            ...materialOptions
        },
        ref
    ) => {
        const meshRef = useRef<THREE.Mesh>(null);
        const outlineRef = useRef<THREE.Mesh>(null);

        // biome-ignore lint/correctness/useExhaustiveDependencies: materialOptions is spread from props
        const material = useMemo(
            () => createToonMaterial(materialOptions),
            [
                materialOptions.color,
                materialOptions.levels,
                materialOptions.rimColor,
                materialOptions.rimPower,
            ]
        );

        const outlineMaterial = useMemo(
            () =>
                createOutlineMaterial({
                    color: materialOptions.outlineColor || 0x000000,
                    outlineWidth: materialOptions.outlineWidth || 0.03,
                }),
            [materialOptions.outlineColor, materialOptions.outlineWidth]
        );

        useImperativeHandle(ref, () => ({
            mesh: meshRef.current,
            material,
        }));

        const scaleArray = typeof scale === 'number' ? [scale, scale, scale] : scale;

        return (
            <group
                position={position}
                rotation={rotation}
                scale={scaleArray as [number, number, number]}
            >
                <mesh ref={meshRef} geometry={geometry}>
                    {children}
                    <primitive object={material} attach="material" />
                </mesh>
                {showOutline && (
                    <mesh ref={outlineRef} geometry={geometry || meshRef.current?.geometry}>
                        {children}
                        <primitive object={outlineMaterial} attach="material" />
                    </mesh>
                )}
            </group>
        );
    }
);

ToonMesh.displayName = 'ToonMesh';
