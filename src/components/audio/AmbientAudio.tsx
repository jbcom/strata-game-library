/**
 * AmbientAudio Component
 *
 * Non-positional ambient audio using Howler.js via SoundManager.
 * @module components/audio
 */

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useAudioManager } from './context';
import type { AmbientAudioProps, AmbientAudioRef } from './types';

// Global counter for generating unique audio instance IDs
let ambientInstanceCount = 0;

/**
 * Non-positional ambient audio for background music and atmosphere.
 *
 * Provides a managed way to play non-spatialized audio tracks, featuring
 * cross-fade support and automated lifecycle management via the SoundManager.
 *
 * @category Player Experience
 * @example
 * ```tsx
 * <AmbientAudio
 *   url="/music/forest_theme.mp3"
 *   volume={0.4}
 *   autoplay
 *   fadeTime={3}
 * />
 * ```
 */
export const AmbientAudio = forwardRef<AmbientAudioRef, AmbientAudioProps>(
    ({ url, volume = 1, loop = true, autoplay = false, fadeTime = 0, onLoad }, ref) => {
        const soundManager = useAudioManager();
        const soundIdRef = useRef<number | undefined>(undefined);
        const targetVolumeRef = useRef(volume);

        // Generate a unique ID for this sound instance to avoid conflicts.
        // We use the URL in the ID combined with a global counter to ensure uniqueness.
        const soundResourceId = useMemo(() => {
            ambientInstanceCount += 1;
            return `ambient-${url}-${ambientInstanceCount}`;
        }, [url]);

        useEffect(() => {
            if (!soundManager) return;

            let isMounted = true;
            let aborted = false;

            const loadSound = async () => {
                try {
                    await soundManager.load(
                        soundResourceId,
                        {
                            src: url,
                            loop,
                            volume: fadeTime > 0 && autoplay ? 0 : volume,
                            preload: true,
                            autoplay: false, // We handle autoplay manually to support fade
                        },
                        'ambient'
                    );

                    // Prevent setup if component unmounted or effect invalidated
                    if (!isMounted || aborted) {
                        soundManager.unload(soundResourceId);
                        return;
                    }

                    onLoad?.();

                    if (autoplay) {
                        soundIdRef.current = soundManager.play(soundResourceId);
                        if (fadeTime > 0 && soundIdRef.current !== undefined) {
                            soundManager.fade(
                                soundResourceId,
                                0,
                                volume,
                                fadeTime * 1000,
                                soundIdRef.current
                            );
                        }
                    }
                } catch (error) {
                    if (isMounted) {
                        console.error(`Failed to load ambient audio: ${error}`);
                    }
                }
            };

            loadSound();

            return () => {
                isMounted = false;
                aborted = true;
                soundManager.unload(soundResourceId);
                soundIdRef.current = undefined;
            };
        }, [soundManager, soundResourceId, url, loop, autoplay, fadeTime, onLoad, volume]);

        useEffect(() => {
            targetVolumeRef.current = volume;
            if (soundManager && soundIdRef.current !== undefined) {
                soundManager.setVolume(soundResourceId, volume, soundIdRef.current);
            }
        }, [soundManager, soundResourceId, volume]);

        useImperativeHandle(
            ref,
            () => ({
                play: () => {
                    if (soundManager) {
                        // Check if currently playing to avoid overlapping tracks
                        const isPlaying = soundManager.isPlaying(soundResourceId);
                        if (!isPlaying) {
                            soundIdRef.current = soundManager.play(soundResourceId);
                        } else if (
                            soundIdRef.current !== undefined &&
                            !soundManager.isPlaying(soundResourceId)
                        ) {
                            // Fallback: if isPlaying returns false but we have an ID, try playing new instance
                            soundIdRef.current = soundManager.play(soundResourceId);
                        }
                    }
                },
                stop: () => {
                    if (soundManager) {
                        soundManager.stop(soundResourceId, soundIdRef.current);
                    }
                },
                fadeIn: (duration: number) => {
                    if (soundManager) {
                        const isPlaying = soundManager.isPlaying(soundResourceId);

                        if (!isPlaying) {
                            // Ensure volume starts at 0 for the fade
                            // We set volume on the resource ID if no specific instance ID is available,
                            // but ideally we play then set.
                            soundIdRef.current = soundManager.play(soundResourceId);
                            if (soundIdRef.current !== undefined) {
                                soundManager.setVolume(soundResourceId, 0, soundIdRef.current);
                            }
                        }

                        const newId = soundIdRef.current;
                        if (newId !== undefined) {
                            // If already playing, we still want to ensure volume is 0 before fading?
                            // Or maybe we fade from current volume?
                            // Usually fadeIn implies starting from silence.
                            soundManager.setVolume(soundResourceId, 0, newId);
                            soundManager.fade(
                                soundResourceId,
                                0,
                                targetVolumeRef.current,
                                duration * 1000,
                                newId
                            );
                        }
                    }
                },
                fadeOut: (duration: number) => {
                    if (soundManager && soundIdRef.current !== undefined) {
                        // Fade from current volume to 0
                        soundManager.fade(
                            soundResourceId,
                            targetVolumeRef.current,
                            0,
                            duration * 1000,
                            soundIdRef.current
                        );
                    }
                },
                setVolume: (vol: number, fadeTime?: number) => {
                    targetVolumeRef.current = vol;
                    if (soundManager) {
                        const id = soundIdRef.current;
                        if (fadeTime && fadeTime > 0 && id !== undefined) {
                            // Fade from current known volume
                            soundManager.fade(
                                soundResourceId,
                                soundManager.getVolume(soundResourceId) ?? 1,
                                vol,
                                fadeTime * 1000,
                                id
                            );
                        } else if (id !== undefined) {
                            soundManager.setVolume(soundResourceId, vol, id);
                        }
                    }
                },
                isPlaying: () => {
                    // Check if this component's sound is currently playing
                    return soundManager ? soundManager.isPlaying(soundResourceId) : false;
                },
            }),
            [soundManager, soundResourceId]
        );

        return null;
    }
);

AmbientAudio.displayName = 'AmbientAudio';
