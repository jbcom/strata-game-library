import type { PropRuntimeNode, RuntimeVector3Tuple } from '@strata-game-library/core/compose';
import { useEffect, useMemo } from 'react';
import {
  BoxGeometry,
  type BufferGeometry,
  CapsuleGeometry,
  CylinderGeometry,
  SphereGeometry,
} from 'three';

export interface RuntimeGeometryProps {
  shape: PropRuntimeNode['shape'] | 'custom';
  size: RuntimeVector3Tuple;
}

type RuntimeAxis = 'x' | 'y' | 'z';

function capsuleDimensions(size: RuntimeVector3Tuple): {
  axis: RuntimeAxis;
  radius: number;
  cylinderLength: number;
} {
  const axes: Array<{ axis: RuntimeAxis; diameter: number }> = [
    { axis: 'x', diameter: Math.max(0, size[0]) },
    { axis: 'y', diameter: Math.max(0, size[1]) },
    { axis: 'z', diameter: Math.max(0, size[2]) },
  ];

  axes.sort((a, b) => b.diameter - a.diameter);

  const [longest, crossA, crossB] = axes;
  const radius = ((crossA?.diameter ?? 0) + (crossB?.diameter ?? 0)) / 4;

  return {
    axis: longest?.axis ?? 'y',
    radius,
    cylinderLength: Math.max(0, (longest?.diameter ?? 0) - 2 * radius),
  };
}

/**
 * Creates a Three.js primitive geometry for an adapter-neutral runtime shape descriptor.
 */
export function createRuntimeGeometry(
  shape: RuntimeGeometryProps['shape'],
  size: RuntimeVector3Tuple
): BufferGeometry {
  const [x, y, z] = size;

  switch (shape) {
    case 'sphere':
      return new SphereGeometry(Math.max(x, y, z) / 2, 24, 16);
    case 'cylinder':
      return new CylinderGeometry(x / 2, z / 2, y, 24);
    case 'capsule': {
      const dimensions = capsuleDimensions(size);
      const geometry = new CapsuleGeometry(dimensions.radius, dimensions.cylinderLength, 8, 16);

      if (dimensions.axis === 'x') {
        geometry.rotateZ(-Math.PI / 2);
      } else if (dimensions.axis === 'z') {
        geometry.rotateX(Math.PI / 2);
      }

      return geometry;
    }
    case 'box':
    case 'mesh':
    case 'custom':
      return new BoxGeometry(x, y, z);
  }
}

/**
 * Renders a primitive geometry for an adapter-neutral runtime shape descriptor.
 */
export function RuntimeGeometry({ shape, size }: RuntimeGeometryProps) {
  const geometry = useMemo(
    () => createRuntimeGeometry(shape, size),
    [shape, size[0], size[1], size[2]]
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return <primitive object={geometry} attach="geometry" />;
}
