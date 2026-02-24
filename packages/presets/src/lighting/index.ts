/**
 * Lighting Presets
 *
 * Pre-configured lighting setups for various environments
 */

import * as THREE from 'three';

export interface LightingPreset {
  name: string;
  description: string;
  godRays: {
    enabled: boolean;
    intensity: number;
    decay: number;
    density: number;
    samples: number;
    exposure: number;
    scattering: number;
    noiseFactor: number;
    color: THREE.Color;
  };
  spotlights: Array<{
    position: THREE.Vector3;
    target: THREE.Vector3;
    color: THREE.Color;
    intensity: number;
    angle: number;
    penumbra: number;
    distance: number;
    dustDensity: number;
  }>;
  pointLights: Array<{
    position: THREE.Vector3;
    color: THREE.Color;
    intensity: number;
    radius: number;
    dustDensity: number;
    flicker: number;
  }>;
  ambient: {
    color: THREE.Color;
    intensity: number;
  };
  fog?: {
    color: THREE.Color;
    density: number;
  };
}

export type LightingPresetName = 'cathedral' | 'forestCanopy' | 'underwater' | 'dustyRoom';

export const cathedralPreset: LightingPreset = {
  name: 'Cathedral Interior',
  description: 'Strong light shafts streaming through high windows',
  godRays: {
    enabled: true,
    intensity: 1.5,
    decay: 0.96,
    density: 1.2,
    samples: 60,
    exposure: 1.2,
    scattering: 1.5,
    noiseFactor: 0.2,
    color: new THREE.Color(1.0, 0.95, 0.8),
  },
  spotlights: [
    {
      position: new THREE.Vector3(-10, 15, -5),
      target: new THREE.Vector3(0, 0, -5),
      color: new THREE.Color(1.0, 0.95, 0.85),
      intensity: 2.0,
      angle: Math.PI / 8,
      penumbra: 0.2,
      distance: 20,
      dustDensity: 0.8,
    },
    {
      position: new THREE.Vector3(10, 15, -5),
      target: new THREE.Vector3(0, 0, -5),
      color: new THREE.Color(1.0, 0.95, 0.85),
      intensity: 2.0,
      angle: Math.PI / 8,
      penumbra: 0.2,
      distance: 20,
      dustDensity: 0.8,
    },
    {
      position: new THREE.Vector3(0, 20, 10),
      target: new THREE.Vector3(0, 0, 0),
      color: new THREE.Color(1.0, 0.98, 0.9),
      intensity: 1.5,
      angle: Math.PI / 6,
      penumbra: 0.3,
      distance: 25,
      dustDensity: 0.6,
    },
  ],
  pointLights: [
    {
      position: new THREE.Vector3(-5, 2, 0),
      color: new THREE.Color(1.0, 0.8, 0.5),
      intensity: 0.5,
      radius: 3,
      dustDensity: 0.3,
      flicker: 0.4,
    },
    {
      position: new THREE.Vector3(5, 2, 0),
      color: new THREE.Color(1.0, 0.8, 0.5),
      intensity: 0.5,
      radius: 3,
      dustDensity: 0.3,
      flicker: 0.4,
    },
  ],
  ambient: {
    color: new THREE.Color(0.2, 0.2, 0.25),
    intensity: 0.3,
  },
  fog: {
    color: new THREE.Color(0.15, 0.15, 0.2),
    density: 0.015,
  },
};

