import { describe, expect, it } from 'vitest';
import { arcticWater, swampWater, tropicalOceanWater } from '../src/water';

describe('water presets', () => {
  describe('preset constants', () => {
    const presets = [
      ['tropicalOceanWater', tropicalOceanWater],
      ['arcticWater', arcticWater],
      ['swampWater', swampWater],
    ] as const;

    it.each(presets)('%s has required color fields', (_name, preset) => {
      expect(preset).toHaveProperty('waterColor');
      expect(preset).toHaveProperty('deepWaterColor');
      expect(preset).toHaveProperty('foamColor');
      expect(preset).toHaveProperty('causticIntensity');
    });

    it.each(presets)('%s has numeric color values', (_name, preset) => {
      expect(typeof preset.waterColor).toBe('number');
      expect(typeof preset.deepWaterColor).toBe('number');
      expect(typeof preset.foamColor).toBe('number');
    });

    it.each(presets)('%s causticIntensity is between 0 and 1', (_name, preset) => {
      expect(preset.causticIntensity).toBeGreaterThanOrEqual(0);
      expect(preset.causticIntensity).toBeLessThanOrEqual(1);
    });
  });

  describe('preset distinctiveness', () => {
    it('tropical has highest caustic intensity', () => {
      expect(tropicalOceanWater.causticIntensity).toBeGreaterThan(arcticWater.causticIntensity);
      expect(tropicalOceanWater.causticIntensity).toBeGreaterThan(swampWater.causticIntensity);
    });

    it('swamp has lowest caustic intensity', () => {
      expect(swampWater.causticIntensity).toBeLessThan(arcticWater.causticIntensity);
    });
  });
});
