import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { updateBillboardRotation } from '../../core/decals';
import { calculateImpostorAngle, createImpostorGeometry, updateImpostorUV } from '../../core/lod';
import type { ImpostorProps, ImpostorRef } from './types';

/**
 * View-Dependent Impostor Billboard.
 *
 * Provides a highly optimized billboard that automatically selects the correct
 * view from a sprite atlas based on the camera's angle relative to the object.
 * Perfect for background trees, buildings, or large crowds.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <Impostor
 *   texture={impostorAtlas}
 *   views={8}
 *   size={5}
 *   billboardMode="cylindrical"
 * />
 * ```
 */
export const Impostor = forwardRef<ImpostorRef, ImpostorProps>(
    (
        {
            texture,
            position = [0, 0, 0],
            size = 1,
            views = 8,
            billboardMode = 'cylindrical',
            opacity = 1,
            transparent = true,
            alphaTest = 0.1,
            depthWrite = false,
            color = 0xffffff,
            renderOrder = 0,
            castShadow = false,
            receiveShadow = false,
        },
        ref
    ) => {
        const meshRef = useRef<THREE.Mesh>(null);
        const { camera } = useThree();
        const [currentView, setCurrentView] = useState(0);

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

        const geometry = useMemo(
            () => createImpostorGeometry(billboardSize[0], billboardSize[1], views),
            [billboardSize, views]
        );

        const material = useMemo(() => {
            const mat = new THREE.MeshBasicMaterial({
                map: texture,
                color,
                transparent,
                opacity,
                alphaTest,
                depthWrite,
                side: THREE.DoubleSide,
            });
            return mat;
        }, [texture, color, transparent, opacity, alphaTest, depthWrite]);

        const updateView = useCallback(() => {
            if (!meshRef.current) return;

            const worldPos = new THREE.Vector3();
            meshRef.current.getWorldPosition(worldPos);

            const angle = calculateImpostorAngle(worldPos, camera.position);
            updateImpostorUV(geometry, angle, views);

            const viewIndex = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * views) % views;
            setCurrentView(viewIndex);
        }, [camera, geometry, views]);

        useImperativeHandle(
            ref,
            () => ({
                mesh: meshRef.current,
                currentView,
                updateView,
            }),
            [currentView, updateView]
        );

        useFrame(() => {
            if (!meshRef.current) return;

            if (billboardMode === 'cylindrical') {
                updateBillboardRotation(meshRef.current, camera, { lockY: true });
            } else {
                updateBillboardRotation(meshRef.current, camera, { lockY: false });
            }

            updateView();
        });

        useEffect(() => {
            return () => {
                geometry.dispose();
                material.dispose();
            };
        }, [geometry, material]);

        return (
            <mesh
                ref={meshRef}
                position={pos}
                geometry={geometry}
                material={material}
                renderOrder={renderOrder}
                castShadow={castShadow}
                receiveShadow={receiveShadow}
            />
        );
    }
);

Impostor.displayName = 'Impostor';
