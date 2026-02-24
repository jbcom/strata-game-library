/**
 * SFX Presets
 * Pre-configured sound effect presets for common game sounds.
 * @packageDocumentation
 * @module presets/sfx
 */

import type { SFXPreset } from '../core/types';

/**
 * Gunshot sound effect - quick sawtooth sweep.
 */
export const GUNSHOT: SFXPreset = {
  id: 'gunshot',
  name: 'Gunshot',
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
  frequency: { start: 150, end: 50, curve: 'exponential', duration: 0.1 },
  duration: '16n',
};

/**
 * Explosion sound effect - low rumble with noise.
 */
export const EXPLOSION: SFXPreset = {
  id: 'explosion',
  name: 'Explosion',
  oscillator: { type: 'sine' },
  envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.2 },
  frequency: 40,
  duration: '4n',
  noise: {
    type: 'white',
    envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.1 },
    volume: -6,
  },
};

/**
 * Impact/hit sound effect - square wave thump.
 */
export const IMPACT: SFXPreset = {
  id: 'impact',
  name: 'Impact',
  oscillator: { type: 'square' },
  envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
  frequency: { start: 200, end: 80, curve: 'exponential', duration: 0.05 },
  duration: '32n',
};

/**
 * Ricochet sound effect - high pitch ping.
 */
export const RICOCHET: SFXPreset = {
  id: 'ricochet',
  name: 'Ricochet',
  oscillator: { type: 'sine' },
  envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
  frequency: { start: 2000, end: 800, curve: 'exponential', duration: 0.15 },
  duration: '16n',
};

/**
 * Pickup/collect sound effect - ascending sine.
 */
export const PICKUP: SFXPreset = {
  id: 'pickup',
  name: 'Pickup',
  oscillator: { type: 'sine' },
  envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 },
  frequency: { start: 523, end: 1047, curve: 'exponential', duration: 0.2 },
  duration: '8n',
};

/**
 * UI select sound effect - soft click.
 */
export const SELECT: SFXPreset = {
  id: 'select',
  name: 'Select',
  oscillator: { type: 'sine' },
  envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
  frequency: 800,
  duration: '32n',
};

/**
 * UI confirm sound effect - positive tone.
 */
export const CONFIRM: SFXPreset = {
  id: 'confirm',
  name: 'Confirm',
  oscillator: { type: 'sine' },
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 },
  frequency: { start: 440, end: 880, curve: 'exponential', duration: 0.1 },
  duration: '8n',
};

/**
 * UI error sound effect - negative buzz.
 */
export const ERROR: SFXPreset = {
  id: 'error',
  name: 'Error',
  oscillator: { type: 'square' },
  envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 },
  frequency: 220,
  duration: '8n',
  volume: -6,
};

/**
 * Splash/water sound effect.
 */
export const SPLASH: SFXPreset = {
  id: 'splash',
  name: 'Splash',
  oscillator: { type: 'sine' },
  envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 },
  frequency: { start: 400, end: 100, curve: 'exponential', duration: 0.3 },
  noise: {
    type: 'pink',
    envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.15 },
    volume: -10,
  },
  duration: '4n',
};

/**
 * Footstep sound effect.
 */
export const FOOTSTEP: SFXPreset = {
  id: 'footstep',
  name: 'Footstep',
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.03 },
  frequency: { start: 100, end: 60, curve: 'linear', duration: 0.05 },
  noise: {
    type: 'brown',
    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.02 },
    volume: -12,
  },
  duration: '32n',
};

/**
 * Laser/energy weapon sound effect.
 */
export const LASER: SFXPreset = {
  id: 'laser',
  name: 'Laser',
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
  frequency: { start: 880, end: 220, curve: 'exponential', duration: 0.1 },
  duration: '16n',
};

/**
 * Power up sound effect.
 */
export const POWERUP: SFXPreset = {
  id: 'powerup',
  name: 'Power Up',
  oscillator: { type: 'sine' },
  envelope: { attack: 0.05, decay: 0.3, sustain: 0.2, release: 0.2 },
  frequency: { start: 220, end: 880, curve: 'exponential', duration: 0.4 },
  duration: '2n',
};

/**
 * All SFX presets indexed by ID.
 */
export const SFX_PRESETS = {
  gunshot: GUNSHOT,
  shoot: GUNSHOT, // Alias
  explosion: EXPLOSION,
  explode: EXPLOSION, // Alias
  impact: IMPACT,
  hit: IMPACT, // Alias
  ricochet: RICOCHET,
  pickup: PICKUP,
  collect: PICKUP, // Alias
  select: SELECT,
  click: SELECT, // Alias
  confirm: CONFIRM,
  success: CONFIRM, // Alias
  error: ERROR,
  fail: ERROR, // Alias
  splash: SPLASH,
  water: SPLASH, // Alias
  footstep: FOOTSTEP,
  step: FOOTSTEP, // Alias
  laser: LASER,
  powerup: POWERUP,
} as const;

export type SFXPresetId = keyof typeof SFX_PRESETS;
