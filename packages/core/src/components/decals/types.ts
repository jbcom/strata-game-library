import type React from 'react';
import type * as THREE from 'three';
import type {
  BillboardConfig,
  DecalInstance,
  DecalProjectorConfig,
  SpriteAnimationState,
  SpriteSheetConfig,
} from '../../core/decals';

/**
 * Props for the Decal component.
 * @category World Building
 */
export interface DecalProps {
  /** World position of the decal center. */
  position: THREE.Vector3 | [number, number, number];
  /** Surface normal direction for orientation. */
  normal: THREE.Vector3 | [number, number, number];
  /** Size of the decal (single number or [width, height]). Default: 1. */
  size?: number | [number, number];
  /** Texture to apply to the decal. */
  texture: THREE.Texture;
  /** Rotation around the normal axis in radians. Default: 0. */
  rotation?: number;
  /** Decal opacity (0-1). Default: 1. */
  opacity?: number;
  /** Time in seconds before the decal automatically fades out. */
  fadeTime?: number;
  /** Whether to test against the depth buffer. Default: true. */
  depthTest?: boolean;
  /** Whether to write to the depth buffer. Default: false. */
  depthWrite?: boolean;
  /** Z-fighting offset factor. Default: -4. */
  polygonOffsetFactor?: number;
  /** Tint color for the decal. Default: 0xffffff. */
  color?: THREE.ColorRepresentation;
}

/**
 * Ref interface for Decal imperative control.
 * @category World Building
 */
export interface DecalRef {
  /** Access to the underlying mesh. */
  mesh: THREE.Mesh | null;
  /** Update the decal opacity dynamically. */
  setOpacity: (opacity: number) => void;
}

/**
 * Props for the Billboard component.
 * @category World Building
 */
export interface BillboardProps {
  /** World position of the billboard. Default: [0, 0, 0]. */
  position?: THREE.Vector3 | [number, number, number];
  /** Size of the billboard (single number or [width, height]). Default: 1. */
  size?: number | [number, number];
  /** Texture to display on the billboard. */
  texture: THREE.Texture;
  /** Tint color for the billboard. Default: 0xffffff. */
  color?: THREE.ColorRepresentation;
  /** Opacity (0-1). Default: 1. */
  opacity?: number;
  /** Whether to enable transparency. Default: true. */
  transparent?: boolean;
  /** Alpha test threshold for transparency. Default: 0.1. */
  alphaTest?: number;
  /** Lock Y-axis rotation (cylindrical billboard). Default: false. */
  lockY?: boolean;
  /** Whether to write to the depth buffer. Default: false. */
  depthWrite?: boolean;
  /** Render order for transparency sorting. Default: 0. */
  renderOrder?: number;
  /** Optional child elements to be billboarded. */
  children?: React.ReactNode;
}

/**
 * Ref interface for Billboard imperative control.
 * @category World Building
 */
export interface BillboardRef {
  /** Access to the mesh (if using children). */
  mesh: THREE.Mesh | null;
  /** Access to the sprite instance. */
  sprite: THREE.Sprite | null;
}

/**
 * Props for the AnimatedBillboard component.
 * @category World Building
 */
export interface AnimatedBillboardProps extends Omit<BillboardProps, 'texture'> {
  /** Sprite sheet texture. */
  texture: THREE.Texture;
  /** Number of columns in the sprite sheet. */
  columns: number;
  /** Number of rows in the sprite sheet. */
  rows: number;
  /** Total number of frames. Defaults to columns * rows. */
  frameCount?: number;
  /** Playback speed in frames per second. Default: 10. */
  frameRate?: number;
  /** Whether the animation loops. Default: true. */
  loop?: boolean;
  /** Play forward then backward. Default: false. */
  pingPong?: boolean;
  /** Start playing immediately on mount. Default: true. */
  autoPlay?: boolean;
  /** Callback fired when a non-looping animation finishes. */
  onAnimationComplete?: () => void;
}

/**
 * Ref interface for AnimatedBillboard imperative control.
 * @category World Building
 */
export interface AnimatedBillboardRef extends BillboardRef {
  /** Start or resume playback. */
  play: () => void;
  /** Pause playback. */
  pause: () => void;
  /** Reset animation to the first frame. */
  reset: () => void;
  /** Manually set the current frame index. */
  setFrame: (frame: number) => void;
  /** Get current frame index. */
  currentFrame: number;
}

/**
 * Props for the DecalPool component.
 * @category World Building
 */
export interface DecalPoolProps {
  /** Maximum number of decals allowed in the pool. Default: 100. */
  maxDecals?: number;
  /** Default fade-out time in seconds for new decals. Default: 5. */
  fadeTime?: number;
  /** Default size for new decals. Default: 1. */
  defaultSize?: number | [number, number];
  /** Default texture used if none is specified. */
  defaultTexture?: THREE.Texture;
  /** Default depth test setting. Default: true. */
  depthTest?: boolean;
  /** Default depth write setting. Default: false. */
  depthWrite?: boolean;
}

/**
 * Ref interface for DecalPool imperative control.
 * @category World Building
 */
export interface DecalPoolRef {
  /** Add a new decal to the pool. Returns a unique ID. */
  addDecal: (
    position: THREE.Vector3 | [number, number, number],
    normal: THREE.Vector3 | [number, number, number],
    options?: {
      texture?: THREE.Texture;
      size?: number | [number, number];
      rotation?: number;
      fadeTime?: number;
      color?: THREE.ColorRepresentation;
    }
  ) => string;
  /** Manually remove a decal by ID. */
  removeDecal: (id: string) => boolean;
  /** Clear all decals from the pool. */
  clear: () => void;
  /** Current number of active decals. */
  count: number;
}

export type {
  DecalProjectorConfig,
  DecalInstance,
  BillboardConfig,
  SpriteSheetConfig,
  SpriteAnimationState,
};