export const forestCanopyPreset: LightingPreset = {
  name: 'Forest Canopy',
  description: 'Dappled light filtering through tree leaves',
  godRays: {
    enabled: true,
    intensity: 0.8,
    decay: 0.92,
    density: 0.8,
    samples: 40,
    exposure: 1.0,
    scattering: 2.5,
    noiseFactor: 0.6,
    color: new THREE.Color(0.9, 1.0, 0.7),
  },
  spotlights: [
    {
      position: new THREE.Vector3(-3, 12, -2),
      target: new THREE.Vector3(-2, 0, -1),
      color: new THREE.Color(1.0, 1.0, 0.8),
      intensity: 1.2,
      angle: Math.PI / 12,
      penumbra: 0.4,
      distance: 15,
      dustDensity: 0.4,
    },
    {
      position: new THREE.Vector3(2, 10, 3),
      target: new THREE.Vector3(1, 0, 2),
      color: new THREE.Color(0.95, 1.0, 0.75),
      intensity: 1.0,
      angle: Math.PI / 10,
      penumbra: 0.5,
      distance: 12,
      dustDensity: 0.35,
    },
    {
      position: new THREE.Vector3(5, 11, -4),
      target: new THREE.Vector3(4, 0, -3),
      color: new THREE.Color(1.0, 0.98, 0.8),
      intensity: 0.9,
      angle: Math.PI / 14,
      penumbra: 0.3,
      distance: 14,
      dustDensity: 0.45,
    },
    {
      position: new THREE.Vector3(-4, 9, 5),
      target: new THREE.Vector3(-3, 0, 4),
      color: new THREE.Color(0.9, 1.0, 0.7),
      intensity: 0.8,
      angle: Math.PI / 16,
      penumbra: 0.6,
      distance: 11,
      dustDensity: 0.3,
    },
  ],
  pointLights: [],
  ambient: {
    color: new THREE.Color(0.15, 0.25, 0.1),
    intensity: 0.4,
  },
  fog: {
    color: new THREE.Color(0.3, 0.4, 0.25),
    density: 0.02,
  },
};

export const underwaterPreset: LightingPreset = {
  name: 'Underwater',
  description: 'Caustic rays filtering through water surface',
  godRays: {
    enabled: true,
    intensity: 0.6,
    decay: 0.88,
    density: 0.6,
    samples: 35,
    exposure: 0.8,
    scattering: 3.0,
    noiseFactor: 0.8,
    color: new THREE.Color(0.4, 0.8, 1.0),
  },
  spotlights: [
    {
      position: new THREE.Vector3(0, 20, 0),
      target: new THREE.Vector3(2, 0, 1),
      color: new THREE.Color(0.5, 0.85, 1.0),
      intensity: 1.5,
      angle: Math.PI / 4,
      penumbra: 0.8,
      distance: 25,
      dustDensity: 0.2,
    },
    {
      position: new THREE.Vector3(-5, 18, 3),
      target: new THREE.Vector3(-3, 0, 2),
      color: new THREE.Color(0.45, 0.8, 0.95),
      intensity: 1.2,
      angle: Math.PI / 5,
      penumbra: 0.7,
      distance: 22,
      dustDensity: 0.25,
    },
  ],
  pointLights: [
    {
      position: new THREE.Vector3(3, 2, -2),
      color: new THREE.Color(0.3, 0.9, 0.8),
      intensity: 0.4,
      radius: 4,
      dustDensity: 0.15,
      flicker: 0.2,
    },
  ],
  ambient: {
    color: new THREE.Color(0.1, 0.3, 0.4),
    intensity: 0.5,
  },
  fog: {
    color: new THREE.Color(0.0, 0.2, 0.35),
    density: 0.04,
  },
};

export const dustyRoomPreset: LightingPreset = {
  name: 'Dusty Room',
  description: 'Visible dust particles floating in light beams',
  godRays: {
    enabled: true,
    intensity: 1.0,
    decay: 0.94,
    density: 1.0,
    samples: 50,
    exposure: 1.1,
    scattering: 1.8,
    noiseFactor: 0.5,
    color: new THREE.Color(1.0, 0.9, 0.75),
  },
  spotlights: [
    {
      position: new THREE.Vector3(5, 8, 0),
      target: new THREE.Vector3(0, 0, 0),
      color: new THREE.Color(1.0, 0.92, 0.8),
      intensity: 1.8,
      angle: Math.PI / 7,
      penumbra: 0.15,
      distance: 12,
      dustDensity: 1.0,
    },
  ],
  pointLights: [
    {
      position: new THREE.Vector3(-3, 1.5, 2),
      color: new THREE.Color(1.0, 0.7, 0.4),
      intensity: 0.6,
      radius: 2.5,
      dustDensity: 0.8,
      flicker: 0.6,
    },
    {
      position: new THREE.Vector3(2, 1, -3),
      color: new THREE.Color(0.9, 0.8, 0.6),
      intensity: 0.4,
      radius: 2,
      dustDensity: 0.7,
      flicker: 0.3,
    },
  ],
  ambient: {
    color: new THREE.Color(0.15, 0.12, 0.1),
    intensity: 0.2,
  },
  fog: {
    color: new THREE.Color(0.2, 0.18, 0.15),
    density: 0.025,
  },
};

