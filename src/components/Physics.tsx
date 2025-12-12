/**
 * Physics Components for Strata
 *
 * Higher-level physics components built on @react-three/rapier.
 * Provides character controllers, vehicles, destructibles, and more.
 * @module components/Physics
 */

import { useFrame } from '@react-three/fiber';
import type { RigidBodyProps } from '@react-three/rapier';
import {
    BallCollider,
    CapsuleCollider,
    CuboidCollider,
    interactionGroups,
    type RapierRigidBody,
    RigidBody,
    useRapier,
    useRevoluteJoint,
    useSphericalJoint,
} from '@react-three/rapier';
import type React from 'react';
import {
    createRef,
    forwardRef,
    type RefObject,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import * as THREE from 'three';
import {
    type BuoyancyConfig,
    type CharacterControllerConfig,
    CollisionLayer,
    calculateBuoyancyForce,
    calculateJumpImpulse,
    createDefaultBuoyancyConfig,
    createDefaultCharacterConfig,
    createDefaultDestructibleConfig,
    createDefaultVehicleConfig,
    createHumanoidRagdoll,
    type DestructibleConfig,
    generateDebrisVelocity,
    isWalkableSlope,
    type RagdollConfig,
    type VehicleConfig,
} from '../core/physics';

/**
 * Props for the CharacterController component
 */
export interface CharacterControllerProps {
    position?: [number, number, number];
    config?: Partial<CharacterControllerConfig>;
    enableInput?: boolean;
    inputMap?: {
        forward?: string[];
        backward?: string[];
        left?: string[];
        right?: string[];
        jump?: string[];
        sprint?: string[];
    };
    sprintMultiplier?: number;
    onGroundedChange?: (grounded: boolean) => void;
    onJump?: () => void;
    onLand?: (velocity: number) => void;
    children?: React.ReactNode;
}

/**
 * Ref interface for CharacterController
 */
export interface CharacterControllerRef {
    getRigidBody: () => RapierRigidBody | null;
    getPosition: () => THREE.Vector3;
    getVelocity: () => THREE.Vector3;
    setPosition: (position: [number, number, number]) => void;
    applyImpulse: (impulse: [number, number, number]) => void;
    isGrounded: () => boolean;
    jump: () => void;
}

/**
 * Character controller with ground detection, jumping, and WASD movement.
 * Ideal for FPS and third-person character controllers.
 *
 * @example
 * ```tsx
 * <CharacterController position={[0, 2, 0]} enableInput>
 *   <mesh>
 *     <capsuleGeometry args={[0.3, 1.2]} />
 *     <meshStandardMaterial color="blue" />
 *   </mesh>
 * </CharacterController>
 * ```
 */
export const CharacterController = forwardRef<CharacterControllerRef, CharacterControllerProps>(
    (
        {
            position = [0, 0, 0],
            config: configOverride,
            enableInput = true,
            inputMap = {
                forward: ['KeyW', 'ArrowUp'],
                backward: ['KeyS', 'ArrowDown'],
                left: ['KeyA', 'ArrowLeft'],
                right: ['KeyD', 'ArrowRight'],
                jump: ['Space'],
                sprint: ['ShiftLeft', 'ShiftRight'],
            },
            sprintMultiplier = 1.5,
            onGroundedChange,
            onJump,
            onLand,
            children,
        },
        ref
    ) => {
        const config = useMemo(
            () => ({
                ...createDefaultCharacterConfig(),
                ...configOverride,
            }),
            [configOverride]
        );

        const rigidBodyRef = useRef<RapierRigidBody>(null);
        const { rapier, world } = useRapier();

        const [_grounded, setGrounded] = useState(false);
        const groundedRef = useRef(false);
        const jumpCountRef = useRef(0);
        const coyoteTimeRef = useRef(0);
        const jumpBufferRef = useRef(0);
        const wasGroundedRef = useRef(false);

        const inputRef = useRef({
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false,
        });

        const velocityRef = useRef(new THREE.Vector3());
        const lastGroundNormalRef = useRef(new THREE.Vector3(0, 1, 0));

        useImperativeHandle(ref, () => ({
            getRigidBody: () => rigidBodyRef.current,
            getPosition: () => {
                if (!rigidBodyRef.current) return new THREE.Vector3(...position);
                const pos = rigidBodyRef.current.translation();
                return new THREE.Vector3(pos.x, pos.y, pos.z);
            },
            getVelocity: () => velocityRef.current.clone(),
            setPosition: (newPos: [number, number, number]) => {
                if (rigidBodyRef.current) {
                    rigidBodyRef.current.setTranslation(
                        { x: newPos[0], y: newPos[1], z: newPos[2] },
                        true
                    );
                }
            },
            applyImpulse: (impulse: [number, number, number]) => {
                if (rigidBodyRef.current) {
                    rigidBodyRef.current.applyImpulse(
                        { x: impulse[0], y: impulse[1], z: impulse[2] },
                        true
                    );
                }
            },
            isGrounded: () => groundedRef.current,
            jump: () => performJump(),
        }));

        useEffect(() => {
            if (!enableInput) return;

            const handleKeyDown = (e: KeyboardEvent) => {
                if (inputMap.forward?.includes(e.code)) inputRef.current.forward = true;
                if (inputMap.backward?.includes(e.code)) inputRef.current.backward = true;
                if (inputMap.left?.includes(e.code)) inputRef.current.left = true;
                if (inputMap.right?.includes(e.code)) inputRef.current.right = true;
                if (inputMap.jump?.includes(e.code)) inputRef.current.jump = true;
                if (inputMap.sprint?.includes(e.code)) inputRef.current.sprint = true;
            };

            const handleKeyUp = (e: KeyboardEvent) => {
                if (inputMap.forward?.includes(e.code)) inputRef.current.forward = false;
                if (inputMap.backward?.includes(e.code)) inputRef.current.backward = false;
                if (inputMap.left?.includes(e.code)) inputRef.current.left = false;
                if (inputMap.right?.includes(e.code)) inputRef.current.right = false;
                if (inputMap.jump?.includes(e.code)) inputRef.current.jump = false;
                if (inputMap.sprint?.includes(e.code)) inputRef.current.sprint = false;
            };

            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
            };
        }, [enableInput, inputMap]);

        const checkGrounded = useCallback(() => {
            if (!rigidBodyRef.current) return false;

            const pos = rigidBodyRef.current.translation();
            const rayOrigin = { x: pos.x, y: pos.y, z: pos.z };
            const rayDir = { x: 0, y: -1, z: 0 };
            const rayLength = config.capsuleHeight / 2 + config.groundCheckDistance;

            const ray = new rapier.Ray(rayOrigin, rayDir);
            const hit = world.castRay(ray, rayLength, true);

            if (hit) {
                const _hitPoint = ray.pointAt(hit.timeOfImpact);
                const normal = hit.collider.castRayAndGetNormal(ray, rayLength, true)?.normal;

                if (normal) {
                    const normalVec = new THREE.Vector3(normal.x, normal.y, normal.z);
                    lastGroundNormalRef.current.copy(normalVec);

                    if (isWalkableSlope(normalVec, config.slopeLimit)) {
                        return true;
                    }
                }
            }

            return false;
        }, [config, rapier, world]);

        const performJump = useCallback(() => {
            if (!rigidBodyRef.current) return;
            if (jumpCountRef.current >= config.maxJumps) return;

            const impulse = calculateJumpImpulse(
                config.jumpForce,
                9.81 * config.gravityScale,
                config.mass
            );
            rigidBodyRef.current.applyImpulse({ x: 0, y: impulse, z: 0 }, true);

            jumpCountRef.current++;
            groundedRef.current = false;
            setGrounded(false);
            coyoteTimeRef.current = 0;
            jumpBufferRef.current = 0;

            onJump?.();
        }, [config, onJump]);

        useFrame((state, delta) => {
            if (!rigidBodyRef.current) return;

            const isGroundedNow = checkGrounded();

            if (isGroundedNow) {
                coyoteTimeRef.current = config.coyoteTime;
                jumpCountRef.current = 0;

                if (!wasGroundedRef.current) {
                    const vel = rigidBodyRef.current.linvel();
                    onLand?.(Math.abs(vel.y));
                }
            } else {
                coyoteTimeRef.current = Math.max(0, coyoteTimeRef.current - delta);
            }

            const effectivelyGrounded = isGroundedNow || coyoteTimeRef.current > 0;

            if (effectivelyGrounded !== groundedRef.current) {
                groundedRef.current = effectivelyGrounded;
                setGrounded(effectivelyGrounded);
                onGroundedChange?.(effectivelyGrounded);
            }

            wasGroundedRef.current = isGroundedNow;

            if (inputRef.current.jump) {
                jumpBufferRef.current = config.jumpBufferTime;
            } else {
                jumpBufferRef.current = Math.max(0, jumpBufferRef.current - delta);
            }

            if (
                jumpBufferRef.current > 0 &&
                coyoteTimeRef.current > 0 &&
                jumpCountRef.current < config.maxJumps
            ) {
                performJump();
            }

            const input = inputRef.current;
            const moveDir = new THREE.Vector3();

            if (input.forward) moveDir.z -= 1;
            if (input.backward) moveDir.z += 1;
            if (input.left) moveDir.x -= 1;
            if (input.right) moveDir.x += 1;

            if (moveDir.lengthSq() > 0) {
                moveDir.normalize();
            }

            const camera = state.camera;
            const cameraDirection = new THREE.Vector3();
            camera.getWorldDirection(cameraDirection);
            cameraDirection.y = 0;
            cameraDirection.normalize();

            const cameraRight = new THREE.Vector3()
                .crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection)
                .normalize();

            const worldMoveDir = new THREE.Vector3()
                .addScaledVector(cameraRight, -moveDir.x)
                .addScaledVector(cameraDirection, -moveDir.z);

            if (worldMoveDir.lengthSq() > 0) {
                worldMoveDir.normalize();
            }

            const currentVel = rigidBodyRef.current.linvel();
            velocityRef.current.set(currentVel.x, currentVel.y, currentVel.z);

            const maxSpeed = config.maxSpeed * (input.sprint ? sprintMultiplier : 1);
            const accel = effectivelyGrounded
                ? config.acceleration
                : config.acceleration * config.airControl;
            const decel = effectivelyGrounded
                ? config.deceleration
                : config.deceleration * config.airControl;

            const targetVelX = worldMoveDir.x * maxSpeed;
            const targetVelZ = worldMoveDir.z * maxSpeed;

            const _currentHorizontalVel = new THREE.Vector2(currentVel.x, currentVel.z);
            const targetHorizontalVel = new THREE.Vector2(targetVelX, targetVelZ);

            let newVelX = currentVel.x;
            let newVelZ = currentVel.z;

            if (targetHorizontalVel.lengthSq() > 0.001) {
                newVelX += (targetVelX - currentVel.x) * Math.min(1, accel * delta);
                newVelZ += (targetVelZ - currentVel.z) * Math.min(1, accel * delta);
            } else {
                newVelX *= Math.max(0, 1 - decel * delta);
                newVelZ *= Math.max(0, 1 - decel * delta);
            }

            rigidBodyRef.current.setLinvel({ x: newVelX, y: currentVel.y, z: newVelZ }, true);
        });

        return (
            <RigidBody
                ref={rigidBodyRef}
                position={position}
                type="dynamic"
                colliders={false}
                mass={config.mass}
                lockRotations
                gravityScale={config.gravityScale}
                linearDamping={0.1}
                collisionGroups={interactionGroups(CollisionLayer.Character)}
            >
                <CapsuleCollider
                    args={[config.capsuleHeight / 2 - config.capsuleRadius, config.capsuleRadius]}
                    position={[0, config.capsuleHeight / 2, 0]}
                />
                {children}
            </RigidBody>
        );
    }
);

