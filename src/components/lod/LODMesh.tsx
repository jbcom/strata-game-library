import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { calculateLODLevel, createLODLevels, interpolateLODMaterials } from '../../core/lod';
import type { LODMeshProps, LODMeshRef } from './types';

/**
 * Distance-Based Level of Detail (LOD) Mesh.
 *
 * Automatically switches between multiple geometry detail levels based on the
 * distance from the camera. Supports crossfading and dithering for smooth transitions.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <LODMesh
 *   levels={[
 *     { distance: 0, geometry: highRes },
 *     { distance: 50, geometry: mediumRes },
 *     { distance: 150, geometry: lowRes }
 *   ]}
 *   fadeMode="crossfade"
 * />
 * ```
 */
export const LODMesh = forwardRef<LODMeshRef, LODMeshProps>(
    (
        {
            levels,
            baseMaterial,
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            scale = 1,
            hysteresis: _hysteresis = 0.1,
            transitionDuration = 0.3,
            fadeMode = 'instant',
            castShadow = true,
            receiveShadow = true,
            frustumCulled = true,
            onLevelChange,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const meshRefs = useRef<THREE.Mesh[]>([]);
        const { camera } = useThree();

        const [currentLevel, setCurrentLevel] = useState(0);
        const [transitionProgress, setTransitionProgress] = useState(1);
        const previousLevelRef = useRef(0);

        const pos = useMemo(
            () => (position instanceof THREE.Vector3 ? position : new THREE.Vector3(...position)),
            [position]
        );

        const rot = useMemo(() => {
            if (rotation instanceof THREE.Euler) return rotation;
            if (Array.isArray(rotation)) return new THREE.Euler(...rotation);
            return rotation;
        }, [rotation]);

        const scl = useMemo(() => {
            if (scale instanceof THREE.Vector3) return scale;
            if (typeof scale === 'number') return new THREE.Vector3(scale, scale, scale);
            return new THREE.Vector3(...scale);
        }, [scale]);

        const lodLevels = useMemo(() => createLODLevels(levels.map((l) => l.distance)), [levels]);

        const materials = useMemo(() => {
            return levels.map((level) => {
                if (level.material) return level.material;
                if (baseMaterial) return baseMaterial.clone();
                return new THREE.MeshStandardMaterial({ color: 0x888888 });
            });
        }, [levels, baseMaterial]);

        useImperativeHandle(
            ref,
            () => ({
                group: groupRef.current,
                currentLevel,
                getDistance: () => {
                    if (!groupRef.current) return 0;
                    const worldPos = new THREE.Vector3();
                    groupRef.current.getWorldPosition(worldPos);
                    return worldPos.distanceTo(camera.position);
                },
            }),
            [currentLevel, camera]
        );

        useFrame((_, delta) => {
            if (!groupRef.current) return;

            const worldPos = new THREE.Vector3();
            groupRef.current.getWorldPosition(worldPos);

            const newLevel = calculateLODLevel(worldPos, camera.position, lodLevels);

            if (newLevel !== currentLevel) {
                previousLevelRef.current = currentLevel;
                setCurrentLevel(newLevel);
                setTransitionProgress(fadeMode === 'instant' ? 1 : 0);
                onLevelChange?.(newLevel);
            }

            if (transitionProgress < 1 && fadeMode !== 'instant') {
                const newProgress = Math.min(1, transitionProgress + delta / transitionDuration);
                setTransitionProgress(newProgress);

                if (fadeMode === 'crossfade') {
                    const prevMesh = meshRefs.current[previousLevelRef.current];
                    const currMesh = meshRefs.current[currentLevel];

                    if (prevMesh?.material && currMesh?.material) {
                        interpolateLODMaterials(
                            prevMesh.material as THREE.Material,
                            currMesh.material as THREE.Material,
                            newProgress
                        );
                    }
                }
            }

            meshRefs.current.forEach((mesh, i) => {
                if (!mesh) return;

                if (fadeMode === 'crossfade' && transitionProgress < 1) {
                    mesh.visible = i === currentLevel || i === previousLevelRef.current;
                } else {
                    mesh.visible = i === currentLevel;
                }
            });
        });

        useEffect(() => {
            return () => {
                materials.forEach((mat) => {
                    if (mat !== baseMaterial) {
                        mat.dispose();
                    }
                });
            };
        }, [materials, baseMaterial]);

        return (
            <group ref={groupRef} position={pos} rotation={rot} scale={scl}>
                {levels.map((level, i) => (
                    <mesh
                        key={`lod-mesh-${level.distance}`}
                        ref={(el) => {
                            if (el) meshRefs.current[i] = el;
                        }}
                        geometry={level.geometry}
                        material={materials[i]}
                        visible={i === currentLevel}
                        castShadow={castShadow}
                        receiveShadow={receiveShadow}
                        frustumCulled={frustumCulled}
                    />
                ))}
            </group>
        );
    }
);

LODMesh.displayName = 'LODMesh';
