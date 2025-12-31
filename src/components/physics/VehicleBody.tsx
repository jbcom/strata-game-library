import { useFrame } from '@react-three/fiber';
import {
    CuboidCollider,
    interactionGroups,
    type RapierRigidBody,
    RigidBody,
} from '@react-three/rapier';
import type React from 'react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CollisionLayer, createDefaultVehicleConfig, type VehicleConfig } from '../../core/physics';

/**
 * Props for the VehicleBody component.
 * @category Entities & Simulation
 * @interface VehicleBodyProps
 */
export interface VehicleBodyProps {
    /** Initial world position. Default: [0, 0, 0]. */
    position?: [number, number, number];
    /** Initial world rotation. Default: [0, 0, 0]. */
    rotation?: [number, number, number];
    /** Configuration for motor force, braking, and chassis dimensions. */
    config?: Partial<VehicleConfig>;
    /** Whether to enable built-in WASD/Arrow keyboard input. Default: true. */
    enableInput?: boolean;
    /** Custom key mapping for controls. */
    inputMap?: {
        accelerate?: string[];
        brake?: string[];
        steerLeft?: string[];
        steerRight?: string[];
        handbrake?: string[];
    };
    /** Callback fired when vehicle speed changes. */
    onSpeedChange?: (speed: number) => void;
    /** Child components (typically the vehicle mesh). */
    children?: React.ReactNode;
}

/**
 * Ref interface for VehicleBody imperative control.
 * @category Entities & Simulation
 * @interface VehicleBodyRef
 */
export interface VehicleBodyRef {
    /** Get the underlying Rapier rigid body. */
    getRigidBody: () => RapierRigidBody | null;
    /** Get current speed in units per second. */
    getSpeed: () => number;
    /** Get current steering angle in radians. */
    getSteeringAngle: () => number;
}

/**
 * Car-like physics body with simplified wheel simulation.
 *
 * Uses force-based driving rather than complex ray-cast wheels for a balance
 * of realism and performance. Ideal for arcade-style racing or vehicle exploration.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <VehicleBody position={[0, 1, 0]} enableInput>
 *   <mesh>
 *     <boxGeometry args={[2, 0.8, 4.5]} />
 *     <meshStandardMaterial color="red" />
 *   </mesh>
 * </VehicleBody>
 * ```
 */
export const VehicleBody = forwardRef<VehicleBodyRef, VehicleBodyProps>(
    (
        {
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            config: configOverride,
            enableInput = true,
            inputMap = {
                accelerate: ['KeyW', 'ArrowUp'],
                brake: ['KeyS', 'ArrowDown'],
                steerLeft: ['KeyA', 'ArrowLeft'],
                steerRight: ['KeyD', 'ArrowRight'],
                handbrake: ['Space'],
            },
            onSpeedChange,
            children,
        },
        ref
    ) => {
        const config = useMemo(
            () => ({
                ...createDefaultVehicleConfig(),
                ...configOverride,
            }),
            [configOverride]
        );

        const rigidBodyRef = useRef<RapierRigidBody>(null);
        const steeringAngleRef = useRef(0);
        const speedRef = useRef(0);

        const inputRef = useRef({
            accelerate: false,
            brake: false,
            steerLeft: false,
            steerRight: false,
            handbrake: false,
        });

        useImperativeHandle(ref, () => ({
            getRigidBody: () => rigidBodyRef.current,
            getSpeed: () => speedRef.current,
            getSteeringAngle: () => steeringAngleRef.current,
        }));

        useEffect(() => {
            if (!enableInput) return;

            const handleKeyDown = (e: KeyboardEvent) => {
                if (inputMap.accelerate?.includes(e.code)) inputRef.current.accelerate = true;
                if (inputMap.brake?.includes(e.code)) inputRef.current.brake = true;
                if (inputMap.steerLeft?.includes(e.code)) inputRef.current.steerLeft = true;
                if (inputMap.steerRight?.includes(e.code)) inputRef.current.steerRight = true;
                if (inputMap.handbrake?.includes(e.code)) inputRef.current.handbrake = true;
            };

            const handleKeyUp = (e: KeyboardEvent) => {
                if (inputMap.accelerate?.includes(e.code)) inputRef.current.accelerate = false;
                if (inputMap.brake?.includes(e.code)) inputRef.current.brake = false;
                if (inputMap.steerLeft?.includes(e.code)) inputRef.current.steerLeft = false;
                if (inputMap.steerRight?.includes(e.code)) inputRef.current.steerRight = false;
                if (inputMap.handbrake?.includes(e.code)) inputRef.current.handbrake = false;
            };

            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
            };
        }, [enableInput, inputMap]);

        useFrame((_, delta) => {
            if (!rigidBodyRef.current) return;

            const input = inputRef.current;

            let targetSteer = 0;
            if (input.steerLeft) targetSteer += config.maxSteerAngle;
            if (input.steerRight) targetSteer -= config.maxSteerAngle;

            steeringAngleRef.current +=
                (targetSteer - steeringAngleRef.current) * Math.min(1, 5 * delta);

            const vel = rigidBodyRef.current.linvel();
            const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
            speedRef.current = speed;
            onSpeedChange?.(speed);

            const rot = rigidBodyRef.current.rotation();
            const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(
                new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
            );

            if (input.accelerate && !input.handbrake) {
                const force = forward.clone().multiplyScalar(config.motorForce);
                rigidBodyRef.current.applyImpulse(
                    { x: force.x * delta, y: 0, z: force.z * delta },
                    true
                );
            }

            if (input.brake) {
                const velocityVec = new THREE.Vector3(vel.x, 0, vel.z);
                // Prevent division by zero when normalizing zero-length vector
                if (velocityVec.lengthSq() > 0.001) {
                    const brakeDir = velocityVec.normalize().multiplyScalar(-1);
                    const brakeForce = brakeDir.multiplyScalar(
                        config.brakeForce * Math.min(speed, 1)
                    );
                    rigidBodyRef.current.applyImpulse(
                        { x: brakeForce.x * delta, y: 0, z: brakeForce.z * delta },
                        true
                    );
                }
            }

            if (input.handbrake) {
                rigidBodyRef.current.setLinvel(
                    { x: vel.x * 0.98, y: vel.y, z: vel.z * 0.98 },
                    true
                );
            }

            if (Math.abs(steeringAngleRef.current) > 0.01 && speed > 0.5) {
                const turnRate = steeringAngleRef.current * (speed / 10) * 2;
                const angVel = rigidBodyRef.current.angvel();
                rigidBodyRef.current.setAngvel({ x: angVel.x, y: turnRate, z: angVel.z }, true);
            }
        });

        return (
            <RigidBody
                ref={rigidBodyRef}
                position={position}
                rotation={rotation}
                type="dynamic"
                colliders={false}
                mass={config.chassisMass}
                linearDamping={0.5}
                angularDamping={2}
                collisionGroups={interactionGroups(CollisionLayer.Vehicle)}
            >
                <CuboidCollider
                    args={[
                        config.chassisSize[0] / 2,
                        config.chassisSize[1] / 2,
                        config.chassisSize[2] / 2,
                    ]}
                    position={[0, config.chassisSize[1] / 2, 0]}
                />
                {children}
            </RigidBody>
        );
    }
);

VehicleBody.displayName = 'VehicleBody';