CharacterController.displayName = 'CharacterController';

/**
 * Props for the VehicleBody component
 */
export interface VehicleBodyProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
    config?: Partial<VehicleConfig>;
    enableInput?: boolean;
    inputMap?: {
        accelerate?: string[];
        brake?: string[];
        steerLeft?: string[];
        steerRight?: string[];
        handbrake?: string[];
    };
    onSpeedChange?: (speed: number) => void;
    children?: React.ReactNode;
}

/**
 * Ref interface for VehicleBody
 */
export interface VehicleBodyRef {
    getRigidBody: () => RapierRigidBody | null;
    getSpeed: () => number;
    getSteeringAngle: () => number;
}

/**
 * Car-like physics body with simplified wheel simulation.
 * Uses force-based driving rather than ray-cast wheels for simplicity.
 *
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

/**
 * Props for the Destructible component
 */
export interface DestructibleProps {
    position?: [number, number, number];
    size?: [number, number, number];
    config?: Partial<DestructibleConfig>;
    onBreak?: () => void;
    onDamage?: (remainingHealth: number) => void;
    children?: React.ReactNode;
}

/**
 * Ref interface for Destructible
 */
export interface DestructibleRef {
    getRigidBody: () => RapierRigidBody | null;
    damage: (amount: number) => void;
    destroy: () => void;
    getHealth: () => number;
}

