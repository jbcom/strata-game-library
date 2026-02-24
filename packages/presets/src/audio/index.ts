/**
 * Audio Presets
 *
 * Pre-configured audio settings for common game environments and scenarios.
 */

import type { DistanceModel, EnvironmentPreset, SpatialConfig } from '@strata-game-library/core';

interface ReverbSettings {
  decay: number;
  preDelay?: number;
  wet: number;
  dry: number;
}

interface EnvironmentConfig {
  preset: EnvironmentPreset;
  reverb: ReverbSettings;
  lowpassFrequency?: number;
  highpassFrequency?: number;
}

type AudioSourceConfig = SpatialConfig;

export type AudioPresetName = 'forest' | 'cave' | 'city' | 'underwater' | 'indoor' | 'combat';

export type SurfaceType = 'grass' | 'dirt' | 'stone' | 'wood' | 'metal' | 'water' | 'sand' | 'snow';

export interface AmbienceLayer {
  id: string;
  volume: number;
  loop: boolean;
  description: string;
}

export interface AudioPreset {
  name: AudioPresetName;
  description: string;
  environment: EnvironmentConfig;
  ambience: AmbienceLayer[];
  spatialDefaults: Partial<AudioSourceConfig>;
}

export interface FootstepPreset {
  surface: SurfaceType;
  volume: number;
  pitchVariation: number;
  interval: number;
}

export interface CombatSoundPreset {
  type: 'impact' | 'weapon' | 'projectile' | 'explosion';
  volume: number;
  refDistance: number;
  maxDistance: number;
  poolSize: number;
}

export const audioPresets: Record<AudioPresetName, AudioPreset> = {
  forest: {
    name: 'forest',
    description: 'Peaceful forest with birds, wind, and rustling leaves',
    environment: {
      preset: 'outdoor',
      reverb: {
        decay: 0.8,
        wet: 0.15,
        dry: 0.85,
      },
    },
    ambience: [
      { id: 'birds', volume: 0.4, loop: true, description: 'Bird chirping and calls' },
      { id: 'wind', volume: 0.3, loop: true, description: 'Gentle wind through trees' },
      { id: 'rustling', volume: 0.2, loop: true, description: 'Leaves rustling' },
      { id: 'insects', volume: 0.15, loop: true, description: 'Background insect sounds' },
    ],
    spatialDefaults: {
      refDistance: 5,
      maxDistance: 100,
      rolloffFactor: 1,
      distanceModel: 'inverse',
    },
  },
  cave: {
    name: 'cave',
    description: 'Echoing cave with dripping water and ambient sounds',
    environment: {
      preset: 'cave',
      reverb: {
        decay: 4,
        preDelay: 0.05,
        wet: 0.5,
        dry: 0.5,
      },
      lowpassFrequency: 8000,
    },
    ambience: [
      {
        id: 'drips',
        volume: 0.5,
        loop: true,
        description: 'Water dripping from stalactites',
      },
      { id: 'echo', volume: 0.3, loop: true, description: 'Distant echoes' },
      { id: 'rumble', volume: 0.2, loop: true, description: 'Deep ambient rumble' },
      { id: 'bats', volume: 0.1, loop: false, description: 'Occasional bat sounds' },
    ],
    spatialDefaults: {
      refDistance: 2,
      maxDistance: 50,
      rolloffFactor: 1.5,
      distanceModel: 'exponential',
    },
  },
  city: {
    name: 'city',
    description: 'Urban environment with traffic, crowds, and city sounds',
    environment: {
      preset: 'outdoor',
      reverb: {
        decay: 1.2,
        wet: 0.2,
        dry: 0.8,
      },
    },
    ambience: [
      { id: 'traffic', volume: 0.5, loop: true, description: 'Distant traffic noise' },
      { id: 'crowd', volume: 0.3, loop: true, description: 'Crowd murmur and chatter' },
      { id: 'horns', volume: 0.15, loop: true, description: 'Car horns and vehicles' },
      { id: 'construction', volume: 0.1, loop: true, description: 'Distant construction' },
    ],
    spatialDefaults: {
      refDistance: 3,
      maxDistance: 80,
      rolloffFactor: 1,
      distanceModel: 'inverse',
    },
  },
  underwater: {
    name: 'underwater',
    description: 'Muffled underwater environment with bubbles and currents',
    environment: {
      preset: 'underwater',
      reverb: {
        decay: 2,
        wet: 0.4,
        dry: 0.6,
      },
      lowpassFrequency: 1000,
      highpassFrequency: 100,
    },
    ambience: [
      { id: 'bubbles', volume: 0.4, loop: true, description: 'Rising bubbles' },
      { id: 'current', volume: 0.5, loop: true, description: 'Water current flow' },
      { id: 'whale', volume: 0.2, loop: false, description: 'Distant whale calls' },
      { id: 'pressure', volume: 0.3, loop: true, description: 'Deep pressure ambience' },
    ],
    spatialDefaults: {
      refDistance: 2,
      maxDistance: 30,
      rolloffFactor: 2,
      distanceModel: 'exponential',
    },
  },
  indoor: {
    name: 'indoor',
    description: 'Generic indoor environment with room acoustics',
    environment: {
      preset: 'indoor',
      reverb: {
        decay: 1.5,
        wet: 0.3,
        dry: 0.7,
      },
    },
    ambience: [
      { id: 'hvac', volume: 0.2, loop: true, description: 'Air conditioning hum' },
      { id: 'roomtone', volume: 0.15, loop: true, description: 'Room tone ambience' },
    ],
    spatialDefaults: {
      refDistance: 1,
      maxDistance: 30,
      rolloffFactor: 1,
      distanceModel: 'inverse',
    },
  },
  combat: {
    name: 'combat',
    description: 'Combat scenario with impacts, weapons, and action sounds',
    environment: {
      preset: 'outdoor',
      reverb: {
        decay: 0.5,
        wet: 0.1,
        dry: 0.9,
      },
    },
    ambience: [],
    spatialDefaults: {
      refDistance: 5,
      maxDistance: 200,
      rolloffFactor: 0.8,
      distanceModel: 'inverse',
    },
  },
};

