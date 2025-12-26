import { type ThreeEvent, useFrame } from '@react-three/fiber';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { HapticFeedback } from '../../core/input';
import type { TriggerComposerProps, TriggerComposerRef } from './types';

/**
 * Composable 3D Trigger System.
 *
 * Allows for the creation of custom interactive controls by combining geometric
 * shapes, visual styles, and interaction behaviors (momentary, toggle, axis, pressure).
 *
 * @category UI & Interaction
 * @example
 * ```tsx
 * <TriggerComposer
 *   shapeConfig={{ shape: 'sphere', size: 0.5 }}
 *   behaviorConfig={{ type: 'toggle' }}
 *   materialConfig={{ color: 'blue', activeColor: 'cyan' }}
 * />
 * ```
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

        useFrame((_state, delta) => {
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
