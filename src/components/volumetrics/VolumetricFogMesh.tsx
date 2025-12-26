import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createVolumetricFogMeshMaterial } from '../../core/volumetrics';
import type { VolumetricFogMeshProps } from './types';

/**
 * Localized Volumetric Fog Volume.
 *
 * Renders a 3D box of volumetric fog that follows the camera horizontally.
 * Features realistic light scattering and height-based density.
 *
 * @category Effects & Atmosphere
 * @example
 * ```tsx
 * <VolumetricFogMesh
 *   color="#ffffff"
 *   density={0.05}
 *   height={15}
 *   size={100}
 * />
 * ```
 */
export function VolumetricFogMesh({
    color = 0xb3c8d9,
    density = 0.02,
    height = 10,
    size = 200,
}: VolumetricFogMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();

    const fogColor = useMemo(() => new THREE.Color(color), [color]);

    const material = useMemo(() => {
        return createVolumetricFogMeshMaterial({
            color: fogColor,
            density,
            height,
            cameraPosition: camera.position as any,
        });
    }, [fogColor, density, height, camera]);

    useFrame((state) => {
        if (material?.uniforms && meshRef.current) {
            material.uniforms.uTime.value = state.clock.elapsedTime;
            material.uniforms.uCameraPosition.value = camera.position.toArray();
            meshRef.current.position.set(camera.position.x, 0, camera.position.z);
        }
    });

    useEffect(() => {
        return () => {
            material.dispose();
        };
    }, [material]);

    return (
        <mesh ref={meshRef as any} position={[0, height / 2, 0]}>
            <boxGeometry args={[size, height, size, 1, 8, 1]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
