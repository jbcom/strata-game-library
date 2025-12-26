import { useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { createGlitchMaterial } from '../../shaders/materials';
import type { GlitchMeshProps, GlitchMeshRef } from './types';

/**
 * Procedural Digital Glitch Effect.
 *
 * Applies a digital corruption effect to a mesh, featuring RGB channel
 * shifting, blocky distortions, and flickering scanlines.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <GlitchMesh
 *   color="green"
 *   glitchIntensity={0.8}
 *   rgbShiftAmount={0.05}
 * >
 *   <planeGeometry />
 * </GlitchMesh>
 * ```
 */
export const GlitchMesh = forwardRef<GlitchMeshRef, GlitchMeshProps>(
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

        // biome-ignore lint/correctness/useExhaustiveDependencies: materialOptions is spread from props
        const material = useMemo(
            () => createGlitchMaterial(materialOptions),
            [
                materialOptions.color,
                materialOptions.glitchIntensity,
                materialOptions.scanlineIntensity,
                materialOptions.rgbShiftAmount,
            ]
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

GlitchMesh.displayName = 'GlitchMesh';
