/**
 * Fixed Perspective Camera Component.
 *
 * Provides locked camera angles for side-scrollers, isometric games,
 * and other fixed-perspective game styles. Renders 3D scenes from
 * predetermined viewing angles.
 *
 * @packageDocumentation
 * @module components/camera/FixedPerspectiveCamera
 * @category Rendering Pipeline
 *
 * ## Perspective Presets
 *
 * | Preset | Use Case | Camera Angle |
 * |--------|----------|--------------|
 * | `side` | Side-scrollers | 90° horizontal |
 * | `side-3/4` | Beat-em-ups | 75° with 10° tilt |
 * | `isometric` | Strategy games | 35° pitch, 45° yaw |
 * | `isometric-rpg` | RPGs (Diablo-style) | 60° pitch, 45° yaw |
 * | `top-down` | Shooters | 90° overhead |
 * | `top-down-tilt` | Zelda-style | 75° overhead |
 * | `hex` | Hex tile games | 55° pitch, 30° yaw |
 * | `dimetric` | Pixel art games | 2:1 pixel ratio |
 *
 * @example
 * ```tsx
 * import { FixedPerspectiveCamera } from '@strata-game-library/core';
 *
 * // Side-scroller camera
 * <FixedPerspectiveCamera preset="side" />
 *
 * // Isometric RPG camera
 * <FixedPerspectiveCamera preset="isometric-rpg" distance={20} />
 *
 * // Custom angle
 * <FixedPerspectiveCamera
 *   preset="custom"
 *   yaw={45}
 *   pitch={30}
 *   distance={15}
 * />
 * ```
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Common fixed perspective presets.
 *
 * @category Rendering Pipeline
 */
export type PerspectivePreset =
  | 'side'
  | 'side-3/4'
  | 'isometric'
  | 'isometric-rpg'
  | 'top-down'
  | 'top-down-tilt'
  | 'hex'
  | 'dimetric'
  | 'trimetric'
  | 'cavalier'
  | 'cabinet'
  | 'custom';

/**
 * Props for the FixedPerspectiveCamera component.
 *
 * @category Rendering Pipeline
 */
export interface FixedPerspectiveCameraProps {
  /**
   * Preset perspective angle.
   * @default 'side'
   */
  preset?: PerspectivePreset;
  /**
   * Camera rotation around Y axis (degrees).
   * Only used when preset is 'custom'.
   * @default 0
   */
  yaw?: number;
  /**
   * Camera rotation around X axis (degrees).
   * Only used when preset is 'custom'.
   * @default 0
   */
  pitch?: number;
  /**
   * Camera roll (degrees).
   * @default 0
   */
  roll?: number;
  /**
   * Distance from the target point.
   * @default 10
   */
  distance?: number;
  /**
   * Use orthographic projection (true) or perspective (false).
   * @default true
   */
  orthographic?: boolean;
  /**
   * Orthographic camera scale (world units visible).
   * @default 10
   */
  orthoScale?: number;
  /**
   * Field of view for perspective cameras.
   * @default 50
   */
  fov?: number;
  /**
   * Target position to look at.
   * @default [0, 0, 0]
   */
  target?: [number, number, number];
  /**
   * Follow a target object smoothly.
   */
  followTarget?: THREE.Object3D | null;
  /**
   * Smooth follow speed (0-1, higher = faster).
   * @default 0.1
   */
  followSpeed?: number;
  /**
   * Offset from follow target.
   * @default [0, 0, 0]
   */
  followOffset?: [number, number, number];
  /**
   * Enable smooth camera transitions.
   * @default true
   */
  smooth?: boolean;
  /**
   * Make this the default camera.
   * @default true
   */
  makeDefault?: boolean;
}

/**
 * Preset configurations.
 */
const PRESETS: Record<
  Exclude<PerspectivePreset, 'custom'>,
  { yaw: number; pitch: number; orthoScale: number }
