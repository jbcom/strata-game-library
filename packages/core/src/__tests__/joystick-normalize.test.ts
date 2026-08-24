import { describe, expect, it } from 'vitest';
import { normalizeJoystick } from '../core/joystick-normalize';

describe('normalizeJoystick', () => {
  it('returns zero at the origin', () => {
    expect(normalizeJoystick({ x: 0, y: 0 }, 50)).toEqual({
      x: 0,
      y: 0,
      magnitude: 0,
      angle: 0,
    });
  });

  it('returns zero for a non-positive radius rather than dividing by it', () => {
    expect(normalizeJoystick({ x: 10, y: 10 }, 0).magnitude).toBe(0);
    expect(normalizeJoystick({ x: 10, y: 10 }, -5).magnitude).toBe(0);
  });

  it('reaches full magnitude at the travel radius', () => {
    const v = normalizeJoystick({ x: 50, y: 0 }, 50);
    expect(v.magnitude).toBeCloseTo(1, 6);
    expect(v.x).toBeCloseTo(1, 6);
    expect(v.y).toBeCloseTo(0, 6);
  });

  it('clamps past the travel radius instead of overshooting', () => {
    const v = normalizeJoystick({ x: 500, y: 0 }, 50);
    expect(v.magnitude).toBeCloseTo(1, 6);
    expect(v.x).toBeCloseTo(1, 6);
  });

  it('suppresses input inside the deadzone', () => {
    // 10px of 100px travel is 0.1, inside a 0.2 deadzone.
    expect(normalizeJoystick({ x: 10, y: 0 }, 100, 0.2).magnitude).toBe(0);
  });

  it('ramps from zero at the deadzone edge rather than jumping', () => {
    // Without rescaling, magnitude would jump straight to 0.2 on engaging.
    const justOutside = normalizeJoystick({ x: 21, y: 0 }, 100, 0.2);
    expect(justOutside.magnitude).toBeGreaterThan(0);
    expect(justOutside.magnitude).toBeLessThan(0.05);

    // And still reaches a full 1 at maximum travel.
    expect(normalizeJoystick({ x: 100, y: 0 }, 100, 0.2).magnitude).toBeCloseTo(1, 6);
  });

  it('reports direction independently of magnitude', () => {
    const up = normalizeJoystick({ x: 0, y: 25 }, 50);
    expect(up.angle).toBeCloseTo(Math.PI / 2, 6);
    const left = normalizeJoystick({ x: -25, y: 0 }, 50);
    expect(Math.abs(left.angle)).toBeCloseTo(Math.PI, 6);
  });

  it('treats a full deadzone as no usable input', () => {
    expect(normalizeJoystick({ x: 50, y: 0 }, 50, 1).magnitude).toBe(0);
  });

  it('clamps an out-of-range deadzone rather than producing NaN', () => {
    expect(Number.isFinite(normalizeJoystick({ x: 25, y: 0 }, 50, -1).magnitude)).toBe(true);
    expect(Number.isFinite(normalizeJoystick({ x: 25, y: 0 }, 50, 5).magnitude)).toBe(true);
  });
});
