import * as THREE from 'three';
import type { BiomeData } from '../../core/sdf';

// Re-export types from core for convenience (used internally)
// Note: Don't re-export as that causes duplicate export issues with src/index.ts

/**
 * Configuration props for vegetation components.
 * @category World Building
 * @interface VegetationProps
 */
export interface VegetationProps {
    /** Total number of instances to generate. Default depends on component. */
    count?: number;
    /** Size of the area (square) to scatter instances in. Default: 100. */
    areaSize?: number;
    /** Array of biome data for placement logic. Default: Standard marsh/forest/savanna set. */
    biomes?: BiomeData[];
    /** Function to sample terrain height at (x, z). Default: flat ground (y=0). */
    heightFunc?: (x: number, z: number) => number;
    /** Base height of the instances for scaling geometry. Default: 1.0. */
    height?: number;
    /** Base color of the instances. Default depends on component. */
    color?: THREE.ColorRepresentation;
}

export const DEFAULT_BIOMES: BiomeData[] = [
    { type: 'marsh', center: new THREE.Vector2(0, 0), radius: 30 },
    { type: 'forest', center: new THREE.Vector2(50, 0), radius: 40 },
    { type: 'savanna', center: new THREE.Vector2(60, 60), radius: 50 },
];
