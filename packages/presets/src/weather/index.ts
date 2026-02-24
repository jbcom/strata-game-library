/**
 * Weather and Environmental Presets.
 * @packageDocumentation
 * @module presets/weather
 */

import type { WeatherStateConfig } from '@strata-game-library/core/core/weather';
import * as THREE from 'three';

export interface WeatherPreset extends Omit<WeatherStateConfig, 'windDirection'> {
  name: string;
  description: string;
  windDirection: [number, number, number];
}

export const WEATHER_PRESET_CLEAR: WeatherPreset = {
  name: 'Clear',
  description: 'Clear skies with no precipitation',
  type: 'clear',
  intensity: 0,
  windDirection: [0.3, 0, 0.1],
  windIntensity: 0.2,
  temperature: 22,
  visibility: 1,
  cloudCoverage: 0.1,
  precipitationRate: 0,
};

export const WEATHER_PRESET_OVERCAST: WeatherPreset = {
  name: 'Overcast',
  description: 'Cloudy skies without rain',
  type: 'clear',
  intensity: 0,
  windDirection: [0.5, 0, 0.2],
  windIntensity: 0.4,
  temperature: 18,
  visibility: 0.8,
  cloudCoverage: 0.8,
  precipitationRate: 0,
};

export const WEATHER_PRESET_FOGGY: WeatherPreset = {
  name: 'Foggy',
  description: 'Dense fog with low visibility',
  type: 'fog',
  intensity: 0.8,
  windDirection: [0.1, 0, 0.05],
  windIntensity: 0.1,
  temperature: 15,
  visibility: 0.2,
  cloudCoverage: 1,
  precipitationRate: 0,
};

export const WEATHER_PRESET_LIGHT_RAIN: WeatherPreset = {
  name: 'Light Rain',
  description: 'Gentle rain with mild wind',
  type: 'rain',
  intensity: 0.3,
  windDirection: [0.4, 0, 0.2],
  windIntensity: 0.3,
  temperature: 16,
  visibility: 0.7,
  cloudCoverage: 0.7,
  precipitationRate: 0.3,
};

export const WEATHER_PRESET_HEAVY_RAIN: WeatherPreset = {
  name: 'Heavy Rain',
  description: 'Heavy downpour with strong wind',
  type: 'rain',
  intensity: 0.8,
  windDirection: [0.7, 0, 0.3],
  windIntensity: 0.6,
  temperature: 14,
  visibility: 0.4,
  cloudCoverage: 0.9,
  precipitationRate: 0.8,
};

export const WEATHER_PRESET_THUNDERSTORM: WeatherPreset = {
  name: 'Thunderstorm',
  description: 'Heavy rain with thunder and lightning',
  type: 'storm',
  intensity: 1,
  windDirection: [1, 0, 0.5],
  windIntensity: 0.9,
  temperature: 12,
  visibility: 0.3,
  cloudCoverage: 1,
  precipitationRate: 1,
};

export const WEATHER_PRESET_LIGHT_SNOW: WeatherPreset = {
  name: 'Light Snow',
  description: 'Gentle snowfall with light wind',
  type: 'snow',
  intensity: 0.4,
  windDirection: [0.3, 0, 0.15],
  windIntensity: 0.2,
  temperature: -2,
  visibility: 0.6,
  cloudCoverage: 0.8,
  precipitationRate: 0.4,
};

export const WEATHER_PRESET_BLIZZARD: WeatherPreset = {
  name: 'Blizzard',
  description: 'Heavy snowfall with strong winds',
  type: 'snow',
  intensity: 1,
  windDirection: [1, 0, 0.4],
  windIntensity: 1,
  temperature: -8,
  visibility: 0.15,
  cloudCoverage: 1,
  precipitationRate: 1,
};

export const WEATHER_PRESETS: Record<string, WeatherPreset> = {
  clear: WEATHER_PRESET_CLEAR,
  overcast: WEATHER_PRESET_OVERCAST,
  foggy: WEATHER_PRESET_FOGGY,
  lightRain: WEATHER_PRESET_LIGHT_RAIN,
  heavyRain: WEATHER_PRESET_HEAVY_RAIN,
  thunderstorm: WEATHER_PRESET_THUNDERSTORM,
  lightSnow: WEATHER_PRESET_LIGHT_SNOW,
  blizzard: WEATHER_PRESET_BLIZZARD,
};

export function getWeatherPreset(name: keyof typeof WEATHER_PRESETS): WeatherPreset {
  return WEATHER_PRESETS[name];
}

export function presetToConfig(preset: WeatherPreset): WeatherStateConfig {
  return {
    type: preset.type,
    intensity: preset.intensity,
    windDirection: new THREE.Vector3(...preset.windDirection),
    windIntensity: preset.windIntensity,
    temperature: preset.temperature,
    visibility: preset.visibility,
    cloudCoverage: preset.cloudCoverage,
    precipitationRate: preset.precipitationRate,
  };
}

export function blendPresets(
  presetA: WeatherPreset,
  presetB: WeatherPreset,
  t: number
): WeatherStateConfig {
  const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
  const clampedT = Math.max(0, Math.min(1, t));

  return {
    type: clampedT < 0.5 ? presetA.type : presetB.type,
    intensity: lerp(presetA.intensity, presetB.intensity, clampedT),
    windDirection: new THREE.Vector3(
      lerp(presetA.windDirection[0], presetB.windDirection[0], clampedT),
      lerp(presetA.windDirection[1], presetB.windDirection[1], clampedT),
      lerp(presetA.windDirection[2], presetB.windDirection[2], clampedT)
    ),
    windIntensity: lerp(presetA.windIntensity, presetB.windIntensity, clampedT),
    temperature: lerp(presetA.temperature, presetB.temperature, clampedT),
    visibility: lerp(presetA.visibility, presetB.visibility, clampedT),
    cloudCoverage: lerp(presetA.cloudCoverage, presetB.cloudCoverage, clampedT),
    precipitationRate: lerp(presetA.precipitationRate, presetB.precipitationRate, clampedT),
  };
}

export type WeatherPresetName = keyof typeof WEATHER_PRESETS;
