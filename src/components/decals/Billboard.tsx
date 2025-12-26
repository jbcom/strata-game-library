import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { updateBillboardRotation } from '../../core/decals';
import type { BillboardProps, BillboardRef } from './types';

/**
 * Camera-Facing Billboard System.
 *
 * Provides a highly efficient way to render sprites, labels, and 2D elements that
 * always face the camera. Supports both spherical and cylindrical (Y-locked) billboarding.
 *
 * @category World Building
 * @example
 * ```tsx
 * <Billboard
 *   position={[0, 2, 0]}
 *   texture={cloudTexture}
 *   size={5}
 *   transparent
 * />
 * ```
 */
export const Billboard = forwardRef<BillboardRef, BillboardProps>(
    (
        {
            position = [0, 0, 0],
            size = 1,
            texture,
            color = 0xffffff,
            opacity = 1,
            transparent = true,
            alphaTest = 0.1,
            lockY = false,
            depthWrite = false,
            renderOrder = 0,
            children,
        },
        ref
    ) => {
        const meshRef = useRef<THREE.Mesh>(null);
        const spriteRef = useRef<THREE.Sprite>(null);
        const { camera } = useThree();

        const pos = useMemo(
            () => (position instanceof THREE.Vector3 ? position : new THREE.Vector3(...position)),
            [position]
        );

        const billboardSize = useMemo(() => {
            if (typeof size === 'number') {
                return [size, size] as [number, number];
            }
            return size;
        }, [size]);

        useImperativeHandle(
            ref,
            () => ({
                mesh: meshRef.current,
                sprite: spriteRef.current,
            }),
            []
        );

        useFrame(() => {
            if (meshRef.current) {
                updateBillboardRotation(meshRef.current, camera, { lockY });
            }
        });

        if (children) {
            return (
                <mesh ref={meshRef} position={pos} renderOrder={renderOrder}>
                    {children}
                </mesh>
            );
        }

        return (
            <sprite
                ref={spriteRef}
                position={pos}
                renderOrder={renderOrder}
                scale={[billboardSize[0], billboardSize[1], 1]}
            >
                <spriteMaterial
                    map={texture}
                    color={color}
                    transparent={transparent}
                    opacity={opacity}
                    alphaTest={alphaTest}
                    depthWrite={depthWrite}
                />
            </sprite>
        );
    }
);

Billboard.displayName = 'Billboard';
