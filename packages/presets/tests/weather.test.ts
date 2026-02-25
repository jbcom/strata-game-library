import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  blendPresets,
  getWeatherPreset,
  presetToConfig,
  WEATHER_PRESET_BLIZZARD,
  WEATHER_PRESET_CLEAR,
  WEATHER_PRESET_FOGGY,
  WEATHER_PRESET_HEAVY_RAIN,
  WEATHER_PRESET_LIGHT_RAIN,
  WEATHER_PRESET_LIGHT_SNOW,
  WEATHER_PRESET_OVERCAST,
  WEATHER_PRESET_THUNDERSTORM,
  WEATHER_PRESETS,
} from '../src/weather';

describe('weather presets', () => {
  describe('WEATHER_PRESETS', () => {
    it('contains all 8 presets', () => {
      expect(Object.keys(WEATHER_PRESETS)).toHaveLength(8);
    });

    it('maps correct keys', () => {
      expect(WEATHER_PRESETS.clear).toBe(WEATHER_PRESET_CLEAR);
      expect(WEATHER_PRESETS.overcast).toBe(WEATHER_PRESET_OVERCAST);
      expect(WEATHER_PRESETS.foggy).toBe(WEATHER_PRESET_FOGGY);
      expect(WEATHER_PRESETS.lightRain).toBe(WEATHER_PRESET_LIGHT_RAIN);
      expect(WEATHER_PRESETS.heavyRain).toBe(WEATHER_PRESET_HEAVY_RAIN);
      expect(WEATHER_PRESETS.thunderstorm).toBe(WEATHER_PRESET_THUNDERSTORM);
      expect(WEATHER_PRESETS.lightSnow).toBe(WEATHER_PRESET_LIGHT_SNOW);
      expect(WEATHER_PRESETS.blizzard).toBe(WEATHER_PRESET_BLIZZARD);
    });

    const presetNames = Object.keys(WEATHER_PRESETS);

    it.each(presetNames)('preset "%s" has all required fields', (name) => {
      const preset = WEATHER_PRESETS[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('description');
      expect(preset).toHaveProperty('type');
      expect(preset).toHaveProperty('intensity');
      expect(preset).toHaveProperty('windDirection');
      expect(preset).toHaveProperty('windIntensity');
      expect(preset).toHaveProperty('temperature');
      expect(preset).toHaveProperty('visibility');
      expect(preset).toHaveProperty('cloudCoverage');
      expect(preset).toHaveProperty('precipitationRate');
    });

    it.each(presetNames)('preset "%s" has windDirection as a 3-element tuple', (name) => {
      const preset = WEATHER_PRESETS[name];
      expect(preset.windDirection).toHaveLength(3);
      expect(typeof preset.windDirection[0]).toBe('number');
      expect(typeof preset.windDirection[1]).toBe('number');
      expect(typeof preset.windDirection[2]).toBe('number');
    });

    it.each(presetNames)('preset "%s" has valid ranges', (name) => {
      const preset = WEATHER_PRESETS[name];
      expect(preset.intensity).toBeGreaterThanOrEqual(0);
      expect(preset.intensity).toBeLessThanOrEqual(1);
      expect(preset.windIntensity).toBeGreaterThanOrEqual(0);
      expect(preset.windIntensity).toBeLessThanOrEqual(1);
      expect(preset.visibility).toBeGreaterThanOrEqual(0);
      expect(preset.visibility).toBeLessThanOrEqual(1);
      expect(preset.cloudCoverage).toBeGreaterThanOrEqual(0);
      expect(preset.cloudCoverage).toBeLessThanOrEqual(1);
      expect(preset.precipitationRate).toBeGreaterThanOrEqual(0);
      expect(preset.precipitationRate).toBeLessThanOrEqual(1);
    });
  });

  describe('getWeatherPreset', () => {
    it('returns the correct preset by name', () => {
      expect(getWeatherPreset('clear')).toBe(WEATHER_PRESET_CLEAR);
      expect(getWeatherPreset('blizzard')).toBe(WEATHER_PRESET_BLIZZARD);
    });
  });

  describe('presetToConfig', () => {
    it('converts windDirection array to THREE.Vector3', () => {
      const config = presetToConfig(WEATHER_PRESET_CLEAR);
      expect(config.windDirection).toBeInstanceOf(THREE.Vector3);
      expect(config.windDirection.x).toBe(WEATHER_PRESET_CLEAR.windDirection[0]);
      expect(config.windDirection.y).toBe(WEATHER_PRESET_CLEAR.windDirection[1]);
      expect(config.windDirection.z).toBe(WEATHER_PRESET_CLEAR.windDirection[2]);
    });

    it('preserves all other fields', () => {
      const config = presetToConfig(WEATHER_PRESET_HEAVY_RAIN);
      expect(config.type).toBe(WEATHER_PRESET_HEAVY_RAIN.type);
      expect(config.intensity).toBe(WEATHER_PRESET_HEAVY_RAIN.intensity);
      expect(config.windIntensity).toBe(WEATHER_PRESET_HEAVY_RAIN.windIntensity);
      expect(config.temperature).toBe(WEATHER_PRESET_HEAVY_RAIN.temperature);
      expect(config.visibility).toBe(WEATHER_PRESET_HEAVY_RAIN.visibility);
      expect(config.cloudCoverage).toBe(WEATHER_PRESET_HEAVY_RAIN.cloudCoverage);
      expect(config.precipitationRate).toBe(WEATHER_PRESET_HEAVY_RAIN.precipitationRate);
    });

    it('does not include name or description in config output', () => {
      const config = presetToConfig(WEATHER_PRESET_CLEAR);
      expect(config).not.toHaveProperty('name');
      expect(config).not.toHaveProperty('description');
    });
  });

  describe('blendPresets', () => {
    it('returns presetA values at t=0', () => {
      const result = blendPresets(WEATHER_PRESET_CLEAR, WEATHER_PRESET_BLIZZARD, 0);
      expect(result.intensity).toBe(WEATHER_PRESET_CLEAR.intensity);
      expect(result.temperature).toBe(WEATHER_PRESET_CLEAR.temperature);
      expect(result.type).toBe(WEATHER_PRESET_CLEAR.type);
    });

    it('returns presetB values at t=1', () => {
      const result = blendPresets(WEATHER_PRESET_CLEAR, WEATHER_PRESET_BLIZZARD, 1);
      expect(result.intensity).toBe(WEATHER_PRESET_BLIZZARD.intensity);
      expect(result.temperature).toBe(WEATHER_PRESET_BLIZZARD.temperature);
      expect(result.type).toBe(WEATHER_PRESET_BLIZZARD.type);
    });

    it('interpolates values at t=0.5', () => {
      const result = blendPresets(WEATHER_PRESET_CLEAR, WEATHER_PRESET_BLIZZARD, 0.5);
      expect(result.intensity).toBeCloseTo(
        (WEATHER_PRESET_CLEAR.intensity + WEATHER_PRESET_BLIZZARD.intensity) / 2
      );
      expect(result.temperature).toBeCloseTo(
        (WEATHER_PRESET_CLEAR.temperature + WEATHER_PRESET_BLIZZARD.temperature) / 2
      );
    });

    it('uses presetA type when t < 0.5', () => {
      const result = blendPresets(WEATHER_PRESET_CLEAR, WEATHER_PRESET_THUNDERSTORM, 0.3);
      expect(result.type).toBe(WEATHER_PRESET_CLEAR.type);
    });

    it('uses presetB type when t >= 0.5', () => {
      const result = blendPresets(WEATHER_PRESET_CLEAR, WEATHER_PRESET_THUNDERSTORM, 0.7);
      expect(result.type).toBe(WEATHER_PRESET_THUNDERSTORM.type);
    });

    it('clamps t values below 0', () => {
      const result = blendPresets(WEATHER_PRESET_CLEAR, WEATHER_PRESET_BLIZZARD, -1);
      expect(result.intensity).toBe(WEATHER_PRESET_CLEAR.intensity);
    });

    it('clamps t values above 1', () => {
      const result = blendPresets(WEATHER_PRESET_CLEAR, WEATHER_PRESET_BLIZZARD, 2);
      expect(result.intensity).toBe(WEATHER_PRESET_BLIZZARD.intensity);
    });

    it('produces a THREE.Vector3 for windDirection', () => {
      const result = blendPresets(WEATHER_PRESET_CLEAR, WEATHER_PRESET_BLIZZARD, 0.5);
      expect(result.windDirection).toBeInstanceOf(THREE.Vector3);
    });
  });
});
