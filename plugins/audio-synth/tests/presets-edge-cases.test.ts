/**
 * Preset Edge Cases & Data Integrity Tests
 *
 * Tests that go beyond basic shape validation to verify preset data
 * integrity, cross-references between aliases and originals, and
 * expected musical/audio properties.
 *
 * @module presets/presets-edge-cases.test
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

import type { SFXPresetId } from '../src/presets/sfx.js';

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

import type { MusicPatternId } from '../src/presets/music.js';

import type { EnvelopeConfig, SFXPreset, MusicPattern, FrequencySweep } from '../src/core/types.js';

// ---- Helpers ----

function getFrequencySweep(preset: SFXPreset): FrequencySweep | null {
  if (typeof preset.frequency === 'object' && preset.frequency !== null) {
    return preset.frequency as FrequencySweep;
  }
  return null;
}

// ---- Tests ----

describe('SFX Preset Data Integrity', () => {
  describe('unique IDs', () => {
    it('all named presets have unique IDs', () => {
      const namedPresets = [
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
      ];
      const ids = namedPresets.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(namedPresets.length);
    });

    it('all named presets have unique names', () => {
      const namedPresets = [
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
      ];
      const names = namedPresets.map((p) => p.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(namedPresets.length);
    });
  });

  describe('SFX_PRESETS lookup', () => {
    it('every primary key in SFX_PRESETS matches the preset ID', () => {
      const primaryKeys: SFXPresetId[] = [
        'gunshot',
        'explosion',
        'impact',
        'ricochet',
        'pickup',
        'select',
        'confirm',
        'error',
        'splash',
        'footstep',
        'laser',
        'powerup',
      ];

      for (const key of primaryKeys) {
        expect(SFX_PRESETS[key].id).toBe(key);
      }
    });

    it('aliases resolve to the same object reference as the primary', () => {
      expect(SFX_PRESETS.shoot).toBe(SFX_PRESETS.gunshot);
      expect(SFX_PRESETS.explode).toBe(SFX_PRESETS.explosion);
      expect(SFX_PRESETS.hit).toBe(SFX_PRESETS.impact);
      expect(SFX_PRESETS.collect).toBe(SFX_PRESETS.pickup);
      expect(SFX_PRESETS.click).toBe(SFX_PRESETS.select);
      expect(SFX_PRESETS.success).toBe(SFX_PRESETS.confirm);
      expect(SFX_PRESETS.fail).toBe(SFX_PRESETS.error);
      expect(SFX_PRESETS.water).toBe(SFX_PRESETS.splash);
      expect(SFX_PRESETS.step).toBe(SFX_PRESETS.footstep);
    });

    it('total SFX_PRESETS keys count includes aliases', () => {
      const keys = Object.keys(SFX_PRESETS);
      // 12 primary + 9 aliases = 21
      expect(keys.length).toBe(21);
    });
  });

  describe('frequency sweep properties', () => {
    it('GUNSHOT sweep goes downward (start > end)', () => {
      const sweep = getFrequencySweep(GUNSHOT);
      expect(sweep).not.toBeNull();
      expect(sweep!.start).toBeGreaterThan(sweep!.end);
    });

    it('IMPACT sweep goes downward', () => {
      const sweep = getFrequencySweep(IMPACT);
      expect(sweep).not.toBeNull();
      expect(sweep!.start).toBeGreaterThan(sweep!.end);
    });

    it('RICOCHET sweep goes downward (high to low)', () => {
      const sweep = getFrequencySweep(RICOCHET);
      expect(sweep).not.toBeNull();
      expect(sweep!.start).toBeGreaterThan(sweep!.end);
    });

    it('PICKUP sweep goes upward (ascending pitch)', () => {
      const sweep = getFrequencySweep(PICKUP);
      expect(sweep).not.toBeNull();
      expect(sweep!.end).toBeGreaterThan(sweep!.start);
    });

    it('CONFIRM sweep goes upward', () => {
      const sweep = getFrequencySweep(CONFIRM);
      expect(sweep).not.toBeNull();
      expect(sweep!.end).toBeGreaterThan(sweep!.start);
    });

    it('POWERUP sweep goes upward (ascending)', () => {
      const sweep = getFrequencySweep(POWERUP);
      expect(sweep).not.toBeNull();
      expect(sweep!.end).toBeGreaterThan(sweep!.start);
    });

    it('LASER sweep goes downward', () => {
      const sweep = getFrequencySweep(LASER);
      expect(sweep).not.toBeNull();
      expect(sweep!.start).toBeGreaterThan(sweep!.end);
    });

    it('SPLASH sweep goes downward', () => {
      const sweep = getFrequencySweep(SPLASH);
      expect(sweep).not.toBeNull();
      expect(sweep!.start).toBeGreaterThan(sweep!.end);
    });

    it('FOOTSTEP sweep goes downward', () => {
      const sweep = getFrequencySweep(FOOTSTEP);
      expect(sweep).not.toBeNull();
      expect(sweep!.start).toBeGreaterThan(sweep!.end);
    });

    it('all frequency sweeps have positive start values', () => {
      const presetsWithSweep = [GUNSHOT, IMPACT, RICOCHET, PICKUP, CONFIRM, SPLASH, FOOTSTEP, LASER, POWERUP];
      for (const preset of presetsWithSweep) {
        const sweep = getFrequencySweep(preset);
        expect(sweep).not.toBeNull();
        expect(sweep!.start).toBeGreaterThan(0);
        expect(sweep!.end).toBeGreaterThan(0);
      }
    });
  });

  describe('noise layers', () => {
    it('EXPLOSION uses white noise', () => {
      expect(EXPLOSION.noise).toBeDefined();
      expect(EXPLOSION.noise!.type).toBe('white');
    });

    it('SPLASH uses pink noise', () => {
      expect(SPLASH.noise).toBeDefined();
      expect(SPLASH.noise!.type).toBe('pink');
    });

    it('FOOTSTEP uses brown noise', () => {
      expect(FOOTSTEP.noise).toBeDefined();
      expect(FOOTSTEP.noise!.type).toBe('brown');
    });

    it('noise layer envelopes are valid', () => {
      const presetsWithNoise = [EXPLOSION, SPLASH, FOOTSTEP];
      for (const preset of presetsWithNoise) {
        expect(preset.noise).toBeDefined();
        const env = preset.noise!.envelope;
        expect(env.attack).toBeGreaterThanOrEqual(0);
        expect(env.decay).toBeGreaterThanOrEqual(0);
        expect(env.sustain).toBeGreaterThanOrEqual(0);
        expect(env.sustain).toBeLessThanOrEqual(1);
        expect(env.release).toBeGreaterThanOrEqual(0);
      }
    });

    it('presets without noise layer have undefined noise', () => {
      const presetsWithoutNoise = [GUNSHOT, IMPACT, RICOCHET, PICKUP, SELECT, CONFIRM, ERROR, LASER, POWERUP];
      for (const preset of presetsWithoutNoise) {
        expect(preset.noise).toBeUndefined();
      }
    });
  });

  describe('volume settings', () => {
    it('ERROR has negative volume (quieter)', () => {
      expect(ERROR.volume).toBeDefined();
      expect(ERROR.volume).toBeLessThan(0);
    });

    it('most presets use default volume (undefined)', () => {
      const defaultVolumePresets = [GUNSHOT, IMPACT, RICOCHET, PICKUP, SELECT, CONFIRM, SPLASH, FOOTSTEP, LASER, POWERUP];
      for (const preset of defaultVolumePresets) {
        expect(preset.volume).toBeUndefined();
      }
    });
  });

  describe('preset categories', () => {
    it('weapon SFX use fast attack', () => {
      const weaponPresets = [GUNSHOT, LASER];
      for (const preset of weaponPresets) {
        expect(preset.envelope.attack).toBeLessThanOrEqual(0.01);
      }
    });

    it('UI SFX have very short durations', () => {
      expect(SELECT.duration).toBeDefined();
      expect(IMPACT.duration).toBeDefined();
    });

    it('POWERUP has longer duration for sustained effect', () => {
      expect(POWERUP.duration).toBe('2n');
    });
  });
});

describe('Music Pattern Data Integrity', () => {
  describe('unique IDs', () => {
    it('all themes have unique IDs', () => {
      const themes = [
        MENU_THEME,
        COMBAT_THEME,
        AMBIENT_THEME,
        VICTORY_THEME,
        DEFEAT_THEME,
        EXPLORATION_THEME,
        TENSION_THEME,
        SHOP_THEME,
      ];
      const ids = themes.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(themes.length);
    });

    it('all themes have unique names', () => {
      const themes = [
        MENU_THEME,
        COMBAT_THEME,
        AMBIENT_THEME,
        VICTORY_THEME,
        DEFEAT_THEME,
        EXPLORATION_THEME,
        TENSION_THEME,
        SHOP_THEME,
      ];
      const names = themes.map((t) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(themes.length);
    });
  });

  describe('MUSIC_PATTERNS lookup', () => {
    it('primary keys match pattern IDs', () => {
      const primaryKeys: MusicPatternId[] = [
        'menu',
        'combat',
        'ambient',
        'victory',
        'defeat',
        'exploration',
        'tension',
        'shop',
      ];

      for (const key of primaryKeys) {
        expect(MUSIC_PATTERNS[key].id).toBe(key);
      }
    });

    it('aliases resolve to the same object reference as primary', () => {
      expect(MUSIC_PATTERNS.menuTheme).toBe(MUSIC_PATTERNS.menu);
      expect(MUSIC_PATTERNS.combatTheme).toBe(MUSIC_PATTERNS.combat);
      expect(MUSIC_PATTERNS.battle).toBe(MUSIC_PATTERNS.combat);
      expect(MUSIC_PATTERNS.ambientTheme).toBe(MUSIC_PATTERNS.ambient);
      expect(MUSIC_PATTERNS.victoryTheme).toBe(MUSIC_PATTERNS.victory);
      expect(MUSIC_PATTERNS.win).toBe(MUSIC_PATTERNS.victory);
      expect(MUSIC_PATTERNS.defeatTheme).toBe(MUSIC_PATTERNS.defeat);
      expect(MUSIC_PATTERNS.gameover).toBe(MUSIC_PATTERNS.defeat);
      expect(MUSIC_PATTERNS.explorationTheme).toBe(MUSIC_PATTERNS.exploration);
      expect(MUSIC_PATTERNS.explore).toBe(MUSIC_PATTERNS.exploration);
      expect(MUSIC_PATTERNS.tensionTheme).toBe(MUSIC_PATTERNS.tension);
      expect(MUSIC_PATTERNS.suspense).toBe(MUSIC_PATTERNS.tension);
      expect(MUSIC_PATTERNS.shopTheme).toBe(MUSIC_PATTERNS.shop);
      expect(MUSIC_PATTERNS.canteen).toBe(MUSIC_PATTERNS.shop);
    });

    it('total MUSIC_PATTERNS keys count includes aliases', () => {
      const keys = Object.keys(MUSIC_PATTERNS);
      // 8 primary + 14 aliases = 22
      // menu, menuTheme, combat, combatTheme, battle, ambient, ambientTheme,
      // victory, victoryTheme, win, defeat, defeatTheme, gameover,
      // exploration, explorationTheme, explore, tension, tensionTheme,
      // suspense, shop, shopTheme, canteen
      expect(keys.length).toBe(22);
    });
  });

  describe('note arrays', () => {
    it('all patterns have exactly 8 notes', () => {
      const patterns = [
        MENU_THEME,
        COMBAT_THEME,
        AMBIENT_THEME,
        VICTORY_THEME,
        DEFEAT_THEME,
        EXPLORATION_THEME,
        TENSION_THEME,
        SHOP_THEME,
      ];

      for (const pattern of patterns) {
        expect(pattern.notes).toHaveLength(8);
      }
    });

    it('all notes follow standard note format (letter + optional # + octave)', () => {
      const noteRegex = /^[A-G]#?\d$/;
      for (const pattern of Object.values(MUSIC_PATTERNS)) {
        for (const note of pattern.notes) {
          expect(note).toMatch(noteRegex);
        }
      }
    });
  });

  describe('direction values', () => {
    it('MENU_THEME uses upDown', () => {
      expect(MENU_THEME.direction).toBe('upDown');
    });

    it('AMBIENT_THEME uses up', () => {
      expect(AMBIENT_THEME.direction).toBe('up');
    });

    it('VICTORY_THEME uses up', () => {
      expect(VICTORY_THEME.direction).toBe('up');
    });

    it('DEFEAT_THEME uses down', () => {
      expect(DEFEAT_THEME.direction).toBe('down');
    });

    it('TENSION_THEME uses random', () => {
      expect(TENSION_THEME.direction).toBe('random');
    });
  });

  describe('filter configurations', () => {
    it('themes without filters', () => {
      const unfiltered = [MENU_THEME, AMBIENT_THEME, VICTORY_THEME, DEFEAT_THEME, EXPLORATION_THEME, SHOP_THEME];
      for (const pattern of unfiltered) {
        expect(pattern.filter).toBeUndefined();
      }
    });

    it('COMBAT_THEME has lowpass filter at 200Hz', () => {
      expect(COMBAT_THEME.filter).toBeDefined();
      expect(COMBAT_THEME.filter!.type).toBe('lowpass');
      expect(COMBAT_THEME.filter!.frequency).toBe(200);
      expect(COMBAT_THEME.filter!.Q).toBe(2);
      expect(COMBAT_THEME.filter!.rolloff).toBe(-12);
    });

    it('TENSION_THEME has lowpass filter at 300Hz with higher Q', () => {
      expect(TENSION_THEME.filter).toBeDefined();
      expect(TENSION_THEME.filter!.type).toBe('lowpass');
      expect(TENSION_THEME.filter!.frequency).toBe(300);
      expect(TENSION_THEME.filter!.Q).toBe(4);
      expect(TENSION_THEME.filter!.rolloff).toBe(-24);
    });
  });

  describe('envelope timing characteristics', () => {
    it('COMBAT_THEME has fast attack for urgency', () => {
      expect(COMBAT_THEME.envelope.attack).toBeLessThanOrEqual(0.1);
    });

    it('AMBIENT_THEME has slow attack for atmospheric feel', () => {
      expect(AMBIENT_THEME.envelope.attack).toBeGreaterThanOrEqual(0.3);
    });

    it('AMBIENT_THEME has long release for sustained atmosphere', () => {
      expect(AMBIENT_THEME.envelope.release).toBeGreaterThanOrEqual(0.8);
    });

    it('DEFEAT_THEME has moderate-to-long release for somber fade', () => {
      expect(DEFEAT_THEME.envelope.release).toBeGreaterThanOrEqual(0.5);
    });

    it('VICTORY_THEME has snappy attack for triumphant feel', () => {
      expect(VICTORY_THEME.envelope.attack).toBeLessThanOrEqual(0.1);
    });
  });

  describe('interval timing', () => {
    it('fast themes use 8n interval', () => {
      expect(COMBAT_THEME.interval).toBe('8n');
      expect(SHOP_THEME.interval).toBe('8n');
      expect(TENSION_THEME.interval).toBe('8n');
      expect(VICTORY_THEME.interval).toBe('8n');
    });

    it('moderate themes use 4n interval', () => {
      expect(MENU_THEME.interval).toBe('4n');
      expect(DEFEAT_THEME.interval).toBe('4n');
    });

    it('AMBIENT_THEME uses slow 2n interval', () => {
      expect(AMBIENT_THEME.interval).toBe('2n');
    });

    it('EXPLORATION_THEME uses dotted 4n for adventurous lilt', () => {
      expect(EXPLORATION_THEME.interval).toBe('4n.');
    });
  });
});
