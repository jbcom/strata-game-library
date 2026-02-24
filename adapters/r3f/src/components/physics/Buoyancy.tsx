import { useFrame } from '@react-three/fiber';
import {
  interactionGroups,
  type RapierRigidBody,
  RigidBody,
  type RigidBodyProps,
} from '@react-three/rapier';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  type BuoyancyConfig,
  CollisionLayer,
  calculateBuoyancyForce,
  createDefaultBuoyancyConfig,
} from '@strata-game-library/core';

/**
 * Props for the Buoyancy component.
 * @category Entities & Simulation
 */
export interface BuoyancyProps extends Omit<RigidBodyProps, 'ref'> {
  /** Buoyancy simulation settings (water level, drag, force). */
  config?: Partial<BuoyancyConfig>;
  /** Local offsets for sampling water depth. If omitted, a standard 8-point set is used. */
  samplePoints?: [number, number, number][];
  /** Callback fired when the object enters or changes depth in water. */
  onSubmerged?: (depth: number) => void;
  /** Child mesh components. */
  children?: React.ReactNode;
}

/**
 * Ref interface for Buoyancy.
 * @category Entities & Simulation
 */
export interface BuoyancyRef {
  /** Get the underlying Rapier rigid body. */
  getRigidBody: () => RapierRigidBody | null;
  /** Get current average submersion depth. */
  getSubmersionDepth: () => number;
}

/**
 * Physical Buoyancy Simulation.
 *
 * Simulates a floating body by sampling multiple points and applying upward
 * buoyancy forces based on submersion depth. Includes realistic water drag
 * and angular resistance.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <Buoyancy
 *   config={{ waterLevel: 0, buoyancyForce: 15 }}
 *   onSubmerged={(depth) => console.log('Depth:', depth)}
 * >
 *   <mesh><boxGeometry args={[2, 0.5, 2]} /></mesh>
 * </Buoyancy>
 * ```
 */
export const Buoyancy = forwardRef<BuoyancyRef, BuoyancyProps>(
  (
    {
      position = [0, 0, 0],
      config: configOverride,
      samplePoints,
      onSubmerged,
      children,
      ...rigidBodyProps
    },
    ref
  ) => {
    const config = useMemo(
      () => ({
        ...createDefaultBuoyancyConfig(),
        ...configOverride,
      }),
      [configOverride]
    );

    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const submersionRef = useRef(0);

    const defaultSamplePoints = useMemo<[number, number, number][]>(
      () =>
        samplePoints || [
          [-0.5, 0, -0.5],
          [0.5, 0, -0.5],
          [-0.5, 0, 0.5],
          [0.5, 0, 0.5],
          [0, 0, 0],
          [-0.5, 0, 0],
          [0.5, 0, 0],
          [0, 0, -0.5],
        ],
      [samplePoints]
    );

    useImperativeHandle(ref, () => ({
      getRigidBody: () => rigidBodyRef.current,
      getSubmersionDepth: () => submersionRef.current,
    }));

    useFrame(() => {
      if (!rigidBodyRef.current) return;

      const pos = rigidBodyRef.current.translation();
      const rot = rigidBodyRef.current.rotation();
      const quaternion = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);

      let totalBuoyancy = 0;
      let submergedPoints = 0;
      let totalDepth = 0;

      const forcePoint = new THREE.Vector3();

      for (const point of defaultSamplePoints) {
        const worldPoint = new THREE.Vector3(...point)
          .applyQuaternion(quaternion)
          .add(new THREE.Vector3(pos.x, pos.y, pos.z));

        const depth = config.waterLevel - worldPoint.y;

        if (depth > 0) {
          const buoyancy = calculateBuoyancyForce(depth, config.buoyancyForce, 1);
          totalBuoyancy += buoyancy;
          forcePoint.add(worldPoint.clone().multiplyScalar(buoyancy));
          submergedPoints++;
          totalDepth += depth;
        }
      }

      if (submergedPoints > 0) {
        const avgDepth = totalDepth / submergedPoints;
        submersionRef.current = avgDepth;
        onSubmerged?.(avgDepth);

        if (totalBuoyancy > 0) {
          forcePoint.divideScalar(totalBuoyancy);
        } else {
          forcePoint.set(pos.x, pos.y, pos.z);
        }

        const buoyancyForce = { x: 0, y: totalBuoyancy, z: 0 };
        rigidBodyRef.current.applyImpulseAtPoint(
          buoyancyForce,
          { x: forcePoint.x, y: forcePoint.y, z: forcePoint.z },
          true
        );

        const vel = rigidBodyRef.current.linvel();
        const angVel = rigidBodyRef.current.angvel();

        rigidBodyRef.current.setLinvel(
          {
            x: vel.x * (1 - config.waterDrag * 0.01),
            y: vel.y * (1 - config.waterDrag * 0.01),
            z: vel.z * (1 - config.waterDrag * 0.01),
          },
          true
        );

        rigidBodyRef.current.setAngvel(
          {
            x: angVel.x * (1 - config.waterAngularDrag * 0.01),
            y: angVel.y * (1 - config.waterAngularDrag * 0.01),
            z: angVel.z * (1 - config.waterAngularDrag * 0.01),
          },
          true
        );
      } else {
        submersionRef.current = 0;
      }
    });

    return (
      <RigidBody
        ref={rigidBodyRef}
        position={position}
        type="dynamic"
        colliders="cuboid"
        collisionGroups={interactionGroups(CollisionLayer.Dynamic)}
        {...rigidBodyProps}
      >
        {children}
      </RigidBody>
    );
  }
);

Buoyancy.displayName = 'Buoyancy';
