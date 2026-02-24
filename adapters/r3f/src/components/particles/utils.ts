import type * as THREE from 'three';
import { Vector3 } from 'three';

/**
 * Normalizes a position/velocity value to a Three.js Vector3.
 * @internal
 */
export function toVector3(
  value: [number, number, number] | THREE.Vector3 | undefined,
  defaultValue: THREE.Vector3
): THREE.Vector3 {
  if (!value) return defaultValue;
  if (value instanceof Vector3) return value.clone();
  return new Vector3(value[0], value[1], value[2]);
}
