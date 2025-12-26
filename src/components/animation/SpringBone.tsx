import { useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SpringDynamics } from '../../core/animation';
import type { SpringBoneProps, SpringBoneRef } from './types';

/**
 * Physical Spring-Based Bone Animation.
 *
 * Adds secondary motion to objects (e.g., hair, capes, dangling bits) using
 * physical spring dynamics. Reacts to parent movement and gravity.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <SpringBone
 *   config={{ stiffness: 100, damping: 10 }}
 *   gravity={[0, -5, 0]}
 * >
 *   <TailMesh />
 * </SpringBone>
 * ```
 */
export const SpringBone = forwardRef<SpringBoneRef, SpringBoneProps>(
    ({ config, gravity = [0, -9.8, 0], children }, ref) => {
        const groupRef = useRef<THREE.Group>(null);
        const spring = useMemo(() => new SpringDynamics(config), [config]);
        const gravityVec = useMemo(() => new THREE.Vector3(...gravity), [gravity]);

        useImperativeHandle(ref, () => ({
            getPosition: () => spring.getPosition(),
            getVelocity: () => spring.getVelocity(),
            reset: () => spring.reset(),
        }));

        useFrame((_, delta) => {
            if (!groupRef.current || !groupRef.current.parent) return;

            const parentWorldPos = new THREE.Vector3();
            groupRef.current.parent.getWorldPosition(parentWorldPos);

            const target = parentWorldPos.clone().add(gravityVec.clone().multiplyScalar(0.1));
            const newPos = spring.update(target, delta);

            const localPos = newPos.clone();
            groupRef.current.parent.worldToLocal(localPos);
            groupRef.current.position.copy(localPos);
        });

        return <group ref={groupRef}>{children}</group>;
    }
);

SpringBone.displayName = 'SpringBone';
