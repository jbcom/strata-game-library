import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { LookAtController } from '../../core/animation';
import type { HeadTrackerProps, HeadTrackerRef } from './types';

/**
 * Head and Eye Tracking Controller.
 *
 * Specialization of the LookAt controller for character heads.
 * Supports mouse tracking, deadzones, and angular limits for natural movement.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <HeadTracker
 *   followMouse
 *   maxAngle={Math.PI / 4}
 * >
 *   <ModelHead />
 * </HeadTracker>
 * ```
 */
export const HeadTracker = forwardRef<HeadTrackerRef, HeadTrackerProps>(
    (
        {
            target,
            followMouse = false,
            maxAngle = Math.PI / 3,
            speed = 5,
            deadzone = 0.01,
            children,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const mouseTarget = useRef(new THREE.Vector3());
        const { camera, size } = useThree();

        const controller = useMemo(
            () =>
                new LookAtController({
                    maxAngle,
                    speed,
                    deadzone,
                }),
            [maxAngle, speed, deadzone]
        );

        useImperativeHandle(ref, () => ({
            lookAt: (pos: THREE.Vector3) => {
                mouseTarget.current.copy(pos);
            },
            reset: () => controller.reset(),
        }));

        useEffect(() => {
            if (!followMouse) return;

            const handleMouseMove = (event: MouseEvent) => {
                const x = (event.clientX / size.width) * 2 - 1;
                const y = -(event.clientY / size.height) * 2 + 1;

                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

                const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -5);
                raycaster.ray.intersectPlane(plane, mouseTarget.current);
            };

            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }, [followMouse, camera, size]);

        const getTargetPosition = useCallback((): THREE.Vector3 => {
            if (followMouse) return mouseTarget.current;
            if (target instanceof THREE.Vector3) return target;
            if (target?.current) {
                const pos = new THREE.Vector3();
                target.current.getWorldPosition(pos);
                return pos;
            }
            return new THREE.Vector3(0, 0, 5);
        }, [target, followMouse]);

        useFrame((_, delta) => {
            if (!groupRef.current) return;

            const targetPos = getTargetPosition();
            const rotation = controller.update(groupRef.current, targetPos, delta);
            groupRef.current.quaternion.copy(rotation);
        });

        return <group ref={groupRef}>{children}</group>;
    }
);

HeadTracker.displayName = 'HeadTracker';
