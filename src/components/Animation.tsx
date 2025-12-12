/**
 * Animation components for Strata
 *
 * React Three Fiber components for procedural animation including
 * IK chains, spring dynamics, look-at controllers, and locomotion.
 * @module components/Animation
 */

import { useFrame, useThree } from '@react-three/fiber';
import type React from 'react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
    type BoneChain,
    CCDSolver,
    createBoneChainFromLengths,
    FABRIKSolver,
    type GaitConfig,
    type GaitState,
    type IKSolverResult,
    type LookAtConfig,
    LookAtController,
    ProceduralGait,
    SpringChain,
    type SpringConfig,
    SpringDynamics,
    TwoBoneIKSolver,
} from '../core/animation';

export interface IKChainProps {
    boneLengths: number[];
    target: THREE.Vector3 | React.RefObject<THREE.Object3D>;
    pole?: THREE.Vector3 | React.RefObject<THREE.Object3D>;
    solver?: 'fabrik' | 'ccd';
    tolerance?: number;
    maxIterations?: number;
    visualize?: boolean;
    visualColor?: string;
    visualRadius?: number;
    children?: React.ReactNode;
    onSolve?: (result: IKSolverResult) => void;
}

export interface IKChainRef {
    getBones: () => THREE.Object3D[];
    getResult: () => IKSolverResult | null;
    solve: () => void;
}

