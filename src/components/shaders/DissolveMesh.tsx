import { useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { createDissolveMaterial } from '../../shaders/materials';
import type { DissolveMeshProps, DissolveMeshRef } from './types';

/**
 * Noise-Based Dissolve Effect.
 *
 * Animates a mesh's visibility using a procedural noise pattern. Features
 * a glowing "burning edge" effect at the transition point. Ideal for spawning
 * or despawning objects.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <DissolveMesh
 *   animate
 *   animationSpeed={0.2}
 *   edgeColor="orange"
 *   noiseScale={10}
 * >
 *   <torusKnotGeometry />
 * </DissolveMesh>
 * ```
 */
export const DissolveMesh = forwardRef<DissolveMeshRef, DissolveMeshProps>(
    (
        {
            geometry,
            children,
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            scale = 1,
            animate = false,
            animationSpeed = 0.5,
            loop = false,
            ...materialOptions
        },
        ref
    ) => {
        const meshRef = useRef<THREE.Mesh>(null);

        // biome-ignore lint/correctness/useExhaustiveDependencies: materialOptions is spread from props
        const material = useMemo(
            () => createDissolveMaterial(materialOptions),
            [
                materialOptions.color,
                materialOptions.edgeColor,
                materialOptions.progress,
                materialOptions.edgeWidth,
                materialOptions.noiseScale,
            ]
        );

        useFrame((state, delta) => {
            if (material.uniforms.uTime) {
                material.uniforms.uTime.value = state.clock.elapsedTime;
            }
            if (animate && material.uniforms.uProgress) {
                let progress = material.uniforms.uProgress.value + delta * animationSpeed;
                if (loop) {
                    progress = progress % 1;
                } else {
                    progress = Math.min(progress, 1);
                }
                material.uniforms.uProgress.value = progress;
            }
        });

        useImperativeHandle(ref, () => ({
            mesh: meshRef.current,
            material,
            setProgress: (progress: number) => {
                if (material.uniforms.uProgress) {
                    material.uniforms.uProgress.value = Math.max(0, Math.min(1, progress));
                }
            },
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

DissolveMesh.displayName = 'DissolveMesh';
