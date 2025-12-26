import { useFrame } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type * as THREE from 'three';
import type { BreathingAnimationProps, BreathingAnimationRef } from './types';

/**
 * Organic Breathing Animation.
 *
 * Simulates a breathing rhythm by pulsing an object's position or scale.
 * Ideal for characters, living environments, or UI highlights.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <BreathingAnimation
 *   amplitude={0.05}
 *   frequency={0.5}
 *   axis="scale"
 * >
 *   <IdleCharacter />
 * </BreathingAnimation>
 * ```
 */
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
