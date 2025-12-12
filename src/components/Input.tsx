/**
 * 3D Input Components
 *
 * Revolutionary 3D joystick and trigger system with real depth, shadows, and haptics.
 * Replaces flat 2D controls with immersive 3D alternatives.
 * @module components/Input
 */

import React, {
    useRef,
    useEffect,
    useMemo,
    useCallback,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { InputManager, InputAxis, InputEvent, HapticFeedback, DragState } from '../core/input';

/**
 * Base ref interface for all input controls
 *
 * @property getAxis - Get current axis values
 * @property getWorldPosition - Get control position in world space
 * @property isActive - Check if control is currently active
 * @property reset - Reset control to default state
 */
export interface InputControlRef {
    getAxis: () => InputAxis;
    getWorldPosition: () => THREE.Vector3;
    isActive: () => boolean;
    reset: () => void;
}

/**
 * Event callbacks for input controls
 *
 * @property onActivate - Called when control is activated
 * @property onDeactivate - Called when control is deactivated
 * @property onAxisChange - Called when axis values change
 * @property onPress - Called on initial press
 * @property onRelease - Called when released
 */
export interface InputControlEvents {
    onActivate?: (event: InputEvent) => void;
    onDeactivate?: (event: InputEvent) => void;
    onAxisChange?: (axis: InputAxis, worldPosition: THREE.Vector3) => void;
    onPress?: (event: InputEvent) => void;
    onRelease?: (event: InputEvent) => void;
}

/**
 * Props for the Joystick3D component
 *
 * @property position - Position in 3D space [x, y, z]
 * @property baseColor - Color of the joystick base
 * @property stalkColor - Color of the joystick stalk
 * @property knobColor - Color of the draggable knob
 * @property size - Overall size multiplier
 * @property deadzone - Center deadzone threshold (0-1)
 * @property returnSpeed - Speed of return to center
 * @property maxTilt - Maximum tilt angle in radians
 */
export interface Joystick3DProps extends InputControlEvents {
    position?: [number, number, number];
    baseColor?: THREE.ColorRepresentation;
    stalkColor?: THREE.ColorRepresentation;
    knobColor?: THREE.ColorRepresentation;
    size?: number;
    deadzone?: number;
    returnSpeed?: number;
    maxTilt?: number;
}

/**
 * Ref interface for Joystick3D with trauma feedback
 */
export interface Joystick3DRef extends InputControlRef {
    addTrauma: (amount: number) => void;
}

/**
 * Physical 3D joystick control with real depth, shadows, and haptic feedback.
 * Ideal for character movement, vehicle control, and camera manipulation.
 *
 * @example
 * ```tsx
 * // Basic movement joystick
 * const joystickRef = useRef<Joystick3DRef>(null);
 *
 * <Joystick3D
 *   ref={joystickRef}
 *   position={[0, 0, 0]}
 *   onAxisChange={(axis) => movePlayer(axis.x, axis.y)}
 * />
 *
 * // Styled joystick with custom colors
 * <Joystick3D
 *   position={[-2, 0.5, 2]}
 *   baseColor="#222222"
 *   stalkColor="#444444"
 *   knobColor="#ff0000"
 *   size={1.5}
 *   maxTilt={Math.PI / 4}
 * />
 *
 * // With haptic feedback on collision
 * const handleCollision = () => {
 *   joystickRef.current?.addTrauma(0.5);
 * };
 * ```
 *
 * @param props - Joystick3DProps configuration
 * @returns React element containing the 3D joystick
 */
export const Joystick3D = forwardRef<Joystick3DRef, Joystick3DProps>(
    (
        {
            position = [0, 0, 0],
            baseColor = '#333333',
            stalkColor = '#555555',
            knobColor = '#ff6600',
            size = 1,
            deadzone = 0.1,
            returnSpeed = 8,
            maxTilt = Math.PI / 6,
            onActivate,
            onDeactivate,
            onAxisChange,
            onPress,
            onRelease,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const stalkRef = useRef<THREE.Group>(null);
        const knobRef = useRef<THREE.Mesh>(null);
        const knobMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

        const currentAxis = useRef<InputAxis>({ x: 0, y: 0 });
        const targetAxis = useRef<InputAxis>({ x: 0, y: 0 });
        const isPressed = useRef(false);
        const haptics = useRef(new HapticFeedback());
        const worldPos = useRef(new THREE.Vector3());

        const { raycaster, camera, pointer } = useThree();

        const baseGeometry = useMemo(() => {
            const points: THREE.Vector2[] = [];
            points.push(new THREE.Vector2(0.8 * size, 0));
            points.push(new THREE.Vector2(0.9 * size, 0.05 * size));
            points.push(new THREE.Vector2(0.9 * size, 0.15 * size));
            points.push(new THREE.Vector2(0.7 * size, 0.2 * size));
            points.push(new THREE.Vector2(0.3 * size, 0.2 * size));
            points.push(new THREE.Vector2(0.2 * size, 0.1 * size));
            points.push(new THREE.Vector2(0, 0.1 * size));
            return new THREE.LatheGeometry(points, 32);
        }, [size]);

        const socketGeometry = useMemo(() => {
            return new THREE.CylinderGeometry(0.25 * size, 0.3 * size, 0.15 * size, 32);
        }, [size]);

        const stalkGeometry = useMemo(() => {
            return new THREE.CylinderGeometry(0.08 * size, 0.12 * size, 0.6 * size, 16);
        }, [size]);

        const knobGeometry = useMemo(() => {
            return new THREE.SphereGeometry(0.18 * size, 32, 24);
        }, [size]);

        useImperativeHandle(ref, () => ({
            getAxis: () => ({ ...currentAxis.current }),
            getWorldPosition: () => {
                if (groupRef.current) {
                    groupRef.current.getWorldPosition(worldPos.current);
                }
                return worldPos.current.clone();
            },
            isActive: () => isPressed.current,
            reset: () => {
                targetAxis.current = { x: 0, y: 0 };
                isPressed.current = false;
            },
            addTrauma: (amount: number) => {
                if (amount > 0.3) haptics.current.heavyImpact();
                else if (amount > 0.1) haptics.current.pulse();
            },
        }));

        const handlePointerDown = useCallback(
            (e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                isPressed.current = true;
                haptics.current.lightImpact();

                if (groupRef.current) {
                    groupRef.current.getWorldPosition(worldPos.current);
                }

                const event: InputEvent = {
                    type: 'press',
                    axis: currentAxis.current,
                    force: 1,
                    worldPosition: worldPos.current.clone(),
                    timestamp: Date.now(),
                };

                onPress?.(event);
                onActivate?.(event);
            },
            [onPress, onActivate]
        );

        const handlePointerUp = useCallback(() => {
            if (!isPressed.current) return;

            isPressed.current = false;
            targetAxis.current = { x: 0, y: 0 };
            haptics.current.selection();

            if (groupRef.current) {
                groupRef.current.getWorldPosition(worldPos.current);
            }

            const event: InputEvent = {
                type: 'release',
                axis: { x: 0, y: 0 },
                force: 0,
                worldPosition: worldPos.current.clone(),
                timestamp: Date.now(),
            };

            onRelease?.(event);
            onDeactivate?.(event);
        }, [onRelease, onDeactivate]);

        useEffect(() => {
            const handleGlobalUp = () => handlePointerUp();
            window.addEventListener('pointerup', handleGlobalUp);
            return () => window.removeEventListener('pointerup', handleGlobalUp);
        }, [handlePointerUp]);

        useFrame((state, delta) => {
            if (!stalkRef.current || !knobRef.current || !groupRef.current) return;

            if (isPressed.current) {
                raycaster.setFromCamera(pointer, camera);
                const plane = new THREE.Plane(
                    new THREE.Vector3(0, 1, 0),
                    -position[1] - 0.3 * size
                );
                const intersection = new THREE.Vector3();
                raycaster.ray.intersectPlane(plane, intersection);

                if (intersection) {
                    const localPoint = groupRef.current.worldToLocal(intersection.clone());
                    const dx = localPoint.x / (0.5 * size);
                    const dz = localPoint.z / (0.5 * size);
                    const magnitude = Math.sqrt(dx * dx + dz * dz);

                    if (magnitude > deadzone) {
                        const clampedMag = Math.min(magnitude, 1);
                        targetAxis.current = {
                            x: (dx / magnitude) * clampedMag,
                            y: (dz / magnitude) * clampedMag,
                        };
                    } else {
                        targetAxis.current = { x: 0, y: 0 };
                    }
                }
            }

            const lerpSpeed = isPressed.current ? 15 : returnSpeed;
            currentAxis.current.x +=
                (targetAxis.current.x - currentAxis.current.x) * delta * lerpSpeed;
            currentAxis.current.y +=
                (targetAxis.current.y - currentAxis.current.y) * delta * lerpSpeed;

            stalkRef.current.rotation.x = -currentAxis.current.y * maxTilt;
            stalkRef.current.rotation.z = -currentAxis.current.x * maxTilt;

            if (knobMaterialRef.current) {
                const intensity = isPressed.current ? 2 : 0.5;
                knobMaterialRef.current.emissiveIntensity = intensity;
            }

            const axisMag = Math.sqrt(currentAxis.current.x ** 2 + currentAxis.current.y ** 2);
            if (axisMag > deadzone) {
                groupRef.current.getWorldPosition(worldPos.current);
                onAxisChange?.(currentAxis.current, worldPos.current.clone());
            }
        });

        return (
            <group ref={groupRef} position={position}>
                <mesh geometry={baseGeometry} castShadow receiveShadow>
                    <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.3} />
                </mesh>

                <mesh geometry={socketGeometry} position={[0, 0.15 * size, 0]} receiveShadow>
                    <meshStandardMaterial color="#222222" roughness={0.9} metalness={0.1} />
                </mesh>

                <group ref={stalkRef} position={[0, 0.2 * size, 0]}>
                    <mesh geometry={stalkGeometry} position={[0, 0.3 * size, 0]} castShadow>
                        <meshStandardMaterial color={stalkColor} roughness={0.5} metalness={0.4} />
                    </mesh>

                    <mesh
                        ref={knobRef}
                        geometry={knobGeometry}
                        position={[0, 0.65 * size, 0]}
                        castShadow
                        onPointerDown={handlePointerDown}
                    >
                        <meshStandardMaterial
                            ref={knobMaterialRef}
                            color={knobColor}
                            roughness={0.3}
                            metalness={0.6}
                            emissive={knobColor}
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                </group>
            </group>
        );
    }
);

Joystick3D.displayName = 'Joystick3D';

/**
 * Props for the GroundSwitch component
 *
 * @property position - Position in 3D space [x, y, z]
 * @property axis - Axis of movement ('x' or 'z')
 * @property throwDistance - Distance the lever travels
 * @property material - Visual style ('steel', 'brass', 'chrome')
 * @property size - Overall size multiplier
 */
export interface GroundSwitchProps extends InputControlEvents {
    position?: [number, number, number];
    axis?: 'x' | 'z';
    throwDistance?: number;
    material?: 'steel' | 'brass' | 'chrome';
    size?: number;
}

/**
 * Ref interface for GroundSwitch with toggle support
 */
export interface GroundSwitchRef extends InputControlRef {
    toggle: () => void;
    setValue: (value: number) => void;
}

/**
 * Industrial ground-mounted lever switch with snapping positions.
 * Great for railway switches, power controls, and mechanical puzzles.
 *
 * @example
 * ```tsx
 * // Railway switch
 * <GroundSwitch
 *   position={[0, 0, 0]}
 *   axis="z"
 *   material="steel"
 *   onActivate={() => switchTrack()}
 * />
 *
 * // Power lever
 * <GroundSwitch
 *   position={[2, 0, 0]}
 *   material="brass"
 *   throwDistance={0.8}
 *   onAxisChange={(axis) => setPowerLevel(axis.y)}
 * />
 *
 * // Programmatic toggle
 * const switchRef = useRef<GroundSwitchRef>(null);
 * <GroundSwitch ref={switchRef} />
 * switchRef.current?.toggle();
 * ```
 *
 * @param props - GroundSwitchProps configuration
 * @returns React element containing the ground switch
 */
export const GroundSwitch = forwardRef<GroundSwitchRef, GroundSwitchProps>(
    (
        {
            position = [0, 0, 0],
            axis = 'z',
            throwDistance = 0.5,
            material = 'steel',
            size = 1,
            onActivate,
            onDeactivate,
            onAxisChange,
            onPress,
            onRelease,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const leverRef = useRef<THREE.Group>(null);

        const currentValue = useRef(0);
        const targetValue = useRef(0);
        const isDragging = useRef(false);
        const haptics = useRef(new HapticFeedback());
        const worldPos = useRef(new THREE.Vector3());

        const { raycaster, camera, pointer } = useThree();

        const materialProps = useMemo(() => {
            const materials = {
                steel: { color: '#888888', roughness: 0.4, metalness: 0.8 },
                brass: { color: '#b5a642', roughness: 0.3, metalness: 0.9 },
                chrome: { color: '#cccccc', roughness: 0.1, metalness: 1.0 },
            };
            return materials[material];
        }, [material]);

        const baseGeometry = useMemo(() => {
            return new THREE.BoxGeometry(0.4 * size, 0.1 * size, 0.4 * size);
        }, [size]);

        const slotGeometry = useMemo(() => {
            const length = axis === 'z' ? throwDistance * 2 * size : 0.1 * size;
            const width = axis === 'x' ? throwDistance * 2 * size : 0.1 * size;
            return new THREE.BoxGeometry(width, 0.05 * size, length);
        }, [size, axis, throwDistance]);

        const handleGeometry = useMemo(() => {
            return new THREE.CylinderGeometry(0.06 * size, 0.08 * size, 0.5 * size, 16);
        }, [size]);

        const gripGeometry = useMemo(() => {
            return new THREE.SphereGeometry(0.1 * size, 16, 12);
        }, [size]);

        useImperativeHandle(ref, () => ({
            getAxis: () => {
                if (axis === 'x') return { x: currentValue.current, y: 0 };
                return { x: 0, y: currentValue.current };
            },
            getWorldPosition: () => {
                if (groupRef.current) {
                    groupRef.current.getWorldPosition(worldPos.current);
                }
                return worldPos.current.clone();
            },
            isActive: () => Math.abs(currentValue.current) > 0.5,
            reset: () => {
                targetValue.current = 0;
            },
            toggle: () => {
                targetValue.current = currentValue.current > 0 ? -1 : 1;
                haptics.current.heavyImpact();
            },
            setValue: (value: number) => {
                targetValue.current = Math.max(-1, Math.min(1, value));
            },
        }));

        const handlePointerDown = useCallback(
            (e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                isDragging.current = true;
                haptics.current.lightImpact();

                if (groupRef.current) {
                    groupRef.current.getWorldPosition(worldPos.current);
                }

                onPress?.({
                    type: 'press',
                    axis:
                        axis === 'x'
                            ? { x: currentValue.current, y: 0 }
                            : { x: 0, y: currentValue.current },
                    force: 1,
                    worldPosition: worldPos.current.clone(),
                    timestamp: Date.now(),
                });
            },
            [axis, onPress]
        );

        const handlePointerUp = useCallback(() => {
            if (!isDragging.current) return;
            isDragging.current = false;

            const snappedValue =
                currentValue.current > 0.3 ? 1 : currentValue.current < -0.3 ? -1 : 0;
            targetValue.current = snappedValue;

            if (Math.abs(snappedValue) > 0.5) {
                haptics.current.heavyImpact();
                onActivate?.({
                    type: 'activate',
                    axis: axis === 'x' ? { x: snappedValue, y: 0 } : { x: 0, y: snappedValue },
                    force: 1,
                    worldPosition: worldPos.current.clone(),
                    timestamp: Date.now(),
                });
            } else {
                haptics.current.selection();
                onDeactivate?.({
                    type: 'deactivate',
                    axis: { x: 0, y: 0 },
                    force: 0,
                    worldPosition: worldPos.current.clone(),
                    timestamp: Date.now(),
                });
            }

            onRelease?.({
                type: 'release',
                axis: axis === 'x' ? { x: snappedValue, y: 0 } : { x: 0, y: snappedValue },
                force: 0,
                worldPosition: worldPos.current.clone(),
                timestamp: Date.now(),
            });
        }, [axis, onActivate, onDeactivate, onRelease]);

        useEffect(() => {
            const handleGlobalUp = () => handlePointerUp();
            window.addEventListener('pointerup', handleGlobalUp);
            return () => window.removeEventListener('pointerup', handleGlobalUp);
        }, [handlePointerUp]);

        useFrame((state, delta) => {
            if (!leverRef.current || !groupRef.current) return;

            if (isDragging.current) {
                raycaster.setFromCamera(pointer, camera);
                const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position[1]);
                const intersection = new THREE.Vector3();
                raycaster.ray.intersectPlane(plane, intersection);

                if (intersection) {
                    const localPoint = groupRef.current.worldToLocal(intersection.clone());
                    const value =
                        axis === 'z'
                            ? localPoint.z / (throwDistance * size)
                            : localPoint.x / (throwDistance * size);
                    targetValue.current = Math.max(-1, Math.min(1, value));
                }
            }

            const prevValue = currentValue.current;
            currentValue.current += (targetValue.current - currentValue.current) * delta * 12;

            const offset = currentValue.current * throwDistance * size;
            if (axis === 'z') {
                leverRef.current.position.z = offset;
                leverRef.current.rotation.x = -currentValue.current * 0.3;
            } else {
                leverRef.current.position.x = offset;
                leverRef.current.rotation.z = currentValue.current * 0.3;
            }

            if (Math.abs(currentValue.current - prevValue) > 0.01) {
                groupRef.current.getWorldPosition(worldPos.current);
                onAxisChange?.(
                    axis === 'x'
                        ? { x: currentValue.current, y: 0 }
                        : { x: 0, y: currentValue.current },
                    worldPos.current.clone()
                );
            }
        });

        return (
            <group ref={groupRef} position={position}>
                <mesh geometry={baseGeometry} receiveShadow>
                    <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.2} />
                </mesh>

                <mesh geometry={slotGeometry} position={[0, 0.06 * size, 0]}>
                    <meshStandardMaterial color="#111111" roughness={0.9} />
                </mesh>

                <group ref={leverRef}>
                    <mesh geometry={handleGeometry} position={[0, 0.3 * size, 0]} castShadow>
                        <meshStandardMaterial {...materialProps} envMapIntensity={1.5} />
                    </mesh>

                    <mesh
                        geometry={gripGeometry}
                        position={[0, 0.55 * size, 0]}
                        castShadow
                        onPointerDown={handlePointerDown}
                    >
                        <meshStandardMaterial {...materialProps} envMapIntensity={1.5} />
                    </mesh>
                </group>
            </group>
        );
    }
);

