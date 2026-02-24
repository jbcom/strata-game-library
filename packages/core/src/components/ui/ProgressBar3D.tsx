import { useFrame, useThree } from '@react-three/fiber';
import type React from 'react';
import { useRef } from 'react';
import type * as THREE from 'three';
import { clampProgress } from '../../core/ui';
import type { ProgressBar3DProps } from './types';

/**
 * Physical 3D Progress Bar.
 *
 * Renders a progress bar as a 3D geometry rather than an HTML overlay.
 * Ideal for world-space indicators that need to receive lighting and shadows.
 *
 * @category UI & Interaction
 * @example
 * ```tsx
 * <ProgressBar3D
 *   value={50}
 *   maxValue={100}
 *   width={2}
 *   billboard
 * />
 * ```
 */
export const ProgressBar3D: React.FC<ProgressBar3DProps> = ({
  value,
  maxValue,
  width = 1,
  height = 0.1,
  depth = 0.05,
  fillColor = '#4ade80',
  backgroundColor = '#1f2937',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  billboard = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (billboard && groupRef.current) {
      groupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  const percentage = clampProgress(value, maxValue) / maxValue;
  const fillWidth = width * percentage;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial color={backgroundColor} />
      </mesh>
      <mesh position={[-(width - fillWidth) / 2, 0, depth / 2 + 0.001]}>
        <boxGeometry args={[fillWidth, height, 0.001]} />
        <meshBasicMaterial color={fillColor} />
      </mesh>
    </group>
  );
};
