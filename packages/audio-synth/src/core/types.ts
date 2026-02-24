/**
 * Audio Synth Types
 * Core type definitions for procedural audio synthesis.
 * @packageDocumentation
 * @module core/types
 */

import type * as Tone from 'tone';

/**
 * Oscillator type for synthesis.
 */
export type OscillatorType =
  | 'sine'
  | 'square'
  | 'sawtooth'
  | 'triangle'
  | 'fatsine'
  | 'fatsquare'
  | 'fatsawtooth'
  | 'fattriangle';

/**
 * Envelope configuration for amplitude shaping.
 */
export interface EnvelopeConfig {
  /** Attack time in seconds */
  attack: number;
  /** Decay time in seconds */
  decay: number;
  /** Sustain level (0-1) */
  sustain: number;
  /** Release time in seconds */
  release: number;
}

/**
 * Frequency sweep configuration.
 */
export interface FrequencySweep {
  /** Starting frequency in Hz */
  start: number;
  /** Ending frequency in Hz */
  end: number;
  /** Sweep curve type */
  curve?: 'linear' | 'exponential';
  /** Sweep duration in seconds */
  duration?: number;
}

/**
 * Filter configuration for sound shaping.
 */
export interface FilterConfig {
  /** Filter type */
  type: BiquadFilterType;
  /** Cutoff frequency in Hz */
  frequency: number;
  /** Q factor (resonance) */
  Q?: number;
  /** Rolloff in dB per octave */
  rolloff?: Tone.FilterRollOff;
}

/**
 * SFX preset definition.
 */
export interface SFXPreset {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Oscillator configuration */
  oscillator: {
    type: OscillatorType;
  };
  /** Envelope configuration */
  envelope: EnvelopeConfig;
  /** Optional frequency sweep */
  frequency?: FrequencySweep | number;
  /** Optional filter */
  filter?: FilterConfig;
  /** Volume in decibels */
  volume?: number;
  /** Duration override */
  duration?: string;
  /** Additional noise layer */
  noise?: {
    type: 'white' | 'pink' | 'brown';
    envelope: EnvelopeConfig;
    volume?: number;
  };
}

/**
 * Music pattern note.
 */
export interface MusicNote {
  /** Note name (e.g., "C4", "G#3") */
  note: string;
  /** Duration (e.g., "4n", "8n") */
  duration: string;
  /** Velocity (0-1) */
  velocity?: number;
}

/**
 * Music pattern configuration.
 */
export interface MusicPattern {
  /** Pattern identifier */
  id: string;
  /** Pattern name */
  name: string;
  /** Notes in the pattern */
  notes: string[];
  /** Pattern direction */
  direction?: 'up' | 'down' | 'upDown' | 'downUp' | 'random';
  /** Interval between notes */
  interval: string;
  /** Oscillator type */
  oscillator: {
    type: OscillatorType;
  };
  /** Envelope */
  envelope: EnvelopeConfig;
  /** Optional filter */
  filter?: FilterConfig;
}

/**
 * Synth manager configuration.
 */
export interface SynthManagerConfig {
  /** Master volume (0-1) */
  masterVolume?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Synth manager interface.
 */
export interface ISynthManager {
  /** Initialize the audio context */
  init(): Promise<void>;
  /** Check if initialized */
  isReady(): boolean;
  /** Play a sound effect */
  playSFX(preset: SFXPreset | string): void;
  /** Play background music */
  playMusic(patternId: string): void;
  /** Stop background music */
  stopMusic(): void;
  /** Set master volume */
  setMasterVolume(volume: number): void;
  /** Stop all sounds */
  stopAll(): void;
  /** Dispose all resources */
  dispose(): void;
}

/**
 * Audio context value for React context.
 */
export interface AudioSynthContextValue {
  /** Synth manager instance */
  manager: ISynthManager | null;
  /** Whether audio is ready */
  isReady: boolean;
  /** Play a sound effect */
  playSFX: (preset: SFXPreset | string) => void;
  /** Play background music */
  playMusic: (patternId: string) => void;
  /** Stop background music */
  stopMusic: () => void;
  /** Set master volume */
  setMasterVolume: (volume: number) => void;
}
