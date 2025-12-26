import { type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { HapticFeedback } from '../../core/input';
import type { GroundSwitchProps, GroundSwitchRef } from './types';

/**
 * Industrial Ground Lever Switch.
 *
 * Provides a physically-interactive ground switch with snapping behavior.
 * Ideal for mechanical puzzles, railway systems, and heavy machinery controls.
 *
 * @category UI & Interaction
 * @example
 * ```tsx
 * <GroundSwitch
 *   axis="z"
 *   material="brass"
 *   onActivate={() => openHatch()}
 * />
 * ```
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

        useFrame((_state, delta) => {
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