GroundSwitch.displayName = 'GroundSwitch';

/**
 * Props for the PressurePlate component
 *
 * @property position - Position in 3D space [x, y, z]
 * @property size - Plate dimensions [width, height, depth]
 * @property activationDepth - How far plate must be pressed
 * @property springiness - Return spring strength
 * @property color - Default plate color
 * @property activeColor - Color when activated
 */
export interface PressurePlateProps extends InputControlEvents {
    position?: [number, number, number];
    size?: [number, number, number];
    activationDepth?: number;
    springiness?: number;
    color?: THREE.ColorRepresentation;
    activeColor?: THREE.ColorRepresentation;
}

/**
 * Ref interface for PressurePlate with pressure feedback
 */
export interface PressurePlateRef extends InputControlRef {
    setPressed: (pressed: boolean) => void;
    getPressure: () => number;
}

/**
 * Pressure-sensitive floor plate for weight-based puzzles and triggers.
 * Features spring-back animation and activation threshold.
 *
 * @example
 * ```tsx
 * // Door trigger
 * <PressurePlate
 *   position={[0, 0, 5]}
 *   onActivate={() => openDoor()}
 *   onDeactivate={() => closeDoor()}
 * />
 *
 * // Weighted puzzle plate
 * <PressurePlate
 *   position={[2, 0, 0]}
 *   size={[2, 0.2, 2]}
 *   activationDepth={0.15}
 *   color="#996633"
 *   activeColor="#669933"
 * />
 *
 * // Programmatic activation
 * const plateRef = useRef<PressurePlateRef>(null);
 * plateRef.current?.setPressed(true);
 * ```
 *
 * @param props - PressurePlateProps configuration
 * @returns React element containing the pressure plate
 */
