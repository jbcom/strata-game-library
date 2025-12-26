/**
 * High-performance Water system for realistic oceans, lakes, and rivers.
 *
 * Provides realistic water surfaces with wave animation, reflections, caustics, and foam effects.
 * Optimized for React Three Fiber with GPU-accelerated wave simulation.
 *
 * @packageDocumentation
 * @module components/water
 * @category World Building
 *
 * ## Interactive Demos
 * <iframe src="../../demos/water.html" width="100%" height="400px" style="border-radius: 8px; border: 1px solid #1e293b;"></iframe>
 *
 * - 🎮 [Full Screen Water Demo](../../demos/water.html)
 * - 📦 [Water Scene Example](https://github.com/jbcom/nodejs-strata/tree/main/examples/water-scene)
 *
 * ## API Documentation
 * - [Full API Reference](http://jonbogaty.com/nodejs-strata/api)
 * - [Examples → API Mapping](https://github.com/jbcom/nodejs-strata/blob/main/EXAMPLES_API_MAP.md#water-system-apis)
 *
 * @example
 * ```tsx
 * // Basic water surface
 * <Water
 *   position={[0, -0.2, 0]}
 *   size={100}
 *   color={0x006994}
 *   opacity={0.8}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Rough ocean water
 * <Water
 *   size={200}
 *   waveSpeed={2.0}
 *   waveHeight={1.5}
 *   segments={64}
 * />
 * ```
 *
 * @see {@link AdvancedWater} for caustics, reflections, and foam effects
 */

import { useFrame } from '@react-three/fiber';
import type React from 'react';
import { forwardRef, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createAdvancedWaterMaterial, createWaterMaterial } from '../../core/water';

/**
 * Props for the Water component.
 * @category World Building
 */
export interface WaterProps {
    /** Position of the water surface in 3D space. Default: [0, -0.2, 0] */
    position?: [number, number, number];
    /** Size of the water plane (width and height). Default: 100 */
    size?: number;
    /** Number of segments for wave detail. Higher = more detailed waves. Default: 32 */
    segments?: number;
    /** Water color (THREE.ColorRepresentation). Default: 0x006994 (blue) */
    color?: THREE.ColorRepresentation;
    /** Water transparency (0 = fully transparent, 1 = opaque). Default: 0.8 */
    opacity?: number;
    /** Wave animation speed multiplier. Default: 1.0 */
    waveSpeed?: number;
    /** Wave amplitude in units. Default: 0.5 */
    waveHeight?: number;
}

/**
 * Simple procedural water surface with animated waves.
 *
 * @category World Building
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

/**
 * Props for the AdvancedWater component.
 * @category World Building
 */
export interface AdvancedWaterProps {
    /** Position of the water surface. */
    position?: [number, number, number];
    /** Size of the water plane. Can be a number or [width, height]. */
    size?: number | [number, number];
    /** Number of segments for the plane geometry. */
    segments?: number;
    /** Shallow water color. */
    color?: THREE.ColorRepresentation;
    /** Alias for color. @deprecated Use color instead. */
    waterColor?: THREE.ColorRepresentation;
    /** Deep water color. */
    deepColor?: THREE.ColorRepresentation;
    /** Foam color. */
    foamColor?: THREE.ColorRepresentation;
    /** Intensity of caustics (0-1). */
    causticIntensity?: number;
    /** Height of waves. */
    waveHeight?: number;
    /** Speed of wave animation. */
    waveSpeed?: number;
}

/**
 * Advanced water with caustics and foam effects.
 *
 * @category World Building
 * @example
 * ```tsx
 * <AdvancedWater
 *   size={500}
 *   color={0x00aaff}
 *   causticIntensity={0.8}
 * />
 * ```
 */
export const AdvancedWater = forwardRef<THREE.Mesh, AdvancedWaterProps>(
    (
        {
            position = [0, 0, 0],
            size = 100,
            segments = 64,
            color: colorProp = 0x2a5a8a,
            waterColor, // Alias for color
            deepColor = 0x1a3a5a,
            foamColor = 0x8ab4d4,
            causticIntensity = 0.4,
            waveHeight = 0.5,
            waveSpeed = 1.0,
        },
        ref
    ) => {
        const color = waterColor !== undefined ? waterColor : colorProp;
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