export const footstepPresets: Record<SurfaceType, FootstepPreset> = {
  grass: {
    surface: 'grass',
    volume: 0.4,
    pitchVariation: 0.1,
    interval: 0.5,
  },
  dirt: {
    surface: 'dirt',
    volume: 0.5,
    pitchVariation: 0.15,
    interval: 0.45,
  },
  stone: {
    surface: 'stone',
    volume: 0.7,
    pitchVariation: 0.05,
    interval: 0.4,
  },
  wood: {
    surface: 'wood',
    volume: 0.6,
    pitchVariation: 0.1,
    interval: 0.42,
  },
  metal: {
    surface: 'metal',
    volume: 0.8,
    pitchVariation: 0.08,
    interval: 0.38,
  },
  water: {
    surface: 'water',
    volume: 0.7,
    pitchVariation: 0.2,
    interval: 0.6,
  },
  sand: {
    surface: 'sand',
    volume: 0.35,
    pitchVariation: 0.12,
    interval: 0.55,
  },
  snow: {
    surface: 'snow',
    volume: 0.3,
    pitchVariation: 0.1,
    interval: 0.52,
  },
};

export const combatSoundPresets: Record<string, CombatSoundPreset> = {
  swordImpact: {
    type: 'impact',
    volume: 0.8,
    refDistance: 3,
    maxDistance: 50,
    poolSize: 6,
  },
  bluntImpact: {
    type: 'impact',
    volume: 0.9,
    refDistance: 4,
    maxDistance: 60,
    poolSize: 6,
  },
  gunshot: {
    type: 'weapon',
    volume: 1.0,
    refDistance: 10,
    maxDistance: 200,
    poolSize: 8,
  },
  bow: {
    type: 'weapon',
    volume: 0.6,
    refDistance: 3,
    maxDistance: 40,
    poolSize: 4,
  },
  arrowHit: {
    type: 'projectile',
    volume: 0.5,
    refDistance: 2,
    maxDistance: 30,
    poolSize: 6,
  },
  bulletRicochet: {
    type: 'projectile',
    volume: 0.7,
    refDistance: 5,
    maxDistance: 80,
    poolSize: 8,
  },
  smallExplosion: {
    type: 'explosion',
    volume: 1.0,
    refDistance: 15,
    maxDistance: 150,
    poolSize: 4,
  },
  largeExplosion: {
    type: 'explosion',
    volume: 1.0,
    refDistance: 30,
    maxDistance: 300,
    poolSize: 3,
  },
};

