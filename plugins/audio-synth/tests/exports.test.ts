/**
 * Package Exports Unit Tests
 *
 * Verifies that the audio-synth package exports all expected symbols
 * from its public API surface. This acts as a contract test to ensure
 * no exports are accidentally removed.
 *
 * @module exports.test
 */

import { describe, expect, it, vi } from 'vitest';

// Mock Tone.js before importing any module that touches it
vi.mock('tone', () => ({
  start: vi.fn().mockResolvedValue(undefined),
  now: vi.fn().mockReturnValue(0),
  Synth: vi.fn().mockImplementation(() => {
    const s = {
      toDestination: vi.fn(),
      triggerAttackRelease: vi.fn(),
      dispose: vi.fn(),
      volume: { value: 0 },
      frequency: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };
    s.toDestination.mockReturnValue(s);
    return s;
  }),
  NoiseSynth: vi.fn().mockImplementation(() => {
    const s = { toDestination: vi.fn(), triggerAttackRelease: vi.fn(), dispose: vi.fn() };
    s.toDestination.mockReturnValue(s);
    return s;
  }),
  PolySynth: vi.fn().mockImplementation(() => {
    const s = { toDestination: vi.fn(), set: vi.fn(), triggerAttackRelease: vi.fn(), dispose: vi.fn() };
    s.toDestination.mockReturnValue(s);
    return s;
  }),
  MonoSynth: vi.fn().mockImplementation(() => {
    const s = { toDestination: vi.fn(), triggerAttackRelease: vi.fn(), dispose: vi.fn() };
    s.toDestination.mockReturnValue(s);
    return s;
  }),
  Pattern: vi.fn().mockImplementation(() => ({
    interval: '',
    start: vi.fn(),
    dispose: vi.fn(),
  })),
  Time: vi.fn().mockImplementation(() => ({
    toSeconds: vi.fn().mockReturnValue(0.25),
  })),
  getTransport: vi.fn().mockReturnValue({
    start: vi.fn(),
    stop: vi.fn(),
    cancel: vi.fn(),
  }),
  getDestination: vi.fn().mockReturnValue({
    volume: { value: 0 },
  }),
  gainToDb: vi.fn().mockReturnValue(0),
}));

describe('Package root exports (src/index.ts)', () => {
  it('exports all expected symbols from the root entry', async () => {
    const mod = await import('../src/index.js');

    // Core exports
    expect(mod.SynthManager).toBeDefined();
    expect(mod.createSynthManager).toBeDefined();

    // SFX preset constants
    expect(mod.GUNSHOT).toBeDefined();
    expect(mod.EXPLOSION).toBeDefined();
    expect(mod.IMPACT).toBeDefined();
    expect(mod.RICOCHET).toBeDefined();
    expect(mod.PICKUP).toBeDefined();
    expect(mod.SELECT).toBeDefined();
    expect(mod.CONFIRM).toBeDefined();
    expect(mod.ERROR).toBeDefined();
    expect(mod.SPLASH).toBeDefined();
    expect(mod.FOOTSTEP).toBeDefined();
    expect(mod.LASER).toBeDefined();
    expect(mod.POWERUP).toBeDefined();
    expect(mod.SFX_PRESETS).toBeDefined();

    // Music preset constants
    expect(mod.MENU_THEME).toBeDefined();
    expect(mod.COMBAT_THEME).toBeDefined();
    expect(mod.AMBIENT_THEME).toBeDefined();
    expect(mod.VICTORY_THEME).toBeDefined();
    expect(mod.DEFEAT_THEME).toBeDefined();
    expect(mod.EXPLORATION_THEME).toBeDefined();
    expect(mod.TENSION_THEME).toBeDefined();
    expect(mod.SHOP_THEME).toBeDefined();
    expect(mod.MUSIC_PATTERNS).toBeDefined();

    // Component exports
    expect(mod.AudioSynthProvider).toBeDefined();
    expect(mod.useAudioSynth).toBeDefined();
    expect(mod.useAudioReady).toBeDefined();
    expect(mod.usePlaySFX).toBeDefined();
    expect(mod.usePlayMusic).toBeDefined();
  });
});

