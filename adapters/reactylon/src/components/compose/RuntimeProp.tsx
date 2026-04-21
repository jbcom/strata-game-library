import { forwardRef, useEffect, useMemo } from 'react';
import { resolveReactylonRuntimeProp } from './runtime.js';
import type { ReactylonRuntimePropDescriptor, StrataRuntimePropProps } from './types.js';

/**
 * Reactylon marker component for a resolved core prop runtime plan.
 *
 * The current Reactylon adapter exposes serializable descriptors because the
 * Babylon JSX mesh API is still intentionally thin. Consumers can read the
 * descriptor from `onResolve` or the hidden marker's `data-runtime` payload and
 * instantiate Babylon meshes/materials in their scene layer.
 */
export const StrataRuntimeProp = forwardRef<HTMLDivElement, StrataRuntimePropProps>(
  function StrataRuntimeProp(
    {
      prop,
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
    const descriptor: ReactylonRuntimePropDescriptor = useMemo(
      () =>
        resolveReactylonRuntimeProp(prop, {
          position,
          rotation,
          scale,
          transparentVolumetrics,
          materialOverrides,
        }),
      [materialOverrides, position, prop, rotation, scale, transparentVolumetrics]
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
        data-strata-runtime="prop"
        data-runtime-id={descriptor.id}
        data-runtime={JSON.stringify(descriptor)}
        style={{ display: 'none' }}
      />
    );
  }
);

StrataRuntimeProp.displayName = 'StrataRuntimeProp';
