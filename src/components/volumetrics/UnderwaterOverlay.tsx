import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createUnderwaterOverlayMaterial } from '../../core/volumetrics';
import type { UnderwaterOverlayProps } from './types';

/**
 * Screen-Space Underwater Overlay.
 *
 * Renders a full-screen effect that simulates being underwater, featuring
 * distance-based fog and animated caustics. Automatically tracks camera depth.
 *
 * @category Effects & Atmosphere
 * @example
 * ```tsx
 * <UnderwaterOverlay
 *   color="#002244"
 *   density={0.2}
 *   waterSurface={0}
 * />
 * ```
 */
export function UnderwaterOverlay({
    color = 0x004d66,
    density = 0.1,
    causticStrength = 0.3,
    waterSurface = 0,
}: UnderwaterOverlayProps) {
    const { camera } = useThree();
    const overlayRef = useRef<THREE.Mesh>(null);

    const material = useMemo(() => {
        return createUnderwaterOverlayMaterial({
            waterColor: new THREE.Color(color),
            density,
            causticStrength,
            waterSurface,
        });
    }, [color, density, causticStrength, waterSurface]);

    useFrame((state) => {
        if (material?.uniforms) {
            material.uniforms.uTime.value = state.clock.elapsedTime;
            material.uniforms.uCameraY.value = camera.position.y;
        }
    });

    useEffect(() => {
        return () => {
            material.dispose();
        };
    }, [material]);

    return (
        <mesh ref={overlayRef} renderOrder={999}>
            <planeGeometry args={[2, 2]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
