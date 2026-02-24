/**
 * Music Presets
 * Pre-configured music patterns for procedural background music.
 * @packageDocumentation
 * @module presets/music
 */

import type { MusicPattern } from '../core/types';

/**
 * Menu theme - melodic and calm.
 */
export const MENU_THEME: MusicPattern = {
  id: 'menu',
  name: 'Menu Theme',
  notes: ['C4', 'E4', 'G4', 'B4', 'A4', 'G4', 'E4', 'D4'],
  direction: 'upDown',
  interval: '4n',
  oscillator: { type: 'sine' },
  envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.5 },
};

/**
 * Combat theme - driving and intense.
 */
export const COMBAT_THEME: MusicPattern = {
  id: 'combat',
  name: 'Combat Theme',
  notes: ['C2', 'C2', 'G2', 'C2', 'F2', 'C2', 'G2', 'B1'],
  direction: 'upDown',
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

/**
 * Ambient theme - atmospheric and sparse.
 */
export const AMBIENT_THEME: MusicPattern = {
  id: 'ambient',
  name: 'Ambient Theme',
  notes: ['C3', 'G3', 'C4', 'E4', 'G4', 'E4', 'C4', 'G3'],
  direction: 'up',
  interval: '2n',
  oscillator: { type: 'sine' },
  envelope: { attack: 0.5, decay: 0.5, sustain: 0.5, release: 1.0 },
};

/**
 * Victory theme - triumphant fanfare.
 */
export const VICTORY_THEME: MusicPattern = {
  id: 'victory',
  name: 'Victory Theme',
  notes: ['C4', 'E4', 'G4', 'C5', 'G4', 'C5', 'E5', 'C5'],
  direction: 'up',
  interval: '8n',
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.3 },
};

/**
 * Defeat/game over theme - somber.
 */
export const DEFEAT_THEME: MusicPattern = {
  id: 'defeat',
  name: 'Defeat Theme',
  notes: ['C4', 'B3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3'],
  direction: 'down',
  interval: '4n',
  oscillator: { type: 'sine' },
  envelope: { attack: 0.2, decay: 0.4, sustain: 0.3, release: 0.8 },
};

/**
 * Exploration theme - curious and adventurous.
 */
export const EXPLORATION_THEME: MusicPattern = {
  id: 'exploration',
  name: 'Exploration Theme',
  notes: ['G3', 'A3', 'B3', 'D4', 'E4', 'D4', 'B3', 'A3'],
  direction: 'upDown',
  interval: '4n.',
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.15, decay: 0.25, sustain: 0.35, release: 0.4 },
};

/**
 * Tension/suspense theme - building dread.
 */
export const TENSION_THEME: MusicPattern = {
  id: 'tension',
  name: 'Tension Theme',
  notes: ['E2', 'F2', 'E2', 'F2', 'G2', 'F2', 'E2', 'D#2'],
  direction: 'random',
  interval: '8n',
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.2, decay: 0.3, sustain: 0.5, release: 0.2 },
  filter: {
    type: 'lowpass',
    frequency: 300,
    Q: 4,
    rolloff: -24,
  },
};

/**
 * Shop/canteen theme - upbeat and commercial.
 */
export const SHOP_THEME: MusicPattern = {
  id: 'shop',
  name: 'Shop Theme',
  notes: ['C4', 'D4', 'E4', 'G4', 'A4', 'G4', 'E4', 'D4'],
  direction: 'upDown',
  interval: '8n',
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.05, decay: 0.15, sustain: 0.3, release: 0.2 },
};

/**
 * All music patterns indexed by ID.
 */
export const MUSIC_PATTERNS = {
  menu: MENU_THEME,
  menuTheme: MENU_THEME, // Alias
  combat: COMBAT_THEME,
  combatTheme: COMBAT_THEME, // Alias
  battle: COMBAT_THEME, // Alias
  ambient: AMBIENT_THEME,
  ambientTheme: AMBIENT_THEME, // Alias
  victory: VICTORY_THEME,
  victoryTheme: VICTORY_THEME, // Alias
  win: VICTORY_THEME, // Alias
  defeat: DEFEAT_THEME,
  defeatTheme: DEFEAT_THEME, // Alias
  gameover: DEFEAT_THEME, // Alias
  exploration: EXPLORATION_THEME,
  explorationTheme: EXPLORATION_THEME, // Alias
  explore: EXPLORATION_THEME, // Alias
  tension: TENSION_THEME,
  tensionTheme: TENSION_THEME, // Alias
  suspense: TENSION_THEME, // Alias
  shop: SHOP_THEME,
  shopTheme: SHOP_THEME, // Alias
  canteen: SHOP_THEME, // Alias
} as const;

export type MusicPatternId = keyof typeof MUSIC_PATTERNS;
