import type React from 'react';
import type * as THREE from 'three';

/**
 * Props for the FollowCamera component.
 * @category Player Experience
 */
export interface FollowCameraProps {
  /** Object to follow (Vector3 position or Object3D ref). */
  target: THREE.Vector3 | React.RefObject<THREE.Object3D>;
  /** Camera offset from target [x, y, z]. Default: [0, 5, 10]. */
  offset?: [number, number, number];
  /** Smoothing duration for position updates. Default: 0.3. */
  smoothTime?: number;
  /** How far ahead to look based on target velocity. Default: 2. */
  lookAheadDistance?: number;
  /** Smoothing factor for look-ahead calculations (0-1). Default: 0.5. */
  lookAheadSmoothing?: number;
  /** Smoothing factor for camera rotation (0-1). Default: 0.1. */
  rotationSmoothing?: number;
  /** Field of view in degrees. Default: 60. */
  fov?: number;
  /** Whether to set this as the default scene camera. Default: true. */
  makeDefault?: boolean;
}

/**
 * Ref interface for FollowCamera imperative control.
 * @category Player Experience
 */
export interface FollowCameraRef {
  /** Get the underlying THREE.PerspectiveCamera instance. */
  getCamera: () => THREE.PerspectiveCamera | null;
  /** Update the camera offset dynamically. */
  setOffset: (offset: [number, number, number]) => void;
}

/**
 * Props for the OrbitCamera component.
 * @category Player Experience
 */
export interface OrbitCameraProps {
  /** Point to orbit around [x, y, z]. Default: [0, 0, 0]. */
  target?: [number, number, number];
  /** Minimum zoom distance. Default: 2. */
  minDistance?: number;
  /** Maximum zoom distance. Default: 50. */
  maxDistance?: number;
  /** Minimum vertical polar angle in radians. Default: 0. */
  minPolarAngle?: number;
  /** Maximum vertical polar angle in radians. Default: PI / 2. */
  maxPolarAngle?: number;
  /** Enable automatic rotation. Default: false. */
  autoRotate?: boolean;
  /** Speed of automatic rotation. Default: 2.0. */
  autoRotateSpeed?: number;
  /** Enable smooth inertia damping. Default: true. */
  enableDamping?: boolean;
  /** Damping factor. Default: 0.05. */
  dampingFactor?: number;
  /** Allow user to zoom. Default: true. */
  enableZoom?: boolean;
  /** Allow user to pan. Default: true. */
  enablePan?: boolean;
  /** Field of view in degrees. Default: 60. */
  fov?: number;
  /** Whether to set this as the default scene camera. Default: true. */
  makeDefault?: boolean;
}

/**
 * Ref interface for OrbitCamera imperative control.
 * @category Player Experience
 */
export interface OrbitCameraRef {
  /** Get the underlying THREE.PerspectiveCamera instance. */
  getCamera: () => THREE.PerspectiveCamera | null;
  /** Get the underlying OrbitControls instance. */
  getControls: () => any;
  /** Update the orbit target dynamically. */
  setTarget: (target: [number, number, number]) => void;
}

/**
 * Props for the FPSCamera component.
 * @category Player Experience
 */
export interface FPSCameraProps {
  /** Initial camera position [x, y, z]. Default: [0, 1.7, 0]. */
  position?: [number, number, number];
  /** Mouse look sensitivity. Default: 0.002. */
  sensitivity?: number;
  /** Enable procedural walking head bob. Default: true. */
  headBobEnabled?: boolean;
  /** Frequency of head bob oscillation. Default: 10. */
  headBobFrequency?: number;
  /** Amplitude of head bob movement. Default: 0.05. */
  headBobAmplitude?: number;
  /** Field of view in degrees. Default: 75. */
  fov?: number;
  /** Whether to set this as the default scene camera. Default: true. */
  makeDefault?: boolean;
  /** Walking movement speed in units/sec. Default: 5. */
  movementSpeed?: number;
}

/**
 * Ref interface for FPSCamera imperative control.
 * @category Player Experience
 */