export const lightingPresets: Record<LightingPresetName, LightingPreset> = {
  cathedral: cathedralPreset,
  forestCanopy: forestCanopyPreset,
  underwater: underwaterPreset,
  dustyRoom: dustyRoomPreset,
};

export function getLightingPreset(name: LightingPresetName): LightingPreset {
  const preset = lightingPresets[name];
  if (!preset) {
    throw new Error(`Unknown lighting preset: ${name}`);
  }
  return preset;
}

export function cloneLightingPreset(preset: LightingPreset): LightingPreset {
  return {
    ...preset,
    godRays: {
      ...preset.godRays,
      color: preset.godRays.color.clone(),
    },
    spotlights: preset.spotlights.map((spot) => ({
      ...spot,
      position: spot.position.clone(),
      target: spot.target.clone(),
      color: spot.color.clone(),
    })),
    pointLights: preset.pointLights.map((point) => ({
      ...point,
      position: point.position.clone(),
      color: point.color.clone(),
    })),
    ambient: {
      ...preset.ambient,
      color: preset.ambient.color.clone(),
    },
    fog: preset.fog
      ? {
          ...preset.fog,
          color: preset.fog.color.clone(),
        }
      : undefined,
  };
}

export function blendLightingPresets(
  presetA: LightingPreset,
  presetB: LightingPreset,
  t: number
): LightingPreset {
  const clampedT = Math.max(0, Math.min(1, t));

  return {
    name: `Blend: ${presetA.name} -> ${presetB.name}`,
    description: `Blended preset at ${Math.round(clampedT * 100)}%`,
    godRays: {
      enabled: clampedT < 0.5 ? presetA.godRays.enabled : presetB.godRays.enabled,
      intensity: THREE.MathUtils.lerp(
        presetA.godRays.intensity,
        presetB.godRays.intensity,
        clampedT
      ),
      decay: THREE.MathUtils.lerp(presetA.godRays.decay, presetB.godRays.decay, clampedT),
      density: THREE.MathUtils.lerp(presetA.godRays.density, presetB.godRays.density, clampedT),
      samples: Math.round(
        THREE.MathUtils.lerp(presetA.godRays.samples, presetB.godRays.samples, clampedT)
      ),
      exposure: THREE.MathUtils.lerp(presetA.godRays.exposure, presetB.godRays.exposure, clampedT),
      scattering: THREE.MathUtils.lerp(
        presetA.godRays.scattering,
        presetB.godRays.scattering,
        clampedT
      ),
      noiseFactor: THREE.MathUtils.lerp(
        presetA.godRays.noiseFactor,
        presetB.godRays.noiseFactor,
        clampedT
      ),
      color: new THREE.Color().lerpColors(presetA.godRays.color, presetB.godRays.color, clampedT),
    },
    spotlights: clampedT < 0.5 ? presetA.spotlights : presetB.spotlights,
    pointLights: clampedT < 0.5 ? presetA.pointLights : presetB.pointLights,
    ambient: {
      color: new THREE.Color().lerpColors(presetA.ambient.color, presetB.ambient.color, clampedT),
      intensity: THREE.MathUtils.lerp(
        presetA.ambient.intensity,
        presetB.ambient.intensity,
        clampedT
      ),
    },
    fog:
      presetA.fog && presetB.fog
        ? {
            color: new THREE.Color().lerpColors(presetA.fog.color, presetB.fog.color, clampedT),
            density: THREE.MathUtils.lerp(presetA.fog.density, presetB.fog.density, clampedT),
          }
        : clampedT < 0.5
          ? presetA.fog
          : presetB.fog,
  };
}
