/**
 * Ray marching component for GPU-based SDF rendering
 *
 * Uses marching.js patterns for efficient ray marching
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createRaymarchingGeometry, createRaymarchingMaterial } from '../core/raymarching';

interface RaymarchingProps {
    sdfFunction: string; // GLSL code for sceneSDF function
    maxSteps?: number;
    maxDistance?: number;
    minDistance?: number;
    backgroundColor?: THREE.ColorRepresentation;
    fogStrength?: number;
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
