import { describe, expect, it } from 'vitest';
import {
  bloomPresets,
  cinematicPreset,
  dofPresets,
  dreamyPreset,
  getPostProcessingPreset,
  horrorPreset,
  neonPreset,
  noirPreset,
  postProcessingPresets,
  realisticPreset,
  sciFiPreset,
  vignettePresets,
  vintagePreset,
} from '../src/postprocessing';

describe('postprocessing presets', () => {
  describe('postProcessingPresets record', () => {
    it('contains all 8 presets', () => {
      expect(Object.keys(postProcessingPresets)).toHaveLength(8);
    });

    it('maps keys correctly', () => {
      expect(postProcessingPresets.cinematic).toBe(cinematicPreset);
      expect(postProcessingPresets.dreamy).toBe(dreamyPreset);
      expect(postProcessingPresets.horror).toBe(horrorPreset);
      expect(postProcessingPresets.neon).toBe(neonPreset);
      expect(postProcessingPresets.realistic).toBe(realisticPreset);
      expect(postProcessingPresets.vintage).toBe(vintagePreset);
      expect(postProcessingPresets.noir).toBe(noirPreset);
      expect(postProcessingPresets.sciFi).toBe(sciFiPreset);
    });
  });

  describe('preset structure', () => {
    const presetNames = Object.keys(postProcessingPresets) as Array<
      keyof typeof postProcessingPresets
    >;

    it.each(presetNames)('preset "%s" has name and mood', (name) => {
      const preset = postProcessingPresets[name];
      expect(preset).toHaveProperty('name');
      expect(typeof preset.name).toBe('string');
      expect(preset).toHaveProperty('mood');
    });

    it.each(presetNames)('preset "%s" has description', (name) => {
      const preset = postProcessingPresets[name];
      expect(preset).toHaveProperty('description');
      expect(typeof preset.description).toBe('string');
    });
  });

  describe('specific preset features', () => {
    it('cinematic has bloom, vignette, chromatic aberration, and film grain', () => {
      expect(cinematicPreset.bloom).toBeDefined();
      expect(cinematicPreset.vignette).toBeDefined();
      expect(cinematicPreset.chromaticAberration).toBeDefined();
      expect(cinematicPreset.filmGrain).toBeDefined();
    });

    it('neon has highest bloom intensity', () => {
      const intensities = Object.values(postProcessingPresets)
        .filter((p) => p.bloom)
        .map((p) => p.bloom!.intensity);
      expect(neonPreset.bloom!.intensity).toBe(Math.max(...intensities));
    });

    it('noir fully desaturates', () => {
      expect(noirPreset.colorGrading!.saturation).toBe(-1);
    });

    it('horror has high vignette darkness', () => {
      expect(horrorPreset.vignette!.darkness).toBeGreaterThanOrEqual(0.7);
    });

    it('realistic has SSAO', () => {
      expect(realisticPreset.ssao).toBeDefined();
      expect(realisticPreset.ssao!.samples).toBeGreaterThan(0);
    });

    it('vintage has sepia', () => {
      expect(vintagePreset.sepia).toBeDefined();
      expect(vintagePreset.sepia!.intensity).toBeGreaterThan(0);
    });
  });

  describe('getPostProcessingPreset', () => {
    it('returns the correct preset', () => {
      expect(getPostProcessingPreset('cinematic')).toBe(cinematicPreset);
      expect(getPostProcessingPreset('noir')).toBe(noirPreset);
    });
  });

  describe('bloomPresets', () => {
    it('contains all 5 bloom presets', () => {
      expect(Object.keys(bloomPresets)).toHaveLength(5);
    });

    const names = Object.keys(bloomPresets) as Array<keyof typeof bloomPresets>;

    it.each(names)('bloom preset "%s" has required fields', (name) => {
      const preset = bloomPresets[name];
      expect(preset).toHaveProperty('intensity');
      expect(preset).toHaveProperty('luminanceThreshold');
      expect(preset).toHaveProperty('luminanceSmoothing');
      expect(preset).toHaveProperty('mipmapBlur');
    });

    it('neon bloom has highest intensity', () => {
      const intensities = Object.values(bloomPresets).map((p) => p.intensity);
      expect(bloomPresets.neon.intensity).toBe(Math.max(...intensities));
    });
  });

  describe('dofPresets', () => {
    it('contains all 6 DOF presets', () => {
      expect(Object.keys(dofPresets)).toHaveLength(6);
    });

    const names = Object.keys(dofPresets) as Array<keyof typeof dofPresets>;

    it.each(names)('DOF preset "%s" has required fields', (name) => {
      const preset = dofPresets[name];
      expect(preset).toHaveProperty('focusDistance');
      expect(preset).toHaveProperty('focalLength');
      expect(preset).toHaveProperty('bokehScale');
    });

    it('macro has closest focus distance', () => {
      const distances = Object.values(dofPresets).map((p) => p.focusDistance);
      expect(dofPresets.macro.focusDistance).toBe(Math.min(...distances));
    });

    it('landscape has furthest focus distance', () => {
      const distances = Object.values(dofPresets).map((p) => p.focusDistance);
      expect(dofPresets.landscape.focusDistance).toBe(Math.max(...distances));
    });
  });

  describe('vignettePresets', () => {
    it('contains all 6 vignette presets', () => {
      expect(Object.keys(vignettePresets)).toHaveLength(6);
    });

    const names = Object.keys(vignettePresets) as Array<keyof typeof vignettePresets>;

    it.each(names)('vignette preset "%s" has darkness and offset', (name) => {
      const preset = vignettePresets[name];
      expect(preset).toHaveProperty('darkness');
      expect(preset).toHaveProperty('offset');
    });

    it('horror has highest darkness', () => {
      const darks = Object.values(vignettePresets).map((p) => p.darkness);
      expect(vignettePresets.horror.darkness).toBe(Math.max(...darks));
    });
  });
});
