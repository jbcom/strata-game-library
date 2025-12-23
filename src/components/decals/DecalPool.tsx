import { useFrame } from '@react-three/fiber';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { DecalPoolProps, DecalPoolRef } from './types';

interface PooledDecal {
    id: string;
    position: THREE.Vector3;
    normal: THREE.Vector3;
    size: [number, number];
    rotation: number;
    texture: THREE.Texture;
    color: THREE.ColorRepresentation;
    createdAt: number;
    fadeTime: number;
    opacity: number;
}

/**
 * High-Performance Decal Pooling System.
 *
 * Efficiently manages a revolving pool of temporary decals (e.g., bullet holes,
 * splashes, debris). Automatically handles memory reuse and smooth fade-outs to
 * maintain steady frame rates in combat-heavy scenes.
 *
 * @category World Building
 * @example
 * ```tsx
 * const poolRef = useRef<DecalPoolRef>(null);
 *
 * <DecalPool
 *   ref={poolRef}
 *   maxDecals={100}
 *   defaultTexture={bulletHole}
 * />
 *
 * // Add on impact
 * poolRef.current?.addDecal(point, normal);
 * ```
 */
export const DecalPool = forwardRef<DecalPoolRef, DecalPoolProps>(
    (
        {
            maxDecals = 100,
            fadeTime = 5,
            defaultSize = 1,
            defaultTexture,
            depthTest = true,
            depthWrite = false,
        },
        ref
    ) => {
        const decalsRef = useRef<Map<string, PooledDecal>>(new Map());
        const nextIdRef = useRef(0);
        const [, forceUpdate] = React.useState({});

        const normalizedDefaultSize = useMemo((): [number, number] => {
            if (typeof defaultSize === 'number') {
                return [defaultSize, defaultSize];
            }
            return defaultSize;
        }, [defaultSize]);

        const addDecal = useCallback(
            (
                position: THREE.Vector3 | [number, number, number],
                normal: THREE.Vector3 | [number, number, number],
                options: {
                    texture?: THREE.Texture;
                    size?: number | [number, number];
                    rotation?: number;
                    fadeTime?: number;
                    color?: THREE.ColorRepresentation;
                } = {}
            ): string => {
                const id = `decal_${nextIdRef.current++}`;

                const pos =
                    position instanceof THREE.Vector3
                        ? position.clone()
                        : new THREE.Vector3(...position);

                const norm =
                    normal instanceof THREE.Vector3 ? normal.clone() : new THREE.Vector3(...normal);

                let size: [number, number];
                if (options.size !== undefined) {
                    if (typeof options.size === 'number') {
                        size = [options.size, options.size];
                    } else {
                        size = options.size;
                    }
                } else {
                    size = normalizedDefaultSize;
                }

                const decal: PooledDecal = {
                    id,
                    position: pos,
                    normal: norm,
                    size,
                    rotation: options.rotation ?? 0,
                    texture: options.texture ?? defaultTexture!,
                    color: options.color ?? 0xffffff,
                    createdAt: Date.now(),
                    fadeTime: (options.fadeTime ?? fadeTime) * 1000,
                    opacity: 1,
                };

                if (decalsRef.current.size >= maxDecals) {
                    let oldest: PooledDecal | null = null;
                    let oldestTime = Infinity;

                    decalsRef.current.forEach((d) => {
                        if (d.createdAt < oldestTime) {
                            oldestTime = d.createdAt;
                            oldest = d;
                        }
                    });

                    if (oldest) {
                        decalsRef.current.delete((oldest as PooledDecal).id);
                    }
                }

                decalsRef.current.set(id, decal);
                forceUpdate({});

                return id;
            },
            [defaultTexture, normalizedDefaultSize, fadeTime, maxDecals]
        );

        const removeDecal = useCallback((id: string): boolean => {
            const removed = decalsRef.current.delete(id);
            if (removed) {
                forceUpdate({});
            }
            return removed;
        }, []);

        const clear = useCallback(() => {
            decalsRef.current.clear();
            forceUpdate({});
        }, []);

        useImperativeHandle(
            ref,
            () => ({
                addDecal,
                removeDecal,
                clear,
                get count() {
                    return decalsRef.current.size;
                },
            }),
            [addDecal, removeDecal, clear]
        );

        useFrame(() => {
            const now = Date.now();
            let needsUpdate = false;
            const toRemove: string[] = [];

            decalsRef.current.forEach((decal) => {
                const age = now - decal.createdAt;
                const fadeStart = decal.fadeTime * 0.5;

                if (age > decal.fadeTime) {
                    toRemove.push(decal.id);
                    needsUpdate = true;
                } else if (age > fadeStart) {
                    const fadeProgress = (age - fadeStart) / (decal.fadeTime - fadeStart);
                    decal.opacity = 1 - fadeProgress;
                }
            });

            toRemove.forEach((id) => decalsRef.current.delete(id));

            if (needsUpdate) {
                forceUpdate({});
            }
        });

        const decals = Array.from(decalsRef.current.values());

        return (
            <group>
                {decals.map((decal) => {
                    const quaternion = new THREE.Quaternion();
                    const up = new THREE.Vector3(0, 0, 1);
                    quaternion.setFromUnitVectors(up, decal.normal);
                    const rotQ = new THREE.Quaternion().setFromAxisAngle(
                        decal.normal,
                        decal.rotation
                    );
                    quaternion.premultiply(rotQ);
                    const euler = new THREE.Euler().setFromQuaternion(quaternion);

                    return (
                        <mesh key={decal.id} position={decal.position} rotation={euler}>
                            <planeGeometry args={[decal.size[0], decal.size[1]]} />
                            <meshPhongMaterial
                                map={decal.texture}
                                color={decal.color}
                                transparent={true}
                                opacity={decal.opacity}
                                depthTest={depthTest}
                                depthWrite={depthWrite}
                                polygonOffset={true}
                                polygonOffsetFactor={-4}
                                polygonOffsetUnits={-4}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    );
                })}
            </group>
        );
    }
);

DecalPool.displayName = 'DecalPool';
