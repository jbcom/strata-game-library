import { useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SpringChain } from '../../core/animation';
import type { TailPhysicsProps, TailPhysicsRef } from './types';

/**
 * Multi-Segment Tail Physics.
 *
 * Simulates a multi-jointed tail or chain using a spring-mass system.
 * Features realistic sway, drag, and gravity response.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <TailPhysics
 *   segmentCount={8}
 *   segmentLength={0.4}
 *   visualize
 * >
 *   <TailTipEmitter />
 * </TailPhysics>
 * ```
 */
export const TailPhysics = forwardRef<TailPhysicsRef, TailPhysicsProps>(
    (
        {
            segmentCount,
            segmentLength = 0.3,
            config,
            gravity = [0, -9.8, 0],
            visualize = false,
            visualColor = '#ff8844',
            visualRadius = 0.03,
            children,
        },
        ref
    ) => {
        const groupRef = useRef<THREE.Group>(null);
        const segmentsRef = useRef<THREE.Object3D[]>([]);
        const positionsRef = useRef<THREE.Vector3[]>([]);

        const chain = useMemo(
            () => new SpringChain(segmentCount, config, segmentLength),
            [segmentCount, config, segmentLength]
        );
        const gravityVec = useMemo(() => new THREE.Vector3(...gravity), [gravity]);

        useImperativeHandle(ref, () => ({
            getPositions: () => positionsRef.current,
            reset: () => {
                const positions = segmentsRef.current.map(
                    (_, i) => new THREE.Vector3(0, -segmentLength * (i + 1), 0)
                );
                chain.reset(positions);
            },
        }));

        useFrame((_, delta) => {
            if (!groupRef.current) return;

            const rootPos = new THREE.Vector3();
            const rootQuat = new THREE.Quaternion();
            groupRef.current.getWorldPosition(rootPos);
            groupRef.current.getWorldQuaternion(rootQuat);

            const positions = chain.update(rootPos, rootQuat, delta, gravityVec);
            positionsRef.current = positions;

            for (let i = 0; i < segmentsRef.current.length && i < positions.length - 1; i++) {
                const segment = segmentsRef.current[i];
                if (!segment) continue;

                const currentPos = positions[i];
                const nextPos = positions[i + 1];

                const localPos = nextPos.clone();
                if (groupRef.current) {
                    groupRef.current.worldToLocal(localPos);
                }
                segment.position.copy(localPos);

                const direction = nextPos.clone().sub(currentPos).normalize();
                const up = new THREE.Vector3(0, 1, 0);
                const quaternion = new THREE.Quaternion();
                const matrix = new THREE.Matrix4().lookAt(new THREE.Vector3(), direction, up);
                quaternion.setFromRotationMatrix(matrix);
                segment.quaternion.copy(quaternion);
            }
        });

        const segments = useMemo(() => {
            return Array.from({ length: segmentCount }, (_, i) => (
                <object3D
                    key={`segment-${i}-${segmentLength}`}
                    ref={(el) => {
                        if (el) segmentsRef.current[i] = el;
                    }}
                    position={[0, -segmentLength * (i + 1), 0]}
                >
                    {visualize && (
                        <>
                            <mesh>
                                <sphereGeometry
                                    args={[visualRadius * (1 - (i / segmentCount) * 0.5), 8, 8]}
                                />
                                <meshStandardMaterial color={visualColor} />
                            </mesh>
                            {i < segmentCount - 1 && (
                                <mesh position={[0, -segmentLength / 2, 0]}>
                                    <cylinderGeometry
                                        args={[
                                            visualRadius * 0.5,
                                            visualRadius * 0.5,
                                            segmentLength,
                                            6,
                                        ]}
                                    />
                                    <meshStandardMaterial color={visualColor} />
                                </mesh>
                            )}
                        </>
                    )}
                </object3D>
            ));
        }, [segmentCount, segmentLength, visualize, visualColor, visualRadius]);

        return (
            <group ref={groupRef}>
                {segments}
                {children}
            </group>
        );
    }
);

TailPhysics.displayName = 'TailPhysics';
