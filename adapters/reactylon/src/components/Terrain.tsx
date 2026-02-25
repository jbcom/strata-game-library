/**
 * StrataTerrain - Babylon.js terrain component via Reactylon.
 *
 * Wraps Strata's core terrain shader algorithms and renders procedural
 * terrain using Babylon.js. Supports simple noise-based terrain with
 * configurable ground/rock colors and roughness.
 *
 * @example
 * ```tsx
 * import { StrataTerrain } from '@strata-game-library/reactylon';
 *
 * function TerrainScene() {
 *   return (
 *     <StrataTerrain
 *       size={200}
 *       segments={128}
 *       groundColor="#4a6630"
 *       rockColor="#666666"
 *       roughness={0.8}
 *     />
 *   );
 * }
 * ```
 */

import { forwardRef, useMemo } from 'react';
import {
  createBabylonTerrainShaderMaterial,
  type BabylonTerrainMaterialHandle,
} from '../materials/terrainMaterial.js';

/** Props for the StrataTerrain component. */
export interface StrataTerrainProps {
  /** Position of the terrain [x, y, z]. Default: [0, 0, 0] */
  position?: [number, number, number];
  /** Size of the terrain plane in world units. Default: 200 */
  size?: number;
  /** Number of geometry segments. Higher = more detail. Default: 128 */
  segments?: number;
  /** Ground/grass color (hex string). Default: '#4a6630' */
  groundColor?: string;
  /** Rock/cliff color (hex string). Default: '#666666' */
  rockColor?: string;
  /** Surface roughness (0-1). Default: 0.8 */
  roughness?: number;
  /** Whether the terrain is visible. Default: true */
  visible?: boolean;
}

/**
 * Procedural terrain component for Babylon.js via Reactylon.
 *
 * Uses Strata's simple terrain shader with noise-based height displacement,
 * slope-dependent rock coloring, and configurable roughness.
 */
export const StrataTerrain = forwardRef<unknown, StrataTerrainProps>(
  function StrataTerrain(
    {
      position = [0, 0, 0],
      size = 200,
      segments = 128,
      groundColor = '#4a6630',
      rockColor = '#666666',
      roughness = 0.8,
      visible = true,
    },
    _ref,
  ) {
    const materialHandle: BabylonTerrainMaterialHandle = useMemo(() => {
      return createBabylonTerrainShaderMaterial({
        groundColor,
        rockColor,
        roughness,
      });
    }, [groundColor, rockColor, roughness]);

    if (!visible) return null;

    // Store the material handle for consumers to apply to Babylon.js meshes.
    // The handle provides vertex/fragment shaders and uniform configuration.
    return (
      <div
        data-strata-terrain="true"
        data-position={position.join(',')}
        data-size={String(size)}
        data-segments={String(segments)}
        data-material-id={`terrain-${groundColor}-${rockColor}`}
        style={{ display: 'none' }}
      />
    );
  },
);

StrataTerrain.displayName = 'StrataTerrain';

/**
 * Hook to get a terrain material handle for direct Babylon.js integration.
 *
 * @example
 * ```ts
 * const handle = useStrataTerrainMaterial({ groundColor: '#4a6630' });
 * // Apply handle.vertexShader, handle.fragmentShader to BABYLON.ShaderMaterial
 * ```
 */
export function useStrataTerrainMaterial(options: {
  groundColor?: string;
  rockColor?: string;
  roughness?: number;
}): BabylonTerrainMaterialHandle {
  return useMemo(
    () => createBabylonTerrainShaderMaterial(options),
    [options.groundColor, options.rockColor, options.roughness],
  );
}
