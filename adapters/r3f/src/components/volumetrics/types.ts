import type * as THREE from 'three';

/**
 * Props for the EnhancedFog component.
 * @category Effects & Atmosphere
 */
export interface EnhancedFogProps {
  /** Fog color. Default: 0xb3c8d9. */
  color?: THREE.ColorRepresentation;
  /** Fog density for exponential fog. Default: 0.02. */
  density?: number;
  /** Starting distance for linear fog. */
  near?: number;
  /** Ending distance for linear fog. */
  far?: number;
}

/**
 * Props for the UnderwaterOverlay component.
 * @category Effects & Atmosphere
 */
export interface UnderwaterOverlayProps {
  /** Water tint color. Default: 0x004d66. */
  color?: THREE.ColorRepresentation;
  /** Fog density underwater. Default: 0.1. */
  density?: number;
  /** Strength of animated caustics (0-1). Default: 0.3. */
  causticStrength?: number;
  /** Y-position of the water surface. Default: 0. */
  waterSurface?: number;
}

/**
 * Props for the VolumetricFogMesh component.
 * @category Effects & Atmosphere
 */
export interface VolumetricFogMeshProps {
  /** Fog color. Default: 0xb3c8d9. */
  color?: THREE.ColorRepresentation;
  /** Fog density. Default: 0.02. */
  density?: number;
  /** Maximum height of the fog volume. Default: 10. */
  height?: number;
  /** Horizontal size of the fog volume. Default: 200. */
  size?: number;
}

/**
 * Configuration for volumetric fog in the combined component.
 * @category Effects & Atmosphere
 */
export interface VolumetricFogSettings {
  color?: THREE.ColorRepresentation;
  density?: number;
  height?: number;
}

/**
 * Configuration for underwater effects in the combined component.
 * @category Effects & Atmosphere
 */
export interface UnderwaterSettings {
  color?: THREE.ColorRepresentation;
  density?: number;
  causticStrength?: number;
  waterSurface?: number;
}

/**
 * Props for the VolumetricEffects combined component.
 * @category Effects & Atmosphere
 */
export interface VolumetricEffectsProps {
  /** Whether to enable localized volumetric fog. Default: true. */
  enableFog?: boolean;
  /** Whether to enable screen-space underwater overlay. Default: true. */
  enableUnderwater?: boolean;
  /** Settings for the fog effect. */
  fogSettings?: VolumetricFogSettings;
  /** Settings for the underwater effect. */
  underwaterSettings?: UnderwaterSettings;
}
