import { describe, expect, it } from 'vitest';
import {
  audioPresets,
  calculateWeatherAudioIntensity,
  combatSoundPresets,
  createCustomAudioPreset,
  footstepPresets,
  getAudioPreset,
  getCombatSoundPreset,
  getFootstepPreset,
  spatialAudioConfigs,
  weatherAudioPresets,
  type AudioPresetName,
  type SurfaceType,
} from '../src/audio';

describe('audioPresets', () => {
  const presetNames = Object.keys(audioPresets) as AudioPresetName[];

  it('has expected preset names', () => {
    expect(presetNames).toContain('forest');
    expect(presetNames).toContain('cave');
    expect(presetNames).toContain('city');
    expect(presetNames).toContain('underwater');
    expect(presetNames).toContain('indoor');
    expect(presetNames).toContain('combat');
  });

  it.each(presetNames)('preset "%s" has required properties', (name) => {
    const preset = audioPresets[name];

    expect(preset.name).toBe(name);
    expect(typeof preset.description).toBe('string');
    expect(preset.description.length).toBeGreaterThan(0);
    expect(preset).toHaveProperty('environment');
    expect(preset).toHaveProperty('ambience');
    expect(preset).toHaveProperty('spatialDefaults');
  });

  it.each(presetNames)('preset "%s" has valid environment config', (name) => {
    const preset = audioPresets[name];
    const env = preset.environment;

    expect(typeof env.preset).toBe('string');
    expect(typeof env.reverb.decay).toBe('number');
    expect(typeof env.reverb.wet).toBe('number');
    expect(typeof env.reverb.dry).toBe('number');
    expect(env.reverb.decay).toBeGreaterThan(0);
    expect(env.reverb.wet).toBeGreaterThanOrEqual(0);
    expect(env.reverb.wet).toBeLessThanOrEqual(1);
    expect(env.reverb.dry).toBeGreaterThanOrEqual(0);
    expect(env.reverb.dry).toBeLessThanOrEqual(1);
  });

  it.each(presetNames)('preset "%s" has valid ambience layers', (name) => {
    const preset = audioPresets[name];

    expect(Array.isArray(preset.ambience)).toBe(true);
    for (const layer of preset.ambience) {
      expect(typeof layer.id).toBe('string');
      expect(typeof layer.volume).toBe('number');
      expect(typeof layer.loop).toBe('boolean');
      expect(typeof layer.description).toBe('string');
      expect(layer.volume).toBeGreaterThan(0);
      expect(layer.volume).toBeLessThanOrEqual(1);
    }
  });

  it.each(presetNames)('preset "%s" has valid spatial defaults', (name) => {
    const preset = audioPresets[name];
    const spatial = preset.spatialDefaults;

    expect(typeof spatial.refDistance).toBe('number');
    expect(typeof spatial.maxDistance).toBe('number');
    expect(typeof spatial.rolloffFactor).toBe('number');
    expect(typeof spatial.distanceModel).toBe('string');
    expect(spatial.maxDistance!).toBeGreaterThan(spatial.refDistance!);
  });

  it('cave has high reverb decay', () => {
    expect(audioPresets.cave.environment.reverb.decay).toBeGreaterThan(2);
  });

  it('underwater has lowpass filter', () => {
    expect(audioPresets.underwater.environment.lowpassFrequency).toBeDefined();
    expect(audioPresets.underwater.environment.lowpassFrequency!).toBeLessThan(2000);
  });

  it('combat has no ambience layers', () => {
    expect(audioPresets.combat.ambience).toHaveLength(0);
  });

  it('forest has bird ambience', () => {
    const birdLayer = audioPresets.forest.ambience.find((l) => l.id === 'birds');
    expect(birdLayer).toBeDefined();
    expect(birdLayer!.loop).toBe(true);
  });
});

