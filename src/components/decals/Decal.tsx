import { useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { DecalProps, DecalRef } from './types';

/**
 * Surface-Projected Decal.
 *
 * Automatically orients to a surface normal, making it ideal for bullet holes,
 * splashes, graffiti, or impact marks on walls and floors.
 *
 * @category World Building
 * @example
 * ```tsx
 * <Decal
 *   position={hitPoint}
 *   normal={hitNormal}
 *   texture={bulletHoleTexture}
 *   size={0.2}
 * />
 * ```
 */
export const Decal = forwardRef<DecalRef, DecalProps>(
    (
        {
            position,
            normal,
            size = 1,
            texture,
            rotation = 0,
            opacity = 1,
            fadeTime,
            depthTest = true,
            depthWrite = false,
            polygonOffsetFactor = -4,
            color = 0xffffff,
        },
        ref
    ) => {
        const meshRef = useRef<THREE.Mesh>(null);
        const materialRef = useRef<THREE.MeshPhongMaterial>(null);
        const createdAtRef = useRef<number>(Date.now());
        const fadeTimeMs = fadeTime ? fadeTime * 1000 : undefined;

        const pos = useMemo(
            () => (position instanceof THREE.Vector3 ? position : new THREE.Vector3(...position)),
            [position]
        );

        const norm = useMemo(
            () => (normal instanceof THREE.Vector3 ? normal : new THREE.Vector3(...normal)),
            [normal]
        );

        const decalSize = useMemo(() => {
            if (typeof size === 'number') {
                return [size, size] as [number, number];
            }
            return size;
        }, [size]);

        const quaternion = useMemo(() => {
            const q = new THREE.Quaternion();
            const up = new THREE.Vector3(0, 0, 1);
            q.setFromUnitVectors(up, norm);

            const rotQ = new THREE.Quaternion().setFromAxisAngle(norm, rotation);
            q.premultiply(rotQ);

            return q;
        }, [norm, rotation]);

        const euler = useMemo(() => new THREE.Euler().setFromQuaternion(quaternion), [quaternion]);

        useImperativeHandle(
            ref,
            () => ({
                mesh: meshRef.current,
                setOpacity: (newOpacity: number) => {
                    if (materialRef.current) {
                        materialRef.current.opacity = newOpacity;
                    }
                },
            }),
            []
        );

        useFrame(() => {
            if (fadeTimeMs && materialRef.current) {
                const age = Date.now() - createdAtRef.current;
                const fadeStart = fadeTimeMs * 0.5;

                if (age > fadeTimeMs) {
                    materialRef.current.opacity = 0;
                } else if (age > fadeStart) {
                    const fadeProgress = (age - fadeStart) / (fadeTimeMs - fadeStart);
                    materialRef.current.opacity = opacity * (1 - fadeProgress);
                }
            }
        });

        return (
            <mesh ref={meshRef} position={pos} rotation={euler}>
                <planeGeometry args={[decalSize[0], decalSize[1]]} />
                <meshPhongMaterial
                    ref={materialRef}
                    map={texture}
                    color={color}
                    transparent={true}
                    opacity={opacity}
                    depthTest={depthTest}
                    depthWrite={depthWrite}
                    polygonOffset={true}
                    polygonOffsetFactor={polygonOffsetFactor}
                    polygonOffsetUnits={polygonOffsetFactor}
                    side={THREE.DoubleSide}
                />
            </mesh>
        );
    }
);

Decal.displayName = 'Decal';