export const PressurePlate = forwardRef<PressurePlateRef, PressurePlateProps>(
    (
        {
            position = [0, 0, 0],
            size = [1, 0.15, 1],
            activationDepth = 0.08,
            springiness = 12,
            color = '#aa4444',
            activeColor = '#44aa44',
            onActivate,
            onDeactivate,
            onAxisChange,
            onPress,
            onRelease,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const plateRef = useRef<THREE.Mesh>(null);
        const plateMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

        const currentDepth = useRef(0);
        const targetDepth = useRef(0);
        const isPressed = useRef(false);
        const isActivated = useRef(false);
        const haptics = useRef(new HapticFeedback());
        const worldPos = useRef(new THREE.Vector3());

        const baseGeometry = useMemo(() => {
            return new THREE.BoxGeometry(size[0] + 0.1, 0.05, size[2] + 0.1);
        }, [size]);

        const plateGeometry = useMemo(() => {
            const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
            geometry.translate(0, size[1] / 2, 0);
            return geometry;
        }, [size]);

        useImperativeHandle(ref, () => ({
            getAxis: () => ({ x: 0, y: currentDepth.current / activationDepth }),
            getWorldPosition: () => {
                if (groupRef.current) {
                    groupRef.current.getWorldPosition(worldPos.current);
                }
                return worldPos.current.clone();
            },
            isActive: () => isActivated.current,
            reset: () => {
                targetDepth.current = 0;
                isPressed.current = false;
                isActivated.current = false;
            },
            setPressed: (pressed: boolean) => {
                targetDepth.current = pressed ? activationDepth : 0;
            },
            getPressure: () => currentDepth.current / activationDepth,
        }));

        const handlePointerDown = useCallback(
            (e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                isPressed.current = true;
                targetDepth.current = activationDepth;
                haptics.current.lightImpact();

                if (groupRef.current) {
                    groupRef.current.getWorldPosition(worldPos.current);
                }

                onPress?.({
                    type: 'press',
                    axis: { x: 0, y: 0 },
                    force: 1,
                    worldPosition: worldPos.current.clone(),
                    timestamp: Date.now(),
                });
            },
            [activationDepth, onPress]
        );

        const handlePointerUp = useCallback(() => {
            if (!isPressed.current) return;
            isPressed.current = false;
            targetDepth.current = 0;
            haptics.current.selection();

            if (groupRef.current) {
                groupRef.current.getWorldPosition(worldPos.current);
            }

            onRelease?.({
                type: 'release',
                axis: { x: 0, y: 0 },
                force: 0,
                worldPosition: worldPos.current.clone(),
                timestamp: Date.now(),
            });
        }, [onRelease]);

        useEffect(() => {
            const handleGlobalUp = () => handlePointerUp();
            window.addEventListener('pointerup', handleGlobalUp);
            return () => window.removeEventListener('pointerup', handleGlobalUp);
        }, [handlePointerUp]);

        useFrame((state, delta) => {
            if (!plateRef.current || !groupRef.current) return;

            currentDepth.current +=
                (targetDepth.current - currentDepth.current) * delta * springiness;
            plateRef.current.position.y = -currentDepth.current;

            const wasActivated = isActivated.current;
            isActivated.current = currentDepth.current > activationDepth * 0.8;

            if (isActivated.current !== wasActivated) {
                groupRef.current.getWorldPosition(worldPos.current);

                if (isActivated.current) {
                    haptics.current.heavyImpact();
                    onActivate?.({
                        type: 'activate',
                        axis: { x: 0, y: 1 },
                        force: 1,
                        worldPosition: worldPos.current.clone(),
                        timestamp: Date.now(),
                    });
                } else {
                    haptics.current.pulse();
                    onDeactivate?.({
                        type: 'deactivate',
                        axis: { x: 0, y: 0 },
                        force: 0,
                        worldPosition: worldPos.current.clone(),
                        timestamp: Date.now(),
                    });
                }
            }

            if (plateMaterialRef.current) {
                const targetColor = isActivated.current ? activeColor : color;
                plateMaterialRef.current.color.lerp(new THREE.Color(targetColor), delta * 8);
                plateMaterialRef.current.emissiveIntensity = isActivated.current ? 0.3 : 0;
            }

            onAxisChange?.(
                { x: 0, y: currentDepth.current / activationDepth },
                worldPos.current.clone()
            );
        });

        return (
            <group ref={groupRef} position={position}>
                <mesh geometry={baseGeometry} position={[0, -0.03, 0]} receiveShadow>
                    <meshStandardMaterial color="#222222" roughness={0.9} />
                </mesh>

                <mesh
                    ref={plateRef}
                    geometry={plateGeometry}
                    castShadow
                    receiveShadow
                    onPointerDown={handlePointerDown}
                >
                    <meshStandardMaterial
                        ref={plateMaterialRef}
                        color={color}
                        roughness={0.6}
                        metalness={0.2}
                        emissive={activeColor}
                        emissiveIntensity={0}
                    />
                </mesh>
            </group>
        );
    }
);

PressurePlate.displayName = 'PressurePlate';

/**
 * Props for the WallButton component
 *
 * @property position - Position in 3D space [x, y, z]
 * @property rotation - Rotation angles [x, y, z]
 * @property size - Button size multiplier
 * @property type - 'momentary' returns on release, 'toggle' stays pressed
 * @property color - Default button color
 * @property activeColor - Color when pressed/active
 * @property housingColor - Color of the button housing
 */
export interface WallButtonProps extends InputControlEvents {
    position?: [number, number, number];
    rotation?: [number, number, number];
    size?: number;
    type?: 'momentary' | 'toggle';
    color?: THREE.ColorRepresentation;
    activeColor?: THREE.ColorRepresentation;
    housingColor?: THREE.ColorRepresentation;
}

/**
 * Ref interface for WallButton with programmatic control
 */
export interface WallButtonRef extends InputControlRef {
    press: () => void;
    setActive: (active: boolean) => void;
}

/**
 * Wall-mounted push button for doors, elevators, and machinery.
 * Supports both momentary and toggle modes with visual feedback.
 *
 * @example
 * ```tsx
 * // Elevator call button
 * <WallButton
 *   position={[5, 1.2, 0]}
 *   rotation={[0, Math.PI / 2, 0]}
 *   onPress={() => callElevator()}
 * />
 *
 * // Toggle light switch
 * <WallButton
 *   position={[0, 1.5, -3]}
 *   type="toggle"
 *   onActivate={() => lightsOn()}
 *   onDeactivate={() => lightsOff()}
 * />
 *
 * // Emergency stop button
 * <WallButton
 *   position={[2, 1, 0]}
 *   size={1.5}
 *   color="#ff0000"
 *   activeColor="#00ff00"
 *   housingColor="#ffff00"
 * />
 * ```
 *
 * @param props - WallButtonProps configuration
 * @returns React element containing the wall button
 */
export const WallButton = forwardRef<WallButtonRef, WallButtonProps>(
    (
        {
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            size = 0.3,
            type = 'momentary',
            color = '#cc3333',
            activeColor = '#33cc33',
            housingColor = '#444444',
            onActivate,
            onDeactivate,
            onAxisChange,
            onPress,
            onRelease,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const buttonRef = useRef<THREE.Mesh>(null);
        const buttonMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

        const isActive = useRef(false);
        const buttonDepth = useRef(0);
        const targetDepth = useRef(0);
        const isPressed = useRef(false);
        const haptics = useRef(new HapticFeedback());
        const worldPos = useRef(new THREE.Vector3());

        const housingGeometry = useMemo(() => {
            return new THREE.CylinderGeometry(size * 0.7, size * 0.8, size * 0.4, 32);
        }, [size]);

        const buttonGeometry = useMemo(() => {
            return new THREE.CylinderGeometry(size * 0.5, size * 0.55, size * 0.25, 32);
        }, [size]);

        const rimGeometry = useMemo(() => {
            return new THREE.TorusGeometry(size * 0.6, size * 0.08, 16, 32);
        }, [size]);

        useImperativeHandle(ref, () => ({
            getAxis: () => ({ x: 0, y: isActive.current ? 1 : 0 }),
            getWorldPosition: () => {
                if (groupRef.current) {
                    groupRef.current.getWorldPosition(worldPos.current);
                }
                return worldPos.current.clone();
            },
            isActive: () => isActive.current,
            reset: () => {
                isActive.current = false;
                targetDepth.current = 0;
            },
            press: () => {
                if (type === 'toggle') {
                    isActive.current = !isActive.current;
                } else {
                    isActive.current = true;
                    setTimeout(() => {
                        isActive.current = false;
                        targetDepth.current = 0;
                    }, 200);
                }
                targetDepth.current = size * 0.15;
                haptics.current.heavyImpact();
            },
            setActive: (active: boolean) => {
                isActive.current = active;
                targetDepth.current = active ? size * 0.15 : 0;
            },
        }));

        const handlePointerDown = useCallback(
            (e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                isPressed.current = true;
                targetDepth.current = size * 0.15;
                haptics.current.lightImpact();

                if (groupRef.current) {
                    groupRef.current.getWorldPosition(worldPos.current);
                }

                if (type === 'toggle') {
                    isActive.current = !isActive.current;
                } else {
                    isActive.current = true;
                }

                onPress?.({
                    type: 'press',
                    axis: { x: 0, y: 1 },
                    force: 1,
                    worldPosition: worldPos.current.clone(),
                    timestamp: Date.now(),
                });

                if (isActive.current) {
                    haptics.current.heavyImpact();
                    onActivate?.({
                        type: 'activate',
                        axis: { x: 0, y: 1 },
                        force: 1,
                        worldPosition: worldPos.current.clone(),
                        timestamp: Date.now(),
                    });
                } else {
                    onDeactivate?.({
                        type: 'deactivate',
                        axis: { x: 0, y: 0 },
                        force: 0,
                        worldPosition: worldPos.current.clone(),
                        timestamp: Date.now(),
                    });
                }
            },
            [size, type, onPress, onActivate, onDeactivate]
        );

        const handlePointerUp = useCallback(() => {
            if (!isPressed.current) return;
            isPressed.current = false;

            if (type === 'momentary') {
                isActive.current = false;
                targetDepth.current = 0;

                onDeactivate?.({
                    type: 'deactivate',
                    axis: { x: 0, y: 0 },
                    force: 0,
                    worldPosition: worldPos.current.clone(),
                    timestamp: Date.now(),
                });
            }

            haptics.current.selection();

            onRelease?.({
                type: 'release',
                axis: { x: 0, y: isActive.current ? 1 : 0 },
                force: 0,
                worldPosition: worldPos.current.clone(),
                timestamp: Date.now(),
            });
        }, [type, onDeactivate, onRelease]);

        useEffect(() => {
            const handleGlobalUp = () => handlePointerUp();
            window.addEventListener('pointerup', handleGlobalUp);
            return () => window.removeEventListener('pointerup', handleGlobalUp);
        }, [handlePointerUp]);

        useFrame((state, delta) => {
            if (!buttonRef.current || !groupRef.current) return;

            const springSpeed = 15;
            buttonDepth.current +=
                (targetDepth.current - buttonDepth.current) * delta * springSpeed;
            buttonRef.current.position.y = size * 0.2 - buttonDepth.current;

            if (buttonMaterialRef.current) {
                const targetColor = isActive.current ? activeColor : color;
                buttonMaterialRef.current.color.lerp(new THREE.Color(targetColor), delta * 10);
                buttonMaterialRef.current.emissive.lerp(
                    new THREE.Color(isActive.current ? activeColor : '#000000'),
                    delta * 10
                );
                buttonMaterialRef.current.emissiveIntensity = isActive.current ? 0.5 : 0;
            }

            groupRef.current.getWorldPosition(worldPos.current);
            onAxisChange?.(
                { x: 0, y: buttonDepth.current / (size * 0.15) },
                worldPos.current.clone()
            );
        });

        return (
            <group ref={groupRef} position={position} rotation={rotation}>
                <mesh geometry={housingGeometry} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
                    <meshStandardMaterial color={housingColor} roughness={0.7} metalness={0.3} />
                </mesh>

                <mesh
                    geometry={rimGeometry}
                    position={[0, size * 0.2, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <meshStandardMaterial color="#666666" roughness={0.4} metalness={0.7} />
                </mesh>

                <mesh
                    ref={buttonRef}
                    geometry={buttonGeometry}
                    position={[0, size * 0.2, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    castShadow
                    onPointerDown={handlePointerDown}
                >
                    <meshStandardMaterial
                        ref={buttonMaterialRef}
                        color={color}
                        roughness={0.4}
                        metalness={0.5}
                        emissive={activeColor}
                        emissiveIntensity={0}
                    />
                </mesh>
            </group>
        );
    }
);

WallButton.displayName = 'WallButton';

/**
 * Trigger shape options for TriggerComposer
 */
export type TriggerShape = 'box' | 'sphere' | 'cylinder' | 'custom';

/**
 * Trigger behavior modes
 */
export type TriggerBehavior = 'momentary' | 'toggle' | 'axis' | 'pressure';

/**
 * Configuration for trigger geometry
 */
export interface TriggerConfig {
    shape: TriggerShape;
    size?: [number, number, number] | number;
    segments?: number;
    customGeometry?: THREE.BufferGeometry;
}

/**
 * Configuration for trigger material appearance
 */
export interface TriggerMaterialConfig {
    color?: THREE.ColorRepresentation;
    activeColor?: THREE.ColorRepresentation;
    roughness?: number;
    metalness?: number;
    emissiveIntensity?: number;
}

/**
 * Configuration for trigger behavior
 */
export interface TriggerBehaviorConfig {
    type: TriggerBehavior;
    axis?: 'x' | 'y' | 'z';
    threshold?: number;
    springiness?: number;
    returnSpeed?: number;
}

/**
 * Props for the TriggerComposer component
 */
export interface TriggerComposerProps extends InputControlEvents {
    position?: [number, number, number];
    rotation?: [number, number, number];
    shapeConfig: TriggerConfig;
    materialConfig?: TriggerMaterialConfig;
    behaviorConfig?: TriggerBehaviorConfig;
}

/**
 * Ref interface for TriggerComposer
 */
export interface TriggerComposerRef extends InputControlRef {
    setValue: (value: number) => void;
    getMesh: () => THREE.Mesh | null;
}

/**
 * Composable trigger builder for creating custom interactive controls.
 * Combine shape, material, and behavior configurations for unique triggers.
 *
 * @example
 * ```tsx
 * // Custom sphere button
 * <TriggerComposer
 *   shapeConfig={{ shape: 'sphere', size: 0.5 }}
 *   materialConfig={{ color: '#0066ff', activeColor: '#00ff66' }}
 *   behaviorConfig={{ type: 'toggle' }}
 *   onActivate={() => console.log('Activated!')}
 * />
 *
 * // Pressure-sensitive cylinder
 * <TriggerComposer
 *   shapeConfig={{ shape: 'cylinder', size: [0.3, 0.8, 0.3] }}
 *   behaviorConfig={{ type: 'pressure', springiness: 20 }}
 *   onAxisChange={(axis) => setForce(axis.y)}
 * />
 *
 * // Custom geometry trigger
 * <TriggerComposer
 *   shapeConfig={{ shape: 'custom', customGeometry: starGeometry }}
 *   materialConfig={{ metalness: 0.9, roughness: 0.1 }}
 *   behaviorConfig={{ type: 'momentary' }}
 * />
 * ```
 *
 * @param props - TriggerComposerProps configuration
 * @returns React element containing the composed trigger
 */
export const TriggerComposer = forwardRef<TriggerComposerRef, TriggerComposerProps>(
    (
        {
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            shapeConfig,
            materialConfig = {},
            behaviorConfig = { type: 'momentary' },
            onActivate,
            onDeactivate,
            onAxisChange,
            onPress,
            onRelease,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const meshRef = useRef<THREE.Mesh>(null);
        const materialRef = useRef<THREE.MeshStandardMaterial>(null);

        const currentValue = useRef(0);
        const targetValue = useRef(0);
        const isActive = useRef(false);
        const isPressed = useRef(false);
        const haptics = useRef(new HapticFeedback());
        const worldPos = useRef(new THREE.Vector3());

        const {
            color = '#888888',
            activeColor = '#00ff00',
            roughness = 0.5,
            metalness = 0.5,
            emissiveIntensity = 0.3,
        } = materialConfig;

        const {
            type: behaviorType = 'momentary',
            threshold = 0.5,
            springiness = 12,
            returnSpeed = 8,
        } = behaviorConfig;

        const geometry = useMemo(() => {
            if (shapeConfig.customGeometry) {
                return shapeConfig.customGeometry;
            }

            const s = shapeConfig.size ?? 1;
            const size = Array.isArray(s) ? s : [s, s, s];
            const segments = shapeConfig.segments ?? 16;

            switch (shapeConfig.shape) {
                case 'sphere':
                    return new THREE.SphereGeometry(size[0] / 2, segments, segments);
                case 'cylinder':
                    return new THREE.CylinderGeometry(size[0] / 2, size[0] / 2, size[1], segments);
                case 'box':
                default:
                    return new THREE.BoxGeometry(size[0], size[1], size[2]);
            }
        }, [shapeConfig]);

        useImperativeHandle(ref, () => ({
            getAxis: () => {
                const axis = behaviorConfig.axis ?? 'y';
                if (axis === 'x') return { x: currentValue.current, y: 0 };
                if (axis === 'z') return { x: 0, y: currentValue.current };
                return { x: 0, y: currentValue.current };
            },
            getWorldPosition: () => {
                if (groupRef.current) {
                    groupRef.current.getWorldPosition(worldPos.current);
                }
                return worldPos.current.clone();
            },
            isActive: () => isActive.current,
            reset: () => {
                targetValue.current = 0;
                isActive.current = false;
            },
            setValue: (value: number) => {
                targetValue.current = Math.max(-1, Math.min(1, value));
            },
            getMesh: () => meshRef.current,
        }));

        const handlePointerDown = useCallback(
            (e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                isPressed.current = true;
                haptics.current.lightImpact();

                if (groupRef.current) {
                    groupRef.current.getWorldPosition(worldPos.current);
                }

                if (behaviorType === 'toggle') {
                    isActive.current = !isActive.current;
                    targetValue.current = isActive.current ? 1 : 0;
                } else if (behaviorType === 'momentary' || behaviorType === 'pressure') {
                    isActive.current = true;
                    targetValue.current = 1;
                }

                onPress?.({
                    type: 'press',
                    axis: { x: 0, y: currentValue.current },
                    force: 1,
                    worldPosition: worldPos.current.clone(),
                    timestamp: Date.now(),
                });

                if (isActive.current) {
                    haptics.current.heavyImpact();
                    onActivate?.({
                        type: 'activate',
                        axis: { x: 0, y: 1 },
                        force: 1,
                        worldPosition: worldPos.current.clone(),
                        timestamp: Date.now(),
                    });
                }
            },
            [behaviorType, onPress, onActivate]
        );

        const handlePointerUp = useCallback(() => {
            if (!isPressed.current) return;
            isPressed.current = false;

            if (behaviorType === 'momentary' || behaviorType === 'pressure') {
                isActive.current = false;
                targetValue.current = 0;

                onDeactivate?.({
                    type: 'deactivate',
                    axis: { x: 0, y: 0 },
                    force: 0,
                    worldPosition: worldPos.current.clone(),
                    timestamp: Date.now(),
                });
            }

            haptics.current.selection();

            onRelease?.({
                type: 'release',
                axis: { x: 0, y: isActive.current ? 1 : 0 },
                force: 0,
                worldPosition: worldPos.current.clone(),
                timestamp: Date.now(),
            });
        }, [behaviorType, onDeactivate, onRelease]);

        useEffect(() => {
            const handleGlobalUp = () => handlePointerUp();
            window.addEventListener('pointerup', handleGlobalUp);
            return () => window.removeEventListener('pointerup', handleGlobalUp);
        }, [handlePointerUp]);

        useFrame((state, delta) => {
            if (!meshRef.current || !groupRef.current) return;

            const speed = isPressed.current ? springiness : returnSpeed;
            currentValue.current += (targetValue.current - currentValue.current) * delta * speed;

            if (materialRef.current) {
                const targetColorObj = new THREE.Color(isActive.current ? activeColor : color);
                materialRef.current.color.lerp(targetColorObj, delta * 8);
                materialRef.current.emissive.lerp(
                    new THREE.Color(isActive.current ? activeColor : '#000000'),
                    delta * 8
                );
                materialRef.current.emissiveIntensity = isActive.current ? emissiveIntensity : 0;
            }

            groupRef.current.getWorldPosition(worldPos.current);
            onAxisChange?.({ x: 0, y: currentValue.current }, worldPos.current.clone());
        });

        return (
            <group ref={groupRef} position={position} rotation={rotation}>
                <mesh
                    ref={meshRef}
                    geometry={geometry}
                    castShadow
                    receiveShadow
                    onPointerDown={handlePointerDown}
                >
                    <meshStandardMaterial
                        ref={materialRef}
                        color={color}
                        roughness={roughness}
                        metalness={metalness}
                        emissive={activeColor}
                        emissiveIntensity={0}
                    />
                </mesh>
            </group>
        );
    }
);

TriggerComposer.displayName = 'TriggerComposer';

export type { InputAxis, InputEvent, DragState };