describe('footstepPresets', () => {
  const surfaceTypes = Object.keys(footstepPresets) as SurfaceType[];

  it('has expected surface types', () => {
    expect(surfaceTypes).toContain('grass');
    expect(surfaceTypes).toContain('dirt');
    expect(surfaceTypes).toContain('stone');
    expect(surfaceTypes).toContain('wood');
    expect(surfaceTypes).toContain('metal');
    expect(surfaceTypes).toContain('water');
    expect(surfaceTypes).toContain('sand');
    expect(surfaceTypes).toContain('snow');
  });

  it.each(surfaceTypes)('surface "%s" has required properties', (surface) => {
    const preset = footstepPresets[surface];

    expect(preset.surface).toBe(surface);
    expect(typeof preset.volume).toBe('number');
    expect(typeof preset.pitchVariation).toBe('number');
    expect(typeof preset.interval).toBe('number');
    expect(preset.volume).toBeGreaterThan(0);
    expect(preset.volume).toBeLessThanOrEqual(1);
    expect(preset.interval).toBeGreaterThan(0);
  });

  it('metal is louder than grass', () => {
    expect(footstepPresets.metal.volume).toBeGreaterThan(footstepPresets.grass.volume);
  });

  it('snow is quieter than stone', () => {
    expect(footstepPresets.snow.volume).toBeLessThan(footstepPresets.stone.volume);
  });

  it('water has high pitch variation', () => {
    expect(footstepPresets.water.pitchVariation).toBeGreaterThan(
      footstepPresets.stone.pitchVariation
    );
  });
});

describe('combatSoundPresets', () => {
  const combatNames = Object.keys(combatSoundPresets);

  it('has expected preset names', () => {
    expect(combatNames).toContain('swordImpact');
    expect(combatNames).toContain('bluntImpact');
    expect(combatNames).toContain('gunshot');
    expect(combatNames).toContain('bow');
    expect(combatNames).toContain('arrowHit');
    expect(combatNames).toContain('bulletRicochet');
    expect(combatNames).toContain('smallExplosion');
    expect(combatNames).toContain('largeExplosion');
  });

  it.each(combatNames)('preset "%s" has required properties', (name) => {
    const preset = combatSoundPresets[name];

    expect(['impact', 'weapon', 'projectile', 'explosion']).toContain(preset.type);
    expect(typeof preset.volume).toBe('number');
    expect(typeof preset.refDistance).toBe('number');
    expect(typeof preset.maxDistance).toBe('number');
    expect(typeof preset.poolSize).toBe('number');
    expect(preset.volume).toBeGreaterThan(0);
    expect(preset.maxDistance).toBeGreaterThan(preset.refDistance);
    expect(preset.poolSize).toBeGreaterThan(0);
  });

  it('explosions have large max distance', () => {
    expect(combatSoundPresets.largeExplosion.maxDistance).toBeGreaterThan(200);
  });

  it('gunshot has full volume', () => {
    expect(combatSoundPresets.gunshot.volume).toBe(1.0);
  });
});

describe('spatialAudioConfigs', () => {
  const configNames = Object.keys(spatialAudioConfigs);

  it('has expected config names', () => {
    expect(configNames).toContain('dialogue');
    expect(configNames).toContain('ambient');
    expect(configNames).toContain('sfx');
    expect(configNames).toContain('music');
    expect(configNames).toContain('ui');
  });

  it.each(configNames)('config "%s" has required properties', (name) => {
    const config = spatialAudioConfigs[name];

    expect(typeof config.distanceModel).toBe('string');
    expect(typeof config.refDistance).toBe('number');
    expect(typeof config.maxDistance).toBe('number');
    expect(typeof config.rolloffFactor).toBe('number');
  });

  it('dialogue has short range', () => {
    expect(spatialAudioConfigs.dialogue.maxDistance).toBeLessThan(
      spatialAudioConfigs.ambient.maxDistance
    );
  });

  it('music has large range', () => {
    expect(spatialAudioConfigs.music.maxDistance).toBeGreaterThan(100);
  });
});

