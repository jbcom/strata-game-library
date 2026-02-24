/**
 * Procedural Animation System for Strata.
 *
 * Provides React Three Fiber components for procedural animation including
 * Inverse Kinematics (IK), spring dynamics, look-at controllers, and complex locomotion.
 *
 * @packageDocumentation
 * @module components/animation/IKChain
 * @category Entities & Simulation
 *
 * ## Interactive Demos
 * - 🎮 [Live Animation Demo](http://jonbogaty.com/nodejs-strata/demos/animation.html)
 * - 📦 [Procedural Character Example](https://github.com/jbcom/strata-game-library/tree/main/examples/characters)
 *
 * ## API Documentation
 * - [Full API Reference](http://jonbogaty.com/nodejs-strata/api)
 * - [Examples → API Mapping](https://github.com/jbcom/strata-game-library/blob/main/EXAMPLES_API_MAP.md#animation-system)
 */

import { useFrame } from '@react-three/fiber';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  type BoneChain,
  CCDSolver,
  createBoneChainFromLengths,
  FABRIKSolver,
  type IKSolverResult,
} from '@strata-game-library/core';
import type { IKChainProps, IKChainRef } from './types';

/**
 * Multi-bone Inverse Kinematics chain.
 *
 * Provides smooth, multi-joint reach behavior using FABRIK or CCD algorithms.
 * Ideal for arms, tentacles, or legs with many segments.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <IKChain
 *   target={targetRef}
 *   boneLengths={[1, 1, 0.5]}
 *   solver="fabrik"
 * />
 * ```
 */
export const IKChain = forwardRef<IKChainRef, IKChainProps>(
  (
    {
      boneLengths,
      target,
      pole,
      solver = 'fabrik',
      tolerance = 0.001,
      maxIterations = 20,
      visualize = false,
      visualColor = '#00ff00',
      visualRadius = 0.05,
      children,
      onSolve,
    },
    ref
  ) => {
    const groupRef = useRef<THREE.Group>(null);
    const chainRef = useRef<BoneChain | null>(null);
    const resultRef = useRef<IKSolverResult | null>(null);

    const solverInstance = useMemo(() => {
      return solver === 'fabrik'
        ? new FABRIKSolver(tolerance, maxIterations)
        : new CCDSolver(tolerance, maxIterations);
    }, [solver, tolerance, maxIterations]);

    useEffect(() => {
      if (groupRef.current && boneLengths.length > 0) {
        // Clear old visual bones if any
        groupRef.current.children.forEach((child) => {
          if ((child as THREE.Object3D).type === 'Object3D' || (child as THREE.Mesh).isMesh) {
            groupRef.current?.remove(child);
          }
        });

        chainRef.current = createBoneChainFromLengths(
          groupRef.current,
          boneLengths,
          new THREE.Vector3(0, -1, 0)
        );
      }
    }, [boneLengths]);

    const getTargetPosition = useCallback((): THREE.Vector3 => {
      if (target instanceof THREE.Vector3) return target;
      if (target?.current) {
        const pos = new THREE.Vector3();
        target.current.getWorldPosition(pos);
        return pos;
      }
      return new THREE.Vector3();
    }, [target]);

    const getPolePosition = useCallback((): THREE.Vector3 | undefined => {
      if (!pole) return undefined;
      if (pole instanceof THREE.Vector3) return pole;
      if (pole?.current) {
        const pos = new THREE.Vector3();
        pole.current.getWorldPosition(pos);
        return pos;
      }
      return undefined;
    }, [pole]);

    const solve = useCallback(() => {
      if (!chainRef.current) return;

      const targetPos = getTargetPosition();
      const polePos = getPolePosition();

      const result =
        solver === 'fabrik'
          ? (solverInstance as FABRIKSolver).solve(chainRef.current, targetPos, polePos)
          : (solverInstance as CCDSolver).solve(chainRef.current, targetPos);

      resultRef.current = result;

      if (solver === 'fabrik') {
        (solverInstance as FABRIKSolver).apply(chainRef.current, result);
      } else {
        (solverInstance as CCDSolver).apply(chainRef.current, result);
      }

      onSolve?.(result);
    }, [solver, solverInstance, getTargetPosition, getPolePosition, onSolve]);

    useImperativeHandle(ref, () => ({
      getBones: () => chainRef.current?.bones ?? [],
      getResult: () => resultRef.current,
      solve,
    }));

    useFrame(() => {
      solve();
    });

    const visualBones = useMemo(() => {
      if (!visualize) return null;

      return boneLengths.map((length, i) => (
        <group key={`bone-${i}-${length}`}>
          <mesh position={[0, -length / 2, 0]}>
            <cylinderGeometry args={[visualRadius, visualRadius * 0.8, length, 8]} />
            <meshStandardMaterial color={visualColor} />
          </mesh>
          <mesh>
            <sphereGeometry args={[visualRadius * 1.2, 8, 8]} />
            <meshStandardMaterial color={visualColor} />
          </mesh>
        </group>
      ));
    }, [visualize, boneLengths, visualColor, visualRadius]);

    return (
      <group ref={groupRef}>
        {visualBones}
        {children}
      </group>
    );
  }
);

IKChain.displayName = 'IKChain';
