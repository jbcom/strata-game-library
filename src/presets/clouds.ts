/**
 * Cloud Presets
 *
 * Pre-configured cloud settings for common weather and atmospheric conditions
 */

import * as THREE from 'three';
import type { CloudLayerConfig, CloudSkyConfig, DayNightConfig, WindConfig } from '../core/clouds';

export type CloudPresetName = 'clear' | 'partlyCloudy' | 'overcast' | 'stormy' | 'sunset';

export interface CloudPreset {
    name: string;
    description: string;
    layers: CloudLayerConfig[];
    wind: WindConfig;
    dayNight: DayNightConfig;
    volumetric?: {
        cloudBase: number;
        cloudHeight: number;
        coverage: number;
        density: number;
    };
}

export const cloudPresets: Record<CloudPresetName, CloudPreset> = {
    clear: {
        name: 'Clear Sky',
        description: 'Minimal, wispy clouds for a clear day',
        layers: [
            {
                altitude: 150,
                density: 0.3,
                coverage: 0.1,
                cloudColor: new THREE.Color(1, 1, 1),
                shadowColor: new THREE.Color(0.85, 0.88, 0.95),
                scale: 8.0,
            },
        ],
        wind: {
            direction: new THREE.Vector2(1, 0),
            speed: 0.005,
        },
        dayNight: {
            sunIntensity: 1.0,
            sunAngle: 70,
            sunColor: new THREE.Color(1, 0.98, 0.9),
        },
        volumetric: {
            cloudBase: 100,
            cloudHeight: 30,
            coverage: 0.1,
            density: 0.3,
        },
    },

    partlyCloudy: {
        name: 'Partly Cloudy',
        description: 'Scattered cumulus clouds, typical fair weather',
        layers: [
            {
                altitude: 80,
                density: 0.9,
                coverage: 0.45,
                cloudColor: new THREE.Color(1, 1, 1),
                shadowColor: new THREE.Color(0.72, 0.77, 0.88),
                scale: 4.0,
            },
            {
                altitude: 130,
                density: 0.5,
                coverage: 0.25,
                cloudColor: new THREE.Color(0.97, 0.97, 1),
                shadowColor: new THREE.Color(0.75, 0.8, 0.9),
                scale: 7.0,
            },
        ],
        wind: {
            direction: new THREE.Vector2(1, 0.2),
            speed: 0.015,
        },
        dayNight: {
            sunIntensity: 1.0,
            sunAngle: 60,
            sunColor: new THREE.Color(1, 0.95, 0.85),
        },
        volumetric: {
            cloudBase: 60,
            cloudHeight: 50,
            coverage: 0.45,
            density: 0.8,
        },
    },

    overcast: {
        name: 'Overcast',
        description: 'Heavy cloud cover blocking most sunlight',
        layers: [
            {
                altitude: 60,
                density: 1.0,
                coverage: 0.85,
                cloudColor: new THREE.Color(0.8, 0.82, 0.85),
                shadowColor: new THREE.Color(0.55, 0.58, 0.65),
                scale: 3.0,
            },
            {
                altitude: 90,
                density: 0.9,
                coverage: 0.8,
                cloudColor: new THREE.Color(0.75, 0.77, 0.82),
                shadowColor: new THREE.Color(0.5, 0.53, 0.6),
                scale: 5.0,
            },
            {
                altitude: 120,
                density: 0.7,
                coverage: 0.7,
                cloudColor: new THREE.Color(0.7, 0.72, 0.78),
                shadowColor: new THREE.Color(0.45, 0.48, 0.55),
                scale: 6.0,
            },
        ],
        wind: {
            direction: new THREE.Vector2(0.8, 0.6),
            speed: 0.02,
        },
        dayNight: {
            sunIntensity: 0.4,
            sunAngle: 45,
            sunColor: new THREE.Color(0.9, 0.9, 0.95),
        },
        volumetric: {
            cloudBase: 40,
            cloudHeight: 80,
            coverage: 0.85,
            density: 1.2,
        },
    },

    stormy: {
        name: 'Stormy',
        description: 'Dark, threatening storm clouds',
        layers: [
            {
                altitude: 50,
                density: 1.2,
                coverage: 0.95,
                cloudColor: new THREE.Color(0.45, 0.48, 0.55),
                shadowColor: new THREE.Color(0.25, 0.27, 0.35),
                scale: 2.5,
            },
            {
                altitude: 80,
                density: 1.0,
                coverage: 0.9,
                cloudColor: new THREE.Color(0.4, 0.42, 0.5),
                shadowColor: new THREE.Color(0.2, 0.22, 0.3),
                scale: 4.0,
            },
            {
                altitude: 110,
                density: 0.8,
                coverage: 0.85,
                cloudColor: new THREE.Color(0.35, 0.37, 0.45),
                shadowColor: new THREE.Color(0.18, 0.2, 0.28),
                scale: 5.0,
            },
        ],
        wind: {
            direction: new THREE.Vector2(0.7, -0.7),
            speed: 0.04,
        },
        dayNight: {
            sunIntensity: 0.15,
            sunAngle: 30,
            sunColor: new THREE.Color(0.7, 0.65, 0.6),
        },
        volumetric: {
            cloudBase: 30,
            cloudHeight: 100,
            coverage: 0.95,
            density: 1.5,
        },
    },

    sunset: {
        name: 'Sunset Clouds',
        description: 'Warm-colored clouds during golden hour',
        layers: [
            {
                altitude: 70,
                density: 0.85,
                coverage: 0.5,
                cloudColor: new THREE.Color(1.0, 0.85, 0.7),
                shadowColor: new THREE.Color(0.7, 0.45, 0.5),
                scale: 4.0,
            },
            {
                altitude: 110,
                density: 0.6,
                coverage: 0.35,
                cloudColor: new THREE.Color(1.0, 0.75, 0.55),
                shadowColor: new THREE.Color(0.65, 0.4, 0.45),
                scale: 6.0,
            },
            {
                altitude: 150,
                density: 0.4,
                coverage: 0.25,
                cloudColor: new THREE.Color(0.95, 0.65, 0.45),
                shadowColor: new THREE.Color(0.6, 0.35, 0.4),
                scale: 8.0,
            },
        ],
        wind: {
            direction: new THREE.Vector2(1, 0),
            speed: 0.008,
        },
        dayNight: {
            sunIntensity: 0.7,
            sunAngle: 15,
            sunColor: new THREE.Color(1.0, 0.5, 0.25),
        },
        volumetric: {
            cloudBase: 50,
            cloudHeight: 60,
            coverage: 0.5,
            density: 0.9,
        },
    },
};

