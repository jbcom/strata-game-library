import { DepthOfField, EffectComposer } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import type * as THREE from 'three';
import { calculateFocusDistanceToMesh } from '../../core/postProcessing';
import type { DynamicDOFProps, DynamicDOFRef } from './types';

/**
 * Intelligent Dynamic Depth of Field.
 *
 * Automatically manages focus distance by tracking a target object or mesh.
 * Features smooth focus pulling and high-quality bokeh simulation.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * const targetRef = useRef<THREE.Mesh>(null);
 *
 * <DynamicDOF
 *   target={targetRef}
 *   focalLength={75}
 *   bokehScale={4}
 * />
 * ```
 */
export const DynamicDOF = forwardRef<DynamicDOFRef, DynamicDOFProps>(
    (
        {
            target,
            focusDistance: fixedFocusDistance = 5,
            focalLength = 50,
            bokehScale = 2,
            focusSpeed = 5,
            enabled = true,
            multisampling = 8,
        },
        ref
    ) => {
        const { camera } = useThree();
        const focusDistanceRef = useRef(fixedFocusDistance);
        const targetFocusRef = useRef(fixedFocusDistance);

        useImperativeHandle(ref, () => ({
            focusOnTarget: (newTarget: THREE.Object3D) => {
                targetFocusRef.current = calculateFocusDistanceToMesh(camera, newTarget);
            },
            getFocusDistance: () => focusDistanceRef.current,
        }));

        useFrame((_, delta) => {
            if (target?.current) {
                targetFocusRef.current = calculateFocusDistanceToMesh(camera, target.current);
            }

            const diff = targetFocusRef.current - focusDistanceRef.current;
            focusDistanceRef.current += diff * focusSpeed * delta;
        });

        if (!enabled) return null;

        return (
            <EffectComposer multisampling={multisampling}>
                <DepthOfField
                    focusDistance={focusDistanceRef.current}
                    focalLength={focalLength}
                    bokehScale={bokehScale}
                />
            </EffectComposer>
        );
    }
);

DynamicDOF.displayName = 'DynamicDOF';
