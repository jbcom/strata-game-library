/**
 * PositionalAudio Component
 *
 * 3D positional audio source using Three.js PositionalAudio.
 * @module components/audio
 */

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { useSpatialAudio } from './context';
import type { PositionalAudioProps, PositionalAudioRef } from './types';

/**
 * 3D positional audio source with distance-based attenuation.
 *
 * @example
 * ```tsx
 * <PositionalAudio
 *   url="/sounds/waterfall.mp3"
 *   position={[10, 0, 5]}
 *   loop={true}
 *   autoplay={true}
 *   refDistance={5}
 *   maxDistance={50}
 * />
 * ```
 */
export const PositionalAudio = forwardRef<PositionalAudioRef, PositionalAudioProps>(
    (
        {
            url,
            position = [0, 0, 0],
            loop = false,
            autoplay = false,
            volume = 1,
            refDistance = 1,
            maxDistance = 10000,
            rolloffFactor = 1,
            distanceModel = 'inverse',
            playbackRate = 1,
            onLoad,
            onEnd,
        },
        ref
    ) => {
        const spatialAudio = useSpatialAudio();
        const idRef = useRef(`positional-${crypto.randomUUID()}`);
        const sourceRef = useRef<THREE.PositionalAudio | null>(null);

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
                    source.position.set(position[0], position[1], position[2]);
                    source.setPlaybackRate(playbackRate);
                    source.setVolume(volume);
                    source.setLoop(loop);

                    if (onEnd) {
                        source.onEnded = onEnd;
                    }

                    onLoad?.();

                    if (autoplay) {
                        source.play();
                    }
                })
                .catch((error) => {
                    if (!isMounted) return;
                    console.error(`Failed to load positional audio: ${error.message}`);
                });

            return () => {
                isMounted = false;
                spatialAudio.remove(idRef.current);
                sourceRef.current = null;
            };
        }, [url, spatialAudio]);

        useEffect(() => {
            if (sourceRef.current) {
                sourceRef.current.position.set(position[0], position[1], position[2]);
            }
        }, [position[0], position[1], position[2]]);

        useEffect(() => {
            if (sourceRef.current) {
                sourceRef.current.setVolume(volume);
            }
        }, [volume]);

        useImperativeHandle(
            ref,
            () => ({
                play: () => sourceRef.current?.play(),
                pause: () => sourceRef.current?.pause(),
                stop: () => sourceRef.current?.stop(),
                setVolume: (vol: number) => sourceRef.current?.setVolume(vol),
                setPosition: (x: number, y: number, z: number) =>
                    sourceRef.current?.position.set(x, y, z),
                isPlaying: () => sourceRef.current?.isPlaying ?? false,
            }),
            []
        );

        return null;
    }
);

PositionalAudio.displayName = 'PositionalAudio';
