import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  blendLightingPresets,
  cathedralPreset,
  cloneLightingPreset,
  dustyRoomPreset,
  forestCanopyPreset,
  getLightingPreset,
  lightingPresets,
  underwaterPreset,
} from '../src/lighting';

describe('lighting presets', () => {
  describe('lightingPresets record', () => {
    it('contains all 4 presets', () => {
      expect(Object.keys(lightingPresets)).toHaveLength(4);
    });

    it('maps keys to correct presets', () => {
      expect(lightingPresets.cathedral).toBe(cathedralPreset);
      expect(lightingPresets.forestCanopy).toBe(forestCanopyPreset);
      expect(lightingPresets.underwater).toBe(underwaterPreset);
      expect(lightingPresets.dustyRoom).toBe(dustyRoomPreset);
    });
  });

  describe('preset structure', () => {
    const presetNames = Object.keys(lightingPresets) as Array<keyof typeof lightingPresets>;

    it.each(presetNames)('preset "%s" has required fields', (name) => {
      const preset = lightingPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('description');
      expect(preset).toHaveProperty('godRays');
      expect(preset).toHaveProperty('spotlights');
      expect(preset).toHaveProperty('pointLights');
      expect(preset).toHaveProperty('ambient');
    });

    it.each(presetNames)('preset "%s" godRays.color is a THREE.Color', (name) => {
      const preset = lightingPresets[name];
      expect(preset.godRays.color).toBeInstanceOf(THREE.Color);
    });

    it.each(presetNames)('preset "%s" ambient.color is a THREE.Color', (name) => {
      const preset = lightingPresets[name];
      expect(preset.ambient.color).toBeInstanceOf(THREE.Color);
    });

    it.each(presetNames)('preset "%s" spotlight positions are Vector3', (name) => {
      const preset = lightingPresets[name];
      for (const spot of preset.spotlights) {
        expect(spot.position).toBeInstanceOf(THREE.Vector3);
        expect(spot.target).toBeInstanceOf(THREE.Vector3);
        expect(spot.color).toBeInstanceOf(THREE.Color);
      }
    });

    it.each(presetNames)('preset "%s" pointLight positions are Vector3', (name) => {
      const preset = lightingPresets[name];
      for (const point of preset.pointLights) {
        expect(point.position).toBeInstanceOf(THREE.Vector3);
        expect(point.color).toBeInstanceOf(THREE.Color);
      }
    });
  });

  describe('getLightingPreset', () => {
    it('returns the correct preset', () => {
      expect(getLightingPreset('cathedral')).toBe(cathedralPreset);
      expect(getLightingPreset('underwater')).toBe(underwaterPreset);
    });

    it('throws on unknown preset', () => {
      expect(() => getLightingPreset('nonexistent' as any)).toThrow('Unknown lighting preset');
    });
  });

  describe('cloneLightingPreset', () => {
    it('creates a deep clone of colors', () => {
      const clone = cloneLightingPreset(cathedralPreset);
      expect(clone.godRays.color).not.toBe(cathedralPreset.godRays.color);
      expect(clone.godRays.color.r).toBe(cathedralPreset.godRays.color.r);
      expect(clone.godRays.color.g).toBe(cathedralPreset.godRays.color.g);
      expect(clone.godRays.color.b).toBe(cathedralPreset.godRays.color.b);
    });

    it('creates a deep clone of positions', () => {
      const clone = cloneLightingPreset(cathedralPreset);
      expect(clone.spotlights[0].position).not.toBe(cathedralPreset.spotlights[0].position);
      expect(clone.spotlights[0].position.x).toBe(cathedralPreset.spotlights[0].position.x);
    });

    it('modifying clone does not affect original', () => {
      const clone = cloneLightingPreset(cathedralPreset);
      clone.godRays.color.setRGB(0, 0, 0);
      expect(cathedralPreset.godRays.color.r).not.toBe(0);
    });

    it('clones fog when present', () => {
      const clone = cloneLightingPreset(cathedralPreset);
      expect(clone.fog).toBeDefined();
      expect(clone.fog!.color).not.toBe(cathedralPreset.fog!.color);
      expect(clone.fog!.color.r).toBe(cathedralPreset.fog!.color.r);
    });
  });

  describe('blendLightingPresets', () => {
    it('returns presetA values at t=0', () => {
      const result = blendLightingPresets(cathedralPreset, underwaterPreset, 0);
      expect(result.godRays.intensity).toBe(cathedralPreset.godRays.intensity);
      expect(result.ambient.intensity).toBe(cathedralPreset.ambient.intensity);
    });

    it('returns presetB values at t=1', () => {
      const result = blendLightingPresets(cathedralPreset, underwaterPreset, 1);
      expect(result.godRays.intensity).toBe(underwaterPreset.godRays.intensity);
    });

    it('interpolates numeric values at t=0.5', () => {
      const result = blendLightingPresets(cathedralPreset, underwaterPreset, 0.5);
      const expected =
        (cathedralPreset.godRays.intensity + underwaterPreset.godRays.intensity) / 2;
      expect(result.godRays.intensity).toBeCloseTo(expected);
    });

    it('clamps t below 0', () => {
      const result = blendLightingPresets(cathedralPreset, underwaterPreset, -1);
      expect(result.godRays.intensity).toBe(cathedralPreset.godRays.intensity);
    });

    it('clamps t above 1', () => {
      const result = blendLightingPresets(cathedralPreset, underwaterPreset, 2);
      expect(result.godRays.intensity).toBe(underwaterPreset.godRays.intensity);
    });

    it('produces THREE.Color for blended colors', () => {
      const result = blendLightingPresets(cathedralPreset, underwaterPreset, 0.5);
      expect(result.godRays.color).toBeInstanceOf(THREE.Color);
      expect(result.ambient.color).toBeInstanceOf(THREE.Color);
    });

    it('rounds samples to integer', () => {
      const result = blendLightingPresets(cathedralPreset, underwaterPreset, 0.5);
      expect(Number.isInteger(result.godRays.samples)).toBe(true);
    });

    it('blends fog when both presets have it', () => {
      const result = blendLightingPresets(cathedralPreset, underwaterPreset, 0.5);
      expect(result.fog).toBeDefined();
      expect(result.fog!.color).toBeInstanceOf(THREE.Color);
    });
  });
});
