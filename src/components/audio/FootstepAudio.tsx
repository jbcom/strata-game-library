/**
 * FootstepAudio Component
 *
 * Footstep audio system with multiple surface types and sound pooling.
 * @module components/audio
 */

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Howl } from 'howler';
import * as THREE from 'three';
import type { FootstepAudioProps, FootstepAudioRef } from './types';

interface SoundPool {
    howl: Howl;
    lastPlayed: number;
}

/**
 * Footstep audio system with multiple surface types and sound pooling.
 *
 * @example
 * ```tsx
 * const footstepRef = useRef<FootstepAudioRef>(null);
 *
 * <FootstepAudio
 *   ref={footstepRef}
 *   surfaces={{
 *     grass: '/sounds/footstep-grass.mp3',
 *     stone: '/sounds/footstep-stone.mp3',
 *     wood: '/sounds/footstep-wood.mp3',
 *   }}
 *   defaultSurface="stone"
 *   volume={0.7}
 * />
 *
 * const onStep = () => {
 *   const surface = detectGroundMaterial();
 *   footstepRef.current?.playFootstep(surface);
 * };
 * ```
 */
export const FootstepAudio = forwardRef<FootstepAudioRef, FootstepAudioProps>(
    ({ surfaces, defaultSurface = 'default', volume = 1, poolSize = 4, throttleMs = 50 }, ref) => {
        const poolsRef = useRef<Map<string, SoundPool>>(new Map());

        useEffect(() => {
            for (const [surface, url] of Object.entries(surfaces)) {
                const howl = new Howl({
                    src: [url],
                    volume,
                    pool: poolSize,
                    preload: true,
                });
                poolsRef.current.set(surface, { howl, lastPlayed: 0 });
            }

            return () => {
                for (const pool of poolsRef.current.values()) {
                    pool.howl.unload();
                }
                poolsRef.current.clear();
            };
        }, [surfaces, volume, poolSize]);

        useEffect(() => {
            for (const pool of poolsRef.current.values()) {
                pool.howl.volume(volume);
            }
        }, [volume]);

        useImperativeHandle(
            ref,
            () => ({
                playFootstep: (surface = defaultSurface, _position?: THREE.Vector3) => {
                    const pool =
                        poolsRef.current.get(surface) ?? poolsRef.current.get(defaultSurface);
                    if (pool) {
                        const now = Date.now();
                        if (now - pool.lastPlayed > throttleMs) {
                            pool.howl.play();
                            pool.lastPlayed = now;
                        }
                    }
                },
            }),
            [defaultSurface, throttleMs]
        );

        return null;
    }
);

FootstepAudio.displayName = 'FootstepAudio';
