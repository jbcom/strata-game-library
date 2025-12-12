/**
 * Decal and Billboard React Components
 *
 * Provides React components for projecting decals onto surfaces,
 * creating billboards that face the camera, and managing decal pools.
 * @module components/Decals
 */

import { useFrame, useThree } from '@react-three/fiber';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react';
import * as THREE from 'three';
import {
    applySpriteSheetFrame,
    type BillboardConfig,
    createSpriteSheetAnimation,
    type DecalInstance,
    type DecalProjectorConfig,
    type SpriteAnimationState,
    type SpriteSheetConfig,
    updateBillboardRotation,
    updateSpriteSheetAnimation,
} from '../core/decals';

/**
 * Props for the Decal component
 *
 * @property position - World position of the decal center
 * @property normal - Surface normal direction for orientation
 * @property size - Size of decal (single number or [width, height])
 * @property texture - Texture to apply to the decal
 * @property rotation - Rotation around the normal axis in radians
 * @property opacity - Decal opacity (0-1)
 * @property fadeTime - Time in seconds before decal fades out
 * @property depthTest - Whether to test against depth buffer
 * @property depthWrite - Whether to write to depth buffer
 * @property polygonOffsetFactor - Z-fighting offset factor
 * @property color - Tint color for the decal
 */
export interface DecalProps {
    position: THREE.Vector3 | [number, number, number];
    normal: THREE.Vector3 | [number, number, number];
    size?: number | [number, number];
    texture: THREE.Texture;
    rotation?: number;
    opacity?: number;
    fadeTime?: number;
    depthTest?: boolean;
    depthWrite?: boolean;
    polygonOffsetFactor?: number;
    color?: THREE.ColorRepresentation;
}

/**
 * Ref interface for Decal imperative control
 */
export interface DecalRef {
    mesh: THREE.Mesh | null;
    setOpacity: (opacity: number) => void;
}

/**
 * Surface-projected decal component for bullet holes, splashes, and marks.
 * Automatically orients to the surface normal with optional fade-out.
 *
 * @example
 * ```tsx
 * // Basic bullet hole decal
 * <Decal
 *   position={hitPoint}
 *   normal={hitNormal}
 *   texture={bulletHoleTexture}
 *   size={0.2}
 * />
 *
 * // Fading blood splatter
 * <Decal
 *   position={[0, 0.01, 0]}
 *   normal={[0, 1, 0]}
 *   texture={bloodTexture}
 *   size={[1, 0.8]}
 *   fadeTime={10}
 *   opacity={0.9}
 * />
 *
 * // Rotated graffiti
 * <Decal
 *   position={wallPosition}
 *   normal={wallNormal}
 *   texture={graffitiTexture}
 *   rotation={Math.PI / 6}
 *   size={2}
 * />
 * ```
 *
 * @param props - DecalProps configuration
 * @returns React element containing the decal mesh
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

/**
 * Props for the Billboard component
 *
 * @property position - World position of the billboard
 * @property size - Size (single number or [width, height])
 * @property texture - Texture to display
 * @property color - Tint color
 * @property opacity - Opacity (0-1)
 * @property transparent - Enable transparency
 * @property alphaTest - Alpha test threshold
 * @property lockY - Lock Y-axis rotation (cylindrical billboard)
 * @property depthWrite - Write to depth buffer
 * @property renderOrder - Render order for transparency sorting
 * @property children - Optional child elements
 */
export interface BillboardProps {
    position?: THREE.Vector3 | [number, number, number];
    size?: number | [number, number];
    texture: THREE.Texture;
    color?: THREE.ColorRepresentation;
    opacity?: number;
    transparent?: boolean;
    alphaTest?: number;
    lockY?: boolean;
    depthWrite?: boolean;
    renderOrder?: number;
    children?: React.ReactNode;
}

/**
 * Ref interface for Billboard imperative control
 */
export interface BillboardRef {
    mesh: THREE.Mesh | null;
    sprite: THREE.Sprite | null;
}

