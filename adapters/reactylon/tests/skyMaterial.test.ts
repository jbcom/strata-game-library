import { describe, expect, it } from 'vitest';
import { createBabylonSkyShaderMaterial } from '../src/materials/skyMaterial';

const defaultTimeOfDay = {
  sunIntensity: 1.0,
  sunAngle: 60,
  ambientLight: 0.8,
  starVisibility: 0,
  fogDensity: 0,
};

describe('createBabylonSkyShaderMaterial', () => {
  it('should create a material handle with default weather', () => {
    const handle = createBabylonSkyShaderMaterial({
      timeOfDay: defaultTimeOfDay,
    });

    expect(handle.vertexShader).toBeDefined();
    expect(handle.fragmentShader).toBeDefined();

    const uniforms = handle.getUniforms();
    expect(uniforms.uSunIntensity).toBe(1.0);
    expect(uniforms.uSunAngle).toBe(60);
    expect(uniforms.uAmbientLight).toBe(0.8);
    expect(uniforms.uStarVisibility).toBe(0);
    expect(uniforms.uFogDensity).toBe(0);
    expect(uniforms.uWeatherIntensity).toBe(0);
    expect(uniforms.uTime).toBe(0);

    handle.dispose();
  });

  it('should apply weather settings', () => {
    const handle = createBabylonSkyShaderMaterial({
      timeOfDay: defaultTimeOfDay,
      weather: { intensity: 0.7 },
    });

    expect(handle.getUniforms().uWeatherIntensity).toBe(0.7);
    handle.dispose();
  });

  it('should update time and gyro tilt', () => {
    const handle = createBabylonSkyShaderMaterial({
      timeOfDay: defaultTimeOfDay,
    });

    handle.updateTime(2.0);
    const uniforms = handle.getUniforms();
    expect(uniforms.uTime).toBe(2.0);
    expect(uniforms.uGyroTilt[0]).toBeCloseTo(Math.sin(2.0 * 0.1) * 0.02, 5);
    expect(uniforms.uGyroTilt[1]).toBeCloseTo(Math.cos(2.0 * 0.15) * 0.02, 5);

    handle.dispose();
  });

  it('should update time of day', () => {
    const handle = createBabylonSkyShaderMaterial({
      timeOfDay: defaultTimeOfDay,
    });

    handle.updateTimeOfDay({
      sunIntensity: 0.5,
      sunAngle: 30,
      ambientLight: 0.4,
      starVisibility: 0.8,
      fogDensity: 0.2,
    });

    const uniforms = handle.getUniforms();
    expect(uniforms.uSunIntensity).toBe(0.5);
    expect(uniforms.uSunAngle).toBe(30);
    expect(uniforms.uAmbientLight).toBe(0.4);
    expect(uniforms.uStarVisibility).toBe(0.8);
    expect(uniforms.uFogDensity).toBe(0.2);

    handle.dispose();
  });

  it('should update weather', () => {
    const handle = createBabylonSkyShaderMaterial({
      timeOfDay: defaultTimeOfDay,
    });

    handle.updateWeather({ intensity: 0.9 });
    expect(handle.getUniforms().uWeatherIntensity).toBe(0.9);

    handle.dispose();
  });

  it('should not update after dispose', () => {
    const handle = createBabylonSkyShaderMaterial({
      timeOfDay: defaultTimeOfDay,
    });

    handle.updateTime(1.0);
    handle.dispose();
    handle.updateTime(5.0);
    expect(handle.getUniforms().uTime).toBe(1.0);
  });

  it('should throw for invalid sunIntensity', () => {
    expect(() =>
      createBabylonSkyShaderMaterial({
        timeOfDay: { ...defaultTimeOfDay, sunIntensity: -0.1 },
      }),
    ).toThrow('sunIntensity must be between 0 and 1');

    expect(() =>
      createBabylonSkyShaderMaterial({
        timeOfDay: { ...defaultTimeOfDay, sunIntensity: 1.5 },
      }),
    ).toThrow('sunIntensity must be between 0 and 1');
  });

  it('should throw for invalid sunAngle', () => {
    expect(() =>
      createBabylonSkyShaderMaterial({
        timeOfDay: { ...defaultTimeOfDay, sunAngle: -200 },
      }),
    ).toThrow('sunAngle must be between -180 and 360');

    expect(() =>
      createBabylonSkyShaderMaterial({
        timeOfDay: { ...defaultTimeOfDay, sunAngle: 400 },
      }),
    ).toThrow('sunAngle must be between -180 and 360');
  });

  it('should contain Babylon.js-compatible attributes in vertex shader', () => {
    const handle = createBabylonSkyShaderMaterial({
      timeOfDay: defaultTimeOfDay,
    });
    expect(handle.vertexShader).toContain('attribute vec3 position');
    expect(handle.vertexShader).toContain('attribute vec2 uv');
    expect(handle.vertexShader).toContain('uniform mat4 worldViewProjection');
    handle.dispose();
  });

  it('should contain sky rendering logic in fragment shader', () => {
    const handle = createBabylonSkyShaderMaterial({
      timeOfDay: defaultTimeOfDay,
    });
    expect(handle.fragmentShader).toContain('getSkyColor');
    expect(handle.fragmentShader).toContain('uStarVisibility');
    expect(handle.fragmentShader).toContain('uWeatherIntensity');
    handle.dispose();
  });
});