/**
 * Breakable physics object that shatters into debris when destroyed.
 *
 * @example
 * ```tsx
 * <Destructible
 *   position={[0, 2, 0]}
 *   size={[1, 1, 1]}
 *   config={{ health: 50, shardCount: 12 }}
 *   onBreak={() => console.log('Destroyed!')}
 * >
 *   <mesh>
 *     <boxGeometry args={[1, 1, 1]} />
 *     <meshStandardMaterial color="brown" />
 *   </mesh>
 * </Destructible>
 * ```
 */
export const Destructible = forwardRef<DestructibleRef, DestructibleProps>(
    (
        {
            position = [0, 0, 0],
            size = [1, 1, 1],
            config: configOverride,
            onBreak,
            onDamage,
            children,
        },
        ref
    ) => {
        const config = useMemo(
            () => ({
                ...createDefaultDestructibleConfig(),
                ...configOverride,
            }),
            [configOverride]
        );

        const rigidBodyRef = useRef<RapierRigidBody>(null);
        const [health, setHealth] = useState(config.health);
        const [destroyed, setDestroyed] = useState(false);
        const [shards, setShards] = useState<
            {
                position: [number, number, number];
                velocity: THREE.Vector3;
                scale: [number, number, number];
                id: number;
            }[]
        >([]);

        // Define createShards before damage to satisfy dependency order
        const createShards = useCallback(() => {
            if (!rigidBodyRef.current) return;

            const pos = rigidBodyRef.current.translation();
            const center = new THREE.Vector3(pos.x, pos.y, pos.z);

            const newShards = [];
            for (let i = 0; i < config.shardCount; i++) {
                const offset = new THREE.Vector3(
                    (Math.random() - 0.5) * size[0],
                    (Math.random() - 0.5) * size[1],
                    (Math.random() - 0.5) * size[2]
                );

                const shardPos = center.clone().add(offset);
                const velocity = generateDebrisVelocity(center, shardPos, config.explosionForce);

                newShards.push({
                    position: [shardPos.x, shardPos.y, shardPos.z] as [number, number, number],
                    velocity,
                    scale: [
                        config.shardScale[0] * (0.5 + Math.random() * 0.5),
                        config.shardScale[1] * (0.5 + Math.random() * 0.5),
                        config.shardScale[2] * (0.5 + Math.random() * 0.5),
                    ] as [number, number, number],
                    id: i,
                });
            }

            setShards(newShards);

            setTimeout(() => {
                setShards([]);
            }, config.shardLifetime * 1000);
        }, [config, size]);

        const damage = useCallback(
            (amount: number) => {
                setHealth((prev: number) => {
                    const newHealth = Math.max(0, prev - amount);
                    onDamage?.(newHealth);

                    if (newHealth <= 0 && !destroyed) {
                        setDestroyed(true);
                        createShards();
                        onBreak?.();
                    }

                    return newHealth;
                });
            },
            [destroyed, onDamage, onBreak, createShards]
        );

        const destroy = useCallback(() => {
            if (!destroyed) {
                damage(health);
            }
        }, [destroyed, damage, health]);

        useImperativeHandle(ref, () => ({
            getRigidBody: () => rigidBodyRef.current,
            damage,
            destroy,
            getHealth: () => health,
        }));

        if (destroyed) {
            return (
                <>
                    {shards.map((shard) => (
                        <RigidBody
                            key={shard.id}
                            position={shard.position}
                            type="dynamic"
                            colliders="cuboid"
                            mass={config.shardMass}
                            linearDamping={0.5}
                            angularDamping={0.5}
                            collisionGroups={interactionGroups(CollisionLayer.Debris)}
                        >
                            <mesh scale={shard.scale} castShadow>
                                <boxGeometry args={[1, 1, 1]} />
                                <meshStandardMaterial color="#8B4513" />
                            </mesh>
                        </RigidBody>
                    ))}
                </>
            );
        }

        return (
            <RigidBody
                ref={rigidBodyRef}
                position={position}
                type="dynamic"
                colliders="cuboid"
                collisionGroups={interactionGroups(CollisionLayer.Dynamic)}
                onCollisionEnter={() => {
                    damage(config.breakForce + 1);
                }}
            >
                {children}
            </RigidBody>
        );
    }
);

