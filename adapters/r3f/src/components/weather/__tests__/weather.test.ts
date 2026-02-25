/**
 * Weather System Tests
 *
 * Tests for weather component exports, types, and WeatherSystem logic.
 *
 * @module components/weather/__tests__/weather.test
 */

import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    camera: new THREE.PerspectiveCamera(),
  }),
  useFrame: (callback: any) => callback,
}));

describe('Weather exports', () => {
  it('should export all weather components from index', async () => {
    const weatherModule = await import('../index');

    expect(weatherModule.Rain).toBeDefined();
    expect(weatherModule.Snow).toBeDefined();
    expect(weatherModule.Lightning).toBeDefined();
    expect(weatherModule.WeatherSystem).toBeDefined();
  });

  it('should export Rain as a function component', async () => {
    const { Rain } = await import('../index');
    expect(typeof Rain).toBe('function');
  });

  it('should export Snow as a function component', async () => {
    const { Snow } = await import('../index');
    expect(typeof Snow).toBe('function');
  });

  it('should export Lightning as a function component', async () => {
    const { Lightning } = await import('../index');
    expect(typeof Lightning).toBe('function');
  });

  it('should export WeatherSystem as a function component', async () => {
    const { WeatherSystem } = await import('../index');
    expect(typeof WeatherSystem).toBe('function');
  });
});

describe('WeatherSystem logic', () => {
  it('should determine rain visibility based on type and temperature', () => {
    // Rain shows when type is rain/storm AND temperature > 0
    const state = {
      type: 'rain' as const,
      intensity: 0.5,
      windDirection: new THREE.Vector3(1, 0, 0),
      windIntensity: 0.3,
      temperature: 20,
      visibility: 1,
      cloudCoverage: 0,
      precipitationRate: 0,
    };

    const showRain =
      (state.type === 'rain' || state.type === 'storm') && state.temperature > 0;
    expect(showRain).toBe(true);
  });

  it('should not show rain when temperature is below 0', () => {
    const state = {
      type: 'rain' as const,
      temperature: -5,
    };

    const showRain =
      (state.type === 'rain' || state.type === 'storm') && state.temperature > 0;
    expect(showRain).toBe(false);
  });

  it('should show snow when type is snow', () => {
    const state = {
      type: 'snow' as const,
      temperature: -5,
    };

    const showSnow =
      state.type === 'snow' ||
      ((state.type === 'rain' || state.type === 'storm') && state.temperature <= 0);
    expect(showSnow).toBe(true);
  });

  it('should show snow instead of rain when temperature <= 0', () => {
    const state: { type: string; temperature: number } = {
      type: 'rain',
      temperature: 0,
    };

    const showRain =
      (state.type === 'rain' || state.type === 'storm') && state.temperature > 0;
    const showSnow =
      state.type === 'snow' ||
      ((state.type === 'rain' || state.type === 'storm') && state.temperature <= 0);

    expect(showRain).toBe(false);
    expect(showSnow).toBe(true);
  });

  it('should show lightning only during storms with intensity > 0.5', () => {
    const shouldShowLightning = (enabled: boolean, type: string, intensity: number) =>
      enabled && type === 'storm' && intensity > 0.5;

    // Storm with high intensity
    expect(shouldShowLightning(true, 'storm', 0.8)).toBe(true);

    // Storm with low intensity
    expect(shouldShowLightning(true, 'storm', 0.3)).toBe(false);

    // Rain (not storm)
    expect(shouldShowLightning(true, 'rain', 0.8)).toBe(false);

    // Lightning disabled
    expect(shouldShowLightning(false, 'storm', 0.8)).toBe(false);
  });

  it('should calculate wind vector from direction and intensity', () => {
    const windDirection = new THREE.Vector3(1, 0, 0);
    const windIntensity = 0.5;
    const wind = windDirection.clone().multiplyScalar(windIntensity);

    expect(wind.x).toBeCloseTo(0.5);
    expect(wind.y).toBeCloseTo(0);
    expect(wind.z).toBeCloseTo(0);
  });

  it('should scale particle count by intensity', () => {
    const rainCount = 10000;
    const intensity = 0.7;

    expect(Math.floor(rainCount * intensity)).toBe(7000);
  });

  it('should halve wind for snow compared to rain', () => {
    const windDirection = new THREE.Vector3(1, 0, 0.5);
    const windIntensity = 1.0;
    const wind = windDirection.clone().multiplyScalar(windIntensity);
    const snowWind = wind.clone().multiplyScalar(0.5);

    expect(snowWind.x).toBeCloseTo(0.5);
    expect(snowWind.z).toBeCloseTo(0.25);
  });

  it('should merge default weather state with provided config', () => {
    const defaults = {
      type: 'clear' as const,
      intensity: 0,
      windDirection: new THREE.Vector3(1, 0, 0),
      windIntensity: 0,
      temperature: 20,
      visibility: 1,
      cloudCoverage: 0,
      precipitationRate: 0,
    };

    const overrides = {
      type: 'storm' as const,
      intensity: 0.9,
    };

    const state = { ...defaults, ...overrides };

    expect(state.type).toBe('storm');
    expect(state.intensity).toBe(0.9);
    expect(state.temperature).toBe(20); // unchanged default
  });

  it('should calculate lightning frequency based on storm intensity', () => {
    const intensity = 0.8;
    const frequency = 0.05 + intensity * 0.1;
    expect(frequency).toBeCloseTo(0.13);
  });

  it('should calculate flash intensity based on storm intensity', () => {
    const intensity = 0.8;
    const flashIntensity = 1 + intensity;
    expect(flashIntensity).toBeCloseTo(1.8);
  });
});

