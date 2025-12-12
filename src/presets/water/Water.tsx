/**
 * Procedural Water components
 *
 * Lifted from Otterfall procedural rendering system.
 */

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createAdvancedWaterMaterial, createWaterMaterial } from '../../core/water';

interface WaterProps {
    position?: [number, number, number];
    size?: number;
    segments?: number;
}

/**
 * Simple procedural water surface with wave animation
 */
export function Water({ position = [0, -0.2, 0], size = 100, segments = 32 }: WaterProps) {
    const meshRef = useRef<THREE.Mesh | null>(null);

    const material = useMemo(() => {
        return createWaterMaterial();
    }, []);

    useEffect(() => {
        return () => {
            material.dispose();
        };
    }, [material]);

    useFrame((_, delta) => {
        material.uniforms.time.value += delta;
    });

    return (
        <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
            <planeGeometry args={[size, size, segments, segments]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

interface AdvancedWaterProps {
    position?: [number, number, number];
    size?: [number, number];
    segments?: number;
    waterColor?: THREE.ColorRepresentation;
    deepWaterColor?: THREE.ColorRepresentation;
    foamColor?: THREE.ColorRepresentation;
    causticIntensity?: number;
}

/**
 * Advanced water with caustics and foam effects
 */
export function AdvancedWater({
    position = [0, 0, 0],
    size = [100, 100],
    segments = 64,
    waterColor = 0x2a5a8a,
    deepWaterColor = 0x1a3a5a,
    foamColor = 0x8ab4d4,
    causticIntensity = 0.4,
}: AdvancedWaterProps) {
    const waterRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (waterRef.current) {
            const time = state.clock.getElapsedTime();
            (waterRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
        }
    });

    const waterMaterial = useMemo(
        () =>
            createAdvancedWaterMaterial({
                waterColor,
                deepWaterColor,
                foamColor,
                causticIntensity,
            }),
        [waterColor, deepWaterColor, foamColor, causticIntensity]
    );

    useEffect(() => {
        return () => {
            waterMaterial.dispose();
        };
    }, [waterMaterial]);

    return (
        <mesh ref={waterRef} position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <primitive
                object={useMemo(
                    () => new THREE.PlaneGeometry(size[0], size[1], segments, segments),
                    [size, segments]
                )}
            />
            <primitive object={waterMaterial} />
        </mesh>
    );
}