export const IKChain = forwardRef<IKChainRef, IKChainProps>(
    (
        {
            boneLengths,
            target,
            pole,
            solver = 'fabrik',
            tolerance = 0.001,
            maxIterations = 20,
            visualize = false,
            visualColor = '#00ff00',
            visualRadius = 0.05,
            children,
            onSolve,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const chainRef = useRef<BoneChain | null>(null);
        const resultRef = useRef<IKSolverResult | null>(null);

        const solverInstance = useMemo(() => {
            return solver === 'fabrik'
                ? new FABRIKSolver(tolerance, maxIterations)
                : new CCDSolver(tolerance, maxIterations);
        }, [solver, tolerance, maxIterations]);

        useEffect(() => {
            if (groupRef.current && boneLengths.length > 0) {
                groupRef.current.children.forEach((child) => {
                    if ((child as THREE.Object3D).type === 'Object3D') {
                        groupRef.current?.remove(child);
                    }
                });

                chainRef.current = createBoneChainFromLengths(
                    groupRef.current,
                    boneLengths,
                    new THREE.Vector3(0, -1, 0)
                );
            }
        }, [boneLengths]);

        const getTargetPosition = useCallback((): THREE.Vector3 => {
            if (target instanceof THREE.Vector3) return target;
            if (target.current) {
                const pos = new THREE.Vector3();
                target.current.getWorldPosition(pos);
                return pos;
            }
            return new THREE.Vector3();
        }, [target]);

        const getPolePosition = useCallback((): THREE.Vector3 | undefined => {
            if (!pole) return undefined;
            if (pole instanceof THREE.Vector3) return pole;
            if (pole.current) {
                const pos = new THREE.Vector3();
                pole.current.getWorldPosition(pos);
                return pos;
            }
            return undefined;
        }, [pole]);

        const solve = useCallback(() => {
            if (!chainRef.current) return;

            const targetPos = getTargetPosition();
            const polePos = getPolePosition();

            const result =
                solver === 'fabrik'
                    ? (solverInstance as FABRIKSolver).solve(chainRef.current, targetPos, polePos)
                    : (solverInstance as CCDSolver).solve(chainRef.current, targetPos);

            resultRef.current = result;

            if (solver === 'fabrik') {
                (solverInstance as FABRIKSolver).apply(chainRef.current, result);
            } else {
                (solverInstance as CCDSolver).apply(chainRef.current, result);
            }

            onSolve?.(result);
        }, [solver, solverInstance, getTargetPosition, getPolePosition, onSolve]);

        useImperativeHandle(ref, () => ({
            getBones: () => chainRef.current?.bones ?? [],
            getResult: () => resultRef.current,
            solve,
        }));

        useFrame(() => {
            solve();
        });

        const visualBones = useMemo(() => {
            if (!visualize) return null;

            return boneLengths.map((length, i) => (
                <group key={i}>
                    <mesh position={[0, -length / 2, 0]}>
                        <cylinderGeometry args={[visualRadius, visualRadius * 0.8, length, 8]} />
                        <meshStandardMaterial color={visualColor} />
                    </mesh>
                    <mesh>
                        <sphereGeometry args={[visualRadius * 1.2, 8, 8]} />
                        <meshStandardMaterial color={visualColor} />
                    </mesh>
                </group>
            ));
        }, [visualize, boneLengths, visualColor, visualRadius]);

        return (
            <group ref={groupRef}>
                {visualBones}
                {children}
            </group>
        );
    }
);

IKChain.displayName = 'IKChain';

export interface IKLimbProps {
    upperLength: number;
    lowerLength: number;
    target: THREE.Vector3 | React.RefObject<THREE.Object3D>;
    poleTarget: THREE.Vector3 | React.RefObject<THREE.Object3D>;
    visualize?: boolean;
    visualColor?: string;
    children?: React.ReactNode;
    onSolve?: (midPos: THREE.Vector3, endPos: THREE.Vector3) => void;
}

export interface IKLimbRef {
    getUpperBone: () => THREE.Object3D | null;
    getLowerBone: () => THREE.Object3D | null;
    getEndEffector: () => THREE.Object3D | null;
}

export const IKLimb = forwardRef<IKLimbRef, IKLimbProps>(
    (
        {
            upperLength,
            lowerLength,
            target,
            poleTarget,
            visualize = false,
            visualColor = '#4488ff',
            children,
            onSolve,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const upperRef = useRef<THREE.Object3D>(null);
        const lowerRef = useRef<THREE.Object3D>(null);
        const endRef = useRef<THREE.Object3D>(null);

        const solver = useMemo(() => new TwoBoneIKSolver(), []);

        useImperativeHandle(ref, () => ({
            getUpperBone: () => upperRef.current,
            getLowerBone: () => lowerRef.current,
            getEndEffector: () => endRef.current,
        }));

        const getTargetPosition = useCallback((): THREE.Vector3 => {
            if (target instanceof THREE.Vector3) return target;
            if (target.current) {
                const pos = new THREE.Vector3();
                target.current.getWorldPosition(pos);
                return pos;
            }
            return new THREE.Vector3();
        }, [target]);

        const getPolePosition = useCallback((): THREE.Vector3 => {
            if (poleTarget instanceof THREE.Vector3) return poleTarget;
            if (poleTarget.current) {
                const pos = new THREE.Vector3();
                poleTarget.current.getWorldPosition(pos);
                return pos;
            }
            return new THREE.Vector3(0, 0, 1);
        }, [poleTarget]);

        useFrame(() => {
            if (!groupRef.current || !upperRef.current || !lowerRef.current || !endRef.current)
                return;

            const rootPos = new THREE.Vector3();
            const midPos = new THREE.Vector3();
            const endPos = new THREE.Vector3();

            groupRef.current.getWorldPosition(rootPos);
            lowerRef.current.getWorldPosition(midPos);
            endRef.current.getWorldPosition(endPos);

            const targetPos = getTargetPosition();
            const polePos = getPolePosition();

            solver.solveLimb(
                upperRef.current,
                lowerRef.current,
                endRef.current,
                targetPos,
                polePos
            );

            lowerRef.current.getWorldPosition(midPos);
            endRef.current.getWorldPosition(endPos);
            onSolve?.(midPos, endPos);
        });

        return (
            <group ref={groupRef}>
                <object3D ref={upperRef}>
                    {visualize && (
                        <mesh position={[0, -upperLength / 2, 0]}>
                            <cylinderGeometry args={[0.05, 0.04, upperLength, 8]} />
                            <meshStandardMaterial color={visualColor} />
                        </mesh>
                    )}
                    <object3D ref={lowerRef} position={[0, -upperLength, 0]}>
                        {visualize && (
                            <mesh position={[0, -lowerLength / 2, 0]}>
                                <cylinderGeometry args={[0.04, 0.03, lowerLength, 8]} />
                                <meshStandardMaterial color={visualColor} />
                            </mesh>
                        )}
                        <object3D ref={endRef} position={[0, -lowerLength, 0]} />
                    </object3D>
                </object3D>
                {children}
            </group>
        );
    }
);

IKLimb.displayName = 'IKLimb';

export interface LookAtProps {
    target: THREE.Vector3 | React.RefObject<THREE.Object3D>;
    config?: Partial<LookAtConfig>;
    children?: React.ReactNode;
}

export interface LookAtRef {
    getRotation: () => THREE.Quaternion;
    reset: () => void;
}

export const LookAt = forwardRef<LookAtRef, LookAtProps>(({ target, config, children }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const controller = useMemo(() => new LookAtController(config), [config]);

    useImperativeHandle(ref, () => ({
        getRotation: () => controller.update(groupRef.current!, new THREE.Vector3(), 0),
        reset: () => controller.reset(),
    }));

    const getTargetPosition = useCallback((): THREE.Vector3 => {
        if (target instanceof THREE.Vector3) return target;
        if (target.current) {
            const pos = new THREE.Vector3();
            target.current.getWorldPosition(pos);
            return pos;
        }
        return new THREE.Vector3(0, 0, 1);
    }, [target]);

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        const targetPos = getTargetPosition();
        const rotation = controller.update(groupRef.current, targetPos, delta);
        groupRef.current.quaternion.copy(rotation);
    });

    return <group ref={groupRef}>{children}</group>;
});