Destructible.displayName = 'Destructible';

/**
 * Props for the Buoyancy component
 */
export interface BuoyancyProps extends Omit<RigidBodyProps, 'ref'> {
    config?: Partial<BuoyancyConfig>;
    samplePoints?: [number, number, number][];
    onSubmerged?: (depth: number) => void;
    children?: React.ReactNode;
}

/**
 * Ref interface for Buoyancy
 */
export interface BuoyancyRef {
    getRigidBody: () => RapierRigidBody | null;
    getSubmersionDepth: () => number;
}

/**
 * Physics body with buoyancy simulation for floating objects.
 *
 * @example
 * ```tsx
 * <Buoyancy
 *   position={[0, 2, 0]}
 *   config={{ waterLevel: 0, buoyancyForce: 20 }}
 * >
 *   <mesh>
 *     <boxGeometry args={[2, 0.5, 3]} />
 *     <meshStandardMaterial color="orange" />
 *   </mesh>
 * </Buoyancy>
 * ```
 */
export const Buoyancy = forwardRef<BuoyancyRef, BuoyancyProps>(
    (
        {
            position = [0, 0, 0],
            config: configOverride,
            samplePoints,
            onSubmerged,
            children,
            ...rigidBodyProps
        },
        ref
    ) => {
        const config = useMemo(
            () => ({
                ...createDefaultBuoyancyConfig(),
                ...configOverride,
            }),
            [configOverride]
        );

        const rigidBodyRef = useRef<RapierRigidBody>(null);
        const submersionRef = useRef(0);

        const defaultSamplePoints = useMemo<[number, number, number][]>(
            () =>
                samplePoints || [
                    [-0.5, 0, -0.5],
                    [0.5, 0, -0.5],
                    [-0.5, 0, 0.5],
                    [0.5, 0, 0.5],
                    [0, 0, 0],
                    [-0.5, 0, 0],
                    [0.5, 0, 0],
                    [0, 0, -0.5],
                ],
            [samplePoints]
        );

        useImperativeHandle(ref, () => ({
            getRigidBody: () => rigidBodyRef.current,
            getSubmersionDepth: () => submersionRef.current,
        }));

        useFrame(() => {
            if (!rigidBodyRef.current) return;

            const pos = rigidBodyRef.current.translation();
            const rot = rigidBodyRef.current.rotation();
            const quaternion = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);

            let totalBuoyancy = 0;
            let submergedPoints = 0;
            let totalDepth = 0;

            const forcePoint = new THREE.Vector3();

            for (const point of defaultSamplePoints) {
                const worldPoint = new THREE.Vector3(...point)
                    .applyQuaternion(quaternion)
                    .add(new THREE.Vector3(pos.x, pos.y, pos.z));

                const depth = config.waterLevel - worldPoint.y;

                if (depth > 0) {
                    const buoyancy = calculateBuoyancyForce(depth, config.buoyancyForce, 1);
                    totalBuoyancy += buoyancy;
                    forcePoint.add(worldPoint.clone().multiplyScalar(buoyancy));
                    submergedPoints++;
                    totalDepth += depth;
                }
            }

            if (submergedPoints > 0) {
                const avgDepth = totalDepth / submergedPoints;
                submersionRef.current = avgDepth;
                onSubmerged?.(avgDepth);

                // Prevent division by zero when totalBuoyancy is 0
                if (totalBuoyancy > 0) {
                    forcePoint.divideScalar(totalBuoyancy);
                } else {
                    forcePoint.set(pos.x, pos.y, pos.z);
                }

                const buoyancyForce = { x: 0, y: totalBuoyancy, z: 0 };
                rigidBodyRef.current.applyImpulseAtPoint(
                    buoyancyForce,
                    { x: forcePoint.x, y: forcePoint.y, z: forcePoint.z },
                    true
                );

                const vel = rigidBodyRef.current.linvel();
                const angVel = rigidBodyRef.current.angvel();

                rigidBodyRef.current.setLinvel(
                    {
                        x: vel.x * (1 - config.waterDrag * 0.01),
                        y: vel.y * (1 - config.waterDrag * 0.01),
                        z: vel.z * (1 - config.waterDrag * 0.01),
                    },
                    true
                );

                rigidBodyRef.current.setAngvel(
                    {
                        x: angVel.x * (1 - config.waterAngularDrag * 0.01),
                        y: angVel.y * (1 - config.waterAngularDrag * 0.01),
                        z: angVel.z * (1 - config.waterAngularDrag * 0.01),
                    },
                    true
                );
            } else {
                submersionRef.current = 0;
            }
        });

        return (
            <RigidBody
                ref={rigidBodyRef}
                position={position}
                type="dynamic"
                colliders="cuboid"
                collisionGroups={interactionGroups(CollisionLayer.Dynamic)}
                {...rigidBodyProps}
            >
                {children}
            </RigidBody>
        );
    }
);

