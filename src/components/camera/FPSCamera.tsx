import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { calculateHeadBob } from '../../core/camera';
import type { FPSCameraProps, FPSCameraRef } from './types';

/**
 * First-Person Camera with mouse look and movement.
 *
 * Implements standard FPS controls including WASD movement, pointer-locked
 * mouse look, and optional walking head bob.
 *
 * @category Player Experience
 * @example
 * ```tsx
 * <FPSCamera
 *   position={[0, 1.8, 0]}
 *   movementSpeed={8}
 *   headBobEnabled
 * />
 * ```
 */
export const FPSCamera = forwardRef<FPSCameraRef, FPSCameraProps>(
    (
        {
            position = [0, 1.7, 0],
            sensitivity = 0.002,
            headBobEnabled = true,
            headBobFrequency = 10,
            headBobAmplitude = 0.05,
            fov = 75,
            makeDefault = true,
            movementSpeed = 5,
        },
        ref
    ) => {
        const cameraRef = useRef<THREE.PerspectiveCamera>(null);
        const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
        const isMoving = useRef(false);
        const currentSpeed = useRef(movementSpeed);
        const bobTime = useRef(0);
        const basePosition = useRef(new THREE.Vector3(...position));
        const keys = useRef<Set<string>>(new Set());

        useImperativeHandle(ref, () => ({
            getCamera: () => cameraRef.current,
            setPosition: (newPosition: [number, number, number]) => {
                basePosition.current.set(...newPosition);
            },
            setMovementSpeed: (speed: number) => {
                currentSpeed.current = speed;
            },
            getMoving: () => isMoving.current,
        }));

        useEffect(() => {
            const handleMouseMove = (event: MouseEvent) => {
                if (document.pointerLockElement) {
                    euler.current.y -= event.movementX * sensitivity;
                    euler.current.x -= event.movementY * sensitivity;
                    euler.current.x = Math.max(
                        -Math.PI / 2,
                        Math.min(Math.PI / 2, euler.current.x)
                    );
                }
            };

            const handleKeyDown = (event: KeyboardEvent) => {
                keys.current.add(event.code);
            };

            const handleKeyUp = (event: KeyboardEvent) => {
                keys.current.delete(event.code);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('keyup', handleKeyUp);
            };
        }, [sensitivity]);

        useFrame((_, delta) => {
            if (!cameraRef.current) return;

            cameraRef.current.quaternion.setFromEuler(euler.current);

            const direction = new THREE.Vector3();
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
                cameraRef.current.quaternion
            );
            forward.y = 0;
            forward.normalize();
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRef.current.quaternion);
            right.y = 0;
            right.normalize();

            if (keys.current.has('KeyW')) direction.add(forward);
            if (keys.current.has('KeyS')) direction.sub(forward);
            if (keys.current.has('KeyD')) direction.add(right);
            if (keys.current.has('KeyA')) direction.sub(right);

            isMoving.current = direction.lengthSq() > 0;

            if (isMoving.current) {
                direction.normalize().multiplyScalar(currentSpeed.current * delta);
                basePosition.current.add(direction);
            }

            const finalPosition = basePosition.current.clone();

            if (headBobEnabled && isMoving.current) {
                bobTime.current += delta * currentSpeed.current;
                const bob = calculateHeadBob(
                    bobTime.current,
                    currentSpeed.current,
                    headBobFrequency,
                    headBobAmplitude
                );
                finalPosition.add(bob);
            }

            cameraRef.current.position.copy(finalPosition);
        });

        return (
            <PerspectiveCamera
                ref={cameraRef}
                fov={fov}
                makeDefault={makeDefault}
                position={position}
            />
        );
    }
);

FPSCamera.displayName = 'FPSCamera';
