import type {
  CrystalMaterialOptions,
  DissolveMaterialOptions,
  ForcefieldMaterialOptions,
  GlitchMaterialOptions,
  GradientMaterialOptions,
  HologramMaterialOptions,
  OutlineMaterialOptions,
  ToonMaterialOptions,
} from '@strata-game-library/shaders/materials';
import type React from 'react';
import type * as THREE from 'three';

/**
 * Common props for shader-based mesh components.
 * @category Rendering Pipeline
 */
export interface ShaderMeshProps {
  /** Target geometry. If omitted, uses children (e.g., <sphereGeometry />). */
  geometry?: THREE.BufferGeometry;
  /** Child elements, typically geometries or other meshes. */
  children?: React.ReactNode;
  /** World position [x, y, z]. Default: [0, 0, 0]. */
  position?: [number, number, number];
  /** World rotation [x, y, z] in radians. Default: [0, 0, 0]. */
  rotation?: [number, number, number];
  /** World scale multiplier or vector. Default: 1.0. */
  scale?: number | [number, number, number];
}

/**
 * Common ref interface for shader-based mesh components.
 * @category Rendering Pipeline
 */
export interface ShaderMeshRef {
  /** Access to the underlying Mesh instance. */
  mesh: THREE.Mesh | null;
  /** Access to the generated ShaderMaterial. */
  material: THREE.ShaderMaterial | null;
}

/**
 * Props for the ToonMesh component.
 * @category Rendering Pipeline
 */
export interface ToonMeshProps extends ToonMaterialOptions, ShaderMeshProps {
  /** Whether to render a silhouette outline. Default: true. */
  showOutline?: boolean;
}

/**
 * Ref interface for ToonMesh.
 * @category Rendering Pipeline
 */
export interface ToonMeshRef extends ShaderMeshRef {}

/**
 * Props for the HologramMesh component.
 * @category Rendering Pipeline
 */
export interface HologramMeshProps extends HologramMaterialOptions, ShaderMeshProps {
  /** Whether to play the flicker/scanline animation. Default: true. */
  animate?: boolean;
}

/**
 * Ref interface for HologramMesh.
 * @category Rendering Pipeline
 */
export interface HologramMeshRef extends ShaderMeshRef {}

/**
 * Props for the DissolveMesh component.
 * @category Rendering Pipeline
 */
export interface DissolveMeshProps extends DissolveMaterialOptions, ShaderMeshProps {
  /** Whether to automatically animate the dissolve progress. Default: false. */
  animate?: boolean;
  /** Speed of the automatic dissolve animation. Default: 0.5. */
  animationSpeed?: number;
  /** Whether the dissolve animation should loop. Default: false. */
  loop?: boolean;
}

/**
 * Ref interface for DissolveMesh.
 * @category Rendering Pipeline
 */
export interface DissolveMeshRef extends ShaderMeshRef {
  /** Manually set the dissolve progress (0-1). */
  setProgress: (progress: number) => void;
}

/**
 * Props for the Forcefield component.
 * @category Rendering Pipeline
 */
export interface ForcefieldProps extends ForcefieldMaterialOptions {
  /** Radius of the forcefield sphere. Default: 1.0. */
  radius?: number;
  /** World position [x, y, z]. Default: [0, 0, 0]. */
  position?: [number, number, number];
  /** Whether to play the pulse/uv animation. Default: true. */
  animate?: boolean;
}

/**
 * Ref interface for Forcefield imperative control.
 * @category Rendering Pipeline
 */
export interface ForcefieldRef {
  /** Access to the underlying Mesh. */
  mesh: THREE.Mesh | null;
  /** Access to the ShaderMaterial. */
  material: THREE.ShaderMaterial | null;
  /** Trigger a ripple effect at a specific world position. */
  triggerHit: (worldPosition: THREE.Vector3, intensity?: number) => void;
}

/**
 * Props for the Outline component.
 * @category Rendering Pipeline
 */
export interface OutlineProps extends OutlineMaterialOptions {
  /** Meshes to apply the outline effect to. */
  children: React.ReactNode;
}

/**
 * Props for the GradientMesh component.
 * @category Rendering Pipeline
 */
export interface GradientMeshProps extends GradientMaterialOptions, ShaderMeshProps {}

/**
 * Ref interface for GradientMesh.
 * @category Rendering Pipeline
 */
export interface GradientMeshRef extends ShaderMeshRef {}

/**
 * Props for the GlitchMesh component.
 * @category Rendering Pipeline
 */
export interface GlitchMeshProps extends GlitchMaterialOptions, ShaderMeshProps {
  /** Whether to play the glitch/noise animation. Default: true. */
  animate?: boolean;
}

/**
 * Ref interface for GlitchMesh.
 * @category Rendering Pipeline
 */
export interface GlitchMeshRef extends ShaderMeshRef {}

/**
 * Props for the CrystalMesh component.
 * @category Rendering Pipeline
 */
export interface CrystalMeshProps extends CrystalMaterialOptions, ShaderMeshProps {
  /** Whether to play the internal shimmer animation. Default: true. */
  animate?: boolean;
}

/**
 * Ref interface for CrystalMesh.
 * @category Rendering Pipeline
 */
export interface CrystalMeshRef extends ShaderMeshRef {}
