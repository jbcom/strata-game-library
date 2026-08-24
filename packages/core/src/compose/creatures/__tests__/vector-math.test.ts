import { describe, expect, it } from 'vitest';
import type { RuntimeVector3Tuple } from '../../runtime-types';
import {
  addVector,
  distance3,
  normalizeVector,
  offsetToward,
  scaleVector,
  subtractVector,
  vectorLength,
} from '../vector-math';

describe('addVector / subtractVector', () => {
  it('adds and subtracts componentwise', () => {
    expect(addVector([1, 2, 3], [10, 20, 30])).toEqual([11, 22, 33]);
    expect(subtractVector([10, 20, 30], [1, 2, 3])).toEqual([9, 18, 27]);
  });

  it('handles negative components', () => {
    expect(addVector([-1, -2, -3], [1, 2, 3])).toEqual([0, 0, 0]);
    expect(subtractVector([-1, -2, -3], [1, 2, 3])).toEqual([-2, -4, -6]);
  });

  it('does not mutate its inputs', () => {
    const a: RuntimeVector3Tuple = [1, 2, 3];
    const b: RuntimeVector3Tuple = [4, 5, 6];
    addVector(a, b);
    subtractVector(a, b);
    expect(a).toEqual([1, 2, 3]);
    expect(b).toEqual([4, 5, 6]);
  });
});

describe('scaleVector', () => {
  it('scales every component', () => {
    expect(scaleVector([1, 2, 3], 2)).toEqual([2, 4, 6]);
  });

  it('collapses to the origin at zero scale', () => {
    expect(scaleVector([5, -5, 5], 0)).toEqual([0, -0, 0]);
  });

  it('mirrors through the origin at negative scale', () => {
    expect(scaleVector([1, -2, 3], -1)).toEqual([-1, 2, -3]);
  });
});

describe('vectorLength', () => {
  it('measures a 3-4-0 triangle as 5', () => {
    expect(vectorLength([3, 4, 0])).toBe(5);
  });

  it('is zero for the zero vector', () => {
    expect(vectorLength([0, 0, 0])).toBe(0);
  });

  it('is sign-independent', () => {
    expect(vectorLength([-3, -4, 0])).toBe(5);
  });

  it('uses hypot, so it survives components that would overflow when squared', () => {
    expect(vectorLength([1e200, 0, 0])).toBe(1e200);
    expect(Number.isFinite(vectorLength([1e200, 1e200, 0]))).toBe(true);
  });
});

describe('normalizeVector', () => {
  it('produces a unit-length vector', () => {
    const unit = normalizeVector([0, 0, 7]);
    expect(unit).toEqual([0, 0, 1]);
    expect(vectorLength(unit)).toBeCloseTo(1, 12);
  });

  it('normalizes a diagonal to 1/sqrt(3) per axis', () => {
    const unit = normalizeVector([2, 2, 2]);
    const expected = 1 / Math.sqrt(3);
    expect(unit[0]).toBeCloseTo(expected, 12);
    expect(vectorLength(unit)).toBeCloseTo(1, 12);
  });

  it('returns the zero vector rather than NaN for zero-length input', () => {
    expect(normalizeVector([0, 0, 0])).toEqual([0, 0, 0]);
  });
});

describe('offsetToward', () => {
  it('walks the requested distance along the direction to the target', () => {
    expect(offsetToward([0, 0, 0], [10, 0, 0], 3)).toEqual([3, 0, 0]);
  });

  it('overshoots past the target when distance exceeds separation', () => {
    expect(offsetToward([0, 0, 0], [2, 0, 0], 5)).toEqual([5, 0, 0]);
  });

  it('moves backwards for a negative distance', () => {
    expect(offsetToward([0, 0, 0], [1, 0, 0], -4)).toEqual([-4, 0, 0]);
  });

  it('returns the origin point when from and to coincide', () => {
    // Direction is undefined, so normalize yields zero and no movement happens.
    expect(offsetToward([2, 3, 4], [2, 3, 4], 9)).toEqual([2, 3, 4]);
  });

  it('is exactly `distance` away from the start point', () => {
    const from: RuntimeVector3Tuple = [1, 1, 1];
    const result = offsetToward(from, [4, 5, 1], 2.5);
    expect(distance3(from, result)).toBeCloseTo(2.5, 12);
  });
});

describe('distance3', () => {
  it('measures a 3-4-0 separation as 5', () => {
    expect(distance3([0, 0, 0], [3, 4, 0])).toBe(5);
  });

  it('is zero for identical points', () => {
    expect(distance3([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  it('is symmetric', () => {
    expect(distance3([1, 2, 3], [-4, 0, 6])).toBe(distance3([-4, 0, 6], [1, 2, 3]));
  });
});
