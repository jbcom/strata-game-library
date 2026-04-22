import { forwardRef, useEffect, useMemo } from 'react';
import { resolveReactylonRuntimeCreature } from './runtime.js';
import type { ReactylonRuntimeCreatureDescriptor, StrataRuntimeCreatureProps } from './types.js';

/**
 * Reactylon marker component for a resolved core creature runtime plan.
 *
 * The descriptor preserves runtime bones, material slots, animation metadata,
 * IK chains, spawn metadata, and physics profiles so Babylon scene code can
 * instantiate meshes without re-running the core composition resolver.
 */
export const StrataRuntimeCreature = forwardRef<HTMLDivElement, StrataRuntimeCreatureProps>(
  function StrataRuntimeCreature(
    {
      creature,
      position,
      rotation,
      scale,
      transparentVolumetrics,
      materialOverrides,
      visible = true,
      onResolve,
    },
    ref
  ) {
    const descriptor: ReactylonRuntimeCreatureDescriptor = useMemo(
      () =>
        resolveReactylonRuntimeCreature(creature, {
          position,
          rotation,
          scale,
          transparentVolumetrics,
          materialOverrides,
        }),
      [creature, materialOverrides, position, rotation, scale, transparentVolumetrics]
    );

    useEffect(() => {
      if (visible) {
        onResolve?.(descriptor);
      }
    }, [descriptor, onResolve, visible]);

    if (!visible) {
      return null;
    }

    return (
      <div
        ref={ref}
        data-strata-runtime="creature"
        data-runtime-id={descriptor.id}
        data-runtime={JSON.stringify(descriptor)}
        style={{ display: 'none' }}
      />
    );
  }
);

StrataRuntimeCreature.displayName = 'StrataRuntimeCreature';