Buoyancy.displayName = 'Buoyancy';

/**
 * Props for the Ragdoll component
 */
export interface RagdollProps {
    position?: [number, number, number];
    config?: Partial<RagdollConfig>;
    scale?: number;
    active?: boolean;
    initialVelocity?: [number, number, number];
    onSleep?: () => void;
    children?: React.ReactNode;
}

/**
 * Ref interface for Ragdoll
 */
export interface RagdollRef {
    activate: () => void;
    deactivate: () => void;
    applyForceToAll: (force: [number, number, number]) => void;
    getBodyPart: (name: string) => RapierRigidBody | null;
}

interface RagdollSphericalJointProps {
    bodyA: RefObject<RapierRigidBody>;
    bodyB: RefObject<RapierRigidBody>;
    anchor1: [number, number, number];
    anchor2: [number, number, number];
}

const RagdollSphericalJoint = ({ bodyA, bodyB, anchor1, anchor2 }: RagdollSphericalJointProps) => {
    useSphericalJoint(bodyA as RefObject<RapierRigidBody>, bodyB as RefObject<RapierRigidBody>, [
        anchor1,
        anchor2,
    ]);
    return null;
};

interface RagdollRevoluteJointProps {
    bodyA: RefObject<RapierRigidBody>;
    bodyB: RefObject<RapierRigidBody>;
    anchor1: [number, number, number];
    anchor2: [number, number, number];
    axis: [number, number, number];
}

