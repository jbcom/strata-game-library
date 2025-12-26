import { type ThreeEvent, useFrame } from '@react-three/fiber';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { HapticFeedback } from '../../core/input';
import type { PressurePlateProps, PressurePlateRef } from './types';

/**
 * Pressure-Sensitive Floor Plate.
 *
 * Provides a physically-interactive floor plate that reacts to weight or clicking.
 * Ideal for hidden traps, door mechanisms, and weight-based puzzle interactions.
 *
 * @category UI & Interaction
 * @example
 * ```tsx
 * <PressurePlate
 *   onActivate={() => triggerTrap()}
 *   activeColor="red"
 * />
 * ```
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

        useFrame((_state, delta) => {
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
