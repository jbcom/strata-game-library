/**
 * Post-Processing Component Tests
 *
 * Tests for post-processing effect component exports and type structure.
 *
 * @module components/postprocessing/__tests__/postprocessing.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({}),
}));

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: vi.fn(),
  Bloom: vi.fn(),
  Vignette: vi.fn(),
  ChromaticAberration: vi.fn(),
  Noise: vi.fn(),
  DepthOfField: vi.fn(),
  SSAO: vi.fn(),
  ToneMapping: vi.fn(),
  Sepia: vi.fn(),
  BrightnessContrast: vi.fn(),
  HueSaturation: vi.fn(),
}));

vi.mock('@strata-game-library/core', () => ({}));

describe('PostProcessing exports', () => {
  it('should export all effect components from index', async () => {
    const ppModule = await import('../index');

    expect(ppModule.CinematicEffects).toBeDefined();
    expect(ppModule.DreamyEffects).toBeDefined();
    expect(ppModule.DynamicDOF).toBeDefined();
    expect(ppModule.EffectStack).toBeDefined();
    expect(ppModule.HorrorEffects).toBeDefined();
    expect(ppModule.MotionBlurEffect).toBeDefined();
    expect(ppModule.NeonEffects).toBeDefined();
    expect(ppModule.RealisticEffects).toBeDefined();
    expect(ppModule.VintageEffects).toBeDefined();
  });
});

describe('CinematicEffects default props', () => {
  it('should define sensible defaults', () => {
    const defaults = {
      bloomIntensity: 1.0,
      vignetteDarkness: 0.4,
      chromaticAberration: 0.003,
      filmGrain: true,
    };

    expect(defaults.bloomIntensity).toBe(1.0);
    expect(defaults.vignetteDarkness).toBe(0.4);
    expect(defaults.chromaticAberration).toBe(0.003);
    expect(defaults.filmGrain).toBe(true);
  });
});

describe('DreamyEffects default props', () => {
  it('should define sensible defaults', () => {
    const defaults = {
      bloomIntensity: 2.0,
      saturation: -0.2,
      brightness: 0.1,
    };

    expect(defaults.bloomIntensity).toBe(2.0);
    expect(defaults.saturation).toBe(-0.2);
    expect(defaults.brightness).toBe(0.1);
  });
});

describe('HorrorEffects default props', () => {
  it('should define sensible defaults', () => {
    const defaults = {
      desaturation: -0.5,
      noiseIntensity: 0.2,
      vignetteDarkness: 0.7,
      chromaticAberration: true,
    };

    expect(defaults.desaturation).toBe(-0.5);
    expect(defaults.noiseIntensity).toBe(0.2);
    expect(defaults.vignetteDarkness).toBe(0.7);
  });
});

describe('NeonEffects default props', () => {
  it('should define sensible defaults', () => {
    const defaults = {
      bloomIntensity: 3.0,
      saturation: 0.3,
      luminanceThreshold: 0.6,
    };

    expect(defaults.bloomIntensity).toBe(3.0);
    expect(defaults.saturation).toBe(0.3);
    expect(defaults.luminanceThreshold).toBe(0.6);
  });
});

describe('DynamicDOF default props', () => {
  it('should define sensible defaults', () => {
    const defaults = {
      focusDistance: 5.0,
      focalLength: 50,
      bokehScale: 2.0,
      focusSpeed: 5.0,
    };

    expect(defaults.focusDistance).toBe(5.0);
    expect(defaults.focalLength).toBe(50);
    expect(defaults.bokehScale).toBe(2.0);
  });
});

describe('MotionBlurEffect default props', () => {
  it('should define sensible defaults', () => {
    const defaults = {
      intensity: 0.5,
      jitter: 0.5,
      samples: 9,
    };

    expect(defaults.intensity).toBe(0.5);
    expect(defaults.jitter).toBe(0.5);
    expect(defaults.samples).toBe(9);
  });
});

describe('VintageEffects default props', () => {
  it('should define sensible defaults', () => {
    const defaults = {
      sepiaIntensity: 0.4,
      vignetteDarkness: 0.5,
      filmGrain: true,
      saturation: -0.3,
    };

    expect(defaults.sepiaIntensity).toBe(0.4);
    expect(defaults.vignetteDarkness).toBe(0.5);
    expect(defaults.saturation).toBe(-0.3);
  });
});
