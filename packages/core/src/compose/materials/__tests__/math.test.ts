import { describe, expect, it } from 'vitest';
import { clamp01, fract, mix, smoothstep } from '../math';

describe('clamp01', () => {
  it('passes through values already inside the unit range', () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
  });

  it('clamps values outside the unit range to the nearest bound', () => {
    expect(clamp01(-0.0001)).toBe(0);
    expect(clamp01(-1e9)).toBe(0);
    expect(clamp01(1.0001)).toBe(1);
    expect(clamp01(Number.POSITIVE_INFINITY)).toBe(1);
    expect(clamp01(Number.NEGATIVE_INFINITY)).toBe(0);
  });

  it('propagates NaN rather than silently producing a bound', () => {
    expect(clamp01(Number.NaN)).toBeNaN();
  });

  it('normalizes negative zero to zero via Math.max', () => {
    expect(Object.is(clamp01(-0), 0)).toBe(true);
  });
});

describe('fract', () => {
  it('returns the fractional part of positive values', () => {
    expect(fract(2.25)).toBeCloseTo(0.25, 12);
    expect(fract(0)).toBe(0);
  });

  it('returns a positive fraction for negative values, matching GLSL', () => {
    expect(fract(-0.25)).toBeCloseTo(0.75, 12);
    expect(fract(-3.5)).toBeCloseTo(0.5, 12);
  });

  it('returns zero for exact integers of either sign', () => {
    expect(fract(7)).toBe(0);
    expect(fract(-7)).toBe(0);
  });

  it('always produces a result inside [0, 1)', () => {
    for (const value of [-9.9, -1.0001, -0.5, 0.5, 1.0001, 123.456]) {
      const result = fract(value);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1);
    }
  });
});

describe('mix', () => {
  it('returns the endpoints at t=0 and t=1', () => {
    expect(mix(10, 20, 0)).toBe(10);
    expect(mix(10, 20, 1)).toBe(20);
  });

  it('interpolates linearly at the midpoint', () => {
    expect(mix(0, 10, 0.5)).toBe(5);
    expect(mix(-10, 10, 0.5)).toBe(0);
  });

  it('extrapolates beyond the endpoints for t outside [0, 1]', () => {
    expect(mix(0, 10, 2)).toBe(20);
    expect(mix(0, 10, -1)).toBe(-10);
  });

  it('returns the shared value when both endpoints are equal', () => {
    expect(mix(4, 4, 0.37)).toBe(4);
  });
});

describe('smoothstep', () => {
  it('returns 0 at or below the lower edge and 1 at or above the upper edge', () => {
    expect(smoothstep(0, 1, -5)).toBe(0);
    expect(smoothstep(0, 1, 0)).toBe(0);
    expect(smoothstep(0, 1, 1)).toBe(1);
    expect(smoothstep(0, 1, 5)).toBe(1);
  });

  it('returns exactly 0.5 at the midpoint of the edges', () => {
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 12);
    expect(smoothstep(2, 6, 4)).toBeCloseTo(0.5, 12);
  });

  it('has zero slope at both edges, unlike a linear ramp', () => {
    // Hermite easing means values near the edges move slower than linear.
    expect(smoothstep(0, 1, 0.1)).toBeLessThan(0.1);
    expect(smoothstep(0, 1, 0.9)).toBeGreaterThan(0.9);
  });

  it('increases monotonically across the transition band', () => {
    let previous = -1;
    for (let i = 0; i <= 20; i += 1) {
      const current = smoothstep(0, 1, i / 20);
      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }
  });

  it('degenerates to a hard step when the edges collapse', () => {
    // (value - edge) / 0 is +/-Infinity, which clamp01 pins to 1 or 0.
    expect(smoothstep(1, 1, 2)).toBe(1);
    expect(smoothstep(1, 1, 0)).toBe(0);
    // Exactly on the collapsed edge produces 0/0 -> NaN.
    expect(smoothstep(1, 1, 1)).toBeNaN();
  });

  it('handles inverted edges by clamping the normalized parameter', () => {
    expect(smoothstep(1, 0, 2)).toBe(0);
    expect(smoothstep(1, 0, -1)).toBe(1);
  });
});
