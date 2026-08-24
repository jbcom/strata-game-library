/**
 * Screen-space projection and anchoring for world-attached UI.
 *
 * Owns the round trip between world coordinates and pixel coordinates: placing
 * nameplates and HUD markers over 3D objects, converting cursor positions back
 * into the world, fading overlays by distance, and offsetting an element for a
 * screen anchor.
 *
 * This is the **only** part of `core/ui` that couples to the renderer — the
 * projection maths needs a camera. Formatting, defaults and type declarations
 * live in sibling modules and stay renderer-free.
 *
 * @packageDocumentation
 * @module core/ui/projection
 * @category UI & Interaction
 */

import * as THREE from 'three';
import type { ScreenPosition, UIAnchor } from './types';

/**
 * Calculates the pixel offset for an element based on a screen anchor.
 *
 * @category UI & Interaction
 * @param anchor - The screen corner or center to anchor to.
 * @param width - Width of the UI element in pixels.
 * @param height - Height of the UI element in pixels.
 * @returns An {x, y} offset object.
 */
export function getAnchorOffset(
  anchor: UIAnchor,
  width: number,
  height: number
): { x: number; y: number } {
  switch (anchor) {
    case 'topLeft':
      return { x: 0, y: 0 };
    case 'topRight':
      return { x: -width, y: 0 };
    case 'bottomLeft':
      return { x: 0, y: -height };
    case 'bottomRight':
      return { x: -width, y: -height };
    case 'center':
      return { x: -width / 2, y: -height / 2 };
    case 'top':
      return { x: -width / 2, y: 0 };
    case 'bottom':
      return { x: -width / 2, y: -height };
    case 'left':
      return { x: 0, y: -height / 2 };
    case 'right':
      return { x: -width, y: -height / 2 };
    default:
      return { x: 0, y: 0 };
  }
}

/**
 * Projects a 3D world position into 2D screen coordinates.
 *
 * Essential for placing HTML-based UI elements (nameplates, HUD markers)
 * correctly over 3D game objects.
 *
 * @category UI & Interaction
 * @param position - The world position to project.
 * @param camera - The active Three.js camera.
 * @param width - Current viewport width in pixels.
 * @param height - Current viewport height in pixels.
 * @returns ScreenPosition object containing pixel coordinates and visibility.
 */
export function worldToScreen(
  position: THREE.Vector3,
  camera: THREE.Camera,
  width: number,
  height: number
): ScreenPosition {
  const vector = position.clone();
  vector.project(camera);

  const behindCamera = vector.z > 1;

  const x = (vector.x * 0.5 + 0.5) * width;
  const y = (-vector.y * 0.5 + 0.5) * height;

  const visible = !behindCamera && x >= 0 && x <= width && y >= 0 && y <= height;

  const distance = position.distanceTo(camera.position);

  return { x, y, visible, distance };
}

/**
 * Unprojects 2D screen coordinates into a 3D world position at a specific depth.
 *
 * Used for mouse interaction, placement tools, or aiming systems.
 *
 * @category UI & Interaction
 * @param screenX - Pixel X coordinate.
 * @param screenY - Pixel Y coordinate.
 * @param camera - The active Three.js camera.
 * @param width - Viewport width in pixels.
 * @param height - Viewport height in pixels.
 * @param targetZ - The world Z-depth to project to (default: 0).
 * @returns The resulting Vector3 in world space.
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: THREE.Camera,
  width: number,
  height: number,
  targetZ: number = 0
): THREE.Vector3 {
  const vector = new THREE.Vector3((screenX / width) * 2 - 1, -(screenY / height) * 2 + 1, 0.5);

  vector.unproject(camera);

  const dir = vector.sub(camera.position).normalize();

  // Guard against division by zero when camera ray is parallel to XY plane
  if (Math.abs(dir.z) < 0.000001) {
    // Return a point at a reasonable distance along the ray
    return camera.position.clone().add(dir.multiplyScalar(100));
  }

  const distance = (targetZ - camera.position.z) / dir.z;

  return camera.position.clone().add(dir.multiplyScalar(distance));
}

/**
 * Calculates a 0-1 opacity fade based on distance.
 *
 * Used to smoothly hide UI elements as they get further from or closer to the camera.
 *
 * @category UI & Interaction
 * @param distance - Current distance from camera.
 * @param fadeStart - Distance where fading begins.
 * @param fadeEnd - Distance where element is fully transparent.
 * @returns Opacity value (0-1).
 */
export function calculateFade(distance: number, fadeStart: number, fadeEnd: number): number {
  if (distance <= fadeStart) return 1;
  if (distance >= fadeEnd) return 0;
  // Guard against division by zero when fadeStart equals fadeEnd
  if (fadeEnd === fadeStart) return 1;
  return 1 - (distance - fadeStart) / (fadeEnd - fadeStart);
}
