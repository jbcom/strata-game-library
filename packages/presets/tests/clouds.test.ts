import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  cloudPresets,
  createCloudPresetConfig,
  getAllCloudPresetNames,
  getCloudPreset,
  interpolateCloudPresets,
} from '../src/clouds';

describe('cloud presets', () => {
  describe('cloudPresets record', () => {
    it('contains all 5 presets', () => {
      expect(Object.keys(cloudPresets)).toHaveLength(5);
    });
  });

  describe('preset structure', () => {
    const presetNames = Object.keys(cloudPresets) as Array<keyof typeof cloudPresets>;

    it.each(presetNames)('preset "%s" has required fields', (name) => {
      const preset = cloudPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('description');
      expect(preset).toHaveProperty('layers');
      expect(preset).toHaveProperty('wind');
      expect(preset).toHaveProperty('dayNight');
    });

    it.each(presetNames)('preset "%s" layers have THREE.Color values', (name) => {
      const preset = cloudPresets[name];
      for (const layer of preset.layers) {
        expect(layer.cloudColor).toBeInstanceOf(THREE.Color);
        expect(layer.shadowColor).toBeInstanceOf(THREE.Color);
      }
    });

    it.each(presetNames)('preset "%s" wind.direction is a THREE.Vector2', (name) => {
      const preset = cloudPresets[name];
      expect(preset.wind.direction).toBeInstanceOf(THREE.Vector2);
    });

    it.each(presetNames)('preset "%s" dayNight.sunColor is a THREE.Color', (name) => {
      const preset = cloudPresets[name];
      expect(preset.dayNight.sunColor).toBeInstanceOf(THREE.Color);
    });

    it.each(presetNames)('preset "%s" has volumetric settings', (name) => {
      const preset = cloudPresets[name];
      expect(preset.volumetric).toBeDefined();
      expect(preset.volumetric!.cloudBase).toBeGreaterThan(0);
      expect(preset.volumetric!.cloudHeight).toBeGreaterThan(0);
    });
  });

  describe('getCloudPreset', () => {
    it('returns the correct preset', () => {
      expect(getCloudPreset('clear')).toBe(cloudPresets.clear);
      expect(getCloudPreset('stormy')).toBe(cloudPresets.stormy);
    });

    it('throws on unknown preset', () => {
      expect(() => getCloudPreset('nonexistent' as any)).toThrow('Unknown cloud preset');
    });
  });

  describe('createCloudPresetConfig', () => {
    it('returns layers, wind, and dayNight', () => {
      const config = createCloudPresetConfig('partlyCloudy');
      expect(config).toHaveProperty('layers');
      expect(config).toHaveProperty('wind');
      expect(config).toHaveProperty('dayNight');
    });

    it('layers match the preset', () => {
      const config = createCloudPresetConfig('overcast');
      expect(config.layers).toBe(cloudPresets.overcast.layers);
    });
  });

  describe('getAllCloudPresetNames', () => {
    it('returns all preset names', () => {
      const names = getAllCloudPresetNames();
      expect(names).toContain('clear');
      expect(names).toContain('partlyCloudy');
      expect(names).toContain('overcast');
      expect(names).toContain('stormy');
      expect(names).toContain('sunset');
      expect(names).toHaveLength(5);
    });
  });

  describe('interpolateCloudPresets', () => {
    it('returns presetA values at t=0', () => {
      const result = interpolateCloudPresets('clear', 'stormy', 0);
      expect(result.wind.speed).toBe(cloudPresets.clear.wind.speed);
      expect(result.dayNight.sunIntensity).toBe(cloudPresets.clear.dayNight.sunIntensity);
    });

    it('returns presetB values at t=1', () => {
      const result = interpolateCloudPresets('clear', 'stormy', 1);
      expect(result.wind.speed).toBe(cloudPresets.stormy.wind.speed);
      expect(result.dayNight.sunIntensity).toBeCloseTo(cloudPresets.stormy.dayNight.sunIntensity);
    });

    it('interpolates at t=0.5', () => {
      const result = interpolateCloudPresets('clear', 'stormy', 0.5);
      const expected = (cloudPresets.clear.wind.speed + cloudPresets.stormy.wind.speed) / 2;
      expect(result.wind.speed).toBeCloseTo(expected);
    });

    it('clamps t to [0, 1]', () => {
      const below = interpolateCloudPresets('clear', 'stormy', -1);
      expect(below.wind.speed).toBe(cloudPresets.clear.wind.speed);

      const above = interpolateCloudPresets('clear', 'stormy', 2);
      expect(above.wind.speed).toBe(cloudPresets.stormy.wind.speed);
    });

    it('handles different layer counts', () => {
      // clear has 1 layer, stormy has 3 layers
      const result = interpolateCloudPresets('clear', 'stormy', 0.5);
      expect(result.layers.length).toBe(3); // max of 1 and 3
    });

    it('produces THREE.Color for layer colors', () => {
      const result = interpolateCloudPresets('clear', 'sunset', 0.5);
      for (const layer of result.layers) {
        expect(layer.cloudColor).toBeInstanceOf(THREE.Color);
        expect(layer.shadowColor).toBeInstanceOf(THREE.Color);
      }
    });

    it('produces THREE.Vector2 for wind direction', () => {
      const result = interpolateCloudPresets('clear', 'overcast', 0.5);
      expect(result.wind.direction).toBeInstanceOf(THREE.Vector2);
    });

    it('interpolates volumetric when both presets have it', () => {
      const result = interpolateCloudPresets('clear', 'stormy', 0.5);
      expect(result.volumetric).toBeDefined();
      const expectedCoverage =
        (cloudPresets.clear.volumetric!.coverage + cloudPresets.stormy.volumetric!.coverage) / 2;
      expect(result.volumetric!.coverage).toBeCloseTo(expectedCoverage);
    });
  });
});
