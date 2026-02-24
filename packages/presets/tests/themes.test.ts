import { describe, expect, it } from 'vitest';
import {
  ALL_THEMES,
  type CreatureTheme,
  FANTASY_THEMES,
  getFantasyThemes,
  getNaturalThemes,
  getThemesByTag,
  NATURAL_THEMES,
} from '../src/creatures/themes';

describe('themes', () => {
  describe('ALL_THEMES', () => {
    it('contains all natural themes', () => {
      for (const key of Object.keys(NATURAL_THEMES)) {
        expect(ALL_THEMES).toHaveProperty(key);
      }
    });

    it('contains all fantasy themes', () => {
      for (const key of Object.keys(FANTASY_THEMES)) {
        expect(ALL_THEMES).toHaveProperty(key);
      }
    });
  });

  describe('theme structure', () => {
    const themeNames = Object.keys(ALL_THEMES);

    it.each(themeNames)('theme "%s" has required properties', (name) => {
      const theme = ALL_THEMES[name];

      expect(theme).toHaveProperty('id');
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('primary');
      expect(theme).toHaveProperty('secondary');
      expect(theme).toHaveProperty('underbelly');
      expect(theme).toHaveProperty('eyes');
      expect(theme).toHaveProperty('nose');
      expect(theme).toHaveProperty('claws');
      expect(theme).toHaveProperty('pattern');
      expect(theme).toHaveProperty('roughness');
      expect(theme).toHaveProperty('metalness');
      expect(theme).toHaveProperty('tags');
    });

    it.each(themeNames)('theme "%s" has valid hex colors', (name) => {
      const theme = ALL_THEMES[name];
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;

      expect(theme.primary).toMatch(hexRegex);
      expect(theme.secondary).toMatch(hexRegex);
      expect(theme.underbelly).toMatch(hexRegex);
      expect(theme.eyes).toMatch(hexRegex);
      expect(theme.nose).toMatch(hexRegex);
      expect(theme.claws).toMatch(hexRegex);
    });

    it.each(themeNames)('theme "%s" has valid material values', (name) => {
      const theme = ALL_THEMES[name];

      expect(theme.roughness).toBeGreaterThanOrEqual(0);
      expect(theme.roughness).toBeLessThanOrEqual(1);
      expect(theme.metalness).toBeGreaterThanOrEqual(0);
      expect(theme.metalness).toBeLessThanOrEqual(1);
    });

    it.each(themeNames)('theme "%s" has valid pattern', (name) => {
      const theme = ALL_THEMES[name];
      const validPatterns = ['solid', 'gradient', 'spotted', 'striped', 'patched', 'tuxedo'];

      expect(validPatterns).toContain(theme.pattern);
    });
  });

  describe('getThemesByTag', () => {
    it('finds natural themes', () => {
      const natural = getThemesByTag('natural');

      expect(natural.length).toBeGreaterThan(0);
      expect(natural.every((t) => t.tags.includes('natural'))).toBe(true);
    });

    it('finds fantasy themes', () => {
      const fantasy = getThemesByTag('fantasy');

      expect(fantasy.length).toBeGreaterThan(0);
      expect(fantasy.every((t) => t.tags.includes('fantasy'))).toBe(true);
    });

    it('finds fire/hot themes', () => {
      const fire = getThemesByTag('fire');
      const hot = getThemesByTag('hot');

      // At least ember/volcanic should match
      expect(fire.length).toBeGreaterThan(0);
      expect(hot.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown tag', () => {
      const unknown = getThemesByTag('nonexistent-tag');
      expect(unknown).toHaveLength(0);
    });
  });

  describe('getNaturalThemes', () => {
    it('returns only natural themes', () => {
      const natural = getNaturalThemes();

      expect(natural.length).toBe(Object.keys(NATURAL_THEMES).length);
      expect(natural.every((t) => t.tags.includes('natural'))).toBe(true);
    });
  });

  describe('getFantasyThemes', () => {
    it('returns only fantasy themes', () => {
      const fantasy = getFantasyThemes();

      expect(fantasy.length).toBe(Object.keys(FANTASY_THEMES).length);
      expect(fantasy.every((t) => t.tags.includes('fantasy'))).toBe(true);
    });
  });
});
