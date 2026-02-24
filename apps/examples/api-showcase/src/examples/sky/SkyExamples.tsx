/**
 * @fileoverview Sky and Volumetrics API Examples
 *
 * Complete examples for all sky, atmospheric, and volumetric APIs in Strata.
 * Covers day/night cycles, weather, fog, and volumetric effects.
 *
 * @module examples/sky
 */

import { createUnderwaterOverlayMaterial, createVolumetricFogMeshMaterial } from '@jbcom/strata';
import * as THREE from 'three';

/**
 * Example 1: Basic Procedural Sky
 *
 * Simple sky setup with default day configuration.
 *
 * @example
 * ```tsx
 * import { ProceduralSky } from '@jbcom/strata';
 *
 * <ProceduralSky
 *     timeOfDay={{
 *         sunAngle: 60,
 *         sunIntensity: 1.0,
 *     }}
 * />
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/components/Sky.tsx#L56 ProceduralSky}
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/core/sky.ts#L32 createSkyMaterial}
 *
 * @category Basic
 * @apiExample ProceduralSky
 */
export function Example_BasicSky() {
  return {
    component: 'ProceduralSky',
    props: {
      timeOfDay: {
        sunAngle: 60,
        sunIntensity: 1.0,
        ambientLight: 0.8,
        starVisibility: 0,
        fogDensity: 0,
      },
    },
    description: 'Basic procedural sky with default midday configuration',
    apiCalls: ['ProceduralSky', 'createSkyMaterial'],
    features: ['Gradient sky coloring', 'Sun position', 'Atmospheric color'],
  };
}

/**
 * Example 2: Dawn Sky Preset
 *
 * Early morning sky with low sun angle and warm colors.
 *
 * @example
 * ```tsx
 * <ProceduralSky
 *     timeOfDay={{
 *         sunAngle: 10,          // Low on horizon
 *         sunIntensity: 0.4,     // Dim
 *         ambientLight: 0.3,     // Dark
 *         starVisibility: 0.5,   // Some stars still visible
 *         fogDensity: 0.3,       // Morning mist
 *     }}
 * />
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/components/Sky.tsx#L56 ProceduralSky}
 *
 * @category Preset
 * @apiExample ProceduralSky - Dawn
 */
export function Example_DawnSky() {
  return {
    component: 'ProceduralSky',
    props: {
      timeOfDay: {
        sunAngle: 10,
        sunIntensity: 0.4,
        ambientLight: 0.3,
        starVisibility: 0.5,
        fogDensity: 0.3,
      },
    },
    description: 'Dawn configuration with low sun and morning mist',
    preset: 'Dawn',
    lighting: {
      sunPosition: 'Low on horizon',
      color: 'Warm orange/pink tones',
      intensity: 'Dim and gentle',
    },
  };
}

/**
 * Example 3: Noon Sky Preset
 *
 * Bright midday sun directly overhead with clear conditions.
 *
 * @example
 * ```tsx
 * <ProceduralSky
 *     timeOfDay={{
 *         sunAngle: 90,          // Directly overhead
 *         sunIntensity: 1.0,     // Full brightness
 *         ambientLight: 1.0,     // Bright
 *         starVisibility: 0,     // No stars
 *         fogDensity: 0,         // Clear
 *     }}
 * />
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/components/Sky.tsx#L56 ProceduralSky}
 *
 * @category Preset
 * @apiExample ProceduralSky - Noon
 */
export function Example_NoonSky() {
  return {
    component: 'ProceduralSky',
    props: {
      timeOfDay: {
        sunAngle: 90,
        sunIntensity: 1.0,
        ambientLight: 1.0,
        starVisibility: 0,
        fogDensity: 0,
      },
    },
    description: 'Bright midday sky with sun at zenith',
    preset: 'Noon',
    lighting: {
      sunPosition: 'Directly overhead (zenith)',
      color: 'Bright blue sky',
      intensity: 'Maximum',
    },
  };
}

