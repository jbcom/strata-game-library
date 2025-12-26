import { useFrame, useThree } from '@react-three/fiber';
import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import * as THREE from 'three';
import { calculateLODLevel, createLODLevels } from '../../core/lod';
import type { LODGroupProps, LODGroupRef } from './types';

/**
 * Distance-Based Level of Detail (LOD) Group.
 *
 * Manages complex objects by showing or hiding child components based on camera
 * distance. Offers more flexibility than `LODMesh` by allowing multiple child
 * objects to represent a single LOD level.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <LODGroup
 *   levels={[
 *     { distance: 0, childIndices: [0, 1] }, // Show HighRes + Details
 *     { distance: 100, childIndices: [2] }   // Show LowRes only
 *   ]}
 * >
 *   <HighResModel />
 *   <BuildingDetails />
 *   <LowResModel />
 * </LODGroup>
 * ```
 */
export const LODGroup = forwardRef<LODGroupRef, LODGroupProps>(
    (
        {
            children,
            levels,
            hysteresis: _hysteresis = 0.1,
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            scale = 1,
            onLevelChange,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const { camera } = useThree();
        const [currentLevel, setCurrentLevel] = useState(0);
        const [forcedLevel, setForcedLevel] = useState<number | null>(null);

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

        const forceLevel = useCallback((level: number) => {
            setForcedLevel(level);
        }, []);

        useImperativeHandle(
            ref,
            () => ({
                group: groupRef.current,
                currentLevel: forcedLevel ?? currentLevel,
                forceLevel,
            }),
            [currentLevel, forcedLevel, forceLevel]
        );

        useFrame(() => {
            if (!groupRef.current || forcedLevel !== null) return;

            const worldPos = new THREE.Vector3();
            groupRef.current.getWorldPosition(worldPos);

            const newLevel = calculateLODLevel(worldPos, camera.position, lodLevels);

            if (newLevel !== currentLevel) {
                setCurrentLevel(newLevel);
                onLevelChange?.(newLevel);
            }
        });

        const activeLevel = forcedLevel ?? currentLevel;
        const activeLevelConfig = levels[activeLevel];
        const activeIndices = activeLevelConfig?.childIndices;

        const childArray = React.Children.toArray(children);

        return (
            <group ref={groupRef} position={pos} rotation={rot} scale={scl}>
                {childArray.map((child, index) => {
                    const isVisible = activeIndices
                        ? activeIndices.includes(index)
                        : index === activeLevel;

                    if (!isVisible) return null;

                    return React.cloneElement(
                        child as React.ReactElement,
                        // biome-ignore lint/suspicious/noArrayIndexKey: children are stable, index-based LOD selection
                        { key: `lod-child-${index}` }
                    );
                })}
            </group>
        );
    }
);

LODGroup.displayName = 'LODGroup';
