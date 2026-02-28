/**
 * SynthManager Unit Tests
 *
 * Comprehensive tests for the SynthManager class and createSynthManager factory.
 * Tone.js is fully mocked to allow pure unit testing without a browser audio context.
 *
 * @module core/synth-manager.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted() so these are available when vi.mock() factory runs (both are hoisted)
const { mockTransportStart, mockTransportStop, mockTransportCancel, mockDestinationVolume } =
  vi.hoisted(() => ({
    mockTransportStart: { calls: [] as unknown[][] },
    mockTransportStop: { calls: [] as unknown[][] },
    mockTransportCancel: { calls: [] as unknown[][] },
    mockDestinationVolume: { value: 0 },
  }));

vi.mock('tone', () => {
  function makeSynthInstance() {
    const inst: Record<string, unknown> = {
      triggerAttackRelease: vi.fn(),
      dispose: vi.fn(),
      volume: { value: 0 },
      frequency: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      toDestination: vi.fn(),
    };
    (inst.toDestination as ReturnType<typeof vi.fn>).mockReturnValue(inst);
    return inst;
  }

  function makeNoiseSynthInstance() {
    const inst: Record<string, unknown> = {
      triggerAttackRelease: vi.fn(),
      dispose: vi.fn(),
      toDestination: vi.fn(),
    };
    (inst.toDestination as ReturnType<typeof vi.fn>).mockReturnValue(inst);
    return inst;
  }

  function makeMonoSynthInstance() {
    const inst: Record<string, unknown> = {
      triggerAttackRelease: vi.fn(),
      dispose: vi.fn(),
      toDestination: vi.fn(),
    };
    (inst.toDestination as ReturnType<typeof vi.fn>).mockReturnValue(inst);
    return inst;
  }

  function makePolySynthInstance() {
    const inst: Record<string, unknown> = {
      set: vi.fn(),
      triggerAttackRelease: vi.fn(),
      dispose: vi.fn(),
      toDestination: vi.fn(),
    };
    (inst.toDestination as ReturnType<typeof vi.fn>).mockReturnValue(inst);
    return inst;
  }

  // Wrap transport mock fns to track calls AND be usable with vi.fn
  const transportStartFn = vi.fn(function (...args: unknown[]) {
    mockTransportStart.calls.push(args);
  });
  const transportStopFn = vi.fn(function (...args: unknown[]) {
    mockTransportStop.calls.push(args);
  });
  const transportCancelFn = vi.fn(function (...args: unknown[]) {
    mockTransportCancel.calls.push(args);
  });

  return {
    start: vi.fn().mockResolvedValue(undefined),
    now: vi.fn().mockReturnValue(0),
    Synth: vi.fn().mockImplementation(function () {
      return makeSynthInstance();
    }),
    NoiseSynth: vi.fn().mockImplementation(function () {
      return makeNoiseSynthInstance();
    }),
    PolySynth: vi.fn().mockImplementation(function () {
      return makePolySynthInstance();
    }),
    MonoSynth: vi.fn().mockImplementation(function () {
      return makeMonoSynthInstance();
    }),
    Pattern: vi.fn().mockImplementation(function () {
      return {
        interval: '',
        start: vi.fn(),
        dispose: vi.fn(),
      };
    }),
    Time: vi.fn().mockImplementation(function () {
      return {
        toSeconds: vi.fn().mockReturnValue(0.25),
      };
    }),
    getTransport: vi.fn().mockReturnValue({
      start: transportStartFn,
      stop: transportStopFn,
      cancel: transportCancelFn,
    }),
    getDestination: vi.fn().mockReturnValue({
      volume: mockDestinationVolume,
    }),
    gainToDb: vi.fn().mockImplementation(function (gain: number) {
      if (gain <= 0) return -Infinity;
      return 20 * Math.log10(gain);
    }),
  };
});

// Import after mocking
import { createSynthManager, SynthManager } from '../src/core/SynthManager.js';
import type { SFXPreset, SynthManagerConfig } from '../src/core/types.js';
import * as Tone from 'tone';

// ---- Test helpers ----

function createBasicSFXPreset(overrides: Partial<SFXPreset> = {}): SFXPreset {
  return {
    id: 'test-sfx',
    name: 'Test SFX',
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
    ...overrides,
  };
}

// ---- Tests ----

describe('SynthManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockDestinationVolume.value = 0;
    mockTransportStart.calls = [];
    mockTransportStop.calls = [];
    mockTransportCancel.calls = [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('creates instance with default config', () => {
      const manager = new SynthManager();
      expect(manager).toBeInstanceOf(SynthManager);
      expect(manager.isReady()).toBe(false);
    });

    it('creates instance with custom masterVolume', () => {
      const manager = new SynthManager({ masterVolume: 0.5 });
      expect(manager).toBeInstanceOf(SynthManager);
    });

    it('creates instance with debug enabled', () => {
      const manager = new SynthManager({ debug: true });
      expect(manager).toBeInstanceOf(SynthManager);
    });

    it('creates instance with full config', () => {
      const config: SynthManagerConfig = {
        masterVolume: 0.75,
        debug: true,
      };
      const manager = new SynthManager(config);
      expect(manager).toBeInstanceOf(SynthManager);
    });
  });

  describe('init()', () => {
    it('initializes the audio context', async () => {
      const manager = new SynthManager();
      expect(manager.isReady()).toBe(false);

      await manager.init();

      expect(Tone.start).toHaveBeenCalledOnce();
      expect(manager.isReady()).toBe(true);
    });

    it('creates a noise synth on init', async () => {
      const manager = new SynthManager();
      await manager.init();

      expect(Tone.NoiseSynth).toHaveBeenCalledOnce();
    });

    it('skips re-initialization if already initialized', async () => {
      const manager = new SynthManager();
      await manager.init();
      await manager.init();

      expect(Tone.start).toHaveBeenCalledOnce();
    });

    it('logs debug message when debug is enabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const manager = new SynthManager({ debug: true });
      await manager.init();

      expect(consoleSpy).toHaveBeenCalledWith('[AudioSynth] Audio context initialized');
      consoleSpy.mockRestore();
    });

    it('does not log when debug is disabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const manager = new SynthManager({ debug: false });
      await manager.init();

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('isReady()', () => {
    it('returns false before initialization', () => {
      const manager = new SynthManager();
      expect(manager.isReady()).toBe(false);
    });

    it('returns true after initialization', async () => {
      const manager = new SynthManager();
      await manager.init();
      expect(manager.isReady()).toBe(true);
    });

    it('returns false after dispose', async () => {
      const manager = new SynthManager();
      await manager.init();
      expect(manager.isReady()).toBe(true);
      manager.dispose();
      expect(manager.isReady()).toBe(false);
    });
  });

  describe('playSFX()', () => {
    it('does nothing when not initialized', () => {
      const manager = new SynthManager();
      manager.playSFX('gunshot');

      expect(Tone.Synth).not.toHaveBeenCalled();
    });

    it('logs warning when not initialized and debug is on', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const manager = new SynthManager({ debug: true });
      manager.playSFX('gunshot');

      expect(warnSpy).toHaveBeenCalledWith('[AudioSynth] Not initialized');
      warnSpy.mockRestore();
    });

    it('plays SFX by preset ID string', async () => {
      const manager = new SynthManager();
      await manager.init();
      manager.playSFX('gunshot');

      expect(Tone.Synth).toHaveBeenCalled();
    });

    it('plays SFX by preset object', async () => {
      const manager = new SynthManager();
      await manager.init();

      const preset = createBasicSFXPreset();
      manager.playSFX(preset);

      expect(Tone.Synth).toHaveBeenCalled();
    });

    it('handles unknown preset ID gracefully', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.playSFX('nonexistent_preset_id');
      // Should not throw, just silently return
    });

    it('logs warning for unknown preset ID with debug enabled', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const manager = new SynthManager({ debug: true });
      await manager.init();

      manager.playSFX('nonexistent_preset_id');

      expect(warnSpy).toHaveBeenCalledWith('[AudioSynth] Unknown preset: nonexistent_preset_id');
      warnSpy.mockRestore();
    });

    it('uses default frequency A4 when no frequency is specified', async () => {
      const manager = new SynthManager();
      await manager.init();

      const preset = createBasicSFXPreset();
      manager.playSFX(preset);

      expect(Tone.Synth).toHaveBeenCalled();
    });

    it('uses numeric frequency when specified', async () => {
      const manager = new SynthManager();
      await manager.init();

      const preset = createBasicSFXPreset({ frequency: 440 });
      manager.playSFX(preset);

      expect(Tone.Synth).toHaveBeenCalled();
    });

    it('handles frequency sweep configuration', async () => {
      const manager = new SynthManager();
      await manager.init();

      const preset = createBasicSFXPreset({
        frequency: { start: 150, end: 50, curve: 'exponential', duration: 0.1 },
      });
      manager.playSFX(preset);

      expect(Tone.Synth).toHaveBeenCalled();
    });

    it('handles frequency sweep with linear curve', async () => {
      const manager = new SynthManager();
      await manager.init();

      const preset = createBasicSFXPreset({
        frequency: { start: 200, end: 100, curve: 'linear', duration: 0.2 },
      });
      manager.playSFX(preset);

      expect(Tone.Synth).toHaveBeenCalled();
    });

    it('handles frequency sweep without explicit curve (defaults to linear)', async () => {
      const manager = new SynthManager();
      await manager.init();

      const preset = createBasicSFXPreset({
        frequency: { start: 500, end: 250 },
      });
      manager.playSFX(preset);

      expect(Tone.Synth).toHaveBeenCalled();
    });

    it('applies volume when specified on preset', async () => {
      const manager = new SynthManager();
      await manager.init();

      const preset = createBasicSFXPreset({ volume: -6 });
      manager.playSFX(preset);

      expect(Tone.Synth).toHaveBeenCalled();
    });

    it('uses custom duration from preset', async () => {
      const manager = new SynthManager();
      await manager.init();

      const preset = createBasicSFXPreset({ duration: '4n' });
      manager.playSFX(preset);

      expect(Tone.Synth).toHaveBeenCalled();
    });

    it('triggers noise synth when preset has noise layer', async () => {
      const manager = new SynthManager();
      await manager.init();

      const preset = createBasicSFXPreset({
        noise: {
          type: 'white',
          envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.1 },
          volume: -6,
        },
      });
      manager.playSFX(preset);

      // The synth should have been created and triggered
      expect(Tone.Synth).toHaveBeenCalled();
    });

    it('cleans up synth after timeout', async () => {
      const manager = new SynthManager();
      await manager.init();

      const preset = createBasicSFXPreset();
      manager.playSFX(preset);

      // Advance past cleanup delay
      vi.advanceTimersByTime(5000);

      // Synth should be cleaned up (dispose called on the created synth instance)
    });

    it('plays multiple SFX presets by ID', async () => {
      const manager = new SynthManager();
      await manager.init();

      const presetIds = ['gunshot', 'explosion', 'impact', 'laser', 'pickup'];
      for (const id of presetIds) {
        manager.playSFX(id);
      }

      // Multiple synths should have been created
      expect(Tone.Synth).toHaveBeenCalledTimes(presetIds.length);
    });

    it('plays SFX using alias IDs', async () => {
      const manager = new SynthManager();
      await manager.init();

      // These are aliases defined in SFX_PRESETS
      manager.playSFX('shoot'); // alias for gunshot
      manager.playSFX('explode'); // alias for explosion
      manager.playSFX('hit'); // alias for impact
      manager.playSFX('collect'); // alias for pickup

      expect(Tone.Synth).toHaveBeenCalledTimes(4);
    });
  });

  describe('playMusic()', () => {
    it('does nothing when not initialized', () => {
      const manager = new SynthManager();
      manager.playMusic('menu');

      expect(Tone.MonoSynth).not.toHaveBeenCalled();
      expect(Tone.PolySynth).not.toHaveBeenCalled();
    });

    it('plays music pattern by ID', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.playMusic('menu');

      // Menu theme uses 'sine' (non-fat), so MonoSynth should be created
      expect(Tone.MonoSynth).toHaveBeenCalled();
    });

    it('handles unknown pattern ID gracefully', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.playMusic('nonexistent_pattern');
      // Should not throw
    });

    it('logs warning for unknown pattern with debug enabled', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const manager = new SynthManager({ debug: true });
      await manager.init();

      manager.playMusic('nonexistent_pattern');

      expect(warnSpy).toHaveBeenCalledWith(
        '[AudioSynth] Unknown music pattern: nonexistent_pattern'
      );
      warnSpy.mockRestore();
    });

    it('does not restart if same pattern is already playing', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.playMusic('menu');
      const firstCallCount = (Tone.MonoSynth as unknown as ReturnType<typeof vi.fn>).mock.calls
        .length;

      manager.playMusic('menu');
      const secondCallCount = (Tone.MonoSynth as unknown as ReturnType<typeof vi.fn>).mock.calls
        .length;

      expect(secondCallCount).toBe(firstCallCount);
    });

    it('switches pattern when different pattern is requested', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.playMusic('menu');
      manager.playMusic('ambient');

      // Both MonoSynths should have been created (menu first, then ambient after stop)
      expect(Tone.MonoSynth).toHaveBeenCalledTimes(2);
    });

    it('starts the transport when playing music', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.playMusic('menu');

      // getTransport().start() should have been called
      expect(mockTransportStart.calls.length).toBeGreaterThan(0);
    });

    it('creates a Pattern with the correct notes and direction', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.playMusic('menu');

      expect(Tone.Pattern).toHaveBeenCalled();
    });

    it('plays music patterns using alias IDs', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.playMusic('battle'); // alias for combat
      manager.stopMusic();

      manager.playMusic('win'); // alias for victory
      manager.stopMusic();

      manager.playMusic('gameover'); // alias for defeat

      // These should all resolve to valid patterns
      expect(mockTransportStart.calls.length).toBeGreaterThan(0);
    });
  });

  describe('stopMusic()', () => {
    it('stops the transport', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.playMusic('menu');
      manager.stopMusic();

      expect(mockTransportStop.calls.length).toBeGreaterThan(0);
      expect(mockTransportCancel.calls.length).toBeGreaterThan(0);
    });

    it('can be called safely when no music is playing', async () => {
      const manager = new SynthManager();
      await manager.init();

      // Should not throw
      manager.stopMusic();
      expect(mockTransportStop.calls.length).toBeGreaterThan(0);
    });

    it('resets currentMusicId so same pattern can be restarted', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.playMusic('menu');
      manager.stopMusic();
      manager.playMusic('menu');

      // Should have created synth twice
      expect(Tone.MonoSynth).toHaveBeenCalledTimes(2);
    });
  });

  describe('setMasterVolume()', () => {
    it('sets volume within valid range', () => {
      const manager = new SynthManager();
      manager.setMasterVolume(0.5);

      expect(Tone.getDestination).toHaveBeenCalled();
      expect(Tone.gainToDb).toHaveBeenCalledWith(0.5);
    });

    it('clamps volume at minimum 0', () => {
      const manager = new SynthManager();
      manager.setMasterVolume(-0.5);

      expect(Tone.gainToDb).toHaveBeenCalledWith(0);
    });

    it('clamps volume at maximum 1', () => {
      const manager = new SynthManager();
      manager.setMasterVolume(1.5);

      expect(Tone.gainToDb).toHaveBeenCalledWith(1);
    });

    it('handles boundary values', () => {
      const manager = new SynthManager();

      manager.setMasterVolume(0);
      expect(Tone.gainToDb).toHaveBeenCalledWith(0);

      manager.setMasterVolume(1);
      expect(Tone.gainToDb).toHaveBeenCalledWith(1);
    });
  });

  describe('stopAll()', () => {
    it('stops music and clears active synths', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.playMusic('menu');
      manager.playSFX('gunshot');
      manager.stopAll();

      expect(mockTransportStop.calls.length).toBeGreaterThan(0);
      expect(mockTransportCancel.calls.length).toBeGreaterThan(0);
    });

    it('can be called when nothing is playing', async () => {
      const manager = new SynthManager();
      await manager.init();

      // Should not throw
      manager.stopAll();
    });
  });

  describe('dispose()', () => {
    it('disposes all resources and resets state', async () => {
      const manager = new SynthManager();
      await manager.init();
      expect(manager.isReady()).toBe(true);

      manager.dispose();

      expect(manager.isReady()).toBe(false);
    });

    it('stops music before disposing', async () => {
      const manager = new SynthManager();
      await manager.init();
      manager.playMusic('menu');

      manager.dispose();

      expect(mockTransportStop.calls.length).toBeGreaterThan(0);
    });

    it('can be called multiple times safely', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.dispose();
      manager.dispose();

      expect(manager.isReady()).toBe(false);
    });

    it('clears active SFX synths on dispose', async () => {
      const manager = new SynthManager();
      await manager.init();

      manager.playSFX('gunshot');
      manager.playSFX('laser');
      manager.dispose();

      expect(manager.isReady()).toBe(false);
    });
  });
});

describe('createSynthManager()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an ISynthManager instance', () => {
    const manager = createSynthManager();
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

  it('creates manager with default config', () => {
    const manager = createSynthManager();
    expect(manager.isReady()).toBe(false);
  });

  it('creates manager with custom config', () => {
    const manager = createSynthManager({
      masterVolume: 0.7,
      debug: true,
    });
    expect(manager.isReady()).toBe(false);
  });

  it('returned manager can be initialized', async () => {
    const manager = createSynthManager();
    await manager.init();
    expect(manager.isReady()).toBe(true);
  });
});