/**
 * Example 4: Sunset Sky Preset
 *
 * Golden hour lighting with warm colors and long shadows.
 *
 * @example
 * ```tsx
 * <ProceduralSky
 *     timeOfDay={{
 *         sunAngle: 15,          // Near horizon
 *         sunIntensity: 0.8,     // Still bright
 *         ambientLight: 0.4,     // Getting darker
 *         starVisibility: 0.2,   // Few stars appearing
 *         fogDensity: 0.2,       // Evening haze
 *     }}
 * />
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/components/Sky.tsx#L56 ProceduralSky}
 *
 * @category Preset
 * @apiExample ProceduralSky - Sunset
 */
export function Example_SunsetSky() {
  return {
    component: 'ProceduralSky',
    props: {
      timeOfDay: {
        sunAngle: 15,
        sunIntensity: 0.8,
        ambientLight: 0.4,
        starVisibility: 0.2,
        fogDensity: 0.2,
      },
    },
    description: 'Golden hour sunset with warm atmospheric colors',
    preset: 'Sunset',
    lighting: {
      sunPosition: 'Low, near horizon',
      color: 'Orange, red, and purple tones',
      intensity: 'Warm and diffuse',
    },
  };
}

/**
 * Example 5: Night Sky Preset
 *
 * Dark night sky with visible stars and minimal lighting.
 *
 * @example
 * ```tsx
 * <ProceduralSky
 *     timeOfDay={{
 *         sunAngle: 0,           // Below horizon
 *         sunIntensity: 0,       // No sun
 *         ambientLight: 0.1,     // Very dark
 *         starVisibility: 1.0,   // Full stars
 *         fogDensity: 0.1,       // Light mist
 *     }}
 * />
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/components/Sky.tsx#L56 ProceduralSky}
 *
 * @category Preset
 * @apiExample ProceduralSky - Night
 */
export function Example_NightSky() {
  return {
    component: 'ProceduralSky',
    props: {
      timeOfDay: {
        sunAngle: 0,
        sunIntensity: 0,
        ambientLight: 0.1,
        starVisibility: 1.0,
        fogDensity: 0.1,
      },
    },
    description: 'Dark night sky with full star field',
    preset: 'Night',
    lighting: {
      sunPosition: 'Below horizon',
      color: 'Deep blue/purple night tones',
      intensity: 'Minimal (moonlight/starlight)',
      stars: 'Fully visible',
    },
  };
}

/**
 * Example 6: Stormy Weather Sky
 *
 * Overcast sky with heavy fog and reduced sun intensity.
 *
 * @example
 * ```tsx
 * <ProceduralSky
 *     timeOfDay={{
 *         sunAngle: 45,
 *         sunIntensity: 0.3,     // Obscured by clouds
 *         ambientLight: 0.3,     // Dark and moody
 *         starVisibility: 0,
 *         fogDensity: 0.8,       // Heavy fog/clouds
 *     }}
 *     weather={{
 *         intensity: 0.8,        // Storm intensity
 *     }}
 * />
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/components/Sky.tsx#L56 ProceduralSky}
 *
 * @category Preset
 * @apiExample ProceduralSky with Weather
 */
export function Example_StormySky() {
  return {
    component: 'ProceduralSky',
    props: {
      timeOfDay: {
        sunAngle: 45,
        sunIntensity: 0.3,
        ambientLight: 0.3,
        starVisibility: 0,
        fogDensity: 0.8,
      },
      weather: {
        intensity: 0.8,
      },
    },
    description: 'Dark stormy sky with heavy clouds and fog',
    preset: 'Stormy',
    atmosphere: {
      visibility: 'Very limited',
      mood: 'Dark and foreboding',
      weather: 'Active storm',
    },
  };
}

