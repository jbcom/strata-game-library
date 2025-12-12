/**
 * Procedural Water components
 *
 * Lifted from Otterfall procedural rendering system.
 */

import { useFrame } from '@react-three/fiber';
import type React from 'react';
import { forwardRef, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createAdvancedWaterMaterial, createWaterMaterial } from '../core/water';

interface WaterProps {
    position?: [number, number, number];
    size?: number;
    segments?: number;
    color?: THREE.ColorRepresentation;
    opacity?: number;
    waveSpeed?: number;
    waveHeight?: number;
}

/**
 * Simple procedural water surface with wave animation
 */
export const Water = forwardRef<THREE.Mesh, WaterProps>(
    (
        {
            position = [0, -0.2, 0],
            size = 100,
            segments = 32,
            color = 0x006994,
            opacity = 0.8,
            waveSpeed = 1.0,
            waveHeight = 0.5,
        },
        ref
    ) => {
        const internalRef = useRef<THREE.Mesh>(null);
        const meshRef = ref || internalRef;

        const material = useMemo(() => {
            const mat = createWaterMaterial();
            if (mat.uniforms) {
                mat.uniforms.waterColor = { value: new THREE.Color(color) };
                mat.uniforms.opacity = { value: opacity };
                mat.uniforms.waveSpeed = { value: waveSpeed };
                mat.uniforms.waveHeight = { value: waveHeight };
            }
            mat.transparent = opacity < 1;
            mat.opacity = opacity;
            return mat;
        }, [color, opacity, waveSpeed, waveHeight]);

        useEffect(() => {
            return () => {
                material.dispose();
            };
        }, [material]);

        useFrame((_, delta) => {
            if (material.uniforms?.time) {
                material.uniforms.time.value += delta * waveSpeed;
            }
        });

        return (
            <mesh
                ref={meshRef as any}
                position={position}
                rotation={[-Math.PI / 2, 0, 0]}
                renderOrder={-1}
            >
                <planeGeometry args={[size, size, segments, segments]} />
                <primitive object={material} attach="material" />
            </mesh>
        );
    }
);

Water.displayName = 'Water';

interface AdvancedWaterProps {
    position?: [number, number, number];
    size?: number | [number, number];
    segments?: number;
    color?: THREE.ColorRepresentation;
    deepColor?: THREE.ColorRepresentation;
    foamColor?: THREE.ColorRepresentation;
    causticIntensity?: number;
    waveHeight?: number;
    waveSpeed?: number;
}

/**
 * Advanced water with caustics and foam effects
 */
export const AdvancedWater = forwardRef<THREE.Mesh, AdvancedWaterProps>(
    (
        {
            position = [0, 0, 0],
            size = 100,
            segments = 64,
            color = 0x2a5a8a,
            deepColor = 0x1a3a5a,
            foamColor = 0x8ab4d4,
            causticIntensity = 0.4,
            waveHeight = 0.5,
            waveSpeed = 1.0,
        },
        ref
    ) => {
        const internalRef = useRef<THREE.Mesh>(null);
        const waterRef = ref || internalRef;

        const resolvedSize: [number, number] = Array.isArray(size) ? size : [size, size];

        useFrame((state) => {
            const mesh = (waterRef as React.RefObject<THREE.Mesh>).current;
            if (mesh) {
                const mat = mesh.material as THREE.ShaderMaterial;
                if (mat.uniforms?.uTime) {
                    mat.uniforms.uTime.value = state.clock.getElapsedTime() * waveSpeed;
                }
                // Apply waveHeight to material uniform if available
                if (mat.uniforms?.uWaveHeight) {
                    mat.uniforms.uWaveHeight.value = waveHeight;
                }
            }
        });

        const waterMaterial = useMemo(
            () =>
                createAdvancedWaterMaterial({
                    waterColor: color,
                    deepWaterColor: deepColor,
                    foamColor: foamColor,
                    causticIntensity,
                }),
            [color, deepColor, foamColor, causticIntensity]
        );

        const waterGeometry = useMemo(
            () => new THREE.PlaneGeometry(resolvedSize[0], resolvedSize[1], segments, segments),
            [resolvedSize, segments]
        );

        useEffect(() => {
            return () => {
                waterGeometry.dispose();
                waterMaterial.dispose();
            };
        }, [waterGeometry, waterMaterial]);

        return (
            <mesh
                ref={waterRef as any}
                position={position}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
            >
                <primitive object={waterGeometry} />
                <primitive object={waterMaterial} />
            </mesh>
        );
    }
);

AdvancedWater.displayName = 'AdvancedWater';