describe('weatherAudioPresets', () => {
  it('has all weather types', () => {
    expect(weatherAudioPresets).toHaveProperty('rainLight');
    expect(weatherAudioPresets).toHaveProperty('rainHeavy');
    expect(weatherAudioPresets).toHaveProperty('thunder');
    expect(weatherAudioPresets).toHaveProperty('wind');
    expect(weatherAudioPresets).toHaveProperty('hail');
  });

  it('heavy rain is louder than light rain', () => {
    expect(weatherAudioPresets.rainHeavy.volume).toBeGreaterThan(
      weatherAudioPresets.rainLight.volume
    );
  });

  it('thunder has interval settings', () => {
    expect(weatherAudioPresets.thunder.minInterval).toBeGreaterThan(0);
    expect(weatherAudioPresets.thunder.maxInterval).toBeGreaterThan(
      weatherAudioPresets.thunder.minInterval
    );
  });
});

describe('getter functions', () => {
  it('getAudioPreset returns correct preset', () => {
    expect(getAudioPreset('forest')).toBe(audioPresets.forest);
    expect(getAudioPreset('cave')).toBe(audioPresets.cave);
  });

  it('getFootstepPreset returns correct preset', () => {
    expect(getFootstepPreset('grass')).toBe(footstepPresets.grass);
    expect(getFootstepPreset('metal')).toBe(footstepPresets.metal);
  });

  it('getCombatSoundPreset returns correct preset', () => {
    expect(getCombatSoundPreset('gunshot')).toBe(combatSoundPresets.gunshot);
    expect(getCombatSoundPreset('bow')).toBe(combatSoundPresets.bow);
  });

  it('getCombatSoundPreset returns undefined for unknown', () => {
    expect(getCombatSoundPreset('nonexistent')).toBeUndefined();
  });
});

describe('createCustomAudioPreset', () => {
  it('creates preset based on existing one', () => {
    const custom = createCustomAudioPreset('forest', {
      description: 'Custom forest',
    });

    expect(custom.name).toBe('forest');
    expect(custom.description).toBe('Custom forest');
    // Environment inherited from base
    expect(custom.environment.preset).toBe(audioPresets.forest.environment.preset);
  });

  it('allows overriding spatial defaults', () => {
    const custom = createCustomAudioPreset('cave', {
      spatialDefaults: { maxDistance: 200 },
    });

    expect(custom.spatialDefaults.maxDistance).toBe(200);
    // Other spatial defaults inherited
    expect(custom.spatialDefaults.refDistance).toBe(audioPresets.cave.spatialDefaults.refDistance);
  });

  it('allows overriding environment', () => {
    const custom = createCustomAudioPreset('forest', {
      environment: { reverb: { decay: 5, wet: 0.8, dry: 0.2 } },
    });

    expect(custom.environment.reverb.decay).toBe(5);
  });
});

describe('calculateWeatherAudioIntensity', () => {
  it('clear weather has no effects', () => {
    const result = calculateWeatherAudioIntensity('clear', 1.0);
    expect(result.rain).toBe(0);
    expect(result.wind).toBe(0);
    expect(result.thunder).toBe(false);
  });

  it('rain scales with intensity', () => {
    const low = calculateWeatherAudioIntensity('rain', 0.3);
    const high = calculateWeatherAudioIntensity('rain', 0.9);

    expect(high.rain).toBeGreaterThan(low.rain);
    expect(high.wind).toBeGreaterThan(low.wind);
  });

  it('rain has no thunder', () => {
    const result = calculateWeatherAudioIntensity('rain', 1.0);
    expect(result.thunder).toBe(false);
  });

  it('storm has thunder at high intensity', () => {
    const result = calculateWeatherAudioIntensity('storm', 0.8);
    expect(result.thunder).toBe(true);
    expect(result.rain).toBeGreaterThan(0);
  });

  it('storm has no thunder at low intensity', () => {
    const result = calculateWeatherAudioIntensity('storm', 0.3);
    expect(result.thunder).toBe(false);
  });

  it('snow has no rain', () => {
    const result = calculateWeatherAudioIntensity('snow', 1.0);
    expect(result.rain).toBe(0);
    expect(result.wind).toBeGreaterThan(0);
  });

  it('fog has minimal wind', () => {
    const result = calculateWeatherAudioIntensity('fog', 1.0);
    expect(result.rain).toBe(0);
    expect(result.wind).toBeGreaterThan(0);
    expect(result.wind).toBeLessThan(0.5);
  });
});
