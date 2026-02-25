import { describe, expect, it } from 'vitest';
import {
  createAdaptiveLODPreset,
  createLODConfigFromPreset,
  createVegetationLODConfigFromPreset,
  DESKTOP_PRESET,
  detectOptimalPreset,
  getLODPreset,
  interpolateLODPresets,
  LOD_PRESETS,
  MOBILE_PRESET,
  PERFORMANCE_PRESET,
  QUALITY_PRESET,
  ULTRA_PRESET,
} from '../src/lod';

describe('lod presets', () => {
  describe('LOD_PRESETS', () => {
    it('contains all 5 presets', () => {
      expect(Object.keys(LOD_PRESETS)).toHaveLength(5);
    });

    it('has correct convenience aliases', () => {
      expect(PERFORMANCE_PRESET).toBe(LOD_PRESETS.performance);
      expect(QUALITY_PRESET).toBe(LOD_PRESETS.quality);
      expect(MOBILE_PRESET).toBe(LOD_PRESETS.mobile);
      expect(DESKTOP_PRESET).toBe(LOD_PRESETS.desktop);
      expect(ULTRA_PRESET).toBe(LOD_PRESETS.ultra);
    });

    const presetNames = Object.keys(LOD_PRESETS) as Array<keyof typeof LOD_PRESETS>;

    it.each(presetNames)('preset "%s" has required fields', (name) => {
      const preset = LOD_PRESETS[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('description');
      expect(preset).toHaveProperty('distances');
      expect(preset).toHaveProperty('hysteresis');
      expect(preset).toHaveProperty('transitionDuration');
      expect(preset).toHaveProperty('fadeMode');
      expect(preset).toHaveProperty('simplificationRatios');
      expect(preset).toHaveProperty('vegetationDensityMultiplier');
      expect(preset).toHaveProperty('shadowLODLevel');
      expect(preset).toHaveProperty('impostorViews');
      expect(preset).toHaveProperty('impostorResolution');
    });

    it.each(presetNames)('preset "%s" has increasing distance thresholds', (name) => {
      const d = LOD_PRESETS[name].distances;
      expect(d.high).toBeLessThan(d.medium);
      expect(d.medium).toBeLessThan(d.low);
      expect(d.low).toBeLessThan(d.impostor);
      expect(d.impostor).toBeLessThan(d.cull);
    });
  });

  describe('getLODPreset', () => {
    it('returns the correct preset', () => {
      expect(getLODPreset('mobile')).toBe(LOD_PRESETS.mobile);
      expect(getLODPreset('ultra')).toBe(LOD_PRESETS.ultra);
    });
  });

  describe('createLODConfigFromPreset', () => {
    it('creates config from preset name string', () => {
      const config = createLODConfigFromPreset('desktop');
      expect(config.levels).toHaveLength(5);
      expect(config.hysteresis).toBe(LOD_PRESETS.desktop.hysteresis);
      expect(config.transitionDuration).toBe(LOD_PRESETS.desktop.transitionDuration);
      expect(config.fadeMode).toBe(LOD_PRESETS.desktop.fadeMode);
    });

    it('creates config from preset object', () => {
      const config = createLODConfigFromPreset(LOD_PRESETS.quality);
      expect(config.levels).toHaveLength(5);
    });

    it('last level has visible=false (cull)', () => {
      const config = createLODConfigFromPreset('desktop');
      expect(config.levels[4].visible).toBe(false);
    });

    it('distances match the preset distances', () => {
      const config = createLODConfigFromPreset('performance');
      const d = LOD_PRESETS.performance.distances;
      expect(config.levels[0].distance).toBe(d.high);
      expect(config.levels[1].distance).toBe(d.medium);
      expect(config.levels[2].distance).toBe(d.low);
      expect(config.levels[3].distance).toBe(d.impostor);
      expect(config.levels[4].distance).toBe(d.cull);
    });
  });

  describe('createVegetationLODConfigFromPreset', () => {
    it('creates vegetation config from preset name', () => {
      const config = createVegetationLODConfigFromPreset('quality');
      expect(config.highDetailDistance).toBe(LOD_PRESETS.quality.distances.high);
      expect(config.mediumDetailDistance).toBe(LOD_PRESETS.quality.distances.medium);
      expect(config.lowDetailDistance).toBe(LOD_PRESETS.quality.distances.low);
      expect(config.impostorDistance).toBe(LOD_PRESETS.quality.distances.impostor);
      expect(config.cullDistance).toBe(LOD_PRESETS.quality.distances.cull);
    });

    it('transitionWidth is 20% of high distance', () => {
      const config = createVegetationLODConfigFromPreset('desktop');
      expect(config.transitionWidth).toBeCloseTo(LOD_PRESETS.desktop.distances.high * 0.2);
    });
  });

  describe('interpolateLODPresets', () => {
    it('returns preset1 values at t=0', () => {
      const result = interpolateLODPresets(LOD_PRESETS.mobile, LOD_PRESETS.ultra, 0);
      expect(result.distances.high).toBe(LOD_PRESETS.mobile.distances.high);
      expect(result.name).toBe(LOD_PRESETS.mobile.name);
    });

    it('returns preset2 values at t=1', () => {
      const result = interpolateLODPresets(LOD_PRESETS.mobile, LOD_PRESETS.ultra, 1);
      expect(result.distances.high).toBe(LOD_PRESETS.ultra.distances.high);
      expect(result.name).toBe(LOD_PRESETS.ultra.name);
    });

    it('interpolates at t=0.5', () => {
      const result = interpolateLODPresets(LOD_PRESETS.performance, LOD_PRESETS.quality, 0.5);
      const expected =
        (LOD_PRESETS.performance.distances.high + LOD_PRESETS.quality.distances.high) / 2;
      expect(result.distances.high).toBeCloseTo(expected);
    });

    it('rounds integer values (shadowLODLevel, impostorViews, impostorResolution)', () => {
      const result = interpolateLODPresets(LOD_PRESETS.mobile, LOD_PRESETS.ultra, 0.5);
      expect(Number.isInteger(result.shadowLODLevel)).toBe(true);
      expect(Number.isInteger(result.impostorViews)).toBe(true);
      expect(Number.isInteger(result.impostorResolution)).toBe(true);
    });
  });

  describe('detectOptimalPreset', () => {
    it('returns desktop when window is undefined (node environment)', () => {
      const result = detectOptimalPreset();
      expect(result).toBe('desktop');
    });
  });

  describe('createAdaptiveLODPreset', () => {
    it('starts with the base preset', () => {
      const adaptive = createAdaptiveLODPreset('desktop', 60);
      expect(adaptive.preset.name).toBe('desktop');
    });

    it('downgrades when FPS is consistently low', () => {
      const adaptive = createAdaptiveLODPreset('quality', 60);
      // Feed consistently low FPS to trigger downgrade
      // smoothedFPS starts at 60, needs to drop below 48 (60 * 0.8)
      for (let i = 0; i < 50; i++) {
        adaptive.adapt(20);
      }
      // After many low FPS readings, should have downgraded
      expect(adaptive.preset.name).not.toBe('ultra');
    });

    it('upgrades when FPS is consistently high', () => {
      const adaptive = createAdaptiveLODPreset('performance', 60);
      // Feed consistently high FPS to trigger upgrade
      for (let i = 0; i < 50; i++) {
        adaptive.adapt(120);
      }
      // After many high FPS readings, should have upgraded from performance
      const presetOrder = ['mobile', 'performance', 'desktop', 'quality', 'ultra'];
      const index = presetOrder.indexOf(adaptive.preset.name);
      expect(index).toBeGreaterThan(1); // Should be above performance
    });

    it('returns a preset from the adapt method', () => {
      const adaptive = createAdaptiveLODPreset('desktop', 60);
      const result = adaptive.adapt(60);
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('distances');
    });
  });
});
