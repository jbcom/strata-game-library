import { describe, expect, it } from 'vitest';
import { createBabylonWaterShaderMaterial } from '../src/materials/waterMaterial';

describe('createBabylonWaterShaderMaterial', () => {
  it('should create a material handle with default options', () => {
    const handle = createBabylonWaterShaderMaterial();

    expect(handle.vertexShader).toBeDefined();
    expect(handle.fragmentShader).toBeDefined();
    expect(handle.vertexShader).toContain('worldViewProjection');
    expect(handle.fragmentShader).toContain('uCausticIntensity');

    const uniforms = handle.getUniforms();
    expect(uniforms.uTime).toBe(0);
    expect(uniforms.uCausticIntensity).toBe(0.4);
    expect(uniforms.uWaveHeight).toBe(0.5);
    expect(uniforms.uWaterColor).toEqual(expect.any(Array));
    expect(uniforms.uWaterColor).toHaveLength(3);

    handle.dispose();
  });

  it('should parse hex colors to RGB floats', () => {
    const handle = createBabylonWaterShaderMaterial({
      waterColor: '#ff0000',
      deepWaterColor: '#00ff00',
      foamColor: '#0000ff',
    });

    const uniforms = handle.getUniforms();
    expect(uniforms.uWaterColor[0]).toBeCloseTo(1.0, 2);
    expect(uniforms.uWaterColor[1]).toBeCloseTo(0.0, 2);
    expect(uniforms.uWaterColor[2]).toBeCloseTo(0.0, 2);

    expect(uniforms.uDeepWaterColor[0]).toBeCloseTo(0.0, 2);
    expect(uniforms.uDeepWaterColor[1]).toBeCloseTo(1.0, 2);
    expect(uniforms.uDeepWaterColor[2]).toBeCloseTo(0.0, 2);

    expect(uniforms.uFoamColor[0]).toBeCloseTo(0.0, 2);
    expect(uniforms.uFoamColor[1]).toBeCloseTo(0.0, 2);
    expect(uniforms.uFoamColor[2]).toBeCloseTo(1.0, 2);

    handle.dispose();
  });

  it('should update time', () => {
    const handle = createBabylonWaterShaderMaterial();

    expect(handle.getUniforms().uTime).toBe(0);
    handle.updateTime(1.5);
    expect(handle.getUniforms().uTime).toBe(1.5);

    handle.dispose();
  });

  it('should not update time after dispose', () => {
    const handle = createBabylonWaterShaderMaterial();

    handle.updateTime(1.0);
    expect(handle.getUniforms().uTime).toBe(1.0);

    handle.dispose();
    handle.updateTime(5.0);
    expect(handle.getUniforms().uTime).toBe(1.0);
  });

  it('should respect custom causticIntensity', () => {
    const handle = createBabylonWaterShaderMaterial({ causticIntensity: 0.8 });
    expect(handle.getUniforms().uCausticIntensity).toBe(0.8);
    handle.dispose();
  });

  it('should throw for invalid causticIntensity', () => {
    expect(() => createBabylonWaterShaderMaterial({ causticIntensity: -0.1 })).toThrow(
      'causticIntensity must be between 0 and 1',
    );
    expect(() => createBabylonWaterShaderMaterial({ causticIntensity: 1.5 })).toThrow(
      'causticIntensity must be between 0 and 1',
    );
  });

  it('should contain Babylon.js-compatible vertex shader with position attribute', () => {
    const handle = createBabylonWaterShaderMaterial();
    expect(handle.vertexShader).toContain('attribute vec3 position');
    expect(handle.vertexShader).toContain('attribute vec2 uv');
    expect(handle.vertexShader).toContain('uniform mat4 worldViewProjection');
    handle.dispose();
  });

  it('should contain caustic calculation in fragment shader', () => {
    const handle = createBabylonWaterShaderMaterial();
    expect(handle.fragmentShader).toContain('caustic');
    expect(handle.fragmentShader).toContain('fresnel');
    expect(handle.fragmentShader).toContain('uFoamColor');
    handle.dispose();
  });

  it('should respect custom waveHeight', () => {
    const handle = createBabylonWaterShaderMaterial({ waveHeight: 1.5 });
    expect(handle.getUniforms().uWaveHeight).toBe(1.5);
    handle.dispose();
  });
});
