import { useFrame } from '@react-three/fiber';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { LookAtController } from '@strata-game-library/core';
import type { LookAtProps, LookAtRef } from './types';

/**
 * Procedural Look-At Controller.
 *
 * Rotates an object to face a target with smooth dampening, speed limits,
 * and angular constraints. Ideal for heads, eyes, or cameras.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <LookAt
 *   target={playerRef}
 *   config={{ speed: 5, maxAngle: Math.PI / 2 }}
 * >
 *   <HeadModel />
 * </LookAt>
 * ```
 */
export const LookAt = forwardRef<LookAtRef, LookAtProps>(({ target, config, children }, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const controller = useMemo(() => new LookAtController(config), [config]);

  useImperativeHandle(ref, () => ({
    getRotation: () => {
      if (!groupRef.current) {
        return new THREE.Quaternion();
      }
      return controller.update(groupRef.current, new THREE.Vector3(), 0);
    },
    reset: () => controller.reset(),
  }));

  const getTargetPosition = useCallback((): THREE.Vector3 => {
    if (target instanceof THREE.Vector3) return target;
    if (target?.current) {
      const pos = new THREE.Vector3();
      target.current.getWorldPosition(pos);
      return pos;
    }
    return new THREE.Vector3(0, 0, 1);
  }, [target]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const targetPos = getTargetPosition();
    const rotation = controller.update(groupRef.current, targetPos, delta);
    groupRef.current.quaternion.copy(rotation);
  });

  return <group ref={groupRef}>{children}</group>;
});

LookAt.displayName = 'LookAt';
