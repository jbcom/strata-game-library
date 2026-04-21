import type { PropRuntimeNode, RuntimeVector3Tuple } from '@strata-game-library/core/compose';
import type React from 'react';

export interface RuntimeGeometryProps {
  shape: PropRuntimeNode['shape'] | 'custom';
  size: RuntimeVector3Tuple;
}

/**
 * Renders a primitive geometry for an adapter-neutral runtime shape descriptor.
 */
export const RuntimeGeometry: React.FC<RuntimeGeometryProps> = ({ shape, size }) => {
  const [x, y, z] = size;

  switch (shape) {
    case 'sphere':
      return <sphereGeometry args={[Math.max(x, y, z) / 2, 24, 16]} />;
    case 'cylinder':
      return <cylinderGeometry args={[x / 2, z / 2, y, 24]} />;
    case 'capsule': {
      const radius = (x + z) / 4;
      const length = Math.max(0, y - 2 * radius);
      return <capsuleGeometry args={[radius, length, 8, 16]} />;
    }
    case 'box':
    case 'mesh':
    case 'custom':
      return <boxGeometry args={size} />;
  }
};
