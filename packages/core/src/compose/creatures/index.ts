/**
 * Creature composition system and preset definitions.
 *
 * Creatures are composed from skeletons, material coverings, AI behaviors,
 * stats, animations, and spawn rules. This module provides the creature
 * registry and built-in presets like the river otter.
 *
 * @module Creatures
 * @category Entities & Simulation
 */

import { COVERINGS } from '../coverings';
import type { CreatureDefinition } from './types';

export * from './types';

export const CREATURES: Record<string, CreatureDefinition> = {
  otter_river: {
    id: 'otter_river',
    name: 'River Otter',
    description: 'A playful aquatic mammal often seen fishing in rivers.',

    skeleton: 'quadruped_medium',
    covering: COVERINGS.otter,

    scale: 1.0,
    scaleVariation: 0.15,

    stats: {
      health: 50,
      speed: 6,
      swimSpeed: 12,
      stamina: 80,
    },

    ai: 'prey',

    animations: {
      idle: 'otter_idle',
      walk: 'otter_walk',
      run: 'otter_run',
      swim: 'otter_swim',
      eat: 'otter_eat',
      play: 'otter_play',
    },

    biomes: ['marsh'],
    spawnWeight: 0.4,
    packSize: [2, 6],
    timeOfDay: ['day', 'dawn', 'dusk'],

    drops: {
      guaranteed: [{ item: 'otter_pelt', count: 1 }],
      chance: [{ item: 'fish', count: [1, 3], probability: 0.3 }],
    },

    sounds: {
      idle: ['otter_chirp_1', 'otter_chirp_2', 'otter_squeak'],
      alert: 'otter_alert',
      hurt: 'otter_hurt',
    },
  },
};