LookAt.displayName = 'LookAt';

export interface SpringBoneProps {
    config?: Partial<SpringConfig>;
    gravity?: [number, number, number];
    children?: React.ReactNode;
}

export interface SpringBoneRef {
    getPosition: () => THREE.Vector3;
    getVelocity: () => THREE.Vector3;
    reset: () => void;
}

export const SpringBone = forwardRef<SpringBoneRef, SpringBoneProps>(
    ({ config, gravity = [0, -9.8, 0], children }, ref) => {
        const groupRef = useRef<THREE.Group>(null);
        const _parentRef = useRef<THREE.Vector3>(new THREE.Vector3());

        const spring = useMemo(() => new SpringDynamics(config), [config]);
        const gravityVec = useMemo(() => new THREE.Vector3(...gravity), [gravity]);

        useImperativeHandle(ref, () => ({
            getPosition: () => spring.getPosition(),
            getVelocity: () => spring.getVelocity(),
            reset: () => spring.reset(),
        }));

        useFrame((_, delta) => {
            if (!groupRef.current || !groupRef.current.parent) return;

            const parentWorldPos = new THREE.Vector3();
            groupRef.current.parent.getWorldPosition(parentWorldPos);

            const target = parentWorldPos.clone().add(gravityVec.clone().multiplyScalar(0.1));
            const newPos = spring.update(target, delta);

            const localPos = newPos.clone();
            if (groupRef.current.parent) {
                groupRef.current.parent.worldToLocal(localPos);
            }
            groupRef.current.position.copy(localPos);
        });

        return <group ref={groupRef}>{children}</group>;
    }
);

SpringBone.displayName = 'SpringBone';

export interface ProceduralWalkProps {
    config?: Partial<GaitConfig>;
    bodyRef: React.RefObject<THREE.Object3D>;
    leftFootRef?: React.RefObject<THREE.Object3D>;
    rightFootRef?: React.RefObject<THREE.Object3D>;
    enabled?: boolean;
    onStep?: (foot: 'left' | 'right', position: THREE.Vector3) => void;
}

export interface ProceduralWalkRef {
    getState: () => GaitState | null;
    getPhase: () => number;
    reset: () => void;
}

export const ProceduralWalk = forwardRef<ProceduralWalkRef, ProceduralWalkProps>(
    ({ config, bodyRef, leftFootRef, rightFootRef, enabled = true, onStep }, ref) => {
        const gaitRef = useRef<ProceduralGait | null>(null);
        const stateRef = useRef<GaitState | null>(null);
        const lastPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());
        const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3());
        const wasLeftLifted = useRef(false);
        const wasRightLifted = useRef(false);

        useEffect(() => {
            gaitRef.current = new ProceduralGait(config);
        }, [config]);

        useImperativeHandle(ref, () => ({
            getState: () => stateRef.current,
            getPhase: () => gaitRef.current?.getPhase() ?? 0,
            reset: () => gaitRef.current?.reset(),
        }));

        useFrame((_, delta) => {
            if (!enabled || !gaitRef.current || !bodyRef.current) return;

            const bodyPos = new THREE.Vector3();
            bodyRef.current.getWorldPosition(bodyPos);

            velocityRef.current
                .copy(bodyPos)
                .sub(lastPositionRef.current)
                .divideScalar(Math.max(delta, 0.001));
            lastPositionRef.current.copy(bodyPos);

            const forward = new THREE.Vector3(0, 0, 1);
            bodyRef.current.getWorldDirection(forward);

            const state = gaitRef.current.update(bodyPos, forward, velocityRef.current, delta);
            stateRef.current = state;

            if (leftFootRef?.current) {
                leftFootRef.current.position.copy(state.leftFootTarget);
            }
            if (rightFootRef?.current) {
                rightFootRef.current.position.copy(state.rightFootTarget);
            }

            if (!wasLeftLifted.current && state.leftFootLifted) {
                onStep?.('left', state.leftFootTarget);
            }
            if (!wasRightLifted.current && state.rightFootLifted) {
                onStep?.('right', state.rightFootTarget);
            }

            wasLeftLifted.current = state.leftFootLifted;
            wasRightLifted.current = state.rightFootLifted;
        });

        return null;
    }
);

