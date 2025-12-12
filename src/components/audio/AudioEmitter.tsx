/**
 * AudioEmitter Component
 *
 * Positional audio emitter that can follow an object.
 * @module components/audio
 */

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpatialAudio } from './context';
import type { AudioEmitterProps, AudioEmitterRef } from './types';

/**
 * Positional audio emitter that can follow an object.
 *
 * @example
 * ```tsx
 * const carRef = useRef<THREE.Group>(null);
 *
 * <group ref={carRef}>
 *   <Car />
 * </group>
 * <AudioEmitter
 *   url="/sounds/engine.mp3"
 *   follow={carRef}
 *   loop={true}
 *   autoplay={true}
 *   refDistance={5}
 * />
 * ```
 */
export const AudioEmitter = forwardRef<AudioEmitterRef, AudioEmitterProps>(
    (
        {
            url,
            position = [0, 0, 0],
            follow,
            loop = false,
            autoplay = false,
            volume = 1,
            refDistance = 1,
            maxDistance = 10000,
            rolloffFactor = 1,
            distanceModel = 'inverse',
            onLoad,
        },
        ref
    ) => {
        const spatialAudio = useSpatialAudio();
        const idRef = useRef(`emitter-${crypto.randomUUID()}`);
        const sourceRef = useRef<THREE.PositionalAudio | null>(null);
        const positionRef = useRef(new THREE.Vector3(...position));

        useEffect(() => {
            if (!spatialAudio) return;

            let isMounted = true;

            spatialAudio
                .load(idRef.current, url, {
                    refDistance,
                    maxDistance,
                    rolloffFactor,
                    distanceModel,
                })
                .then((source) => {
                    // Prevent setting state/refs after unmount
                    if (!isMounted) return;

                    sourceRef.current = source;
                    source.position.copy(positionRef.current);
                    source.setVolume(volume);
                    source.setLoop(loop);
                    onLoad?.();

                    if (autoplay) {
                        source.play();
                    }
                })
                .catch((error) => {
                    if (!isMounted) return;
                    console.error(`Failed to load audio emitter: ${error.message}`);
                });

            return () => {
                isMounted = false;
                spatialAudio.remove(idRef.current);
                sourceRef.current = null;
            };
        }, [url, spatialAudio]);

        useFrame(() => {
            if (!sourceRef.current) return;

            if (follow?.current) {
                follow.current.getWorldPosition(positionRef.current);
                sourceRef.current.position.copy(positionRef.current);
            }
        });

        useEffect(() => {
            if (!follow && sourceRef.current) {
                positionRef.current.set(position[0], position[1], position[2]);
                sourceRef.current.position.copy(positionRef.current);
            }
        }, [position[0], position[1], position[2], follow]);

        useEffect(() => {
            if (sourceRef.current) {
                sourceRef.current.setVolume(volume);
            }
        }, [volume]);

        useImperativeHandle(
            ref,
            () => ({
                play: () => sourceRef.current?.play(),
                stop: () => sourceRef.current?.stop(),
                pause: () => sourceRef.current?.pause(),
                setVolume: (vol: number) => sourceRef.current?.setVolume(vol),
                setPosition: (x: number, y: number, z: number) => {
                    positionRef.current.set(x, y, z);
                    sourceRef.current?.position.copy(positionRef.current);
                },
                isPlaying: () => sourceRef.current?.isPlaying ?? false,
            }),
            []
        );

        return null;
    }
);

AudioEmitter.displayName = 'AudioEmitter';
