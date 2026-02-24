/**
 * PositionalAudio Component
 *
 * 3D positional audio source using Three.js PositionalAudio.
 * @module components/audio
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type * as THREE from 'three';
import { useSpatialAudio } from './context';
import type { PositionalAudioProps, PositionalAudioRef } from './types';

/**
 * 3D Positional Audio Source.
 *
 * Provides a high-fidelity 3D audio source with distance-based attenuation,
 * volume falloff, and playback rate control. Built on the Web Audio API.
 *
 * @category Player Experience
 * @example
 * ```tsx
 * <PositionalAudio
 *   url="/sounds/explosion.wav"
 *   volume={1.0}
 *   refDistance={10}
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
    }, [
      url,
      spatialAudio,
      autoplay,
      distanceModel,
      loop,
      maxDistance,
      onEnd,
      onLoad,
      playbackRate,
      position[0],
      refDistance,
      rolloffFactor,
      volume,
    ]);

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
        setPosition: (x: number, y: number, z: number) => sourceRef.current?.position.set(x, y, z),
        isPlaying: () => sourceRef.current?.isPlaying ?? false,
      }),
      []
    );

    return null;
  }
);

PositionalAudio.displayName = 'PositionalAudio';