describe('Core subpath exports (src/core/index.ts)', () => {
  it('exports SynthManager class', async () => {
    const mod = await import('../src/core/index.js');
    expect(mod.SynthManager).toBeDefined();
    expect(typeof mod.SynthManager).toBe('function');
  });

  it('exports createSynthManager factory', async () => {
    const mod = await import('../src/core/index.js');
    expect(mod.createSynthManager).toBeDefined();
    expect(typeof mod.createSynthManager).toBe('function');
  });
});

describe('Presets subpath exports (src/presets/index.ts)', () => {
  it('exports all SFX presets', async () => {
    const mod = await import('../src/presets/index.js');

    const sfxNames = [
      'GUNSHOT',
      'EXPLOSION',
      'IMPACT',
      'RICOCHET',
      'PICKUP',
      'SELECT',
      'CONFIRM',
      'ERROR',
      'SPLASH',
      'FOOTSTEP',
      'LASER',
      'POWERUP',
      'SFX_PRESETS',
    ];

    for (const name of sfxNames) {
      expect((mod as Record<string, unknown>)[name]).toBeDefined();
    }
  });

  it('exports all music patterns', async () => {
    const mod = await import('../src/presets/index.js');

    const musicNames = [
      'MENU_THEME',
      'COMBAT_THEME',
      'AMBIENT_THEME',
      'VICTORY_THEME',
      'DEFEAT_THEME',
      'EXPLORATION_THEME',
      'TENSION_THEME',
      'SHOP_THEME',
      'MUSIC_PATTERNS',
    ];

    for (const name of musicNames) {
      expect((mod as Record<string, unknown>)[name]).toBeDefined();
    }
  });
});

describe('Components subpath exports (src/components/index.ts)', () => {
  it('exports AudioSynthProvider', async () => {
    const mod = await import('../src/components/index.js');
    expect(mod.AudioSynthProvider).toBeDefined();
  });

  it('exports all hooks', async () => {
    const mod = await import('../src/components/index.js');
    expect(mod.useAudioSynth).toBeDefined();
    expect(mod.useAudioReady).toBeDefined();
    expect(mod.usePlaySFX).toBeDefined();
    expect(mod.usePlayMusic).toBeDefined();
  });
});

describe('Export types are correct', () => {
  it('SynthManager is a constructor function', async () => {
    const mod = await import('../src/core/index.js');
    const manager = new mod.SynthManager();
    expect(manager).toBeDefined();
    expect(typeof manager.init).toBe('function');
    expect(typeof manager.isReady).toBe('function');
    expect(typeof manager.playSFX).toBe('function');
    expect(typeof manager.playMusic).toBe('function');
    expect(typeof manager.stopMusic).toBe('function');
    expect(typeof manager.setMasterVolume).toBe('function');
    expect(typeof manager.stopAll).toBe('function');
    expect(typeof manager.dispose).toBe('function');
  });

  it('createSynthManager returns ISynthManager', async () => {
    const mod = await import('../src/core/index.js');
    const manager = mod.createSynthManager();
    expect(typeof manager.init).toBe('function');
    expect(typeof manager.isReady).toBe('function');
    expect(typeof manager.playSFX).toBe('function');
    expect(typeof manager.playMusic).toBe('function');
    expect(typeof manager.stopMusic).toBe('function');
    expect(typeof manager.setMasterVolume).toBe('function');
    expect(typeof manager.stopAll).toBe('function');
    expect(typeof manager.dispose).toBe('function');
  });

  it('SFX_PRESETS values are all SFXPreset objects', async () => {
    const mod = await import('../src/presets/sfx.js');
    for (const [key, preset] of Object.entries(mod.SFX_PRESETS)) {
      expect(preset).toHaveProperty('id');
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('oscillator');
      expect(preset).toHaveProperty('envelope');
    }
  });

  it('MUSIC_PATTERNS values are all MusicPattern objects', async () => {
    const mod = await import('../src/presets/music.js');
    for (const [key, pattern] of Object.entries(mod.MUSIC_PATTERNS)) {
      expect(pattern).toHaveProperty('id');
      expect(pattern).toHaveProperty('name');
      expect(pattern).toHaveProperty('notes');
      expect(pattern).toHaveProperty('interval');
      expect(pattern).toHaveProperty('oscillator');
      expect(pattern).toHaveProperty('envelope');
    }
  });
});
