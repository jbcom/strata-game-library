import { describe, expect, it } from 'vitest';
import { createBabylonTerrainShaderMaterial } from '../src/materials/terrainMaterial';

describe('createBabylonTerrainShaderMaterial', () => {
  it('should create a material handle with defaults', () => {
    const handle = createBabylonTerrainShaderMaterial();

    expect(handle.vertexShader).toBeDefined();
    expect(handle.fragmentShader).toBeDefined();

    const uniforms = handle.getUniforms();
    expect(uniforms.uRoughness).toBe(0.8);
    expect(uniforms.uGroundColor).toHaveLength(3);
    expect(uniforms.uRockColor).toHaveLength(3);

    handle.dispose();
  });

  it('should parse custom colors', () => {
    const handle = createBabylonTerrainShaderMaterial({
      groundColor: '#ff0000',
      rockColor: '#00ff00',
    });

    const uniforms = handle.getUniforms();
    expect(uniforms.uGroundColor[0]).toBeCloseTo(1.0, 2);
    expect(uniforms.uGroundColor[1]).toBeCloseTo(0.0, 2);
    expect(uniforms.uGroundColor[2]).toBeCloseTo(0.0, 2);

    expect(uniforms.uRockColor[0]).toBeCloseTo(0.0, 2);
    expect(uniforms.uRockColor[1]).toBeCloseTo(1.0, 2);
    expect(uniforms.uRockColor[2]).toBeCloseTo(0.0, 2);

    handle.dispose();
  });

  it('should respect custom roughness', () => {
    const handle = createBabylonTerrainShaderMaterial({ roughness: 0.3 });
    expect(handle.getUniforms().uRoughness).toBe(0.3);
    handle.dispose();
  });

  it('should throw for invalid roughness', () => {
    expect(() => createBabylonTerrainShaderMaterial({ roughness: -0.1 })).toThrow(
      'roughness must be between 0 and 1',
    );
    expect(() => createBabylonTerrainShaderMaterial({ roughness: 1.5 })).toThrow(
      'roughness must be between 0 and 1',
    );
  });

  it('should contain Babylon.js-compatible vertex shader', () => {
    const handle = createBabylonTerrainShaderMaterial();
    expect(handle.vertexShader).toContain('attribute vec3 position');
    expect(handle.vertexShader).toContain('uniform mat4 worldViewProjection');
    expect(handle.vertexShader).toContain('noise');
    handle.dispose();
  });

  it('should contain terrain rendering logic in fragment shader', () => {
    const handle = createBabylonTerrainShaderMaterial();
    expect(handle.fragmentShader).toContain('uGroundColor');
    expect(handle.fragmentShader).toContain('uRockColor');
    expect(handle.fragmentShader).toContain('uRoughness');
    expect(handle.fragmentShader).toContain('slope');
    handle.dispose();
  });
});
