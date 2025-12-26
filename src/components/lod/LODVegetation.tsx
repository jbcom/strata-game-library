import { useFrame, useThree } from '@react-three/fiber';
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import * as THREE from 'three';
import { calculateLODLevel, createVegetationLODLevels, simplifyGeometry } from '../../core/lod';
import { Impostor } from './Impostor';
import type { LODVegetationProps, LODVegetationRef, VegetationLODConfig } from './types';

interface VegetationInstance {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    lodLevel: number;
    visible: boolean;
}

/**
 * Optimized Large-Scale Vegetation LOD System.
 *
 * Manages thousands of individual vegetation instances with automatic mesh
 * simplification and view-dependent impostors for maximum performance.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <LODVegetation
 *   count={1000}
 *   instances={forestData}
 *   highDetailGeometry={treeGeo}
 *   impostorTexture={treeAtlas}
 * />
 * ```
 */
export const LODVegetation = forwardRef<LODVegetationRef, LODVegetationProps>(
    (
        {
            count,
            instances,
            highDetailGeometry,
            mediumDetailGeometry,
            lowDetailGeometry,
            impostorTexture,
            material,
            lodConfig = {},
            castShadow = true,
            receiveShadow = true,
            frustumCulled = true,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const { camera } = useThree();

        const config: VegetationLODConfig = useMemo(
            () => ({
                highDetailDistance: lodConfig.highDetailDistance ?? 20,
                mediumDetailDistance: lodConfig.mediumDetailDistance ?? 50,
                lowDetailDistance: lodConfig.lowDetailDistance ?? 100,
                impostorDistance: lodConfig.impostorDistance ?? 200,
                cullDistance: lodConfig.cullDistance ?? 500,
                transitionWidth: lodConfig.transitionWidth ?? 5,
            }),
            [lodConfig]
        );

        const lodLevels = useMemo(() => createVegetationLODLevels(config), [config]);

        const [vegetationInstances, setVegetationInstances] = useState<VegetationInstance[]>(() =>
            instances.slice(0, count).map((inst) => ({
                position:
                    inst.position instanceof THREE.Vector3
                        ? inst.position.clone()
                        : new THREE.Vector3(...inst.position),
                rotation:
                    inst.rotation instanceof THREE.Euler
                        ? inst.rotation.clone()
                        : inst.rotation
                          ? new THREE.Euler(...inst.rotation)
                          : new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
                scale:
                    inst.scale instanceof THREE.Vector3
                        ? inst.scale.clone()
                        : typeof inst.scale === 'number'
                          ? new THREE.Vector3(inst.scale, inst.scale, inst.scale)
                          : inst.scale
                            ? new THREE.Vector3(...inst.scale)
                            : new THREE.Vector3(1, 1, 1),
                lodLevel: 0,
                visible: true,
            }))
        );

        const [visibleCounts, setVisibleCounts] = useState({
            high: 0,
            medium: 0,
            low: 0,
            impostor: 0,
        });

        const baseMaterial = useMemo(() => {
            return (
                material ??
                new THREE.MeshStandardMaterial({
                    color: 0x4a7c23,
                    roughness: 0.8,
                    side: THREE.DoubleSide,
                })
            );
        }, [material]);

        const geometries = useMemo(
            () => ({
                high: highDetailGeometry,
                medium:
                    mediumDetailGeometry ??
                    simplifyGeometry(highDetailGeometry, { targetRatio: 0.5 }),
                low:
                    lowDetailGeometry ?? simplifyGeometry(highDetailGeometry, { targetRatio: 0.2 }),
            }),
            [highDetailGeometry, mediumDetailGeometry, lowDetailGeometry]
        );

        const updateLOD = useCallback(() => {
            const cameraPos = camera.position;
            const counts = { high: 0, medium: 0, low: 0, impostor: 0 };

            const updatedInstances = vegetationInstances.map((inst) => {
                const distance = inst.position.distanceTo(cameraPos);
                const level = calculateLODLevel(inst.position, cameraPos, lodLevels);
                const visible = distance < config.cullDistance;

                if (visible) {
                    if (level === 0) counts.high++;
                    else if (level === 1) counts.medium++;
                    else if (level === 2) counts.low++;
                    else counts.impostor++;
                }

                return { ...inst, lodLevel: level, visible };
            });

            setVegetationInstances(updatedInstances);
            setVisibleCounts(counts);
        }, [camera.position, vegetationInstances, lodLevels, config.cullDistance]);

        useImperativeHandle(
            ref,
            () => ({
                group: groupRef.current,
                visibleCounts,
                updateLOD,
            }),
            [visibleCounts, updateLOD]
        );

        useFrame(() => {
            updateLOD();
        });

        useEffect(() => {
            return () => {
                if (!material) baseMaterial.dispose();
                if (!mediumDetailGeometry) geometries.medium.dispose();
                if (!lowDetailGeometry) geometries.low.dispose();
            };
        }, [material, mediumDetailGeometry, lowDetailGeometry, baseMaterial, geometries]);

        return (
            <group ref={groupRef}>
                {vegetationInstances.map((inst) => {
                    if (!inst.visible) return null;

                    const geometry =
                        inst.lodLevel === 0
                            ? geometries.high
                            : inst.lodLevel === 1
                              ? geometries.medium
                              : geometries.low;

                    if (inst.lodLevel >= 3 && impostorTexture) {
                        const posKey = `${inst.position.x.toFixed(2)}-${inst.position.z.toFixed(2)}`;
                        return (
                            <Impostor
                                key={`impostor-${posKey}`}
                                texture={impostorTexture}
                                position={inst.position}
                                size={inst.scale.x}
                                billboardMode="cylindrical"
                            />
                        );
                    }

                    const posKey = `${inst.position.x.toFixed(2)}-${inst.position.z.toFixed(2)}`;
                    return (
                        <mesh
                            key={`veg-${posKey}`}
                            position={inst.position}
                            rotation={inst.rotation}
                            scale={inst.scale}
                            geometry={geometry}
                            material={baseMaterial}
                            castShadow={castShadow && inst.lodLevel < 2}
                            receiveShadow={receiveShadow}
                            frustumCulled={frustumCulled}
                        />
                    );
                })}
            </group>
        );
    }
);

LODVegetation.displayName = 'LODVegetation';