export function getAudioPreset(name: AudioPresetName): AudioPreset {
  return audioPresets[name];
}

export function getFootstepPreset(surface: SurfaceType): FootstepPreset {
  return footstepPresets[surface];
}

export function getCombatSoundPreset(name: string): CombatSoundPreset | undefined {
  return combatSoundPresets[name];
}

export function createCustomAudioPreset(
  base: AudioPresetName,
  overrides: Partial<AudioPreset>
): AudioPreset {
  const basePreset = audioPresets[base];
  return {
    ...basePreset,
    ...overrides,
    environment: {
      ...basePreset.environment,
      ...overrides.environment,
    },
    spatialDefaults: {
      ...basePreset.spatialDefaults,
      ...overrides.spatialDefaults,
    },
  };
}

export interface WeatherAudioPreset {
  rainLight: { volume: number; fadeTime: number };
  rainHeavy: { volume: number; fadeTime: number };
  thunder: { volume: number; minInterval: number; maxInterval: number };
  wind: { volume: number; fadeTime: number };
  hail: { volume: number; fadeTime: number };
}

export const weatherAudioPresets: WeatherAudioPreset = {
  rainLight: { volume: 0.3, fadeTime: 2 },
  rainHeavy: { volume: 0.7, fadeTime: 1.5 },
  thunder: { volume: 1.0, minInterval: 8, maxInterval: 20 },
  wind: { volume: 0.5, fadeTime: 3 },
  hail: { volume: 0.6, fadeTime: 1 },
};

export function calculateWeatherAudioIntensity(
  weatherType: 'clear' | 'rain' | 'storm' | 'snow' | 'fog',
  intensity: number
): { rain: number; wind: number; thunder: boolean } {
  switch (weatherType) {
    case 'rain':
      return {
        rain: intensity * 0.7,
        wind: intensity * 0.3,
        thunder: false,
      };
    case 'storm':
      return {
        rain: intensity * 0.9,
        wind: intensity * 0.6,
        thunder: intensity > 0.5,
      };
    case 'snow':
      return {
        rain: 0,
        wind: intensity * 0.4,
        thunder: false,
      };
    case 'fog':
      return {
        rain: 0,
        wind: intensity * 0.15,
        thunder: false,
      };
    default:
      return {
        rain: 0,
        wind: 0,
        thunder: false,
      };
  }
}

export interface SpatialAudioConfig {
  distanceModel: DistanceModel;
  refDistance: number;
  maxDistance: number;
  rolloffFactor: number;
}

export const spatialAudioConfigs: Record<string, SpatialAudioConfig> = {
  dialogue: {
    distanceModel: 'inverse',
    refDistance: 1,
    maxDistance: 15,
    rolloffFactor: 1.5,
  },
  ambient: {
    distanceModel: 'linear',
    refDistance: 5,
    maxDistance: 100,
    rolloffFactor: 1,
  },
  sfx: {
    distanceModel: 'inverse',
    refDistance: 2,
    maxDistance: 50,
    rolloffFactor: 1,
  },
  music: {
    distanceModel: 'exponential',
    refDistance: 10,
    maxDistance: 200,
    rolloffFactor: 0.5,
  },
  ui: {
    distanceModel: 'linear',
    refDistance: 0,
    maxDistance: 1,
    rolloffFactor: 0,
  },
};