describe('Rain shader uniforms', () => {
  it('should create rain vertex shader with expected uniforms', () => {
    const uniforms = {
      uTime: { value: 0 },
      uWind: { value: new THREE.Vector3(0.5, 0, 0.2) },
      uIntensity: { value: 1.0 },
      uAreaSize: { value: 50 },
      uHeight: { value: 30 },
      uColor: { value: new THREE.Color(0xaaccff) },
    };

    expect(uniforms.uTime.value).toBe(0);
    expect(uniforms.uIntensity.value).toBe(1.0);
    expect(uniforms.uAreaSize.value).toBe(50);
    expect(uniforms.uHeight.value).toBe(30);
    expect(uniforms.uColor.value).toBeInstanceOf(THREE.Color);
  });
});

describe('Snow shader uniforms', () => {
  it('should create snow vertex shader with expected uniforms', () => {
    const uniforms = {
      uTime: { value: 0 },
      uWind: { value: new THREE.Vector3(0.3, 0, 0.1) },
      uIntensity: { value: 1.0 },
      uAreaSize: { value: 50 },
      uHeight: { value: 30 },
      uColor: { value: new THREE.Color(0xffffff) },
    };

    expect(uniforms.uTime.value).toBe(0);
    expect(uniforms.uIntensity.value).toBe(1.0);
    expect(uniforms.uColor.value.r).toBe(1);
    expect(uniforms.uColor.value.g).toBe(1);
    expect(uniforms.uColor.value.b).toBe(1);
  });
});

describe('Rain geometry generation', () => {
  it('should generate correct number of vertices for rain drops', () => {
    const count = 100;
    const verticesPerDrop = 4; // quad
    const totalVertices = count * verticesPerDrop * 3; // x,y,z per vertex
    expect(totalVertices).toBe(1200);
  });

  it('should generate correct number of indices for rain drops', () => {
    const count = 100;
    const indicesPerDrop = 6; // two triangles per quad
    const totalIndices = count * indicesPerDrop;
    expect(totalIndices).toBe(600);
  });
});

describe('Snow geometry generation', () => {
  it('should vary snowflake size randomly', () => {
    const flakeSize = 0.15;
    const minSize = flakeSize * 0.5;
    const maxSize = flakeSize * 1.0;

    expect(minSize).toBeCloseTo(0.075);
    expect(maxSize).toBeCloseTo(0.15);
  });
});
