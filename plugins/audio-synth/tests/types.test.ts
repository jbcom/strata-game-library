/**
 * Audio Synth Types Unit Tests
 *
 * Validates the type definitions, interfaces, and type exports from the
 * audio-synth package. Since TypeScript types are erased at runtime, these
 * tests verify that the exported interfaces produce valid runtime objects
 * and that type-level constraints are upheld by the data structures.
 *
 * @module core/types.test
 */

import { describe, expect, it } from 'vitest';

import type {
  AudioSynthContextValue,
  EnvelopeConfig,
  FilterConfig,
  FrequencySweep,
  ISynthManager,
  MusicNote,
  MusicPattern,
  OscillatorType,
  SFXPreset,
  SynthManagerConfig,
} from '../src/core/types.js';

describe('Type definitions - runtime shape validation', () => {
  describe('EnvelopeConfig', () => {
    it('accepts a valid envelope configuration', () => {
      const envelope: EnvelopeConfig = {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.2,
      };

      expect(envelope.attack).toBe(0.01);
      expect(envelope.decay).toBe(0.1);
      expect(envelope.sustain).toBe(0.5);
      expect(envelope.release).toBe(0.2);
    });

    it('allows zero values for all fields', () => {
      const envelope: EnvelopeConfig = {
        attack: 0,
        decay: 0,
        sustain: 0,
        release: 0,
      };

      expect(envelope.attack).toBe(0);
      expect(envelope.decay).toBe(0);
      expect(envelope.sustain).toBe(0);
      expect(envelope.release).toBe(0);
    });

    it('allows maximum sustain value of 1', () => {
      const envelope: EnvelopeConfig = {
        attack: 0.1,
        decay: 0.2,
        sustain: 1,
        release: 0.3,
      };

      expect(envelope.sustain).toBe(1);
    });
  });

  describe('FrequencySweep', () => {
    it('accepts a minimal frequency sweep', () => {
      const sweep: FrequencySweep = {
        start: 440,
        end: 220,
      };

      expect(sweep.start).toBe(440);
      expect(sweep.end).toBe(220);
      expect(sweep.curve).toBeUndefined();
      expect(sweep.duration).toBeUndefined();
    });

    it('accepts a full frequency sweep with linear curve', () => {
      const sweep: FrequencySweep = {
        start: 880,
        end: 110,
        curve: 'linear',
        duration: 0.5,
      };

      expect(sweep.curve).toBe('linear');
      expect(sweep.duration).toBe(0.5);
    });

    it('accepts a frequency sweep with exponential curve', () => {
      const sweep: FrequencySweep = {
        start: 1000,
        end: 50,
        curve: 'exponential',
        duration: 0.2,
      };

      expect(sweep.curve).toBe('exponential');
    });

    it('supports ascending frequency sweep', () => {
      const sweep: FrequencySweep = {
        start: 200,
        end: 800,
        curve: 'linear',
        duration: 0.3,
      };

      expect(sweep.end).toBeGreaterThan(sweep.start);
    });

    it('supports descending frequency sweep', () => {
      const sweep: FrequencySweep = {
        start: 800,
        end: 200,
        curve: 'exponential',
        duration: 0.1,
      };

      expect(sweep.start).toBeGreaterThan(sweep.end);
    });
  });

  describe('FilterConfig', () => {
    it('accepts a minimal filter config', () => {
      const filter: FilterConfig = {
        type: 'lowpass',
        frequency: 800,
      };

      expect(filter.type).toBe('lowpass');
      expect(filter.frequency).toBe(800);
      expect(filter.Q).toBeUndefined();
      expect(filter.rolloff).toBeUndefined();
    });

    it('accepts a full filter config', () => {
      const filter: FilterConfig = {
        type: 'highpass',
        frequency: 1200,
        Q: 4,
        rolloff: -24,
      };

      expect(filter.type).toBe('highpass');
      expect(filter.Q).toBe(4);
      expect(filter.rolloff).toBe(-24);
    });

    it('supports bandpass filter type', () => {
      const filter: FilterConfig = {
        type: 'bandpass',
        frequency: 500,
        Q: 2,
      };

      expect(filter.type).toBe('bandpass');
    });
  });

  describe('SFXPreset', () => {
    it('accepts a minimal SFX preset', () => {
      const preset: SFXPreset = {
        id: 'test',
        name: 'Test Sound',
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
      };

      expect(preset.id).toBe('test');
      expect(preset.name).toBe('Test Sound');
      expect(preset.oscillator.type).toBe('sine');
      expect(preset.frequency).toBeUndefined();
      expect(preset.filter).toBeUndefined();
      expect(preset.volume).toBeUndefined();
      expect(preset.duration).toBeUndefined();
      expect(preset.noise).toBeUndefined();
    });

    it('accepts a fully configured SFX preset', () => {
      const preset: SFXPreset = {
        id: 'full-test',
        name: 'Full Test Sound',
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
        frequency: { start: 150, end: 50, curve: 'exponential', duration: 0.1 },
        filter: { type: 'lowpass', frequency: 800, Q: 2 },
        volume: -6,
        duration: '16n',
        noise: {
          type: 'white',
          envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.1 },
          volume: -10,
        },
      };

      expect(preset.id).toBe('full-test');
      expect(preset.noise?.type).toBe('white');
      expect(preset.volume).toBe(-6);
    });

    it('accepts numeric frequency', () => {
      const preset: SFXPreset = {
        id: 'numeric-freq',
        name: 'Numeric Frequency',
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 },
        frequency: 440,
      };

      expect(preset.frequency).toBe(440);
    });

    it('accepts noise layers with all noise types', () => {
      const noiseTypes: Array<'white' | 'pink' | 'brown'> = ['white', 'pink', 'brown'];

      for (const noiseType of noiseTypes) {
        const preset: SFXPreset = {
          id: `noise-${noiseType}`,
          name: `Noise ${noiseType}`,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
          noise: {
            type: noiseType,
            envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 },
          },
        };

        expect(preset.noise?.type).toBe(noiseType);
      }
    });
  });

  describe('MusicNote', () => {
    it('accepts a valid music note', () => {
      const note: MusicNote = {
        note: 'C4',
        duration: '4n',
      };

      expect(note.note).toBe('C4');
      expect(note.duration).toBe('4n');
      expect(note.velocity).toBeUndefined();
    });

    it('accepts a music note with velocity', () => {
      const note: MusicNote = {
        note: 'G#3',
        duration: '8n',
        velocity: 0.8,
      };

      expect(note.velocity).toBe(0.8);
    });
  });

  describe('MusicPattern', () => {
    it('accepts a minimal music pattern', () => {
      const pattern: MusicPattern = {
        id: 'test-pattern',
        name: 'Test Pattern',
        notes: ['C4', 'E4', 'G4'],
        interval: '4n',
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.5 },
      };

      expect(pattern.id).toBe('test-pattern');
      expect(pattern.notes).toHaveLength(3);
      expect(pattern.direction).toBeUndefined();
      expect(pattern.filter).toBeUndefined();
    });

    it('accepts all direction values', () => {
      const directions: Array<'up' | 'down' | 'upDown' | 'downUp' | 'random'> = [
        'up',
        'down',
        'upDown',
        'downUp',
        'random',
      ];

      for (const direction of directions) {
        const pattern: MusicPattern = {
          id: `dir-${direction}`,
          name: `Direction ${direction}`,
          notes: ['C4', 'E4'],
          direction,
          interval: '4n',
          oscillator: { type: 'sine' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.5 },
        };

        expect(pattern.direction).toBe(direction);
      }
    });

    it('accepts a pattern with filter config', () => {
      const pattern: MusicPattern = {
        id: 'filtered',
        name: 'Filtered Pattern',
        notes: ['C2', 'G2'],
        interval: '8n',
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.1 },
        filter: {
          type: 'lowpass',
          frequency: 200,
          Q: 2,
          rolloff: -12,
        },
      };

      expect(pattern.filter?.type).toBe('lowpass');
    });
  });

  describe('SynthManagerConfig', () => {
    it('accepts empty config (all optional)', () => {
      const config: SynthManagerConfig = {};

      expect(config.masterVolume).toBeUndefined();
      expect(config.debug).toBeUndefined();
    });

    it('accepts full config', () => {
      const config: SynthManagerConfig = {
        masterVolume: 0.75,
        debug: true,
      };

      expect(config.masterVolume).toBe(0.75);
      expect(config.debug).toBe(true);
    });
  });

  describe('OscillatorType', () => {
    it('supports all valid oscillator types', () => {
      const validTypes: OscillatorType[] = [
        'sine',
        'square',
        'sawtooth',
        'triangle',
        'fatsine',
        'fatsquare',
        'fatsawtooth',
        'fattriangle',
      ];

      expect(validTypes).toHaveLength(8);
      for (const type of validTypes) {
        expect(typeof type).toBe('string');
      }
    });

    it('basic types are the 4 standard waveforms', () => {
      const basicTypes: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];
      expect(basicTypes).toHaveLength(4);
    });

    it('fat types correspond to basic types with "fat" prefix', () => {
      const fatTypes: OscillatorType[] = ['fatsine', 'fatsquare', 'fatsawtooth', 'fattriangle'];
      const basicTypes: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];

      for (let i = 0; i < fatTypes.length; i++) {
        expect(fatTypes[i]).toBe(`fat${basicTypes[i]}`);
      }
    });
  });

  describe('ISynthManager interface', () => {
    it('defines the complete SynthManager API surface', () => {
      // Create a mock that satisfies ISynthManager
      const mockManager: ISynthManager = {
        init: async () => {},
        isReady: () => false,
        playSFX: () => {},
        playMusic: () => {},
        stopMusic: () => {},
        setMasterVolume: () => {},
        stopAll: () => {},
        dispose: () => {},
      };

      expect(typeof mockManager.init).toBe('function');
      expect(typeof mockManager.isReady).toBe('function');
      expect(typeof mockManager.playSFX).toBe('function');
      expect(typeof mockManager.playMusic).toBe('function');
      expect(typeof mockManager.stopMusic).toBe('function');
      expect(typeof mockManager.setMasterVolume).toBe('function');
      expect(typeof mockManager.stopAll).toBe('function');
      expect(typeof mockManager.dispose).toBe('function');
    });

    it('init returns a Promise', () => {
      const mockManager: ISynthManager = {
        init: async () => {},
        isReady: () => false,
        playSFX: () => {},
        playMusic: () => {},
        stopMusic: () => {},
        setMasterVolume: () => {},
        stopAll: () => {},
        dispose: () => {},
      };

      const result = mockManager.init();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('AudioSynthContextValue interface', () => {
    it('defines the context shape for React provider', () => {
      const contextValue: AudioSynthContextValue = {
        manager: null,
        isReady: false,
        playSFX: () => {},
        playMusic: () => {},
        stopMusic: () => {},
        setMasterVolume: () => {},
      };

      expect(contextValue.manager).toBeNull();
      expect(contextValue.isReady).toBe(false);
      expect(typeof contextValue.playSFX).toBe('function');
      expect(typeof contextValue.playMusic).toBe('function');
      expect(typeof contextValue.stopMusic).toBe('function');
      expect(typeof contextValue.setMasterVolume).toBe('function');
    });

    it('supports non-null manager in context', () => {
      const mockManager: ISynthManager = {
        init: async () => {},
        isReady: () => true,
        playSFX: () => {},
        playMusic: () => {},
        stopMusic: () => {},
        setMasterVolume: () => {},
        stopAll: () => {},
        dispose: () => {},
      };

      const contextValue: AudioSynthContextValue = {
        manager: mockManager,
        isReady: true,
        playSFX: mockManager.playSFX,
        playMusic: mockManager.playMusic,
        stopMusic: mockManager.stopMusic,
        setMasterVolume: mockManager.setMasterVolume,
      };

      expect(contextValue.manager).toBe(mockManager);
      expect(contextValue.isReady).toBe(true);
    });
  });
});