ProceduralWalk.displayName = 'ProceduralWalk';

export interface HeadTrackerProps {
    target?: THREE.Vector3 | React.RefObject<THREE.Object3D>;
    followMouse?: boolean;
    maxAngle?: number;
    speed?: number;
    deadzone?: number;
    children?: React.ReactNode;
}

export interface HeadTrackerRef {
    lookAt: (target: THREE.Vector3) => void;
    reset: () => void;
}

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

export interface TailPhysicsProps {
    segmentCount: number;
    segmentLength?: number;
    config?: Partial<SpringConfig>;
    gravity?: [number, number, number];
    visualize?: boolean;
    visualColor?: string;
    visualRadius?: number;
    children?: React.ReactNode;
}

export interface TailPhysicsRef {
    getPositions: () => THREE.Vector3[];
    reset: () => void;
}

export const TailPhysics = forwardRef<TailPhysicsRef, TailPhysicsProps>(
    (
        {
            segmentCount,
            segmentLength = 0.3,
            config,
            gravity = [0, -9.8, 0],
            visualize = false,
            visualColor = '#ff8844',
            visualRadius = 0.03,
            children,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const segmentsRef = useRef<THREE.Object3D[]>([]);
        const positionsRef = useRef<THREE.Vector3[]>([]);

        const chain = useMemo(
            () => new SpringChain(segmentCount, config, segmentLength),
            [segmentCount, config, segmentLength]
        );
        const gravityVec = useMemo(() => new THREE.Vector3(...gravity), [gravity]);

        useImperativeHandle(ref, () => ({
            getPositions: () => positionsRef.current,
            reset: () => {
                const positions = segmentsRef.current.map(
                    (_, i) => new THREE.Vector3(0, -segmentLength * (i + 1), 0)
                );
                chain.reset(positions);
            },
        }));

        useFrame((_, delta) => {
            if (!groupRef.current) return;

            const rootPos = new THREE.Vector3();
            const rootQuat = new THREE.Quaternion();
            groupRef.current.getWorldPosition(rootPos);
            groupRef.current.getWorldQuaternion(rootQuat);

            const positions = chain.update(rootPos, rootQuat, delta, gravityVec);
            positionsRef.current = positions;

            for (let i = 0; i < segmentsRef.current.length && i < positions.length - 1; i++) {
                const segment = segmentsRef.current[i];
                if (!segment) continue;

                const currentPos = positions[i];
                const nextPos = positions[i + 1];

                const localPos = nextPos.clone();
                if (groupRef.current) {
                    groupRef.current.worldToLocal(localPos);
                }
                segment.position.copy(localPos);

                const direction = nextPos.clone().sub(currentPos).normalize();
                const up = new THREE.Vector3(0, 1, 0);
                const quaternion = new THREE.Quaternion();
                const matrix = new THREE.Matrix4().lookAt(new THREE.Vector3(), direction, up);
                quaternion.setFromRotationMatrix(matrix);
                segment.quaternion.copy(quaternion);
            }
        });

        const segments = useMemo(() => {
            return Array.from({ length: segmentCount }, (_, i) => (
                <object3D
                    key={i}
                    ref={(el) => {
                        if (el) segmentsRef.current[i] = el;
                    }}
                    position={[0, -segmentLength * (i + 1), 0]}
                >
                    {visualize && (
                        <>
                            <mesh>
                                <sphereGeometry
                                    args={[visualRadius * (1 - (i / segmentCount) * 0.5), 8, 8]}
                                />
                                <meshStandardMaterial color={visualColor} />
                            </mesh>
                            {i < segmentCount - 1 && (
                                <mesh position={[0, -segmentLength / 2, 0]}>
                                    <cylinderGeometry
                                        args={[
                                            visualRadius * 0.5,
                                            visualRadius * 0.5,
                                            segmentLength,
                                            6,
                                        ]}
                                    />
                                    <meshStandardMaterial color={visualColor} />
                                </mesh>
                            )}
                        </>
                    )}
                </object3D>
            ));
        }, [segmentCount, segmentLength, visualize, visualColor, visualRadius]);

        return (
            <group ref={groupRef}>
                {segments}
                {children}
            </group>
        );
    }
);

TailPhysics.displayName = 'TailPhysics';

export interface BreathingAnimationProps {
    amplitude?: number;
    frequency?: number;
    axis?: 'x' | 'y' | 'z' | 'scale';
    children?: React.ReactNode;
}

export interface BreathingAnimationRef {
    pause: () => void;
    resume: () => void;
    setAmplitude: (amplitude: number) => void;
}

export const BreathingAnimation = forwardRef<BreathingAnimationRef, BreathingAnimationProps>(
    ({ amplitude = 0.02, frequency = 1, axis = 'y', children }, ref) => {
        const groupRef = useRef<THREE.Group>(null);
        const pausedRef = useRef(false);
        const amplitudeRef = useRef(amplitude);
        const timeRef = useRef(0);

        useEffect(() => {
            amplitudeRef.current = amplitude;
        }, [amplitude]);

        useImperativeHandle(ref, () => ({
            pause: () => {
                pausedRef.current = true;
            },
            resume: () => {
                pausedRef.current = false;
            },
            setAmplitude: (a: number) => {
                amplitudeRef.current = a;
            },
        }));

        useFrame((_, delta) => {
            if (!groupRef.current || pausedRef.current) return;

            timeRef.current += delta;
            const value =
                Math.sin(timeRef.current * frequency * Math.PI * 2) * amplitudeRef.current;

            if (axis === 'scale') {
                const scale = 1 + value;
                groupRef.current.scale.set(scale, scale, scale);
            } else {
                groupRef.current.position[axis] = value;
            }
        });

        return <group ref={groupRef}>{children}</group>;
    }
);

BreathingAnimation.displayName = 'BreathingAnimation';

export interface BlinkControllerProps {
    blinkDuration?: number;
    minInterval?: number;
    maxInterval?: number;
    leftEyeRef?: React.RefObject<THREE.Object3D>;
    rightEyeRef?: React.RefObject<THREE.Object3D>;
    onBlink?: () => void;
    children?: React.ReactNode;
}

export interface BlinkControllerRef {
    blink: () => void;
    setBlinking: (enabled: boolean) => void;
}

export const BlinkController = forwardRef<BlinkControllerRef, BlinkControllerProps>(
    (
        {
            blinkDuration = 0.15,
            minInterval = 2,
            maxInterval = 6,
            leftEyeRef,
            rightEyeRef,
            onBlink,
            children,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const blinkingRef = useRef(true);
        const nextBlinkRef = useRef(0);
        const blinkProgressRef = useRef(1);
        const baseScaleRef = useRef<{ left: THREE.Vector3; right: THREE.Vector3 } | null>(null);

        const scheduleNextBlink = useCallback(() => {
            nextBlinkRef.current = minInterval + Math.random() * (maxInterval - minInterval);
        }, [minInterval, maxInterval]);

        useEffect(() => {
            scheduleNextBlink();
        }, [scheduleNextBlink]);

        const triggerBlink = useCallback(() => {
            blinkProgressRef.current = 0;
            onBlink?.();
        }, [onBlink]);

        useImperativeHandle(ref, () => ({
            blink: triggerBlink,
            setBlinking: (enabled: boolean) => {
                blinkingRef.current = enabled;
            },
        }));

        useFrame((_, delta) => {
            if (!baseScaleRef.current && leftEyeRef?.current && rightEyeRef?.current) {
                baseScaleRef.current = {
                    left: leftEyeRef.current.scale.clone(),
                    right: rightEyeRef.current.scale.clone(),
                };
            }

            if (blinkProgressRef.current < 1) {
                blinkProgressRef.current = Math.min(
                    1,
                    blinkProgressRef.current + delta / blinkDuration
                );

                const t = blinkProgressRef.current;
                // Use proper blink animation: closing phase (0-0.5), opening phase (0.5-1)
                const blinkValue = 1 - Math.sin(t * Math.PI);
                const scaleY = Math.max(0.1, blinkValue);

                if (leftEyeRef?.current && baseScaleRef.current) {
                    leftEyeRef.current.scale.y = baseScaleRef.current.left.y * scaleY;
                }
                if (rightEyeRef?.current && baseScaleRef.current) {
                    rightEyeRef.current.scale.y = baseScaleRef.current.right.y * scaleY;
                }
            } else if (blinkingRef.current) {
                nextBlinkRef.current -= delta;

                if (nextBlinkRef.current <= 0) {
                    triggerBlink();
                    scheduleNextBlink();
                }
            }
        });

        return <group ref={groupRef}>{children}</group>;
    }
);

BlinkController.displayName = 'BlinkController';
