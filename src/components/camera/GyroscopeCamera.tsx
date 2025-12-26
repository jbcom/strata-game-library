import { useFrame, useThree } from '@react-three/fiber';
import type React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface GyroscopeCameraProps {
    /** Target object or position to look at. */
    target?: React.RefObject<THREE.Object3D> | THREE.Vector3;
    /** Default distance from the target. Default: 15. */
    distance?: number;
    /** Minimum zoom distance. Default: 5. */
    minDistance?: number;
    /** Maximum zoom distance. Default: 30. */
    maxDistance?: number;
    /** Sensitivity of the gyroscope. Default: 0.5. */
    sensitivity?: number;
    /** Whether to enable pinch-to-zoom. Default: true. */
    enableZoom?: boolean;
    /** Called when the camera azimuth changes. */
    onAzimuthChange?: (azimuth: number) => void;
    /** Lerp speed for smooth camera movement. Default: 5. */
    lerpSpeed?: number;
    /** Default elevation angle in radians. Default: Math.PI / 6 (~30°). */
    defaultElevation?: number;
    /** Minimum elevation angle in radians. Default: Math.PI / 12 (~15°). */
    minElevation?: number;
    /** Maximum elevation angle in radians. Default: Math.PI / 3 (~60°). */
    maxElevation?: number;
    /** Beta (tilt) sensitivity multiplier. Default: 0.3. */
    tiltSensitivity?: number;
}

/**
 * A generalized Gyroscope-controlled Camera for mobile devices.
 *
 * Provides immersive camera control using the device's orientation sensors,
 * with support for pinch-to-zoom and smooth target tracking.
 *
 * @category Camera
 */
export function GyroscopeCamera({
    target,
    distance: initialDistance = 15,
    minDistance = 5,
    maxDistance = 30,
    sensitivity = 0.5,
    enableZoom = true,
    onAzimuthChange,
    lerpSpeed = 5,
    defaultElevation = Math.PI / 6,
    minElevation = Math.PI / 12,
    maxElevation = Math.PI / 3,
    tiltSensitivity = 0.3,
}: GyroscopeCameraProps) {
    const { camera } = useThree();
    const cameraRotation = useRef({ azimuth: 0, elevation: defaultElevation });
    const currentTargetPos = useRef(new THREE.Vector3());
    const cameraDistance = useRef(initialDistance);
    const targetDistance = useRef(initialDistance);

    const gyroRotation = useRef({ alpha: 0, beta: 0, gamma: 0 });
    const initialOrientation = useRef<{ alpha: number; beta: number } | null>(null);
    const pinchDistance = useRef<number | null>(null);

    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (event.alpha === null || event.beta === null || event.gamma === null) {
                return;
            }

            if (!initialOrientation.current) {
                initialOrientation.current = { alpha: event.alpha, beta: event.beta };
            }

            gyroRotation.current = {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
            };
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (enableZoom && e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                pinchDistance.current = Math.sqrt(dx * dx + dy * dy);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (enableZoom && e.touches.length === 2 && pinchDistance.current) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const scale = pinchDistance.current / dist;
                targetDistance.current = THREE.MathUtils.clamp(
                    targetDistance.current * scale,
                    minDistance,
                    maxDistance
                );

                pinchDistance.current = dist;
            }
        };

        const handleTouchEnd = () => {
            pinchDistance.current = null;
        };

        const requestPermissionAndListen = async () => {
            try {
                if (
                    typeof window !== 'undefined' &&
                    window.DeviceOrientationEvent &&
                    typeof (DeviceOrientationEvent as any).requestPermission === 'function'
                ) {
                    const response = await (DeviceOrientationEvent as any).requestPermission();
                    if (response === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    } else {
                        console.warn('DeviceOrientation permission not granted');
                    }
                } else if (typeof window !== 'undefined') {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            } catch (error) {
                console.warn(
                    'DeviceOrientation permission request failed:',
                    error instanceof Error ? error.message : error
                );
            }
        };

        requestPermissionAndListen();

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('deviceorientation', handleOrientation);
                window.removeEventListener('touchstart', handleTouchStart);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [enableZoom, minDistance, maxDistance]);

    useFrame((_state, delta) => {
        const smoothFactor = delta * lerpSpeed;

        // Update target position
        if (target instanceof THREE.Vector3) {
            currentTargetPos.current.lerp(target, smoothFactor);
        } else if (target?.current) {
            const worldPos = new THREE.Vector3();
            target.current.getWorldPosition(worldPos);
            currentTargetPos.current.lerp(worldPos, smoothFactor);
        }

        // Apply gyro rotation
        if (initialOrientation.current) {
            const alphaDelta =
                (gyroRotation.current.alpha - initialOrientation.current.alpha) * (Math.PI / 180);
            const betaDelta =
                (gyroRotation.current.beta - initialOrientation.current.beta) * (Math.PI / 180);

            cameraRotation.current.azimuth = -alphaDelta * sensitivity;
            cameraRotation.current.elevation = THREE.MathUtils.clamp(
                defaultElevation + betaDelta * tiltSensitivity,
                minElevation,
                maxElevation
            );
        }

        onAzimuthChange?.(cameraRotation.current.azimuth);

        // Smoothly interpolate distance
        cameraDistance.current = THREE.MathUtils.lerp(
            cameraDistance.current,
            targetDistance.current,
            smoothFactor
        );

        const dist = cameraDistance.current;
        const offsetX =
            dist *
            Math.sin(cameraRotation.current.azimuth) *
            Math.cos(cameraRotation.current.elevation);
        const offsetY = dist * Math.sin(cameraRotation.current.elevation);
        const offsetZ =
            dist *
            Math.cos(cameraRotation.current.azimuth) *
            Math.cos(cameraRotation.current.elevation);

        camera.position.set(
            currentTargetPos.current.x + offsetX,
            currentTargetPos.current.y + offsetY,
            currentTargetPos.current.z + offsetZ
        );

        camera.lookAt(currentTargetPos.current);
    });

    return null;
}
