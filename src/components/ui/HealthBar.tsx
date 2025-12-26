import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type React from 'react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type * as THREE from 'three';
import { calculateFade, clampProgress, easeOutCubic, lerp } from '../../core/ui';
import type { HealthBarProps, HealthBarRef } from './types';

/**
 * Immersive HTML-Based Health Bar.
 *
 * Renders a stylized health or progress bar in 3D space. Features smooth
 * animations, segmented display, and automatic distance-based fading.
 *
 * @category UI & Interaction
 * @example
 * ```tsx
 * <HealthBar
 *   value={75}
 *   maxValue={100}
 *   fillColor="#ff0000"
 *   segments={5}
 * />
 * ```
 */
export const HealthBar = forwardRef<HealthBarRef, HealthBarProps>(
    (
        {
            value = 100,
            maxValue = 100,
            width = 100,
            height = 10,
            backgroundColor = 'rgba(0, 0, 0, 0.7)',
            fillColor = '#4ade80',
            borderColor = 'rgba(255, 255, 255, 0.3)',
            borderWidth = 1,
            borderRadius = 2,
            showText: _showText = false,
            textFormat: _textFormat = 'percentage',
            animationDuration = 300,
            segments,
            glowColor,
            glowIntensity = 0.5,
            position = [0, 0, 0],
            offset = [0, 0],
            occlude = true,
            distanceFade,
            className,
            style,
        },
        ref
    ) => {
        const [displayValue, setDisplayValue] = useState(value);
        const [isFlashing, setIsFlashing] = useState(false);
        const animationRef = useRef<number>(undefined);
        const startValueRef = useRef(value);
        const startTimeRef = useRef(0);
        const { camera } = useThree();
        const groupRef = useRef<THREE.Group>(null);
        const [opacity, setOpacity] = useState(1);

        useEffect(() => {
            startValueRef.current = displayValue;
            startTimeRef.current = performance.now();

            const animate = () => {
                const elapsed = performance.now() - startTimeRef.current;
                const progress = Math.min(elapsed / animationDuration, 1);
                const eased = easeOutCubic(progress);
                const newValue = lerp(startValueRef.current, value, eased);
                setDisplayValue(newValue);

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                }
            };

            animationRef.current = requestAnimationFrame(animate);

            return () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
            };
        }, [value, animationDuration, displayValue]);

        useFrame(() => {
            if (distanceFade && groupRef.current) {
                const distance = groupRef.current.position.distanceTo(camera.position);
                const fade = calculateFade(distance, distanceFade.start, distanceFade.end);
                setOpacity(fade);
            }
        });

        useImperativeHandle(ref, () => ({
            setValue: (newValue: number) => setDisplayValue(newValue),
            setMaxValue: () => {},
            flash: () => {
                setIsFlashing(true);
                setTimeout(() => setIsFlashing(false), 200);
            },
        }));

        const percentage = (clampProgress(displayValue, maxValue) / maxValue) * 100;

        const containerStyle: React.CSSProperties = {
            width,
            height,
            backgroundColor,
            border: `${borderWidth}px solid ${borderColor}`,
            borderRadius,
            position: 'relative',
            overflow: 'hidden',
            opacity,
            transition: isFlashing ? 'none' : undefined,
            filter: isFlashing ? 'brightness(1.5)' : undefined,
            boxShadow: glowColor ? `0 0 ${glowIntensity * 20}px ${glowColor}` : undefined,
            ...style,
        };

        const fillStyle: React.CSSProperties = {
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: fillColor,
            transition: `width ${animationDuration}ms ease-out`,
            position: 'absolute',
            left: 0,
            top: 0,
        };

        return (
            <group ref={groupRef} position={position}>
                <Html
                    center
                    occlude={occlude}
                    style={{ transform: `translate(${offset[0]}px, ${offset[1]}px)` }}
                    className={className}
                >
                    <div style={containerStyle}>
                        {segments ? (
                            <div style={{ display: 'flex', height: '100%', gap: 1 }}>
                                {Array.from({ length: segments }).map((_, i) => {
                                    const segmentPercentage = ((i + 1) / segments) * 100;
                                    const isFilled = percentage >= segmentPercentage;
                                    return (
                                        <div
                                            key={`segment-${i}-${segments}`}
                                            style={{
                                                flex: 1,
                                                backgroundColor: isFilled
                                                    ? fillColor
                                                    : 'transparent',
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={fillStyle} />
                        )}
                    </div>
                </Html>
            </group>
        );
    }
);

HealthBar.displayName = 'HealthBar';
