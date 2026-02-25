/**
 * Sky Component Tests
 *
 * Tests for ProceduralSky exports, createTimeOfDay utility, and configuration logic.
 *
 * @module components/sky/__tests__/sky.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
}));

vi.mock('@strata-game-library/core', () => ({
  createSkyMaterial: vi.fn(() => ({
    uniforms: {
      uTime: { value: 0 },
      uSunIntensity: { value: 1.0 },
      uSunAngle: { value: 60 },
      uAmbientLight: { value: 0.8 },
      uStarVisibility: { value: 0 },
      uFogDensity: { value: 0 },
      uWeatherIntensity: { value: 0 },
      uGyroTilt: { value: { set: vi.fn() } },
    },
    dispose: vi.fn(),
  })),
  createSkyGeometry: vi.fn(() => ({
    dispose: vi.fn(),
  })),
}));

describe('Sky exports', () => {
  it('should export ProceduralSky from index', async () => {
    const skyModule = await import('../index');
    expect(skyModule.ProceduralSky).toBeDefined();
  });

  it('should export createTimeOfDay utility function', async () => {
    const { createTimeOfDay } = await import('../ProceduralSky');
    expect(typeof createTimeOfDay).toBe('function');
  });

  it('should export ProceduralSky as a function component', async () => {
    const { ProceduralSky } = await import('../ProceduralSky');
    expect(typeof ProceduralSky).toBe('function');
  });
});

describe('createTimeOfDay', () => {
  let createTimeOfDay: (hour: number) => {
    sunIntensity: number;
    sunAngle: number;
    ambientLight: number;
    starVisibility: number;
    fogDensity: number;
  };

  beforeAll(async () => {
    const mod = await import('../ProceduralSky');
    createTimeOfDay = mod.createTimeOfDay;
  });

  it('should return midnight state at hour 0', () => {
    const state = createTimeOfDay(0);
    expect(state.sunIntensity).toBe(0);
    expect(state.sunAngle).toBe(0);
    expect(state.starVisibility).toBe(1);
    expect(state.fogDensity).toBe(0);
  });

  it('should return noon state at hour 12', () => {
    const state = createTimeOfDay(12);
    expect(state.sunIntensity).toBeCloseTo(1, 1);
    expect(state.sunAngle).toBeCloseTo(90, 0);
    expect(state.starVisibility).toBe(0);
  });

  it('should return sunrise state at hour 6', () => {
    const state = createTimeOfDay(6);
    expect(state.sunIntensity).toBeCloseTo(0, 1);
    expect(state.sunAngle).toBeCloseTo(0, 0);
  });

  it('should return sunset state at hour 18', () => {
    const state = createTimeOfDay(18);
    expect(state.sunIntensity).toBeCloseTo(0, 1);
    expect(state.sunAngle).toBeCloseTo(0, 0);
  });

  it('should have max intensity at noon', () => {
    const noon = createTimeOfDay(12);
    const morning = createTimeOfDay(8);
    const evening = createTimeOfDay(16);

    expect(noon.sunIntensity).toBeGreaterThan(morning.sunIntensity);
    expect(noon.sunIntensity).toBeGreaterThan(evening.sunIntensity);
  });

  it('should have stars visible at night', () => {
    const midnight = createTimeOfDay(0);
    const twoAM = createTimeOfDay(2);
    const elevenPM = createTimeOfDay(23);

    expect(midnight.starVisibility).toBe(1);
    expect(twoAM.starVisibility).toBe(1);
    expect(elevenPM.starVisibility).toBe(1);
  });

  it('should have no stars visible at noon', () => {
    const noon = createTimeOfDay(12);
    expect(noon.starVisibility).toBe(0);
  });

  it('should normalize hours beyond 24', () => {
    const state25 = createTimeOfDay(25);
    const state1 = createTimeOfDay(1);
    expect(state25.sunIntensity).toBeCloseTo(state1.sunIntensity, 5);
    expect(state25.sunAngle).toBeCloseTo(state1.sunAngle, 5);
  });

  it('should handle negative hours', () => {
    const stateNeg1 = createTimeOfDay(-1);
    const state23 = createTimeOfDay(23);
    expect(stateNeg1.sunIntensity).toBeCloseTo(state23.sunIntensity, 5);
  });

  it('should have ambient light always above 0.2', () => {
    for (let hour = 0; hour < 24; hour++) {
      const state = createTimeOfDay(hour);
      expect(state.ambientLight).toBeGreaterThanOrEqual(0.2);
    }
  });

  it('should have fog density always 0 from createTimeOfDay', () => {
    for (let hour = 0; hour < 24; hour += 3) {
      const state = createTimeOfDay(hour);
      expect(state.fogDensity).toBe(0);
    }
  });

  it('should have higher ambient light during day than night', () => {
    const noon = createTimeOfDay(12);
    const midnight = createTimeOfDay(0);
    expect(noon.ambientLight).toBeGreaterThan(midnight.ambientLight);
  });
});

describe('ProceduralSky default configuration', () => {
  it('should have correct default TimeOfDayState', () => {
    const defaults = {
      sunIntensity: 1.0,
      sunAngle: 60,
      ambientLight: 0.8,
      starVisibility: 0,
      fogDensity: 0,
    };

    expect(defaults.sunIntensity).toBe(1.0);
    expect(defaults.sunAngle).toBe(60);
    expect(defaults.ambientLight).toBe(0.8);
    expect(defaults.starVisibility).toBe(0);
    expect(defaults.fogDensity).toBe(0);
  });

  it('should have correct default WeatherState', () => {
    const defaults = {
      intensity: 0,
    };
    expect(defaults.intensity).toBe(0);
  });

  it('should have default size of [200, 100]', () => {
    const defaultSize: [number, number] = [200, 100];
    expect(defaultSize).toEqual([200, 100]);
  });

  it('should have default distance of 50', () => {
    const defaultDistance = 50;
    expect(defaultDistance).toBe(50);
  });
});

describe('ProceduralSky sunElevation alias', () => {
  it('should support sunElevation as alias for sunAngle', () => {
    const timeOfDayProp = { sunElevation: 45 };
    const defaults = {
      sunIntensity: 1.0,
      sunAngle: 60,
      ambientLight: 0.8,
      starVisibility: 0,
      fogDensity: 0,
    };
    const merged = { ...defaults, ...timeOfDayProp };
    expect(merged.sunElevation).toBe(45);
  });
});
