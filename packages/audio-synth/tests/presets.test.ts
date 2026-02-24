/**
 * Audio synth preset tests
 *
 * Validates that SFX and music presets export valid configuration objects
 * with the correct structure. Tone.js is not required for these tests
 * since we only check data shapes.
 */
import { describe, expect, it } from 'vitest';

import {
  GUNSHOT,
  EXPLOSION,
  IMPACT,
  RICOCHET,
  PICKUP,
  SELECT,
  CONFIRM,
  ERROR,
  SPLASH,
  FOOTSTEP,
  LASER,
  POWERUP,
  SFX_PRESETS,
} from '../src/presets/sfx.js';

import {
  MENU_THEME,
  COMBAT_THEME,
  AMBIENT_THEME,
  VICTORY_THEME,
  DEFEAT_THEME,
  EXPLORATION_THEME,
  TENSION_THEME,
  SHOP_THEME,
  MUSIC_PATTERNS,
} from '../src/presets/music.js';

import type { SFXPreset, MusicPattern, EnvelopeConfig } from '../src/core/types.js';

function expectValidEnvelope(env: EnvelopeConfig) {
  expect(env.attack).toBeTypeOf('number');
  expect(env.decay).toBeTypeOf('number');
  expect(env.sustain).toBeTypeOf('number');
  expect(env.release).toBeTypeOf('number');
  expect(env.attack).toBeGreaterThanOrEqual(0);
  expect(env.decay).toBeGreaterThanOrEqual(0);
  expect(env.sustain).toBeGreaterThanOrEqual(0);
  expect(env.sustain).toBeLessThanOrEqual(1);
  expect(env.release).toBeGreaterThanOrEqual(0);
}

function expectValidSFXPreset(preset: SFXPreset) {
  expect(preset.id).toBeTypeOf('string');
  expect(preset.id.length).toBeGreaterThan(0);
  expect(preset.name).toBeTypeOf('string');
  expect(preset.name.length).toBeGreaterThan(0);
  expect(preset.oscillator).toBeDefined();
  expect(preset.oscillator.type).toBeTypeOf('string');
  expectValidEnvelope(preset.envelope);
}

function expectValidMusicPattern(pattern: MusicPattern) {
  expect(pattern.id).toBeTypeOf('string');
  expect(pattern.id.length).toBeGreaterThan(0);
  expect(pattern.name).toBeTypeOf('string');
  expect(pattern.name.length).toBeGreaterThan(0);
  expect(pattern.notes).toBeInstanceOf(Array);
  expect(pattern.notes.length).toBeGreaterThan(0);
  expect(pattern.interval).toBeTypeOf('string');
  expect(pattern.oscillator).toBeDefined();
  expect(pattern.oscillator.type).toBeTypeOf('string');
  expectValidEnvelope(pattern.envelope);
}

describe('SFX presets', () => {
  const presets: [string, SFXPreset][] = [
    ['GUNSHOT', GUNSHOT],
    ['EXPLOSION', EXPLOSION],
    ['IMPACT', IMPACT],
    ['RICOCHET', RICOCHET],
    ['PICKUP', PICKUP],
    ['SELECT', SELECT],
    ['CONFIRM', CONFIRM],
    ['ERROR', ERROR],
    ['SPLASH', SPLASH],
    ['FOOTSTEP', FOOTSTEP],
    ['LASER', LASER],
    ['POWERUP', POWERUP],
  ];

  it.each(presets)('%s is a valid SFX preset', (_name, preset) => {
    expectValidSFXPreset(preset);
  });

  it('GUNSHOT has frequency sweep', () => {
    expect(typeof GUNSHOT.frequency).toBe('object');
    const sweep = GUNSHOT.frequency as { start: number; end: number };
    expect(sweep.start).toBeGreaterThan(sweep.end);
  });

  it('EXPLOSION has noise layer', () => {
    expect(EXPLOSION.noise).toBeDefined();
    expect(EXPLOSION.noise!.type).toBe('white');
  });

  it('FOOTSTEP has noise layer', () => {
    expect(FOOTSTEP.noise).toBeDefined();
    expect(FOOTSTEP.noise!.type).toBe('brown');
  });

  it('SFX_PRESETS contains all presets and aliases', () => {
    expect(SFX_PRESETS.gunshot).toBe(GUNSHOT);
    expect(SFX_PRESETS.shoot).toBe(GUNSHOT);
    expect(SFX_PRESETS.explosion).toBe(EXPLOSION);
    expect(SFX_PRESETS.explode).toBe(EXPLOSION);
    expect(SFX_PRESETS.impact).toBe(IMPACT);
    expect(SFX_PRESETS.hit).toBe(IMPACT);
    expect(SFX_PRESETS.laser).toBe(LASER);
    expect(SFX_PRESETS.powerup).toBe(POWERUP);
  });
});

