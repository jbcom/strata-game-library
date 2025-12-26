import { useFrame } from '@react-three/fiber';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { TwoBoneIKSolver } from '../../core/animation';
import type { IKLimbProps, IKLimbRef } from './types';

/**
 * Optimized Two-Bone IK Limb.
 *
 * Provides specialized reach behavior for 2-joint limbs like legs and arms.
 * Features pole targets for knee/elbow direction control.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <IKLimb
 *   upperLength={1}
 *   lowerLength={1}
 *   target={handTargetRef}
 *   poleTarget={elbowPoleRef}
 * />
 * ```
 */
export const IKLimb = forwardRef<IKLimbRef, IKLimbProps>(
    (
        {
            upperLength,
            lowerLength,
            target,
            poleTarget,
            visualize = false,
            visualColor = '#4488ff',
            children,
            onSolve,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const upperRef = useRef<THREE.Object3D>(null);
        const lowerRef = useRef<THREE.Object3D>(null);
        const endRef = useRef<THREE.Object3D>(null);

        const solver = useMemo(() => new TwoBoneIKSolver(), []);

        useImperativeHandle(ref, () => ({
            getUpperBone: () => upperRef.current,
            getLowerBone: () => lowerRef.current,
            getEndEffector: () => endRef.current,
        }));

        const getTargetPosition = useCallback((): THREE.Vector3 => {
            if (target instanceof THREE.Vector3) return target;
            if (target?.current) {
                const pos = new THREE.Vector3();
                target.current.getWorldPosition(pos);
                return pos;
            }
            return new THREE.Vector3();
        }, [target]);

        const getPolePosition = useCallback((): THREE.Vector3 => {
            if (poleTarget instanceof THREE.Vector3) return poleTarget;
            if (poleTarget?.current) {
                const pos = new THREE.Vector3();
                poleTarget.current.getWorldPosition(pos);
                return pos;
            }
            return new THREE.Vector3(0, 0, 1);
        }, [poleTarget]);

        useFrame(() => {
            if (!groupRef.current || !upperRef.current || !lowerRef.current || !endRef.current)
                return;

            const midPos = new THREE.Vector3();
            const endPos = new THREE.Vector3();

            const targetPos = getTargetPosition();
            const polePos = getPolePosition();

            solver.solveLimb(
                upperRef.current,
                lowerRef.current,
                endRef.current,
                targetPos,
                polePos
            );

            lowerRef.current.getWorldPosition(midPos);
            endRef.current.getWorldPosition(endPos);
            onSolve?.(midPos, endPos);
        });

        return (
            <group ref={groupRef}>
                <object3D ref={upperRef}>
                    {visualize && (
                        <mesh position={[0, -upperLength / 2, 0]}>
                            <cylinderGeometry args={[0.05, 0.04, upperLength, 8]} />
                            <meshStandardMaterial color={visualColor} />
                        </mesh>
                    )}
                    <object3D ref={lowerRef} position={[0, -upperLength, 0]}>
                        {visualize && (
                            <mesh position={[0, -lowerLength / 2, 0]}>
                                <cylinderGeometry args={[0.04, 0.03, lowerLength, 8]} />
                                <meshStandardMaterial color={visualColor} />
                            </mesh>
                        )}
                        <object3D ref={endRef} position={[0, -lowerLength, 0]} />
                    </object3D>
                </object3D>
                {children}
            </group>
        );
    }
);

IKLimb.displayName = 'IKLimb';