> = {
  side: { yaw: 90, pitch: 0, orthoScale: 10 },
  'side-3/4': { yaw: 75, pitch: 10, orthoScale: 10 },
  isometric: { yaw: 45, pitch: 35.264, orthoScale: 10 },
  'isometric-rpg': { yaw: 45, pitch: 60, orthoScale: 15 },
  'top-down': { yaw: 0, pitch: 90, orthoScale: 10 },
  'top-down-tilt': { yaw: 0, pitch: 75, orthoScale: 12 },
  hex: { yaw: 30, pitch: 55, orthoScale: 12 },
  dimetric: { yaw: 45, pitch: 26.565, orthoScale: 10 },
  trimetric: { yaw: 40, pitch: 30, orthoScale: 10 },
  cavalier: { yaw: 45, pitch: 45, orthoScale: 10 },
  cabinet: { yaw: 45, pitch: 63.43, orthoScale: 10 },
};

/**
 * Fixed perspective camera for side-scrollers, isometric games, and other
 * fixed-angle game styles.
 *
 * @category Rendering Pipeline
 *
 * @example
 * ```tsx
 * // Basic side-scroller camera
 * <Canvas>
 *   <FixedPerspectiveCamera preset="side" />
 *   <GameScene />
 * </Canvas>
 * ```
 *
 * @example
 * ```tsx
 * // Follow player in isometric view
 * <FixedPerspectiveCamera
 *   preset="isometric-rpg"
 *   followTarget={playerRef.current}
 *   followSpeed={0.08}
 *   followOffset={[0, 2, 0]}
 * />
 * ```
 */
export function FixedPerspectiveCamera({
  preset = 'side',
  yaw: customYaw = 0,
  pitch: customPitch = 0,
  roll = 0,
  distance = 10,
  orthographic = true,
  orthoScale: customOrthoScale,
  fov = 50,
  target = [0, 0, 0],
  followTarget,
  followSpeed = 0.1,
  followOffset = [0, 0, 0],
  smooth = true,
  makeDefault = true,
}: FixedPerspectiveCameraProps) {
  const { set, size } = useThree();

  // Get preset values or custom
  const { yaw, pitch, orthoScale } = useMemo(() => {
    if (preset === 'custom') {
      return {
        yaw: customYaw,
        pitch: customPitch,
        orthoScale: customOrthoScale ?? 10,
      };
    }
    const p = PRESETS[preset];
    return {
      yaw: p.yaw,
      pitch: p.pitch,
      orthoScale: customOrthoScale ?? p.orthoScale,
    };
  }, [preset, customYaw, customPitch, customOrthoScale]);

  // Current target position (for smooth following)
  const currentTarget = useRef(new THREE.Vector3(...target));
  const targetPos = useRef(new THREE.Vector3());
  const offsetVec = useRef(new THREE.Vector3());

  // Create camera
  const camera = useMemo(() => {
    const aspect = size.width / size.height;

    if (orthographic) {
      const halfWidth = (orthoScale * aspect) / 2;
      const halfHeight = orthoScale / 2;
      return new THREE.OrthographicCamera(
        -halfWidth,
        halfWidth,
        halfHeight,
        -halfHeight,
        0.1,
        distance * 3
      );
    } else {
      return new THREE.PerspectiveCamera(fov, aspect, 0.1, distance * 3);
    }
  }, [orthographic, orthoScale, fov, distance, size.width, size.height]);

  // Position camera based on angles
  useEffect(() => {
    const yawRad = THREE.MathUtils.degToRad(yaw);
    const pitchRad = THREE.MathUtils.degToRad(pitch);

    const x = distance * Math.cos(pitchRad) * Math.sin(yawRad);
    const y = distance * Math.sin(pitchRad);
    const z = distance * Math.cos(pitchRad) * Math.cos(yawRad);

    camera.position.set(
      currentTarget.current.x + x,
      currentTarget.current.y + y,
      currentTarget.current.z + z
    );
    camera.lookAt(currentTarget.current);

    if (roll !== 0) {
      camera.rotateZ(THREE.MathUtils.degToRad(roll));
    }

    camera.updateProjectionMatrix();

    if (makeDefault) {
      set({ camera });
    }
  }, [camera, yaw, pitch, roll, distance, set, makeDefault]);

  // Update camera on resize
  useEffect(() => {
    const aspect = size.width / size.height;

    if (camera instanceof THREE.OrthographicCamera) {
      const halfWidth = (orthoScale * aspect) / 2;
      const halfHeight = orthoScale / 2;
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
    } else if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = aspect;
    }

    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, orthoScale]);

  // Follow target each frame
  useFrame(() => {
    if (!followTarget) return;

    // Calculate target position with offset
    followTarget.getWorldPosition(targetPos.current);
    offsetVec.current.fromArray(followOffset);
    targetPos.current.add(offsetVec.current);

    // Smooth follow
    if (smooth) {
      currentTarget.current.lerp(targetPos.current, followSpeed);
    } else {
      currentTarget.current.copy(targetPos.current);
    }

    // Update camera position
    const yawRad = THREE.MathUtils.degToRad(yaw);
    const pitchRad = THREE.MathUtils.degToRad(pitch);

    const x = distance * Math.cos(pitchRad) * Math.sin(yawRad);
    const y = distance * Math.sin(pitchRad);
    const z = distance * Math.cos(pitchRad) * Math.cos(yawRad);

    camera.position.set(
      currentTarget.current.x + x,
      currentTarget.current.y + y,
      currentTarget.current.z + z
    );
    camera.lookAt(currentTarget.current);

    if (roll !== 0) {
      camera.rotateZ(THREE.MathUtils.degToRad(roll));
    }
  });

  // Render nothing - camera is set via useThree
  return null;
}

