import { describe, expect, it } from 'vitest';
import {
  colorPalettes,
  crystalPresets,
  dissolvePresets,
  forcefieldPresets,
  getColorPalette,
  getCrystalPreset,
  getDissolvePreset,
  getForcefieldPreset,
  getGlitchPreset,
  getGradientPreset,
  getHologramPreset,
  getScanlinePreset,
  getToonPreset,
  glitchPresets,
  gradientPresets,
  hologramPresets,
  scanlinePresets,
  toonPresets,
} from '../src/shaders';

describe('shader presets', () => {
  describe('toonPresets', () => {
    it('contains all 4 presets', () => {
      expect(Object.keys(toonPresets)).toHaveLength(4);
    });

    const names = Object.keys(toonPresets);

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = toonPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('description');
      expect(preset).toHaveProperty('color');
      expect(preset).toHaveProperty('levels');
      expect(preset).toHaveProperty('rimColor');
      expect(preset).toHaveProperty('rimPower');
      expect(preset).toHaveProperty('outlineColor');
      expect(preset).toHaveProperty('outlineWidth');
    });

    it.each(names)('preset "%s" has positive levels', (name) => {
      expect(toonPresets[name].levels).toBeGreaterThan(0);
    });
  });

  describe('hologramPresets', () => {
    it('contains all 5 presets', () => {
      expect(Object.keys(hologramPresets)).toHaveLength(5);
    });

    const names = Object.keys(hologramPresets);

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = hologramPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('color');
      expect(preset).toHaveProperty('scanlineIntensity');
      expect(preset).toHaveProperty('scanlineDensity');
      expect(preset).toHaveProperty('flickerSpeed');
      expect(preset).toHaveProperty('fresnelPower');
      expect(preset).toHaveProperty('alpha');
    });

    it.each(names)('preset "%s" alpha is between 0 and 1', (name) => {
      const preset = hologramPresets[name];
      expect(preset.alpha).toBeGreaterThanOrEqual(0);
      expect(preset.alpha).toBeLessThanOrEqual(1);
    });
  });

  describe('dissolvePresets', () => {
    it('contains all 5 presets', () => {
      expect(Object.keys(dissolvePresets)).toHaveLength(5);
    });

    const names = Object.keys(dissolvePresets);

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = dissolvePresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('edgeColor');
      expect(preset).toHaveProperty('edgeWidth');
      expect(preset).toHaveProperty('noiseScale');
    });
  });

  describe('forcefieldPresets', () => {
    it('contains all 4 presets', () => {
      expect(Object.keys(forcefieldPresets)).toHaveLength(4);
    });

    const names = Object.keys(forcefieldPresets);

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = forcefieldPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('color');
      expect(preset).toHaveProperty('secondaryColor');
      expect(preset).toHaveProperty('fresnelPower');
      expect(preset).toHaveProperty('pulseSpeed');
      expect(preset).toHaveProperty('hexagonScale');
      expect(preset).toHaveProperty('alpha');
    });
  });

  describe('glitchPresets', () => {
    it('contains all 4 presets', () => {
      expect(Object.keys(glitchPresets)).toHaveLength(4);
    });

    const names = Object.keys(glitchPresets);

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = glitchPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('glitchIntensity');
      expect(preset).toHaveProperty('scanlineIntensity');
      expect(preset).toHaveProperty('rgbShiftAmount');
    });

    it('extreme has highest glitch intensity', () => {
      const intensities = Object.values(glitchPresets).map((p) => p.glitchIntensity!);
      expect(glitchPresets.extreme.glitchIntensity).toBe(Math.max(...intensities));
    });
  });

  describe('crystalPresets', () => {
    it('contains all 6 presets', () => {
      expect(Object.keys(crystalPresets)).toHaveLength(6);
    });

    const names = Object.keys(crystalPresets);

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = crystalPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('color');
      expect(preset).toHaveProperty('fresnelPower');
      expect(preset).toHaveProperty('rainbowIntensity');
    });

    it('opal has highest rainbow intensity', () => {
      const intensities = Object.values(crystalPresets).map((p) => p.rainbowIntensity!);
      expect(crystalPresets.opal.rainbowIntensity).toBe(Math.max(...intensities));
    });
  });

  describe('gradientPresets', () => {
    it('contains all 7 presets', () => {
      expect(Object.keys(gradientPresets)).toHaveLength(7);
    });

    const names = Object.keys(gradientPresets);

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = gradientPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('colorStart');
      expect(preset).toHaveProperty('colorEnd');
      expect(preset).toHaveProperty('direction');
    });

    it('neon is horizontal direction', () => {
      expect(gradientPresets.neon.direction).toBe('horizontal');
    });

    it('grayscale is radial direction', () => {
      expect(gradientPresets.grayscale.direction).toBe('radial');
    });
  });

  describe('scanlinePresets', () => {
    it('contains all 4 presets', () => {
      expect(Object.keys(scanlinePresets)).toHaveLength(4);
    });

    const names = Object.keys(scanlinePresets);

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = scanlinePresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('color');
      expect(preset).toHaveProperty('backgroundColor');
      expect(preset).toHaveProperty('scanlineDensity');
      expect(preset).toHaveProperty('scanlineOpacity');
      expect(preset).toHaveProperty('flickerIntensity');
      expect(preset).toHaveProperty('curvature');
    });
  });

  describe('colorPalettes', () => {
    it('contains all 8 palettes', () => {
      expect(Object.keys(colorPalettes)).toHaveLength(8);
    });

    const names = Object.keys(colorPalettes);

    it.each(names)('palette "%s" has 5 colors', (name) => {
      const palette = colorPalettes[name];
      expect(palette.colors).toHaveLength(5);
    });

    it.each(names)('palette "%s" has name and description', (name) => {
      const palette = colorPalettes[name];
      expect(palette).toHaveProperty('name');
      expect(palette).toHaveProperty('description');
    });
  });

  describe('getter functions', () => {
    it('getToonPreset returns preset or fallback', () => {
      expect(getToonPreset('anime')).toBe(toonPresets.anime);
      expect(getToonPreset('comic')).toBe(toonPresets.comic);
    });

    it('getHologramPreset returns preset or fallback', () => {
      expect(getHologramPreset('blue')).toBe(hologramPresets.blue);
      expect(getHologramPreset('matrix')).toBe(hologramPresets.matrix);
    });

    it('getDissolvePreset returns preset or fallback', () => {
      expect(getDissolvePreset('fire')).toBe(dissolvePresets.fire);
    });

    it('getForcefieldPreset returns preset or fallback', () => {
      expect(getForcefieldPreset('scifi')).toBe(forcefieldPresets.scifi);
    });

    it('getGlitchPreset returns preset or fallback', () => {
      expect(getGlitchPreset('moderate')).toBe(glitchPresets.moderate);
    });

    it('getCrystalPreset returns preset or fallback', () => {
      expect(getCrystalPreset('diamond')).toBe(crystalPresets.diamond);
    });

    it('getGradientPreset returns preset or fallback', () => {
      expect(getGradientPreset('sunset')).toBe(gradientPresets.sunset);
    });

    it('getScanlinePreset returns preset or fallback', () => {
      expect(getScanlinePreset('crt')).toBe(scanlinePresets.crt);
    });

    it('getColorPalette returns palette or fallback', () => {
      expect(getColorPalette('cyberpunk')).toBe(colorPalettes.cyberpunk);
    });
  });
});
