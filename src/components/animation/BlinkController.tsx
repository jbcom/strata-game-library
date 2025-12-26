import { useFrame } from '@react-three/fiber';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import type * as THREE from 'three';
import type { BlinkControllerProps, BlinkControllerRef } from './types';

/**
 * Natural Blink Controller for characters.
 *
 * Automatically triggers procedural blinking on eye objects at random intervals.
 * Correctly handles eye closing/opening phases and manual triggers.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <BlinkController
 *   leftEyeRef={leftEyeRef}
 *   rightEyeRef={rightEyeRef}
 *   minInterval={3}
 *   maxInterval={8}
 * />
 * ```
 */
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

        return <group>{children}</group>;
    }
);

BlinkController.displayName = 'BlinkController';
