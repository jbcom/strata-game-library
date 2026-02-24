import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type React from 'react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type * as THREE from 'three';
import { calculateFade } from '../../core/ui';
import type { NameplateProps, NameplateRef } from './types';

/**
 * Character Identity Nameplate.
 *
 * Renders a floating UI element above characters with their name, title,
 * level, and health status. Features distance-based auto-fading.
 *
 * @category UI & Interaction
 * @example
 * ```tsx
 * <Nameplate
 *   name="Guard Captain"
 *   level={45}
 *   guild="Royal Guard"
 *   healthBar={{ value: 100, maxValue: 100 }}
 * />
 * ```
 */
export const Nameplate = forwardRef<NameplateRef, NameplateProps>(
  (
    {
      name = 'Unknown',
      title,
      level,
      healthBar,
      guild,
      nameColor = '#ffffff',
      titleColor = '#a8a29e',
      backgroundColor = 'rgba(0, 0, 0, 0.5)',
      showHealthBar = true,
      showLevel = true,
      fadeStart = 15,
      fadeEnd = 25,
      position = [0, 0, 0],
      offset = [0, 0],
      occlude = true,
      className,
      style,
    },
    ref
  ) => {
    const { camera } = useThree();
    const groupRef = useRef<THREE.Group>(null);
    const [opacity, setOpacity] = useState(1);
    const [currentName, setCurrentName] = useState(name);
    const [health, setHealth] = useState({
      value: healthBar?.value ?? 100,
      maxValue: healthBar?.maxValue ?? 100,
    });

    useFrame(() => {
      if (groupRef.current) {
        const distance = groupRef.current.position.distanceTo(camera.position);
        const fade = calculateFade(distance, fadeStart, fadeEnd);
        setOpacity(fade);
      }
    });

    useImperativeHandle(ref, () => ({
      setName: (newName: string) => setCurrentName(newName),
      setHealth: (value: number, maxValue: number) => setHealth({ value, maxValue }),
    }));

    const containerStyle: React.CSSProperties = {
      padding: '4px 8px',
      backgroundColor,
      borderRadius: 4,
      opacity,
      textAlign: 'center',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      ...style,
    };

    const percentage = (health.value / health.maxValue) * 100;

    return (
      <group ref={groupRef} position={position}>
        <Html
          center
          occlude={occlude}
          style={{ transform: `translate(${offset[0]}px, ${offset[1]}px)` }}
          className={className}
        >
          <div style={containerStyle}>
            {showLevel && level !== undefined && (
              <span style={{ color: '#fbbf24', marginRight: 4, fontSize: 12 }}>Lv.{level}</span>
            )}
            <span style={{ color: nameColor, fontWeight: 'bold', fontSize: 14 }}>
              {currentName}
            </span>
            {title && <div style={{ color: titleColor, fontSize: 11 }}>{title}</div>}
            {guild && <div style={{ color: '#60a5fa', fontSize: 11 }}>&lt;{guild}&gt;</div>}
            {showHealthBar && (
              <div
                style={{
                  marginTop: 4,
                  height: 6,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor:
                      percentage > 50 ? '#4ade80' : percentage > 25 ? '#fbbf24' : '#ef4444',
                    transition: 'width 0.3s ease-out',
                  }}
                />
              </div>
            )}
          </div>
        </Html>
      </group>
    );
  }
);

Nameplate.displayName = 'Nameplate';