export function getCloudPreset(name: CloudPresetName): CloudPreset {
    const preset = cloudPresets[name];
    if (!preset) {
        throw new Error(`Unknown cloud preset: ${name}`);
    }
    return preset;
}

export function createCloudPresetConfig(name: CloudPresetName): CloudSkyConfig {
    const preset = getCloudPreset(name);
    return {
        layers: preset.layers,
        wind: preset.wind,
        dayNight: preset.dayNight,
    };
}

export function interpolateCloudPresets(
    from: CloudPresetName,
    to: CloudPresetName,
    t: number
): CloudPreset {
    const presetA = getCloudPreset(from);
    const presetB = getCloudPreset(to);
    t = Math.max(0, Math.min(1, t));

    const maxLayers = Math.max(presetA.layers.length, presetB.layers.length);
    const interpolatedLayers: CloudLayerConfig[] = [];

    for (let i = 0; i < maxLayers; i++) {
        const layerA = presetA.layers[i] || presetA.layers[presetA.layers.length - 1];
        const layerB = presetB.layers[i] || presetB.layers[presetB.layers.length - 1];

        const cloudColor = layerA.cloudColor.clone().lerp(layerB.cloudColor, t);
        const shadowColor = layerA.shadowColor.clone().lerp(layerB.shadowColor, t);

        interpolatedLayers.push({
            altitude: layerA.altitude + (layerB.altitude - layerA.altitude) * t,
            density: layerA.density + (layerB.density - layerA.density) * t,
            coverage: layerA.coverage + (layerB.coverage - layerA.coverage) * t,
            cloudColor,
            shadowColor,
            scale: (layerA.scale || 5) + ((layerB.scale || 5) - (layerA.scale || 5)) * t,
        });
    }

    const sunColor = presetA.dayNight.sunColor.clone().lerp(presetB.dayNight.sunColor, t);

    return {
        name: `${presetA.name} → ${presetB.name}`,
        description: `Interpolated between ${from} and ${to}`,
        layers: interpolatedLayers,
        wind: {
            direction: new THREE.Vector2(
                presetA.wind.direction.x +
                    (presetB.wind.direction.x - presetA.wind.direction.x) * t,
                presetA.wind.direction.y + (presetB.wind.direction.y - presetA.wind.direction.y) * t
            ),
            speed: presetA.wind.speed + (presetB.wind.speed - presetA.wind.speed) * t,
        },
        dayNight: {
            sunIntensity:
                presetA.dayNight.sunIntensity +
                (presetB.dayNight.sunIntensity - presetA.dayNight.sunIntensity) * t,
            sunAngle:
                presetA.dayNight.sunAngle +
                (presetB.dayNight.sunAngle - presetA.dayNight.sunAngle) * t,
            sunColor,
        },
        volumetric:
            presetA.volumetric && presetB.volumetric
                ? {
                      cloudBase:
                          presetA.volumetric.cloudBase +
                          (presetB.volumetric.cloudBase - presetA.volumetric.cloudBase) * t,
                      cloudHeight:
                          presetA.volumetric.cloudHeight +
                          (presetB.volumetric.cloudHeight - presetA.volumetric.cloudHeight) * t,
                      coverage:
                          presetA.volumetric.coverage +
                          (presetB.volumetric.coverage - presetA.volumetric.coverage) * t,
                      density:
                          presetA.volumetric.density +
                          (presetB.volumetric.density - presetA.volumetric.density) * t,
                  }
                : undefined,
    };
}

export function getAllCloudPresetNames(): CloudPresetName[] {
    return Object.keys(cloudPresets) as CloudPresetName[];
}
