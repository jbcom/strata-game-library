import { type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { HapticFeedback, type InputAxis, type InputEvent } from '../../core/input';
import type { Joystick3DProps, Joystick3DRef } from './types';

/**
 * Immersive 3D Joystick.
 *
 * Provides a physically-modeled 3D joystick with real depth, shadows, and
 * haptic feedback support. Replaces standard 2D joystick overlays for a
 * more integrated feel in VR or 3D desktop applications.
 *
 * @category UI & Interaction
 * @example
 * ```tsx
 * <Joystick3D
 *   onAxisChange={(axis) => movePlayer(axis)}
 *   knobColor="red"
 *   size={1.5}
 * />
 * ```
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

        useFrame((_state, delta) => {
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
