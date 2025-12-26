import { type ThreeEvent, useFrame } from '@react-three/fiber';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { HapticFeedback } from '../../core/input';
import type { WallButtonProps, WallButtonRef } from './types';

/**
 * Wall-Mounted Push Button.
 *
 * Provides a physically-interactive button for walls or control panels.
 * Supports both momentary and toggle behaviors with visual and haptic feedback.
 *
 * @category UI & Interaction
 * @example
 * ```tsx
 * <WallButton
 *   type="toggle"
 *   onActivate={() => openDoor()}
 *   color="red"
 *   activeColor="green"
 * />
 * ```
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

        useFrame((_state, delta) => {
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