/**
 * Example 7: Animated Day/Night Cycle
 *
 * Demonstrates how to animate the sky through a full day cycle.
 *
 * @example
 * ```tsx
 * import { useFrame } from '@react-three/fiber';
 * import { useState } from 'react';
 *
 * function AnimatedSky() {
 *     const [time, setTime] = useState(0);
 *
 *     useFrame((_, delta) => {
 *         setTime(t => (t + delta * 0.05) % 24);
 *     });
 *
 *     // Convert 0-24 hours to 0-180 degrees
 *     const sunAngle = (time / 24) * 180;
 *     const isDay = sunAngle > 0 && sunAngle < 180;
 *
 *     return (
 *         <ProceduralSky
 *             timeOfDay={{
 *                 sunAngle,
 *                 sunIntensity: isDay ? Math.sin(sunAngle * Math.PI / 180) : 0,
 *                 ambientLight: isDay ? 0.8 : 0.1,
 *                 starVisibility: isDay ? 0 : 1.0,
 *                 fogDensity: 0.1,
 *             }}
 *         />
 *     );
 * }
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/components/Sky.tsx#L56 ProceduralSky}
 *
 * @category Advanced
 * @apiExample Animated Day/Night Cycle
 */
export function Example_AnimatedDayNightCycle() {
  return {
    description: 'Fully animated day/night cycle over 24-hour period',
    implementation: 'Use useFrame to increment time value',
    apiCalls: ['ProceduralSky', 'useFrame'],
    features: [
      'Smooth sun angle progression',
      'Dynamic sun intensity based on angle',
      'Automatic star appearance at night',
      'Ambient light transitions',
      'Continuous looping cycle',
    ],
    calculations: {
      sunAngle: '(time / 24) * 180',
      sunIntensity: 'Math.sin(sunAngle * PI / 180)',
      starVisibility: '1.0 - sunIntensity',
      ambientLight: 'Lerp between 0.1 (night) and 0.8 (day)',
    },
  };
}

/**
 * Example 8: Volumetric Fog System
 *
 * Add volumetric fog for atmospheric depth and mood.
 *
 * @example
 * ```tsx
 * import { createVolumetricFogMeshMaterial } from '@jbcom/strata';
 * import * as THREE from 'three';
 *
 * const fogMaterial = createVolumetricFogMeshMaterial({
 *     color: new THREE.Color(0.7, 0.8, 0.9),
 *     density: 0.02,
 *     height: 10,
 *     cameraPosition: new THREE.Vector3(0, 5, 10),
 * });
 *
 * const fogGeometry = new THREE.PlaneGeometry(200, 100);
 * const fogMesh = new THREE.Mesh(fogGeometry, fogMaterial);
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/core/volumetrics.ts#L37 createVolumetricFogMeshMaterial}
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/shaders/volumetrics-components.ts Volumetrics Shaders}
 *
 * @category Advanced
 * @apiExample createVolumetricFogMeshMaterial
 */
export function Example_VolumetricFog() {
  const fogMaterial = createVolumetricFogMeshMaterial({
    color: new THREE.Color(0.7, 0.8, 0.9),
    density: 0.02,
    height: 10,
    cameraPosition: new THREE.Vector3(0, 5, 10),
  });

  return {
    material: fogMaterial,
    description: 'Volumetric fog mesh for atmospheric effects',
    apiCalls: ['createVolumetricFogMeshMaterial'],
    parameters: {
      color: 'Fog color (light blue-grey)',
      density: 'Fog thickness (0.02)',
      height: 'Fog height falloff (10 units)',
      cameraPosition: 'Camera position for depth calculation',
    },
    usage: {
      setup: 'Create material and apply to large plane',
      update: 'Update cameraPosition uniform each frame',
      blending: 'Uses transparent material with depth write disabled',
    },
  };
}

/**
 * Example 9: Underwater Overlay Effect
 *
 * Create underwater caustics and color overlay when camera is submerged.
 *
 * @example
 * ```tsx
 * import { createUnderwaterOverlayMaterial } from '@jbcom/strata';
 *
 * const underwaterMaterial = createUnderwaterOverlayMaterial({
 *     waterColor: new THREE.Color(0.0, 0.3, 0.5),
 *     density: 0.1,
 *     causticStrength: 0.3,
 *     waterSurface: 0,
 *     cameraY: -5,
 * });
 *
 * // Apply to full-screen quad when underwater
 * if (cameraY < waterSurface) {
 *     // Render underwater overlay
 * }
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/core/volumetrics.ts#L73 createUnderwaterOverlayMaterial}
 *
 * @category Advanced
 * @apiExample createUnderwaterOverlayMaterial
 */