/**
 * Get the camera position for a given preset and distance.
 * Useful for calculating spawn points or UI positioning.
 *
 * @category Rendering Pipeline
 *
 * @example
 * ```ts
 * const cameraPos = getCameraPosition('isometric', 20);
 * // { x: 14.14, y: 11.55, z: 14.14 }
 * ```
 */
export function getCameraPosition(
  preset: PerspectivePreset,
  distance: number,
  customAngles?: { yaw: number; pitch: number }
): { x: number; y: number; z: number } {
  let yaw: number;
  let pitch: number;

  if (preset === 'custom') {
    if (!customAngles) {
      // Default to side view if custom angles missing
      yaw = 90;
      pitch = 0;
    } else {
      yaw = customAngles.yaw;
      pitch = customAngles.pitch;
    }
  } else {
    const p = PRESETS[preset];
    yaw = p.yaw;
    pitch = p.pitch;
  }

  const yawRad = THREE.MathUtils.degToRad(yaw);
  const pitchRad = THREE.MathUtils.degToRad(pitch);

  return {
    x: distance * Math.cos(pitchRad) * Math.sin(yawRad),
    y: distance * Math.sin(pitchRad),
    z: distance * Math.cos(pitchRad) * Math.cos(yawRad),
  };
}

/**
 * Convert screen pixel coordinates to world coordinates for a fixed perspective camera.
 *
 * @category Rendering Pipeline
 *
 * @example
 * ```ts
 * const worldPos = screenToWorld(mouseX, mouseY, camera, viewportWidth, viewportHeight, groundPlane);
 * ```
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: THREE.Camera,
  viewportWidth: number,
  viewportHeight: number,
  groundY: number = 0
): THREE.Vector3 | null {
  // Convert screen pixel coordinates to Normalized Device Coordinates (NDC)
  const ndc = new THREE.Vector2(
    (screenX / viewportWidth) * 2 - 1,
    -(screenY / viewportHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(ndc, camera);

  // Create a ground plane
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -groundY);
  const intersection = new THREE.Vector3();

  const result = raycaster.ray.intersectPlane(plane, intersection);
  return result ? intersection : null;
}