describe('Music presets', () => {
  const patterns: [string, MusicPattern][] = [
    ['MENU_THEME', MENU_THEME],
    ['COMBAT_THEME', COMBAT_THEME],
    ['AMBIENT_THEME', AMBIENT_THEME],
    ['VICTORY_THEME', VICTORY_THEME],
    ['DEFEAT_THEME', DEFEAT_THEME],
    ['EXPLORATION_THEME', EXPLORATION_THEME],
    ['TENSION_THEME', TENSION_THEME],
    ['SHOP_THEME', SHOP_THEME],
  ];

  it.each(patterns)('%s is a valid music pattern', (_name, pattern) => {
    expectValidMusicPattern(pattern);
  });

  it('COMBAT_THEME has filter config', () => {
    expect(COMBAT_THEME.filter).toBeDefined();
    expect(COMBAT_THEME.filter!.type).toBe('lowpass');
    expect(COMBAT_THEME.filter!.frequency).toBeGreaterThan(0);
  });

  it('TENSION_THEME has filter config', () => {
    expect(TENSION_THEME.filter).toBeDefined();
    expect(TENSION_THEME.filter!.type).toBe('lowpass');
  });

  it('MUSIC_PATTERNS contains all patterns and aliases', () => {
    expect(MUSIC_PATTERNS.menu).toBe(MENU_THEME);
    expect(MUSIC_PATTERNS.menuTheme).toBe(MENU_THEME);
    expect(MUSIC_PATTERNS.combat).toBe(COMBAT_THEME);
    expect(MUSIC_PATTERNS.battle).toBe(COMBAT_THEME);
    expect(MUSIC_PATTERNS.ambient).toBe(AMBIENT_THEME);
    expect(MUSIC_PATTERNS.victory).toBe(VICTORY_THEME);
    expect(MUSIC_PATTERNS.win).toBe(VICTORY_THEME);
    expect(MUSIC_PATTERNS.defeat).toBe(DEFEAT_THEME);
    expect(MUSIC_PATTERNS.gameover).toBe(DEFEAT_THEME);
    expect(MUSIC_PATTERNS.exploration).toBe(EXPLORATION_THEME);
    expect(MUSIC_PATTERNS.explore).toBe(EXPLORATION_THEME);
    expect(MUSIC_PATTERNS.tension).toBe(TENSION_THEME);
    expect(MUSIC_PATTERNS.suspense).toBe(TENSION_THEME);
    expect(MUSIC_PATTERNS.shop).toBe(SHOP_THEME);
    expect(MUSIC_PATTERNS.canteen).toBe(SHOP_THEME);
  });
});

describe('Type definitions', () => {
  it('SFXPreset oscillator types are valid', () => {
    const validTypes = [
      'sine',
      'square',
      'sawtooth',
      'triangle',
      'fatsine',
      'fatsquare',
      'fatsawtooth',
      'fattriangle',
    ];
    for (const preset of Object.values(SFX_PRESETS)) {
      expect(validTypes).toContain(preset.oscillator.type);
    }
  });

  it('MusicPattern oscillator types are valid', () => {
    const validTypes = [
      'sine',
      'square',
      'sawtooth',
      'triangle',
      'fatsine',
      'fatsquare',
      'fatsawtooth',
      'fattriangle',
    ];
    for (const pattern of Object.values(MUSIC_PATTERNS)) {
      expect(validTypes).toContain(pattern.oscillator.type);
    }
  });
});
