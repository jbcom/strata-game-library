import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { evaluateCatmullRom } from '../../core/camera';
import { easeInOutCubic, lerp } from '../../core/math/utils';
import type { CinematicCameraProps, CinematicCameraRef } from './types';

/**
 * Path-Based Cinematic Camera.
 *
 * Follows a Catmull-Rom spline path for smooth camera flythroughs and cutscenes.
 * Features automated look-at behavior and FOV keyframe interpolation.
 *
 * @category Player Experience
 * @example
 * ```tsx
 * <CinematicCamera
 *   path={[
 *     new THREE.Vector3(0, 5, 20),
 *     new THREE.Vector3(10, 8, 10),
 *     new THREE.Vector3(0, 5, 0)
 *   ]}
 *   duration={10}
 *   autoPlay
 * />
 * ```
 */
export const CinematicCamera = forwardRef<CinematicCameraRef, CinematicCameraProps>(
    (
        {
            path,
            duration = 5,
            tension = 0.5,
            closed = false,
            lookAt,
            autoPlay = true,
            loop = false,
            fov = 50,
            fovKeyframes,
            makeDefault = true,
            onComplete,
        },
        ref
    ) => {
        const cameraRef = useRef<THREE.PerspectiveCamera>(null);
        const progressRef = useRef(0);
        const isPlaying = useRef(autoPlay);
        const hasCompleted = useRef(false);

        useImperativeHandle(ref, () => ({
            getCamera: () => cameraRef.current,
            play: () => {
                isPlaying.current = true;
                hasCompleted.current = false;
            },
            pause: () => {
                isPlaying.current = false;
            },
            reset: () => {
                progressRef.current = 0;
                hasCompleted.current = false;
            },
            setProgress: (t: number) => {
                progressRef.current = Math.max(0, Math.min(1, t));
            },
            getProgress: () => progressRef.current,
        }));

        const getLookAtPosition = useCallback((): THREE.Vector3 | null => {
            if (!lookAt) return null;
            if (lookAt instanceof THREE.Vector3) return lookAt;
            if (lookAt?.current) return lookAt.current.position;
            return null;
        }, [lookAt]);

        const interpolateFOV = useCallback(
            (t: number): number => {
                if (!fovKeyframes || fovKeyframes.length === 0) return fov;
                if (fovKeyframes.length === 1) return fovKeyframes[0].fov;

                for (let i = 0; i < fovKeyframes.length - 1; i++) {
                    const current = fovKeyframes[i];
                    const next = fovKeyframes[i + 1];
                    if (t >= current.time && t <= next.time) {
                        const localT = (t - current.time) / (next.time - current.time);
                        return lerp(current.fov, next.fov, easeInOutCubic(localT));
                    }
                }

                return fovKeyframes[fovKeyframes.length - 1].fov;
            },
            [fov, fovKeyframes]
        );

        useFrame((_, delta) => {
            if (!cameraRef.current || path.length < 2) return;

            if (isPlaying.current) {
                progressRef.current += delta / duration;

                if (progressRef.current >= 1) {
                    if (loop) {
                        progressRef.current = progressRef.current % 1;
                    } else {
                        progressRef.current = 1;
                        isPlaying.current = false;
                        if (!hasCompleted.current) {
                            hasCompleted.current = true;
                            onComplete?.();
                        }
                    }
                }
            }

            const position = evaluateCatmullRom(path, progressRef.current, tension, closed);
            cameraRef.current.position.copy(position);

            const lookAtPos = getLookAtPosition();
            if (lookAtPos) {
                cameraRef.current.lookAt(lookAtPos);
            } else {
                const lookAheadT = Math.min(1, progressRef.current + 0.01);
                const lookAheadPos = evaluateCatmullRom(path, lookAheadT, tension, closed);
                cameraRef.current.lookAt(lookAheadPos);
            }

            cameraRef.current.fov = interpolateFOV(progressRef.current);
            cameraRef.current.updateProjectionMatrix();
        });

        const initialPosition = path[0] ?? new THREE.Vector3();

        return (
            <PerspectiveCamera
                ref={cameraRef}
                fov={fov}
                makeDefault={makeDefault}
                position={[initialPosition.x, initialPosition.y, initialPosition.z]}
            />
        );
    }
);

CinematicCamera.displayName = 'CinematicCamera';
