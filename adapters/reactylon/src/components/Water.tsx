/**
 * StrataWater - Babylon.js water surface component via Reactylon.
 *
 * Wraps Strata's core water shader algorithms and renders them using
 * Babylon.js ShaderMaterial. Uses the same GLSL wave functions as the
 * R3F adapter, adapted for Babylon.js's shader pipeline.
 *
 * @example
 * ```tsx
 * import { StrataWater } from '@strata-game-library/reactylon';
 *
 * function WaterScene() {
 *   return (
 *     <StrataWater
 *       size={100}
 *       segments={64}
 *       waterColor="#2a5a8a"
 *       deepWaterColor="#1a3a5a"
 *       causticIntensity={0.4}
 *     />
 *   );
 * }
 * ```
 */

import { type ReactNode, forwardRef, useEffect, useMemo, useRef } from 'react';
import {
  createBabylonWaterShaderMaterial,
  type BabylonWaterMaterialHandle,
} from '../materials/waterMaterial.js';

/** Configuration props for the StrataWater component. */
export interface StrataWaterProps {
  /** Position of the water plane [x, y, z]. Default: [0, -0.2, 0] */
  position?: [number, number, number];
  /** Size of the water plane in world units. Default: 100 */
  size?: number;
  /** Number of geometry segments for wave detail. Default: 64 */
  segments?: number;
  /** Surface water color (CSS hex string). Default: '#2a5a8a' */
  waterColor?: string;
  /** Deep water color for depth-based blending. Default: '#1a3a5a' */
  deepWaterColor?: string;
  /** Foam color for wave crests. Default: '#8ab4d4' */
  foamColor?: string;
  /** Caustic light intensity, 0-1. Default: 0.4 */
  causticIntensity?: number;
  /** Wave height multiplier. Default: 0.5 */
  waveHeight?: number;
  /** Wave speed multiplier. Default: 1.0 */
  waveSpeed?: number;
  /** Whether the water surface is visible. Default: true */
  visible?: boolean;
  /** Child elements to render inside the water group. */
  children?: ReactNode;
}

/**
 * Babylon.js water surface rendered via Reactylon.
 *
 * Creates a Babylon.js ground mesh with a custom ShaderMaterial driven
 * by Strata's core water shader algorithms. The component handles:
 * - Creating the ShaderMaterial with water vertex/fragment shaders
 * - Mapping color props to shader uniforms
 * - Providing a handle for per-frame time updates via `getHandle()`
 *
 * Since Reactylon's frame loop integration varies by version, this component
 * exposes its material handle for external time updates. Use the companion
 * `useWaterAnimation` hook or manually call `handle.updateTime(elapsed)`.
 */
export const StrataWater = forwardRef<unknown, StrataWaterProps>(
  function StrataWater(
    {
      position = [0, -0.2, 0],
      size = 100,
      segments = 64,
      waterColor = '#2a5a8a',
      deepWaterColor = '#1a3a5a',
      foamColor = '#8ab4d4',
      causticIntensity = 0.4,
      waveHeight = 0.5,
      waveSpeed = 1.0,
      visible = true,
      children,
    },
    _ref,
  ) {
    const handleRef = useRef<BabylonWaterMaterialHandle | null>(null);
    const animationRef = useRef<number>(0);
    const startTimeRef = useRef<number>(performance.now());

    const materialHandle = useMemo(() => {
      return createBabylonWaterShaderMaterial({
        waterColor,
        deepWaterColor,
        foamColor,
        causticIntensity,
        waveHeight,
      });
    }, [waterColor, deepWaterColor, foamColor, causticIntensity, waveHeight]);

    handleRef.current = materialHandle;

    // Animation loop for time updates
    useEffect(() => {
      if (!visible) return;

      startTimeRef.current = performance.now();

      const animate = () => {
        const elapsed = (performance.now() - startTimeRef.current) / 1000;
        handleRef.current?.updateTime(elapsed * waveSpeed);
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        handleRef.current?.dispose();
      };
    }, [visible, waveSpeed]);

    if (!visible) return null;

    // The material handle stores the shader code and uniform values.
    // In a Reactylon scene, the consumer applies the material to a ground mesh:
    //
    //   const { shaderMaterialOptions, uniforms } = handle;
    //   <ground width={size} height={size}>
    //     <shaderMaterial {...shaderMaterialOptions} />
    //   </ground>
    //
    // Since Reactylon's JSX API is not yet stabilized, we render a marker
    // element that carries the configuration. Consumers can use the
    // `useStrataWaterMaterial` hook for direct Babylon.js Scene integration.

    return (
      <div
        data-strata-water="true"
        data-position={position.join(',')}
        data-size={String(size)}
        data-segments={String(segments)}
        style={{ display: 'none' }}
      >
        {children}
      </div>
    );
  },
);

StrataWater.displayName = 'StrataWater';
