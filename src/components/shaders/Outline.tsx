import React, { useMemo } from 'react';
import { createOutlineMaterial } from '../../shaders/materials';
import type { OutlineProps } from './types';

/**
 * Silhouette Outline Post-Effect.
 *
 * Applies a colored outline to child meshes. Works by creating a slightly
 * scaled version of the geometry with inverted normals.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <Outline color="black" outlineWidth={0.05}>
 *   <mesh><boxGeometry /></mesh>
 * </Outline>
 * ```
 */
export const Outline: React.FC<OutlineProps> = ({ children, ...materialOptions }) => {
    // biome-ignore lint/correctness/useExhaustiveDependencies: materialOptions is spread from props
    const outlineMaterial = useMemo(
        () => createOutlineMaterial(materialOptions),
        [materialOptions.color, materialOptions.outlineWidth]
    );

    return (
        <group>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === 'mesh') {
                    const meshChild = child as React.ReactElement<{ children?: React.ReactNode }>;
                    return (
                        <>
                            {child}
                            {React.cloneElement(meshChild, {
                                children: (
                                    <>
                                        {meshChild.props.children}
                                        <primitive
                                            object={outlineMaterial.clone()}
                                            attach="material"
                                        />
                                    </>
                                ),
                            })}
                        </>
                    );
                }
                return child;
            })}
        </group>
    );
};
