/**
 * React components for shader materials
 * Provides easy-to-use components for common shader effects
 */

import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    createToonMaterial,
    createHologramMaterial,
    createDissolveMaterial,
    createForcefieldMaterial,
    createGlitchMaterial,
    createCrystalMaterial,
    createOutlineMaterial,
    createGradientMaterial,
    ToonMaterialOptions,
    HologramMaterialOptions,
    DissolveMaterialOptions,
    ForcefieldMaterialOptions,
    GlitchMaterialOptions,
    CrystalMaterialOptions,
    OutlineMaterialOptions,
    GradientMaterialOptions,
} from '../shaders/materials';

export interface ToonMeshProps extends ToonMaterialOptions {
    geometry?: THREE.BufferGeometry;
    children?: React.ReactNode;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
    showOutline?: boolean;
}

export interface ToonMeshRef {
    mesh: THREE.Mesh | null;
    material: THREE.ShaderMaterial | null;
}

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

export interface HologramMeshProps extends HologramMaterialOptions {
    geometry?: THREE.BufferGeometry;
    children?: React.ReactNode;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
    animate?: boolean;
}

export interface HologramMeshRef {
    mesh: THREE.Mesh | null;
    material: THREE.ShaderMaterial | null;
}

export const HologramMesh = forwardRef<HologramMeshRef, HologramMeshProps>(
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

        const material = useMemo(
            () => createHologramMaterial(materialOptions),
            [
                materialOptions.color,
                materialOptions.scanlineIntensity,
                materialOptions.scanlineDensity,
                materialOptions.flickerSpeed,
                materialOptions.fresnelPower,
                materialOptions.alpha,
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

HologramMesh.displayName = 'HologramMesh';

export interface DissolveMeshProps extends DissolveMaterialOptions {
    geometry?: THREE.BufferGeometry;
    children?: React.ReactNode;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
    animate?: boolean;
    animationSpeed?: number;
    loop?: boolean;
}

export interface DissolveMeshRef {
    mesh: THREE.Mesh | null;
    material: THREE.ShaderMaterial | null;
    setProgress: (progress: number) => void;
}

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

export interface ForcefieldProps extends ForcefieldMaterialOptions {
    radius?: number;
    position?: [number, number, number];
    animate?: boolean;
}

export interface ForcefieldRef {
    mesh: THREE.Mesh | null;
    material: THREE.ShaderMaterial | null;
    triggerHit: (worldPosition: THREE.Vector3, intensity?: number) => void;
}

export const Forcefield = forwardRef<ForcefieldRef, ForcefieldProps>(
    ({ radius = 1, position = [0, 0, 0], animate = true, ...materialOptions }, ref) => {
        const meshRef = useRef<THREE.Mesh>(null);
        const hitDecay = useRef(0);

        const material = useMemo(
            () => createForcefieldMaterial(materialOptions),
            [
                materialOptions.color,
                materialOptions.secondaryColor,
                materialOptions.fresnelPower,
                materialOptions.pulseSpeed,
                materialOptions.hexagonScale,
                materialOptions.alpha,
            ]
        );

        useFrame((state, delta) => {
            if (animate && material.uniforms.uTime) {
                material.uniforms.uTime.value = state.clock.elapsedTime;
            }
            if (hitDecay.current > 0) {
                hitDecay.current -= delta * 3;
                material.uniforms.uHitIntensity.value = Math.max(0, hitDecay.current);
            }
        });

        const triggerHit = (worldPosition: THREE.Vector3, intensity = 1) => {
            if (meshRef.current) {
                const localPos = meshRef.current.worldToLocal(worldPosition.clone());
                material.uniforms.uHitPoint.value.copy(localPos);
                material.uniforms.uHitIntensity.value = intensity;
                hitDecay.current = intensity;
            }
        };

        useImperativeHandle(ref, () => ({
            mesh: meshRef.current,
            material,
            triggerHit,
        }));

        return (
            <mesh ref={meshRef} position={position}>
                <sphereGeometry args={[radius, 64, 64]} />
                <primitive object={material} attach="material" />
            </mesh>
        );
    }
);

Forcefield.displayName = 'Forcefield';

export interface OutlineProps extends OutlineMaterialOptions {
    children: React.ReactNode;
}

export const Outline: React.FC<OutlineProps> = ({ children, ...materialOptions }) => {
    const groupRef = useRef<THREE.Group>(null);

    const outlineMaterial = useMemo(
        () => createOutlineMaterial(materialOptions),
        [materialOptions.color, materialOptions.outlineWidth]
    );

    return (
        <group ref={groupRef}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === 'mesh') {
                    return (
                        <>
                            {child}
                            {React.cloneElement(
                                child as React.ReactElement<{ children?: React.ReactNode }>,
                                {
                                    children: (
                                        <>
                                            {
                                                (
                                                    child as React.ReactElement<{
                                                        children?: React.ReactNode;
                                                    }>
                                                ).props.children
                                            }
                                            <primitive
                                                object={outlineMaterial.clone()}
                                                attach="material"
                                            />
                                        </>
                                    ),
                                }
                            )}
                        </>
                    );
                }
                return child;
            })}
        </group>
    );
};

export interface GradientMeshProps extends GradientMaterialOptions {
    geometry?: THREE.BufferGeometry;
    children?: React.ReactNode;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
}

export interface GradientMeshRef {
    mesh: THREE.Mesh | null;
    material: THREE.ShaderMaterial | null;
}

export const GradientMesh = forwardRef<GradientMeshRef, GradientMeshProps>(
    (
        {
            geometry,
            children,
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            scale = 1,
            ...materialOptions
        },
        ref
    ) => {
        const meshRef = useRef<THREE.Mesh>(null);

        const material = useMemo(
            () => createGradientMaterial(materialOptions),
            [
                materialOptions.colorStart,
                materialOptions.colorEnd,
                materialOptions.colorMiddle,
                materialOptions.direction,
                materialOptions.useThreeColors,
            ]
        );

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

GradientMesh.displayName = 'GradientMesh';

export interface GlitchMeshProps extends GlitchMaterialOptions {
    geometry?: THREE.BufferGeometry;
    children?: React.ReactNode;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
    animate?: boolean;
}

export interface GlitchMeshRef {
    mesh: THREE.Mesh | null;
    material: THREE.ShaderMaterial | null;
}

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

export interface CrystalMeshProps extends CrystalMaterialOptions {
    geometry?: THREE.BufferGeometry;
    children?: React.ReactNode;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
    animate?: boolean;
}

export interface CrystalMeshRef {
    mesh: THREE.Mesh | null;
    material: THREE.ShaderMaterial | null;
}

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
