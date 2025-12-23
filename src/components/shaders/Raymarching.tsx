/**
 * GPU-Based Ray Marching System for Strata.
 *
 * Provides specialized components for rendering complex Signed Distance Fields (SDFs)
 * directly on the GPU using efficient ray marching algorithms.
 *
 * @packageDocumentation
 * @module components/Raymarching
 * @category Rendering Pipeline
 *
 * ## Interactive Demos
 * - 🎮 [Live Raymarching Demo](http://jonbogaty.com/nodejs-strata/demos/raymarching.html)
 * - 📦 [Fractal World Example](https://github.com/jbcom/nodejs-strata/tree/main/examples/raymarching-fractals)
 *
 * @example
 * ```tsx
 * <Raymarching
 *   sdfFunction={`
 *     float sceneSDF(vec3 p) {
 *       return sdSphere(p, 1.0);
 *     }
 *   `}
 *   maxSteps={128}
 * />
 * ```
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createRaymarchingGeometry, createRaymarchingMaterial } from '../../core/raymarching';

/**
 * Props for the Raymarching component.
 * @category Rendering Pipeline
 */
export interface RaymarchingProps {
    /** GLSL code for the sceneSDF function. */
    sdfFunction: string;
    /** Maximum number of raymarching steps. Default: 100. */
    maxSteps?: number;
    /** Maximum distance for raymarching. Default: 20.0. */
    maxDistance?: number;
    /** Minimum distance for hit detection. Default: 0.001. */
    minDistance?: number;
    /** Background color for the scene. Default: 0x000000. */
    backgroundColor?: THREE.ColorRepresentation;
    /** Strength of scene fog. Default: 0.1. */
    fogStrength?: number;
    /** Color of the scene fog. Default: 0x000000. */
    fogColor?: THREE.ColorRepresentation;
}

export function Raymarching({
    sdfFunction,
    maxSteps = 100,
    maxDistance = 20.0,
    minDistance = 0.001,
    backgroundColor = 0x000000,
    fogStrength = 0.1,
    fogColor = 0x000000,
}: RaymarchingProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera, size } = useThree();

    const material = useMemo(() => {
        return createRaymarchingMaterial({
            sdfFunction,
            maxSteps,
            maxDistance,
            minDistance,
            backgroundColor,
            fogStrength,
            fogColor,
            cameraPosition: camera.position.clone() as unknown as THREE.Vector3,
            cameraMatrix: camera.matrixWorld.clone() as unknown as THREE.Matrix4,
            resolution: new THREE.Vector2(size.width, size.height),
        });
    }, [
        sdfFunction,
        maxSteps,
        maxDistance,
        minDistance,
        backgroundColor,
        fogStrength,
        fogColor,
        camera,
        size,
    ]);

    useFrame((state) => {
        if (!material.uniforms) return;

        material.uniforms.uTime.value = state.clock.elapsedTime;
        material.uniforms.uCameraPosition.value.copy(camera.position);
        material.uniforms.uCameraMatrix.value.copy(camera.matrixWorld);
        material.uniforms.uResolution.value.set(size.width, size.height);
    });

    // Fullscreen quad geometry
    const geometry = useMemo(() => {
        return createRaymarchingGeometry();
    }, []);

    // Cleanup GPU resources on unmount or when dependencies change
    useEffect(() => {
        return () => {
            material.dispose();
            geometry.dispose();
        };
    }, [material, geometry]);

    return (
        <mesh ref={meshRef as any} geometry={geometry as any}>
            <primitive object={material} attach="material" />
        </mesh>
    );
}
