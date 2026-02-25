import { describe, expect, it } from 'vitest';
import { createTimeOfDay } from '../src/components/Sky';

describe('createTimeOfDay', () => {
  it('should return noon settings at hour 12', () => {
    const tod = createTimeOfDay(12);
    expect(tod.sunAngle).toBe(90);
    expect(tod.sunIntensity).toBeCloseTo(1.0, 1);
    expect(tod.starVisibility).toBe(0);
    expect(tod.ambientLight).toBeCloseTo(0.8, 1);
  });

  it('should return sunrise settings at hour 6', () => {
    const tod = createTimeOfDay(6);
    expect(tod.sunAngle).toBeCloseTo(0, 1);
    expect(tod.sunIntensity).toBeCloseTo(0, 1);
    expect(tod.starVisibility).toBe(1);
  });

  it('should return night settings at midnight', () => {
    const tod = createTimeOfDay(0);
    expect(tod.sunAngle).toBe(0);
    expect(tod.sunIntensity).toBe(0);
    expect(tod.starVisibility).toBe(1);
    expect(tod.ambientLight).toBeCloseTo(0.2, 1);
  });

  it('should return sunset settings at hour 18', () => {
    const tod = createTimeOfDay(18);
    expect(tod.sunAngle).toBeCloseTo(0, 1);
    expect(tod.sunIntensity).toBeCloseTo(0, 1);
  });

  it('should handle values > 24 by wrapping', () => {
    const tod = createTimeOfDay(36); // 36 = 12 (noon)
    expect(tod.sunAngle).toBe(90);
    expect(tod.sunIntensity).toBeCloseTo(1.0, 1);
  });

  it('should handle negative hours by wrapping', () => {
    const tod = createTimeOfDay(-12); // -12 = 12 (noon)
    expect(tod.sunAngle).toBe(90);
    expect(tod.sunIntensity).toBeCloseTo(1.0, 1);
  });

  it('should return zero fogDensity', () => {
    const tod = createTimeOfDay(12);
    expect(tod.fogDensity).toBe(0);
  });

  it('should return partial sun at 9 AM', () => {
    const tod = createTimeOfDay(9);
    expect(tod.sunIntensity).toBeGreaterThan(0);
    expect(tod.sunIntensity).toBeLessThan(1);
    expect(tod.sunAngle).toBeGreaterThan(0);
    expect(tod.sunAngle).toBeLessThan(90);
  });
});