/**
 * Camera-facing billboard component for sprites, labels, and impostors.
 * Can be configured for spherical or cylindrical billboarding.
 *
 * @example
 * ```tsx
 * // Basic sprite billboard
 * <Billboard
 *   position={[0, 2, 0]}
 *   texture={treeTexture}
 *   size={3}
 * />
 *
 * // Cylindrical billboard (locked Y rotation)
 * <Billboard
 *   position={characterPosition}
 *   texture={characterSprite}
 *   size={[1, 2]}
 *   lockY={true}
 * />
 *
 * // Transparent health bar
 * <Billboard
 *   position={[0, 3, 0]}
 *   texture={healthBarTexture}
 *   size={[2, 0.3]}
 *   alphaTest={0.5}
 *   renderOrder={100}
 * />
 * ```
 *
 * @param props - BillboardProps configuration
 * @returns React element containing the billboard
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

/**
 * Props for the AnimatedBillboard component
 *
 * @property texture - Sprite sheet texture
 * @property columns - Number of columns in sprite sheet
 * @property rows - Number of rows in sprite sheet
 * @property frameCount - Total number of frames (defaults to columns * rows)
 * @property frameRate - Frames per second
 * @property loop - Whether animation loops
 * @property pingPong - Play forward then backward
 * @property autoPlay - Start playing immediately
 * @property onAnimationComplete - Callback when animation ends
 */
export interface AnimatedBillboardProps extends Omit<BillboardProps, 'texture'> {
    texture: THREE.Texture;
    columns: number;
    rows: number;
    frameCount?: number;
    frameRate?: number;
    loop?: boolean;
    pingPong?: boolean;
    autoPlay?: boolean;
    onAnimationComplete?: () => void;
}

/**
 * Ref interface for AnimatedBillboard imperative control
 */
export interface AnimatedBillboardRef extends BillboardRef {
    play: () => void;
    pause: () => void;
    reset: () => void;
    setFrame: (frame: number) => void;
    currentFrame: number;
}

/**
 * Animated sprite sheet billboard for effects and character sprites.
 * Supports looping, ping-pong, and manual frame control.
 *
 * @example
 * ```tsx
 * // Explosion animation
 * <AnimatedBillboard
 *   position={explosionPos}
 *   texture={explosionSheet}
 *   columns={8}
 *   rows={8}
 *   frameRate={30}
 *   loop={false}
 *   onAnimationComplete={() => removeExplosion()}
 * />
 *
 * // Looping fire effect
 * <AnimatedBillboard
 *   position={[0, 1, 0]}
 *   texture={fireSheet}
 *   columns={4}
 *   rows={4}
 *   frameRate={15}
 *   loop={true}
 *   size={2}
 * />
 *
 * // Character idle animation
 * <AnimatedBillboard
 *   position={characterPos}
 *   texture={idleSheet}
 *   columns={6}
 *   rows={1}
 *   frameRate={8}
 *   loop={true}
 *   pingPong={true}
 *   lockY={true}
 * />
 * ```
 *
 * @param props - AnimatedBillboardProps configuration
 * @returns React element containing the animated billboard
 */
