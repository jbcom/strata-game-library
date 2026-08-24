/**
 * Pure deadzone/clamp/normalize math for a virtual joystick.
 *
 * Kept in its own module rather than folded into `input.ts` because it is
 * genuinely engine-agnostic: no imports at all, so it can be used by any
 * adapter — or by a consumer with no renderer — without pulling three.js in.
 *
 * Contributed from @arcade-cabinet/input-joystick, where it backed a
 * touch-anywhere floating joystick. Strata's own VirtualJoystick had no
 * deadzone handling, which is the gap this fills.
 */

export interface JoystickVector {
  /** Normalized horizontal axis, -1..1. */
  x: number;
  /** Normalized vertical axis, -1..1. */
  y: number;
  /** Distance from centre, 0..1, already deadzone-adjusted. */
  magnitude: number;
  /** Direction in radians, atan2(y, x). Zero when inside the deadzone. */
  angle: number;
}

/** Raw pointer offset in pixels, relative to the joystick's origin. */
export interface RawOffset {
  x: number;
  y: number;
}

const ZERO: JoystickVector = { x: 0, y: 0, magnitude: 0, angle: 0 };

/**
 * Convert a raw pointer offset into a normalized joystick vector.
 *
 * @param offset  Pointer offset in pixels from the joystick's origin.
 * @param radius  Travel radius in pixels. Non-positive radii yield a zero vector.
 * @param deadZone Fraction of the radius (0..1) treated as no input. Input inside
 *   this band returns zero; input beyond it is rescaled so that magnitude ramps
 *   from 0 at the deadzone edge to 1 at full travel. Without that rescale the
 *   stick would jump discontinuously to `deadZone` the moment it engaged.
 */
export function normalizeJoystick(offset: RawOffset, radius: number, deadZone = 0): JoystickVector {
  if (!(radius > 0)) return { ...ZERO };

  const distance = Math.hypot(offset.x, offset.y);
  if (distance === 0) return { ...ZERO };

  const clamped = Math.min(distance, radius);
  const raw = clamped / radius;

  const dead = Math.min(Math.max(deadZone, 0), 1);
  if (raw <= dead) return { ...ZERO };

  // Rescale past the deadzone so magnitude still spans the full 0..1 range.
  const magnitude = dead >= 1 ? 0 : (raw - dead) / (1 - dead);

  const angle = Math.atan2(offset.y, offset.x);
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
    magnitude,
    angle,
  };
}
