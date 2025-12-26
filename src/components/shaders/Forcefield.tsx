import { useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { createForcefieldMaterial } from '../../shaders/materials';
import type { ForcefieldProps, ForcefieldRef } from './types';

/**
 * Animated Shield Forcefield.
 *
 * Provides a glowing spherical forcefield with a procedural hexagonal pattern.
 * Features an interactive hit response system that creates ripples at impact points.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * const fieldRef = useRef<ForcefieldRef>(null);
 *
 * <Forcefield
 *   ref={fieldRef}
 *   radius={2}
 *   color="blue"
 *   hexagonScale={15}
 * />
 *
 * // On impact
 * fieldRef.current?.triggerHit(hitPoint, 1.0);
 * ```
 */
export const Forcefield = forwardRef<ForcefieldRef, ForcefieldProps>(
    ({ radius = 1, position = [0, 0, 0], animate = true, ...materialOptions }, ref) => {
        const meshRef = useRef<THREE.Mesh>(null);
        const hitDecay = useRef(0);

        // biome-ignore lint/correctness/useExhaustiveDependencies: materialOptions is spread from props
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