export function Example_UnderwaterEffect() {
  const underwaterMaterial = createUnderwaterOverlayMaterial({
    waterColor: new THREE.Color(0.0, 0.3, 0.5),
    density: 0.1,
    causticStrength: 0.3,
    waterSurface: 0,
    cameraY: -5,
  });

  return {
    material: underwaterMaterial,
    description: 'Underwater overlay with caustics and color tint',
    apiCalls: ['createUnderwaterOverlayMaterial'],
    parameters: {
      waterColor: 'Blue-green water tint',
      density: 'Fog density underwater',
      causticStrength: 'Caustics intensity',
      waterSurface: 'Y position of water surface',
      cameraY: 'Current camera Y position',
    },
    usage: {
      detection: 'Check if cameraY < waterSurface',
      rendering: 'Render as fullscreen quad/plane',
      animation: 'Update time uniform for caustics',
    },
  };
}

/**
 * Example 10: Complete Atmospheric Scene
 *
 * Full integration of sky, fog, and volumetric effects.
 *
 * @example
 * ```tsx
 * import { ProceduralSky, createVolumetricFogMeshMaterial } from '@jbcom/strata';
 * import * as THREE from 'three';
 *
 * function AtmosphericScene() {
 *     const fogMaterial = createVolumetricFogMeshMaterial({
 *         color: new THREE.Color(0.7, 0.8, 0.9),
 *         density: 0.02,
 *         height: 10,
 *         cameraPosition: new THREE.Vector3(0, 5, 10),
 *     });
 *
 *     return (
 *         <>
 *             {/* Procedural sky background *\/}
 *             <ProceduralSky
 *                 timeOfDay={{
 *                     sunAngle: 30,
 *                     sunIntensity: 0.6,
 *                     ambientLight: 0.5,
 *                     starVisibility: 0.3,
 *                     fogDensity: 0.4,
 *                 }}
 *                 weather={{ intensity: 0.3 }}
 *             />
 *
 *             {/* Volumetric fog layer *\/}
 *             <mesh position={[0, 5, -20]}>
 *                 <planeGeometry args={[200, 50]} />
 *                 <primitive object={fogMaterial} />
 *             </mesh>
 *
 *             {/* Scene content *\/}
 *             <Terrain />
 *             <Water />
 *         </>
 *     );
 * }
 * ```
 *
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/components/Sky.tsx ProceduralSky}
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/core/volumetrics.ts Volumetrics}
 *
 * @category Complete
 * @apiExample Complete atmospheric scene
 */
export function Example_CompleteAtmosphericScene() {
  return {
    description: 'Complete atmospheric scene with sky, fog, and weather',
    components: [
      {
        type: 'ProceduralSky',
        purpose: 'Background sky with day/night cycle',
      },
      {
        type: 'VolumetricFog',
        purpose: 'Atmospheric depth and mood',
      },
      {
        type: 'Weather',
        purpose: 'Dynamic weather effects',
      },
    ],
    bestPractices: [
      'Layer sky behind all geometry',
      'Update fog camera position each frame',
      'Match fog color to time of day',
      'Adjust fog density based on weather',
      'Use underwater overlay when submerged',
      'Sync directional light with sun angle',
    ],
    performance: {
      sky: 'Single plane, minimal cost',
      fog: 'Transparent shader, moderate cost',
      underwater: 'Fullscreen effect, render when needed',
    },
  };
}

/**
 * All sky and volumetrics examples exported for showcase
 */
export const SkyExamples = {
  Example_BasicSky,
  Example_DawnSky,
  Example_NoonSky,
  Example_SunsetSky,
  Example_NightSky,
  Example_StormySky,
  Example_AnimatedDayNightCycle,
  Example_VolumetricFog,
  Example_UnderwaterEffect,
  Example_CompleteAtmosphericScene,
};
