/**
 * AudioZone Component
 *
 * Spatial audio zone that triggers audio when listener enters.
 * @module components/audio
 */

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AmbientAudio } from './AmbientAudio';
import { useAudioListener } from './context';
import type { AudioZoneProps, AudioZoneRef, AmbientAudioRef } from './types';

/**
 * Spatial audio zone that triggers audio when listener enters.
 *
 * @example
 * ```tsx
 * <AudioZone
 *   position={[0, 0, -20]}
 *   geometry="sphere"
 *   radius={15}
 *   audioUrl="/sounds/cave-ambience.mp3"
 *   fadeTime={1}
 *   onEnter={() => setEnvironment('cave')}
 *   onExit={() => setEnvironment('outdoor')}
 * />
 * ```
 */
export const AudioZone = forwardRef<AudioZoneRef, AudioZoneProps>(
    (
        {
            position = [0, 0, 0],
            geometry,
            size = [10, 10, 10],
            radius = 5,
            audioUrl,
            audioVolume = 1,
            audioLoop = true,
            fadeTime = 0.5,
            onEnter,
            onExit,
            debug = false,
            children,
        },
        ref
    ) => {
        const listener = useAudioListener();
        const audioRef = useRef<AmbientAudioRef>(null);
        const isInsideRef = useRef(false);
        const meshRef = useRef<THREE.Mesh>(null);
        const boundingBox = useRef(new THREE.Box3());
        const boundingSphere = useRef(new THREE.Sphere());
        const listenerPosition = useRef(new THREE.Vector3());

        useEffect(() => {
            const pos = new THREE.Vector3(...position);
            if (geometry === 'box') {
                boundingBox.current.setFromCenterAndSize(
                    pos,
                    new THREE.Vector3(size[0], size[1], size[2])
                );
            } else {
                boundingSphere.current.set(pos, radius);
            }
        }, [position, size, radius, geometry]);

        useFrame(() => {
            if (!listener) return;

            listener.getWorldPosition(listenerPosition.current);
            let inside = false;

            if (geometry === 'box') {
                inside = boundingBox.current.containsPoint(listenerPosition.current);
            } else {
                inside = boundingSphere.current.containsPoint(listenerPosition.current);
            }

            if (inside && !isInsideRef.current) {
                isInsideRef.current = true;
                onEnter?.();
                audioRef.current?.fadeIn(fadeTime);
            } else if (!inside && isInsideRef.current) {
                isInsideRef.current = false;
                onExit?.();
                audioRef.current?.fadeOut(fadeTime);
            }
        });

        useImperativeHandle(
            ref,
            () => ({
                isInside: () => isInsideRef.current,
                getAudio: () => audioRef.current,
            }),
            []
        );

        return (
            <>
                {debug && (
                    <mesh ref={meshRef} position={position}>
                        {geometry === 'box' ? (
                            <boxGeometry args={size} />
                        ) : (
                            <sphereGeometry args={[radius, 16, 16]} />
                        )}
                        <meshBasicMaterial color={0x00ff00} wireframe transparent opacity={0.3} />
                    </mesh>
                )}
                {audioUrl && (
                    <AmbientAudio
                        ref={audioRef}
                        url={audioUrl}
                        volume={audioVolume}
                        loop={audioLoop}
                    />
                )}
                {children}
            </>
        );
    }
);

AudioZone.displayName = 'AudioZone';
