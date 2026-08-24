import { describe, expect, it } from 'vitest';
import { noise3D } from '../noise';

describe('noise3D', () => {
  describe('range', () => {
    it('stays within [-1, 1] across a dense sweep of the field', () => {
      for (let x = -5; x <= 5; x += 0.37) {
        for (let y = -5; y <= 5; y += 0.61) {
          for (let z = -3; z <= 3; z += 0.83) {
            const value = noise3D(x, y, z);
            expect(value).toBeGreaterThanOrEqual(-1);
            expect(value).toBeLessThanOrEqual(1);
          }
        }
      }
    });

    it('returns finite values at the origin and on the lattice', () => {
      for (const [x, y, z] of [
        [0, 0, 0],
        [1, 1, 1],
        [-1, -1, -1],
        [10, -10, 10],
      ]) {
        expect(Number.isFinite(noise3D(x, y, z))).toBe(true);
      }
    });
  });

  describe('determinism', () => {
    it('returns the same value for the same input', () => {
      expect(noise3D(1.5, 2.25, 3.125)).toBe(noise3D(1.5, 2.25, 3.125));
      expect(noise3D(-0.25, 8.5, 0)).toBe(noise3D(-0.25, 8.5, 0));
    });

    it('varies as the sample point moves within a cell', () => {
      // Same integer cell, different fractional offsets.
      const samples = [0.1, 0.3, 0.5, 0.7, 0.9].map((f) => noise3D(2 + f, 2 + f, 2 + f));
      const unique = new Set(samples);
      expect(unique.size).toBeGreaterThan(1);
    });

    it('produces different fields for different z slices', () => {
      const a = noise3D(1.5, 1.5, 0.5);
      const b = noise3D(1.5, 1.5, 5.5);
      expect(a).not.toBe(b);
    });
  });

  describe('continuity', () => {
    it('changes smoothly rather than jumping across a cell boundary', () => {
      // Approach the boundary at x = 3 from both sides; the smoothstep fade
      // means the two one-sided limits must be close together.
      const before = noise3D(2.9999, 0.5, 0.5);
      const after = noise3D(3.0001, 0.5, 0.5);
      expect(Math.abs(after - before)).toBeLessThan(0.05);
    });

    it('keeps nearby samples close in value', () => {
      const base = noise3D(1.2, 3.4, 5.6);
      const nudged = noise3D(1.2001, 3.4, 5.6);
      expect(Math.abs(nudged - base)).toBeLessThan(0.01);
    });
  });

  describe('edge cases', () => {
    it('handles exact integer coordinates where the fractional part is zero', () => {
      const value = noise3D(4, 4, 4);
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    });

    it('handles negative fractional coordinates', () => {
      const value = noise3D(-1.75, -2.5, -0.25);
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    });

    it('handles zero', () => {
      expect(Number.isFinite(noise3D(0, 0, 0))).toBe(true);
    });

    it('handles very large coordinates without returning NaN', () => {
      // Large inputs stress the sin-based hash; the result must still be usable
      // as a velocity multiplier rather than poisoning the simulation.
      const value = noise3D(1e6, 1e6, 1e6);
      expect(Number.isNaN(value)).toBe(false);
    });

    it('propagates NaN rather than silently producing a number', () => {
      expect(Number.isNaN(noise3D(Number.NaN, 0, 0))).toBe(true);
      expect(Number.isNaN(noise3D(0, Number.NaN, 0))).toBe(true);
      expect(Number.isNaN(noise3D(0, 0, Number.NaN))).toBe(true);
    });

    it('yields NaN for infinite coordinates', () => {
      // floor(Infinity) is Infinity and Infinity - Infinity is NaN; asserting
      // this pins the observed behaviour so a future change is deliberate.
      expect(Number.isNaN(noise3D(Number.POSITIVE_INFINITY, 0, 0))).toBe(true);
    });
  });

  describe('distribution', () => {
    it('covers both signs over a broad sample', () => {
      let negative = 0;
      let positive = 0;
      for (let i = 0; i < 500; i++) {
        const value = noise3D(i * 0.31, i * 0.17, i * 0.53);
        if (value < 0) negative++;
        if (value > 0) positive++;
      }
      expect(negative).toBeGreaterThan(20);
      expect(positive).toBeGreaterThan(20);
    });
  });
});