export interface FPSCameraRef {
  /** Get the underlying THREE.PerspectiveCamera instance. */
  getCamera: () => THREE.PerspectiveCamera | null;
  /** Teleport the camera to a new position. */
  setPosition: (position: [number, number, number]) => void;
  /** Update the walking movement speed. */
  setMovementSpeed: (speed: number) => void;
  /** Check if the camera is currently moving. */
  getMoving: () => boolean;
}

/**
 * Props for the CinematicCamera component.
 * @category Player Experience
 */
export interface CinematicCameraProps {
  /** Array of Vector3 waypoints defining the spline path. */
  path: THREE.Vector3[];
  /** Total duration of the animation in seconds. Default: 5. */
  duration?: number;
  /** Catmull-Rom spline tension (0-1). Default: 0.5. */
  tension?: number;
  /** Whether the path loops back to the start. Default: false. */
  closed?: boolean;
  /** Optional target to face (Vector3 or Object3D ref). Defaults to path direction. */
  lookAt?: THREE.Vector3 | React.RefObject<THREE.Object3D>;
  /** Whether to start playing immediately on mount. Default: true. */
  autoPlay?: boolean;
  /** Whether to loop the animation indefinitely. Default: false. */
  loop?: boolean;
  /** Field of view in degrees. Default: 50. */
  fov?: number;
  /** Optional FOV animation keyframes { time: 0..1, fov: degrees }. */
  fovKeyframes?: { time: number; fov: number }[];
  /** Whether to set this as the default scene camera. Default: true. */
  makeDefault?: boolean;
  /** Callback fired when the animation finishes. */
  onComplete?: () => void;
}

/**
 * Ref interface for CinematicCamera imperative control.
 * @category Player Experience
 */
export interface CinematicCameraRef {
  /** Get the underlying THREE.PerspectiveCamera instance. */
  getCamera: () => THREE.PerspectiveCamera | null;
  /** Resume or start playback. */
  play: () => void;
  /** Pause playback. */
  pause: () => void;
  /** Reset progress to the start. */
  reset: () => void;
  /** Manually set animation progress (0-1). */
  setProgress: (t: number) => void;
  /** Get current animation progress (0-1). */
  getProgress: () => number;
}

/**
 * Props for the CameraShake component.
 * @category Player Experience
 */
export interface CameraShakeProps {
  /** Overall shake intensity multiplier. Default: 1.0. */
  intensity?: number;
  /** How quickly the shake trauma decays (higher = faster). Default: 1.5. */
  decay?: number;
  /** Maximum yaw rotation in radians. Default: 0.1. */
  maxYaw?: number;
  /** Maximum pitch rotation in radians. Default: 0.1. */
  maxPitch?: number;
  /** Maximum roll rotation in radians. Default: 0.1. */
  maxRoll?: number;
  /** Yaw oscillation frequency in Hz. Default: 25. */
  yawFrequency?: number;
  /** Pitch oscillation frequency in Hz. Default: 25. */
  pitchFrequency?: number;
  /** Roll oscillation frequency in Hz. Default: 25. */
  rollFrequency?: number;
}

/**
 * Ref interface for CameraShake imperative control.
 * @category Player Experience
 */
export interface CameraShakeRef {
  /** Add a burst of trauma (0-1). */
  addTrauma: (amount: number) => void;
  /** Set trauma level directly (0-1). */
  setTrauma: (amount: number) => void;
  /** Get current trauma level (0-1). */
  getTrauma: () => number;
}

/**
 * Configuration for a camera transition.
 * @category Player Experience
 */
export interface CameraTransitionConfig {
  /** Starting world position. */
  from: THREE.Vector3;
  /** Target world position. */
  to: THREE.Vector3;
  /** Starting look-at target. */
  fromLookAt?: THREE.Vector3;
  /** Target look-at target. */
  toLookAt?: THREE.Vector3;
  /** Duration of the transition in seconds. Default: 1.0. */
  duration?: number;
  /** Easing function (t: 0..1) -> 0..1. Defaults to easeInOutCubic. */
  easing?: (t: number) => number;
  /** Callback fired when the transition completes. */
  onComplete?: () => void;
}