export const AnimatedBillboard = forwardRef<AnimatedBillboardRef, AnimatedBillboardProps>(
    (
        {
            texture,
            columns,
            rows,
            frameCount,
            frameRate = 10,
            loop = true,
            pingPong = false,
            autoPlay = true,
            onAnimationComplete,
            position = [0, 0, 0],
            size = 1,
            color = 0xffffff,
            opacity = 1,
            transparent = true,
            alphaTest = 0.1,
            lockY = false,
            depthWrite = false,
            renderOrder = 0,
        },
        ref
    ) => {
        const spriteRef = useRef<THREE.Sprite>(null);
        const materialRef = useRef<THREE.SpriteMaterial>(null);
        const { camera } = useThree();

        const animState = useRef<SpriteAnimationState>(
            createSpriteSheetAnimation({
                columns,
                rows,
                frameCount,
                frameRate,
                loop,
                pingPong,
            })
        );

        const config: SpriteSheetConfig = useMemo(
            () => ({
                columns,
                rows,
                frameCount,
                frameRate,
                loop,
                pingPong,
            }),
            [columns, rows, frameCount, frameRate, loop, pingPong]
        );

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

        const clonedTexture = useMemo(() => {
            const t = texture.clone();
            t.repeat.set(1 / columns, 1 / rows);
            t.needsUpdate = true;
            return t;
        }, [texture, columns, rows]);

        useEffect(() => {
            animState.current.isPlaying = autoPlay;
        }, [autoPlay]);

        useImperativeHandle(
            ref,
            () => ({
                mesh: null,
                sprite: spriteRef.current,
                play: () => {
                    animState.current.isPlaying = true;
                },
                pause: () => {
                    animState.current.isPlaying = false;
                },
                reset: () => {
                    animState.current.currentFrame = 0;
                    animState.current.elapsedTime = 0;
                    animState.current.direction = 1;
                    animState.current.isPlaying = autoPlay;
                    applySpriteSheetFrame(clonedTexture, 0, config);
                },
                setFrame: (frame: number) => {
                    animState.current.currentFrame = frame;
                    applySpriteSheetFrame(clonedTexture, frame, config);
                },
                get currentFrame() {
                    return animState.current.currentFrame;
                },
            }),
            [autoPlay, clonedTexture, config]
        );

        useFrame((_, delta) => {
            const prevFrame = animState.current.currentFrame;
            const wasPlaying = animState.current.isPlaying;

            animState.current = updateSpriteSheetAnimation(animState.current, config, delta);

            if (animState.current.currentFrame !== prevFrame) {
                applySpriteSheetFrame(clonedTexture, animState.current.currentFrame, config);
            }

            if (wasPlaying && !animState.current.isPlaying && onAnimationComplete) {
                onAnimationComplete();
            }
        });

        useEffect(() => {
            return () => {
                clonedTexture.dispose();
            };
        }, [clonedTexture]);

        return (
            <sprite
                ref={spriteRef}
                position={pos}
                renderOrder={renderOrder}
                scale={[billboardSize[0], billboardSize[1], 1]}
            >
                <spriteMaterial
                    ref={materialRef}
                    map={clonedTexture}
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

AnimatedBillboard.displayName = 'AnimatedBillboard';

/**
 * Props for the DecalPool component
 *
 * @property maxDecals - Maximum number of decals in the pool
 * @property fadeTime - Default fade-out time in seconds
 * @property defaultSize - Default decal size
 * @property defaultTexture - Default texture for new decals
 * @property depthTest - Default depth test setting
 * @property depthWrite - Default depth write setting
 */
export interface DecalPoolProps {
    maxDecals?: number;
    fadeTime?: number;
    defaultSize?: number | [number, number];
    defaultTexture?: THREE.Texture;
    depthTest?: boolean;
    depthWrite?: boolean;
}

/**
 * Ref interface for DecalPool imperative control
 */
export interface DecalPoolRef {
    addDecal: (
        position: THREE.Vector3 | [number, number, number],
        normal: THREE.Vector3 | [number, number, number],
        options?: {
            texture?: THREE.Texture;
            size?: number | [number, number];
            rotation?: number;
            fadeTime?: number;
            color?: THREE.ColorRepresentation;
        }
    ) => string;
    removeDecal: (id: string) => boolean;
    clear: () => void;
    count: number;
}

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
 * Managed pool of decals with automatic lifecycle and fade-out.
 * Efficiently handles many temporary decals like bullet holes and blood splatters.
 *
 * @example
 * ```tsx
 * // Bullet hole pool
 * const decalPoolRef = useRef<DecalPoolRef>(null);
 *
 * <DecalPool
 *   ref={decalPoolRef}
 *   maxDecals={100}
 *   fadeTime={30}
 *   defaultTexture={bulletHoleTexture}
 *   defaultSize={0.1}
 * />
 *
 * // Add decal on hit
 * const handleHit = (point, normal) => {
 *   decalPoolRef.current?.addDecal(point, normal, {
 *     rotation: Math.random() * Math.PI * 2
 *   });
 * };
 *
 * // Blood splatter pool with custom textures
 * <DecalPool
 *   ref={bloodPoolRef}
 *   maxDecals={50}
 *   fadeTime={60}
 * />
 *
 * // Add with custom options
 * bloodPoolRef.current?.addDecal(hitPos, hitNormal, {
 *   texture: bloodTextures[Math.floor(Math.random() * 3)],
 *   size: [0.5, 0.4],
 *   color: 0x880000
 * });
 * ```
 *
 * @param props - DecalPoolProps configuration
 * @returns React element containing all pool decals
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

export type {
    DecalProjectorConfig,
    DecalInstance,
    BillboardConfig,
    SpriteSheetConfig,
    SpriteAnimationState,
};
