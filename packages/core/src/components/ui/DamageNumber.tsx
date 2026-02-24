import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type React from 'react';
import { useRef, useState } from 'react';
import { easeOutCubic, formatNumber, getDamageNumberColor } from '../../core/ui';
import type { DamageNumberProps } from './types';

/**
 * Animated Damage Number.
 *
 * Renders a floating, animated number in 3D space to signify damage, healing,
 * or other status changes. Supports critical hit scaling and color presets.
 *
 * @category UI & Interaction
 * @example
 * ```tsx
 * <DamageNumber
 *   value={150}
 *   type="critical"
 *   position={[0, 2, 0]}
 *   onComplete={() => removeNumber()}
 * />
 * ```
 */
export const DamageNumber: React.FC<DamageNumberProps> = ({
  value = 0,
  type = 'normal',
  color,
  fontSize = 24,
  fontFamily = 'Impact, sans-serif',
  fontWeight = 'bold',
  duration = 1500,
  floatDistance = 60,
  fadeStart = 0.5,
  scale = 1,
  randomOffset = 20,
  position,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(performance.now());
  const offsetRef = useRef({
    x: (Math.random() - 0.5) * randomOffset,
    y: 0,
  });

  useFrame(() => {
    const elapsed = performance.now() - startTimeRef.current;
    const newProgress = Math.min(elapsed / duration, 1);
    setProgress(newProgress);

    if (newProgress >= 1 && onComplete) {
      onComplete();
    }
  });

  const displayColor = color || getDamageNumberColor(type);
  const y = offsetRef.current.y - easeOutCubic(progress) * floatDistance;
  const opacity = progress > fadeStart ? 1 - (progress - fadeStart) / (1 - fadeStart) : 1;
  const currentScale = type === 'critical' ? scale * (1 + (1 - progress) * 0.5) : scale;

  const textStyle: React.CSSProperties = {
    color: displayColor,
    fontSize: fontSize * currentScale,
    fontFamily,
    fontWeight,
    textShadow: `
            -2px -2px 0 #000,
            2px -2px 0 #000,
            -2px 2px 0 #000,
            2px 2px 0 #000,
            0 0 10px ${displayColor}
        `,
    opacity,
    pointerEvents: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  return (
    <group position={position}>
      <Html
        center
        style={{
          transform: `translate(${offsetRef.current.x}px, ${y}px)`,
        }}
      >
        <div style={textStyle}>
          {type === 'miss' ? 'MISS' : type === 'block' ? 'BLOCKED' : formatNumber(Math.abs(value))}
          {type === 'critical' && '!'}
          {type === 'heal' && ' +'}
        </div>
      </Html>
    </group>
  );
};
