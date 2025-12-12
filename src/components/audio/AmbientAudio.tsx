/**
 * AmbientAudio Component
 *
 * Non-positional ambient audio using Howler.js via SoundManager.
 * @module components/audio
 */

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Howl } from 'howler';
import { useAudioManager } from './context';
import type { AmbientAudioProps, AmbientAudioRef } from './types';

/**
 * Non-positional ambient audio for background music and atmosphere.
 *
 * @example
 * ```tsx
 * <AmbientAudio
 *   url="/music/ambient.mp3"
 *   volume={0.5}
 *   loop={true}
 *   autoplay={true}
 *   fadeTime={2}
 * />
 * ```
 */
export const AmbientAudio = forwardRef<AmbientAudioRef, AmbientAudioProps>(
    ({ url, volume = 1, loop = true, autoplay = false, fadeTime = 0, onLoad }, ref) => {
        // Note: Currently using direct Howl instance for simplicity.
        // TODO: Future enhancement - integrate with SoundManager for bus/volume control
        const _soundManager = useAudioManager();
        const howlRef = useRef<Howl | null>(null);
        const soundIdRef = useRef<number | undefined>(undefined);
        const targetVolumeRef = useRef(volume);

        useEffect(() => {
            let isMounted = true;

            const howl = new Howl({
                src: [url],
                loop,
                volume: fadeTime > 0 && autoplay ? 0 : volume,
                preload: true,
                onload: () => {
                    // Prevent callbacks after unmount
                    if (!isMounted) return;

                    onLoad?.();
                    if (autoplay) {
                        soundIdRef.current = howl.play();
                        if (fadeTime > 0) {
                            howl.fade(0, volume, fadeTime * 1000, soundIdRef.current);
                        }
                    }
                },
                onloaderror: (_id, error) => {
                    if (!isMounted) return;
                    console.error(`Failed to load ambient audio: ${error}`);
                },
            });

            howlRef.current = howl;

            return () => {
                isMounted = false;
                howl.unload();
                howlRef.current = null;
                soundIdRef.current = undefined;
            };
        }, [url, loop]);

        useEffect(() => {
            targetVolumeRef.current = volume;
            if (howlRef.current && soundIdRef.current !== undefined) {
                howlRef.current.volume(volume, soundIdRef.current);
            }
        }, [volume]);

        useImperativeHandle(
            ref,
            () => ({
                play: () => {
                    if (howlRef.current) {
                        soundIdRef.current = howlRef.current.play(soundIdRef.current);
                    }
                },
                stop: () => {
                    if (howlRef.current) {
                        howlRef.current.stop(soundIdRef.current);
                    }
                },
                fadeIn: (duration: number) => {
                    if (howlRef.current) {
                        const id = soundIdRef.current;
                        if (!howlRef.current.playing(id)) {
                            if (id !== undefined) {
                                howlRef.current.volume(0, id);
                            }
                            soundIdRef.current = howlRef.current.play(id);
                        }
                        const newId = soundIdRef.current;
                        if (newId !== undefined) {
                            howlRef.current.fade(
                                0,
                                targetVolumeRef.current,
                                duration * 1000,
                                newId
                            );
                        }
                    }
                },
                fadeOut: (duration: number) => {
                    if (howlRef.current && soundIdRef.current !== undefined) {
                        howlRef.current.fade(
                            howlRef.current.volume() as number,
                            0,
                            duration * 1000,
                            soundIdRef.current
                        );
                    }
                },
                setVolume: (vol: number, fadeTime?: number) => {
                    targetVolumeRef.current = vol;
                    if (howlRef.current) {
                        const id = soundIdRef.current;
                        if (fadeTime && fadeTime > 0 && id !== undefined) {
                            howlRef.current.fade(
                                howlRef.current.volume() as number,
                                vol,
                                fadeTime * 1000,
                                id
                            );
                        } else if (id !== undefined) {
                            howlRef.current.volume(vol, id);
                        }
                    }
                },
                isPlaying: () => howlRef.current?.playing(soundIdRef.current) ?? false,
            }),
            []
        );

        return null;
    }
);

AmbientAudio.displayName = 'AmbientAudio';
