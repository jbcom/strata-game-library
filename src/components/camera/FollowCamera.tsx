import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { calculateLookAhead, smoothDampVector3 } from '../../core/camera';
import type { FollowCameraProps, FollowCameraRef } from './types';

/**
 * Smooth Follow Camera with look-ahead logic.
 *
 * Provides a specialized camera that tracks a target with smooth dampening
 * and optional velocity-based look-ahead for dynamic third-person gameplay.
 *
 * @category Player Experience
 * @example
 * ```tsx
 * <FollowCamera
 *   target={playerRef}
 *   offset={[0, 5, 10]}
 *   smoothTime={0.3}
 * />
 * ```
 */
export const FollowCamera = forwardRef<FollowCameraRef, FollowCameraProps>(
    (
        {
            target,
            offset = [0, 5, 10],
            smoothTime = 0.3,
            lookAheadDistance = 2,
            lookAheadSmoothing = 0.5,
            rotationSmoothing = 0.1,
            fov = 60,
            makeDefault = true,
        },
        ref
    ) => {
        const cameraRef = useRef<THREE.PerspectiveCamera>(null);
        const velocityRef = useRef(new THREE.Vector3());
        const currentLookAhead = useRef(new THREE.Vector3());
        const lastTargetPos = useRef(new THREE.Vector3());
        const currentOffset = useRef(new THREE.Vector3(...offset));

        useImperativeHandle(ref, () => ({
            getCamera: () => cameraRef.current,
            setOffset: (newOffset: [number, number, number]) => {
                currentOffset.current.set(...newOffset);
            },
        }));

        const getTargetPosition = useCallback((): THREE.Vector3 => {
            if (target instanceof THREE.Vector3) return target;
            if (target?.current) {
                const pos = new THREE.Vector3();
                target.current.getWorldPosition(pos);
                return pos;
            }
            return new THREE.Vector3();
        }, [target]);

        useFrame((_, delta) => {
            if (!cameraRef.current) return;

            const targetPos = getTargetPosition();
            const targetVelocity = targetPos
                .clone()
                .sub(lastTargetPos.current)
                .divideScalar(Math.max(delta, 0.001));
            lastTargetPos.current.copy(targetPos);

            const lookAhead = calculateLookAhead(
                targetVelocity,
                lookAheadDistance,
                lookAheadSmoothing,
                currentLookAhead.current,
                delta
            );
            currentLookAhead.current.copy(lookAhead);

            const desiredPosition = targetPos.clone().add(currentOffset.current).add(lookAhead);

            const newPosition = smoothDampVector3(
                cameraRef.current.position,
                desiredPosition,
                velocityRef.current,
                smoothTime,
                delta
            );

            cameraRef.current.position.copy(newPosition);

            const lookTarget = targetPos.clone().add(lookAhead);
            const currentQuat = cameraRef.current.quaternion.clone();
            cameraRef.current.lookAt(lookTarget);
            const targetQuat = cameraRef.current.quaternion.clone();
            cameraRef.current.quaternion
                .copy(currentQuat)
                .slerp(targetQuat, 1 - Math.exp(-rotationSmoothing * delta));
        });

        return (
            <PerspectiveCamera
                ref={cameraRef}
                fov={fov}
                makeDefault={makeDefault}
                position={offset}
            />
        );
    }
);

FollowCamera.displayName = 'FollowCamera';
