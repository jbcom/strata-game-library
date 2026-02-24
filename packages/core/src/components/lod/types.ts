import type * as THREE from 'three';
import type {
  ImpostorConfig,
  LODConfig,
  LODLevel,
  LODState,
  VegetationLODConfig,
} from '../../core/lod';

/**
 * Props for the LODMesh component.
 * @category Rendering Pipeline
 */
export interface LODMeshProps {
  /** Array of LOD levels with distance thresholds and corresponding geometry. */
  levels: Array<{
    distance: number;
    geometry: THREE.BufferGeometry;
    material?: THREE.Material;
  }>;
  /** Default material used if a level does not specify one. */
  baseMaterial?: THREE.Material;
  /** World position [x, y, z]. Default: [0, 0, 0]. */
  position?: THREE.Vector3 | [number, number, number];
  /** World rotation. Default: [0, 0, 0]. */
  rotation?: THREE.Euler | [number, number, number];
  /** World scale. Default: 1.0. */
  scale?: THREE.Vector3 | [number, number, number] | number;
  /** Buffer distance to prevent rapid level switching (flicker). Default: 0.1. */
  hysteresis?: number;
  /** Time in seconds for crossfade/dither transitions. Default: 0.3. */
  transitionDuration?: number;
  /** Visual transition algorithm. Default: 'instant'. */
  fadeMode?: 'instant' | 'crossfade' | 'dither';
  /** Whether the mesh casts shadows. Default: true. */
  castShadow?: boolean;
  /** Whether the mesh receives shadows. Default: true. */
  receiveShadow?: boolean;
  /** Enable frustum culling. Default: true. */
  frustumCulled?: boolean;
  /** Callback fired when the active LOD level changes. */
  onLevelChange?: (level: number) => void;
}

/**
 * Ref interface for LODMesh imperative control.
 * @category Rendering Pipeline
 */
export interface LODMeshRef {
  /** Access to the underlying Group. */
  group: THREE.Group | null;
  /** Current active LOD level index. */
  currentLevel: number;
  /** Get current distance to the active camera. */
  getDistance: () => number;
}

/**
 * Props for the LODGroup component.
 * @category Rendering Pipeline
 */
export interface LODGroupProps {
  /** Child components to be managed by the LOD system. */
  children: React.ReactNode;
  /** LOD level thresholds and mapping to child indices. */
  levels: Array<{
    distance: number;
    childIndices?: number[];
  }>;
  /** Buffer distance to prevent rapid level switching. Default: 0.1. */
  hysteresis?: number;
  /** World position [x, y, z]. Default: [0, 0, 0]. */
  position?: THREE.Vector3 | [number, number, number];
  /** World rotation. Default: [0, 0, 0]. */
  rotation?: THREE.Euler | [number, number, number];
  /** World scale. Default: 1.0. */
  scale?: THREE.Vector3 | [number, number, number] | number;
  /** Callback fired when the active LOD level changes. */
  onLevelChange?: (level: number) => void;
}

/**
 * Ref interface for LODGroup.
 * @category Rendering Pipeline
 */
export interface LODGroupRef {
  /** Access to the underlying Group. */
  group: THREE.Group | null;
  /** Current active LOD level index. */
  currentLevel: number;
  /** Manually force a specific LOD level. */
  forceLevel: (level: number) => void;
}

/**
 * Props for the Impostor component.
 * @category Rendering Pipeline
 */
export interface ImpostorProps {
  /** Sprite atlas texture containing multiple view angles. */
  texture: THREE.Texture;
  /** World position [x, y, z]. Default: [0, 0, 0]. */
  position?: THREE.Vector3 | [number, number, number];
  /** Visual size of the billboard. Default: 1.0. */
  size?: number | [number, number];
  /** Number of discrete view angles in the texture atlas. Default: 8. */
  views?: number;
  /** Facing algorithm. 'cylindrical' only rotates on Y axis. Default: 'cylindrical'. */
  billboardMode?: 'spherical' | 'cylindrical';
  /** Opacity (0-1). Default: 1.0. */
  opacity?: number;
  /** Whether to enable transparency. Default: true. */
  transparent?: boolean;
  /** Alpha test threshold for texture transparency. Default: 0.1. */
  alphaTest?: number;
  /** Whether to write to the depth buffer. Default: false. */
  depthWrite?: boolean;
  /** Tint color. Default: white. */
  color?: THREE.ColorRepresentation;
  /** Render order for transparency sorting. Default: 0. */
  renderOrder?: number;
  /** Whether to cast shadows. Default: false. */
  castShadow?: boolean;
  /** Whether to receive shadows. Default: false. */
  receiveShadow?: boolean;
}

/**
 * Ref interface for Impostor.
 * @category Rendering Pipeline
 */
export interface ImpostorRef {
  /** Access to the underlying Mesh. */
  mesh: THREE.Mesh | null;
  /** Current active view index from the atlas. */
  currentView: number;
  /** Force a manual view calculation update. */
  updateView: () => void;
}

/**
 * Props for the LODVegetation component.
 * @category Rendering Pipeline
 */
export interface LODVegetationProps {
  /** Maximum number of instances to render. */
  count: number;
  /** Array of instance transforms (position, rotation, scale). */
  instances: Array<{
    position: THREE.Vector3 | [number, number, number];
    rotation?: THREE.Euler | [number, number, number];
    scale?: THREE.Vector3 | [number, number, number] | number;
  }>;
  /** High-detail geometry for near distance. */
  highDetailGeometry: THREE.BufferGeometry;
  /** Optional medium-detail geometry. Auto-simplified if omitted. */
  mediumDetailGeometry?: THREE.BufferGeometry;
  /** Optional low-detail geometry. Auto-simplified if omitted. */
  lowDetailGeometry?: THREE.BufferGeometry;
  /** Atlas texture for the furthest billboard impostor LOD. */
  impostorTexture?: THREE.Texture;
  /** Shared material for all mesh LOD levels. */
  material?: THREE.Material;
  /** Configuration for LOD distance thresholds. */
  lodConfig?: Partial<VegetationLODConfig>;
  /** Whether to cast shadows. Default: true. */
  castShadow?: boolean;
  /** Whether to receive shadows. Default: true. */
  receiveShadow?: boolean;
  /** Enable frustum culling. Default: true. */
  frustumCulled?: boolean;
}

/**
 * Ref interface for LODVegetation.
 * @category Rendering Pipeline
 */
export interface LODVegetationRef {
  /** Access to the underlying Group. */
  group: THREE.Group | null;
  /** Number of instances currently visible at each detail level. */
  visibleCounts: { high: number; medium: number; low: number; impostor: number };
  /** Force a manual update of all instance LOD levels. */
  updateLOD: () => void;
}

export type { LODLevel, LODConfig, LODState, ImpostorConfig, VegetationLODConfig };
