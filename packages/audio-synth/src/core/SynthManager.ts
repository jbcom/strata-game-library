/**
 * Synth Manager
 * Core audio synthesis engine using Tone.js.
 * @packageDocumentation
 * @module core/SynthManager
 */

import * as Tone from 'tone';
import { MUSIC_PATTERNS } from '../presets/music.js';
import { SFX_PRESETS } from '../presets/sfx.js';
import type { ISynthManager, MusicPattern, SFXPreset, SynthManagerConfig } from './types.js';

/**
 * Creates and manages procedural audio synthesis.
 *
 * @category Audio
 * @example
 * ```typescript
 * const manager = createSynthManager({ masterVolume: 0.8 });
 * await manager.init();
 * manager.playSFX('gunshot');
 * ```
 */
export class SynthManager implements ISynthManager {
  private initialized = false;
  private config: Required<SynthManagerConfig>;
  private activeSynths: Set<Tone.Synth | Tone.MonoSynth | Tone.NoiseSynth> = new Set();
  private noiseSynth: Tone.NoiseSynth | null = null;
  private musicSynth: Tone.PolySynth | Tone.MonoSynth | null = null;
  private musicPattern: Tone.Pattern<string> | null = null;
  private currentMusicId: string | null = null;

  constructor(config: SynthManagerConfig = {}) {
    this.config = {
      masterVolume: config.masterVolume ?? 1,
      debug: config.debug ?? false,
    };
  }

  /**
   * Initialize the Tone.js audio context.
   * MUST be called after a user gesture (click/touch).
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    await Tone.start();

    if (this.config.debug) {
      console.log('[AudioSynth] Audio context initialized');
    }

    // Create reusable noise synth
    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0 },
    }).toDestination();

    this.initialized = true;
  }

  /**
   * Check if the audio context is ready.
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Play a sound effect from a preset or preset ID.
   */
  playSFX(presetOrId: SFXPreset | string): void {
    if (!this.initialized) {
      if (this.config.debug) {
        console.warn('[AudioSynth] Not initialized');
      }
      return;
    }

    const preset =
      typeof presetOrId === 'string'
        ? SFX_PRESETS[presetOrId as keyof typeof SFX_PRESETS]
        : presetOrId;

    if (!preset) {
      if (this.config.debug) {
        console.warn(`[AudioSynth] Unknown preset: ${presetOrId}`);
      }
      return;
    }

    this.triggerSFX(preset);
  }

  private triggerSFX(preset: SFXPreset): void {
    const now = Tone.now();

    // Create synth based on preset
    const synth = new Tone.Synth({
      oscillator: { type: preset.oscillator.type } as Tone.OmniOscillatorOptions,
      envelope: preset.envelope,
    }).toDestination();

    if (preset.volume !== undefined) {
      synth.volume.value = preset.volume;
    }

    this.activeSynths.add(synth);

    // Handle frequency
    let frequency: Tone.Unit.Frequency = 'A4';
    if (typeof preset.frequency === 'number') {
      frequency = preset.frequency;
    } else if (preset.frequency?.start) {
      frequency = preset.frequency.start;

      // Schedule frequency sweep
      if (preset.frequency.end) {
        const duration = preset.frequency.duration ?? 0.1;
        synth.frequency.setValueAtTime(preset.frequency.start, now);
        if (preset.frequency.curve === 'exponential') {
          synth.frequency.exponentialRampToValueAtTime(preset.frequency.end, now + duration);
        } else {
          synth.frequency.linearRampToValueAtTime(preset.frequency.end, now + duration);
        }
      }
    }

    const duration = preset.duration ?? '16n';
    synth.triggerAttackRelease(frequency, duration, now);

    // Handle noise layer
    if (preset.noise && this.noiseSynth) {
      this.noiseSynth.triggerAttackRelease(duration, now);
    }

    // Cleanup after sound completes
    const cleanupDelay =
      Tone.Time(duration).toSeconds() * 1000 + preset.envelope.release * 1000 + 100;
    setTimeout(() => {
      synth.dispose();
      this.activeSynths.delete(synth);
    }, cleanupDelay);
  }

  /**
   * Play background music from a pattern ID.
   */
  playMusic(patternId: string): void {
    if (!this.initialized) return;

    // Don't restart if already playing same pattern
    if (this.currentMusicId === patternId) return;

    this.stopMusic();

    const pattern = MUSIC_PATTERNS[patternId as keyof typeof MUSIC_PATTERNS];
    if (!pattern) {
      if (this.config.debug) {
        console.warn(`[AudioSynth] Unknown music pattern: ${patternId}`);
      }
      return;
    }

    this.startMusicPattern(pattern);
    this.currentMusicId = patternId;
  }

  private startMusicPattern(pattern: MusicPattern): void {
    // Create appropriate synth based on pattern
    if (pattern.oscillator.type.startsWith('fat')) {
      this.musicSynth = new Tone.PolySynth(Tone.Synth).toDestination();
      this.musicSynth.set({
        oscillator: {
          type: pattern.oscillator.type,
        } as Tone.OmniOscillatorOptions,
        envelope: pattern.envelope,
      });
    } else {
      this.musicSynth = new Tone.MonoSynth({
        oscillator: {
          type: pattern.oscillator.type,
        } as Tone.OmniOscillatorOptions,
        envelope: pattern.envelope,
        filter: pattern.filter
          ? {
              Q: pattern.filter.Q ?? 2,
              type: pattern.filter.type,
              rolloff: pattern.filter.rolloff ?? -12,
            }
          : undefined,
        filterEnvelope: pattern.filter
          ? {
              attack: 0.01,
              decay: 0.1,
              sustain: 0.2,
              baseFrequency: pattern.filter.frequency,
              octaves: 2,
            }
          : undefined,
      }).toDestination();
    }

    this.musicPattern = new Tone.Pattern(
      (time, note) => {
        if (this.musicSynth instanceof Tone.PolySynth) {
          this.musicSynth.triggerAttackRelease(note, '8n', time);
        } else {
          (this.musicSynth as Tone.MonoSynth)?.triggerAttackRelease(note, '16n', time);
        }
      },
      pattern.notes,
      pattern.direction ?? 'upDown'
    );

    this.musicPattern.interval = pattern.interval;
    this.musicPattern.start(0);
    Tone.getTransport().start();
  }

  /**
   * Stop background music.
   */
  stopMusic(): void {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();

    if (this.musicPattern) {
      this.musicPattern.dispose();
      this.musicPattern = null;
    }

    if (this.musicSynth) {
      this.musicSynth.dispose();
      this.musicSynth = null;
    }

    this.currentMusicId = null;
  }

  /**
   * Set master volume.
   */
  setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    Tone.getDestination().volume.value = Tone.gainToDb(this.config.masterVolume);
  }

  /**
   * Stop all sounds and reset.
   */
  stopAll(): void {
    this.stopMusic();

    // Dispose active synths
    this.activeSynths.forEach((synth) => {
      synth.dispose();
    });
    this.activeSynths.clear();
  }

  /**
   * Dispose all resources.
   */
  dispose(): void {
    this.stopAll();

    if (this.noiseSynth) {
      this.noiseSynth.dispose();
      this.noiseSynth = null;
    }

    this.initialized = false;
  }
}

/**
 * Factory function to create a SynthManager instance.
 *
 * @param config - Configuration options
 * @returns SynthManager instance
 */
export function createSynthManager(config?: SynthManagerConfig): ISynthManager {
  return new SynthManager(config);
}
