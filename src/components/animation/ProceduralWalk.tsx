import { useFrame } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { type GaitState, ProceduralGait } from '../../core/animation';
import type { ProceduralWalkProps, ProceduralWalkRef } from './types';

/**
 * Procedural Locomotion and Walking System.
 *
 * Provides dynamic step calculation and foot placement for multi-legged characters.
 * Automatically adapts to body velocity and orientation.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <ProceduralWalk
 *   bodyRef={characterRef}
 *   leftFootRef={leftFootRef}
 *   rightFootRef={rightFootRef}
 *   config={{ stepHeight: 0.5, stepLength: 1.2 }}
 * />
 * ```
 */
export const ProceduralWalk = forwardRef<ProceduralWalkRef, ProceduralWalkProps>(
    ({ config, bodyRef, leftFootRef, rightFootRef, enabled = true, onStep }, ref) => {
        const gaitRef = useRef<ProceduralGait | null>(null);
        const stateRef = useRef<GaitState | null>(null);
        const lastPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());
        const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3());
        const wasLeftLifted = useRef(false);
        const wasRightLifted = useRef(false);

        useEffect(() => {
            gaitRef.current = new ProceduralGait(config);
        }, [config]);

        useImperativeHandle(ref, () => ({
            getState: () => stateRef.current,
            getPhase: () => gaitRef.current?.getPhase() ?? 0,
            reset: () => gaitRef.current?.reset(),
        }));

        useFrame((_, delta) => {
            if (!enabled || !gaitRef.current || !bodyRef.current) return;

            const bodyPos = new THREE.Vector3();
            bodyRef.current.getWorldPosition(bodyPos);

            velocityRef.current
                .copy(bodyPos)
                .sub(lastPositionRef.current)
                .divideScalar(Math.max(delta, 0.001));
            lastPositionRef.current.copy(bodyPos);

            const forward = new THREE.Vector3(0, 0, 1);
            bodyRef.current.getWorldDirection(forward);

            const state = gaitRef.current.update(bodyPos, forward, velocityRef.current, delta);
            stateRef.current = state;

            if (leftFootRef?.current) {
                leftFootRef.current.position.copy(state.leftFootTarget);
            }
            if (rightFootRef?.current) {
                rightFootRef.current.position.copy(state.rightFootTarget);
            }

            if (!wasLeftLifted.current && state.leftFootLifted) {
                onStep?.('left', state.leftFootTarget);
            }
            if (!wasRightLifted.current && state.rightFootLifted) {
                onStep?.('right', state.rightFootTarget);
            }

            wasLeftLifted.current = state.leftFootLifted;
            wasRightLifted.current = state.rightFootLifted;
        });

        return null;
    }
);

ProceduralWalk.displayName = 'ProceduralWalk';
