import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitCameraProps, OrbitCameraRef } from './types';

/**
 * Standard Orbit Camera for scene exploration.
 *
 * Provides mouse and touch controls for orbiting, zooming, and panning
 * around a central target. Built on top of `OrbitControls`.
 *
 * @category Player Experience
 * @example
 * ```tsx
 * <OrbitCamera
 *   target={[0, 1, 0]}
 *   minDistance={2}
 *   maxDistance={10}
 * />
 * ```
 */
export const OrbitCamera = forwardRef<OrbitCameraRef, OrbitCameraProps>(
    (
        {
            target = [0, 0, 0],
            minDistance = 2,
            maxDistance = 50,
            minPolarAngle = 0,
            maxPolarAngle = Math.PI / 2,
            autoRotate = false,
            autoRotateSpeed = 2,
            enableDamping = true,
            dampingFactor = 0.05,
            enableZoom = true,
            enablePan = true,
            fov = 60,
            makeDefault = true,
        },
        ref
    ) => {
        const cameraRef = useRef<THREE.PerspectiveCamera>(null);
        const controlsRef = useRef<any>(null);

        useImperativeHandle(ref, () => ({
            getCamera: () => cameraRef.current,
            getControls: () => controlsRef.current,
            setTarget: (newTarget: [number, number, number]) => {
                if (controlsRef.current) {
                    controlsRef.current.target.set(...newTarget);
                }
            },
        }));

        return (
            <>
                <PerspectiveCamera
                    ref={cameraRef}
                    fov={fov}
                    makeDefault={makeDefault}
                    position={[0, 5, 10]}
                />
                <OrbitControls
                    ref={controlsRef}
                    camera={cameraRef.current ?? undefined}
                    target={new THREE.Vector3(...target)}
                    minDistance={minDistance}
                    maxDistance={maxDistance}
                    minPolarAngle={minPolarAngle}
                    maxPolarAngle={maxPolarAngle}
                    autoRotate={autoRotate}
                    autoRotateSpeed={autoRotateSpeed}
                    enableDamping={enableDamping}
                    dampingFactor={dampingFactor}
                    enableZoom={enableZoom}
                    enablePan={enablePan}
                />
            </>
        );
    }
);

OrbitCamera.displayName = 'OrbitCamera';