const RagdollRevoluteJoint = ({
    bodyA,
    bodyB,
    anchor1,
    anchor2,
    axis,
}: RagdollRevoluteJointProps) => {
    useRevoluteJoint(bodyA as RefObject<RapierRigidBody>, bodyB as RefObject<RapierRigidBody>, [
        anchor1,
        anchor2,
        axis,
    ]);
    return null;
};

/**
 * Ragdoll physics body with articulated joints.
 * Creates body parts connected with spherical and revolute joints
 * for realistic physics simulation.
 *
 * @example
 * ```tsx
 * <Ragdoll
 *   position={[0, 5, 0]}
 *   scale={1}
 *   active={true}
 *   initialVelocity={[5, 2, 0]}
 * />
 * ```
 */
export const Ragdoll = forwardRef<RagdollRef, RagdollProps>(
    (
        {
            position = [0, 0, 0],
            config: configOverride,
            scale = 1,
            active = true,
            initialVelocity = [0, 0, 0],
            onSleep,
            children,
        },
        ref
    ) => {
        const config = useMemo(
            () => ({
                ...createHumanoidRagdoll(scale),
                ...configOverride,
            }),
            [scale, configOverride]
        );

        const [isActive, setIsActive] = useState(active);

        const bodyPartRefs = useMemo(() => {
            const refs: Record<string, RefObject<RapierRigidBody>> = {};
            config.bodyParts.forEach((part) => {
                refs[part.name] =
                    createRef<RapierRigidBody>() as unknown as RefObject<RapierRigidBody>;
            });
            return refs;
        }, [config.bodyParts]);

        const bodyPartsMapRef = useRef<Map<string, RapierRigidBody>>(new Map());

        useImperativeHandle(ref, () => ({
            activate: () => setIsActive(true),
            deactivate: () => setIsActive(false),
            applyForceToAll: (force: [number, number, number]) => {
                bodyPartsMapRef.current.forEach((body) => {
                    body.applyImpulse({ x: force[0], y: force[1], z: force[2] }, true);
                });
            },
            getBodyPart: (name: string) => bodyPartsMapRef.current.get(name) || null,
        }));

        useEffect(() => {
            Object.entries(bodyPartRefs).forEach(([name, refObj]) => {
                if (refObj.current) {
                    bodyPartsMapRef.current.set(name, refObj.current);
                    if (
                        initialVelocity[0] !== 0 ||
                        initialVelocity[1] !== 0 ||
                        initialVelocity[2] !== 0
                    ) {
                        refObj.current.setLinvel(
                            {
                                x: initialVelocity[0],
                                y: initialVelocity[1],
                                z: initialVelocity[2],
                            },
                            true
                        );
                    }
                }
            });
        }, [bodyPartRefs, initialVelocity]);

        if (!isActive) {
            return <group position={position}>{children}</group>;
        }

        return (
            <group position={position}>
                {config.bodyParts.map((part) => {
                    const partPos: [number, number, number] = [
                        part.position[0],
                        part.position[1],
                        part.position[2],
                    ];

                    return (
                        <RigidBody
                            key={part.name}
                            ref={bodyPartRefs[part.name]}
                            position={partPos}
                            type="dynamic"
                            colliders={false}
                            mass={part.mass}
                            linearDamping={config.linearDamping}
                            angularDamping={config.angularDamping}
                            collisionGroups={interactionGroups(CollisionLayer.Character)}
                        >
                            {part.type === 'sphere' && (
                                <>
                                    <BallCollider args={[(part.size as [number])[0]]} />
                                    <mesh castShadow>
                                        <sphereGeometry args={[(part.size as [number])[0]]} />
                                        <meshStandardMaterial color="#e0b0a0" />
                                    </mesh>
                                </>
                            )}
                            {part.type === 'capsule' && (
                                <>
                                    <CapsuleCollider
                                        args={[
                                            (part.size as [number, number])[1] / 2,
                                            (part.size as [number, number])[0],
                                        ]}
                                    />
                                    <mesh castShadow rotation={part.rotation || [0, 0, 0]}>
                                        <capsuleGeometry
                                            args={[
                                                (part.size as [number, number])[0],
                                                (part.size as [number, number])[1],
                                            ]}
                                        />
                                        <meshStandardMaterial color="#e0b0a0" />
                                    </mesh>
                                </>
                            )}
                            {part.type === 'box' && (
                                <>
                                    <CuboidCollider
                                        args={[
                                            (part.size as [number, number, number])[0] / 2,
                                            (part.size as [number, number, number])[1] / 2,
                                            (part.size as [number, number, number])[2] / 2,
                                        ]}
                                    />
                                    <mesh castShadow>
                                        <boxGeometry args={part.size as [number, number, number]} />
                                        <meshStandardMaterial color="#e0b0a0" />
                                    </mesh>
                                </>
                            )}
                        </RigidBody>
                    );
                })}

                {config.joints.map((joint, index) => {
                    const parentRef = bodyPartRefs[joint.parent];
                    const childRef = bodyPartRefs[joint.child];

                    if (!parentRef || !childRef) return null;

                    if (joint.type === 'spherical') {
                        return (
                            <RagdollSphericalJoint
                                key={`joint-${index}-${joint.parent}-${joint.child}`}
                                bodyA={parentRef}
                                bodyB={childRef}
                                anchor1={joint.anchor1}
                                anchor2={joint.anchor2}
                            />
                        );
                    }

                    if (joint.type === 'revolute' && joint.axis) {
                        return (
                            <RagdollRevoluteJoint
                                key={`joint-${index}-${joint.parent}-${joint.child}`}
                                bodyA={parentRef}
                                bodyB={childRef}
                                anchor1={joint.anchor1}
                                anchor2={joint.anchor2}
                                axis={joint.axis}
                            />
                        );
                    }

                    return null;
                })}
            </group>
        );
    }
);

Ragdoll.displayName = 'Ragdoll';
