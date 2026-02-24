/**
 * @fileoverview Water System API Examples
 *
 * Complete examples for all water-related APIs in Strata.
 * Demonstrates water rendering, caustics, reflections, and underwater effects.
 *
 * @module examples/water
 */

import { createWaterMaterial } from '@jbcom/strata';
import * as THREE from 'three';

/**
 * Example 1: Basic Water Surface
 *
 * The simplest water setup with default animated waves.
 * Perfect for lakes, ponds, or simple water features.
 *
 * @example
 * ```tsx
 * import { Water } from '@jbcom/strata';
 *
 * <Water
 *     position={[0, 0, 0]}
 *     size={100}
 *     segments={32}
 * />
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/water/Water.tsx#L21 Water Component}
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/core/water.ts#L30 createWaterMaterial}
 *
 * @category Basic
 * @apiExample Water
 */
export function Example_BasicWater() {
  return {
    component: 'Water',
    props: {
      position: [0, 0, 0] as [number, number, number],
      size: 100,
      segments: 32,
    },
    description: 'Simple animated water surface with default wave parameters',
    apiCalls: ['Water', 'createWaterMaterial'],
    features: [
      'Animated wave displacement',
      'Basic transparency',
      'Tile-based texture',
      'Performance optimized',
    ],
  };
}

/**
 * Example 2: Advanced Water with Caustics
 *
 * High-quality water with caustics, foam, fresnel reflections,
 * and depth-based coloring. Suitable for oceans, large lakes.
 *
 * @example
 * ```tsx
 * import { AdvancedWater } from '@jbcom/strata';
 *
 * <AdvancedWater
 *     position={[0, 0, 0]}
 *     size={[200, 200]}
 *     segments={128}
 *     waterColor={0x2a5a8a}
 *     deepWaterColor={0x1a3a5a}
 *     foamColor={0x8ab4d4}
 *     causticIntensity={0.6}
 * />
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/water/Water.tsx#L59 AdvancedWater Component}
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/core/water.ts#L120 createAdvancedWaterMaterial}
 *
 * @category Advanced
 * @apiExample AdvancedWater, createAdvancedWaterMaterial
 */
export function Example_AdvancedWaterWithCaustics() {
  return {
    component: 'AdvancedWater',
    props: {
      position: [0, 0, 0] as [number, number, number],
      size: [200, 200] as [number, number],
      segments: 128,
      waterColor: 0x2a5a8a,
      deepWaterColor: 0x1a3a5a,
      foamColor: 0x8ab4d4,
      causticIntensity: 0.6,
    },
    description: 'High-quality water with caustics, foam, and fresnel reflections',
    apiCalls: ['AdvancedWater', 'createAdvancedWaterMaterial'],
    features: [
      'Gerstner wave simulation',
      'Underwater caustics projection',
      'Procedural foam at edges',
      'Fresnel-based reflections',
      'Depth-based color blending',
      'Real-time normal mapping',
    ],
  };
}

/**
 * Example 3: Custom Water Material (Core API)
 *
 * Use the core water material function for vanilla Three.js integration
 * or when you need full control over the water mesh.
 *
 * @example
 * ```tsx
 * import { createWaterMaterial } from '@jbcom/strata';
 * import * as THREE from 'three';
 *
 * const waterMaterial = createWaterMaterial();
 * const waterGeometry = new THREE.PlaneGeometry(100, 100, 64, 64);
 * const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
 * waterMesh.rotation.x = -Math.PI / 2;
 *
 * // Animate in render loop
 * function animate() {
 *     waterMaterial.uniforms.time.value += 0.016;
 * }
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/core/water.ts#L30 createWaterMaterial}
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/shaders/water.ts Water Shaders}
 *
 * @category Core
 * @apiExample createWaterMaterial
 */
export function Example_CustomWaterMaterial() {
  const waterMaterial = createWaterMaterial();

  const waterGeometry = new THREE.PlaneGeometry(100, 100, 64, 64);
  const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
  waterMesh.rotation.x = -Math.PI / 2;

  return {
    mesh: waterMesh,
    material: waterMaterial,
    description: 'Custom water using core API for vanilla Three.js',
    apiCalls: ['createWaterMaterial'],
    usage: {
      setup: 'Create material with createWaterMaterial()',
      animate: 'Update uniforms.time.value in render loop',
      integration: 'Works with any Three.js scene',
    },
    uniforms: {
      time: 'Animation time',
      waveHeight: 'Wave amplitude',
      waveSpeed: 'Animation speed',
      color: 'Water color',
    },
  };
}

/**
 * Example 4: Deep Ocean Configuration
 *
 * Settings optimized for deep ocean water with large waves
 * and realistic deep-water coloring.
 *
 * @example
 * ```tsx
 * <AdvancedWater
 *     position={[0, -5, 0]}
 *     size={[500, 500]}
 *     segments={256}
 *     waterColor={0x0a2a4a}     // Deep blue
 *     deepWaterColor={0x021628}  // Very dark blue-black
 *     foamColor={0xffffff}       // White foam
 *     causticIntensity={0.3}     // Subtle caustics
 * />
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/water/Water.tsx#L59 AdvancedWater}
 *
 * @category Preset
 * @apiExample AdvancedWater - Ocean Preset
 */
export function Example_DeepOceanWater() {
  return {
    component: 'AdvancedWater',
    props: {
      position: [0, -5, 0] as [number, number, number],
      size: [500, 500] as [number, number],
      segments: 256,
      waterColor: 0x0a2a4a,
      deepWaterColor: 0x021628,
      foamColor: 0xffffff,
      causticIntensity: 0.3,
    },
    description: 'Deep ocean configuration with large area and realistic colors',
    apiCalls: ['AdvancedWater'],
    preset: 'Deep Ocean',
    characteristics: {
      depth: 'Very deep (5 units below surface)',
      area: '500x500 units',
      waves: 'Large, slow-moving',
      color: 'Dark blue transitioning to near-black',
      foam: 'Bright white for contrast',
    },
  };
}

/**
 * Example 5: Tropical Lagoon Configuration
 *
 * Crystal-clear tropical water with bright colors and
 * visible caustics. Perfect for beach or island scenes.
 *
 * @example
 * ```tsx
 * <AdvancedWater
 *     position={[0, -0.5, 0]}
 *     size={[100, 100]}
 *     segments={128}
 *     waterColor={0x4ab4e4}      // Bright turquoise
 *     deepWaterColor={0x2a8ab4}  // Medium blue
 *     foamColor={0xd4e4f4}       // Light foam
 *     causticIntensity={0.8}     // Strong caustics (clear water)
 * />
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/water/Water.tsx#L59 AdvancedWater}
 *
 * @category Preset
 * @apiExample AdvancedWater - Tropical Preset
 */
export function Example_TropicalLagoonWater() {
  return {
    component: 'AdvancedWater',
    props: {
      position: [0, -0.5, 0] as [number, number, number],
      size: [100, 100] as [number, number],
      segments: 128,
      waterColor: 0x4ab4e4,
      deepWaterColor: 0x2a8ab4,
      foamColor: 0xd4e4f4,
      causticIntensity: 0.8,
    },
    description: 'Crystal-clear tropical lagoon with bright colors',
    apiCalls: ['AdvancedWater'],
    preset: 'Tropical Lagoon',
    characteristics: {
      depth: 'Shallow (0.5 units below surface)',
      area: '100x100 units',
      clarity: 'Crystal clear',
      color: 'Bright turquoise',
      caustics: 'Strong and visible',
    },
  };
}

/**
 * Example 6: Murky Swamp Water
 *
 * Dark, muddy water with minimal transparency.
 * Suitable for swamps, bayous, or polluted water.
 *
 * @example
 * ```tsx
 * <AdvancedWater
 *     position={[0, -0.2, 0]}
 *     size={[80, 80]}
 *     segments={64}
 *     waterColor={0x3a4a2a}      // Muddy green
 *     deepWaterColor={0x1a2a1a}  // Dark murky
 *     foamColor={0x5a6a4a}       // Dirty foam
 *     causticIntensity={0.05}    // Almost no caustics
 * />
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/water/Water.tsx#L59 AdvancedWater}
 *
 * @category Preset
 * @apiExample AdvancedWater - Swamp Preset
 */
export function Example_MurkySwampWater() {
  return {
    component: 'AdvancedWater',
    props: {
      position: [0, -0.2, 0] as [number, number, number],
      size: [80, 80] as [number, number],
      segments: 64,
      waterColor: 0x3a4a2a,
      deepWaterColor: 0x1a2a1a,
      foamColor: 0x5a6a4a,
      causticIntensity: 0.05,
    },
    description: 'Dark, murky swamp water with low clarity',
    apiCalls: ['AdvancedWater'],
    preset: 'Murky Swamp',
    characteristics: {
      depth: 'Very shallow',
      area: '80x80 units',
      clarity: 'Nearly opaque',
      color: 'Muddy green-brown',
      caustics: 'Almost invisible',
    },
  };
}

/**
 * Example 7: Water with Underwater Caustics on Terrain
 *
 * Demonstrates how to project water caustics onto underwater terrain.
 * Requires setting up both water and terrain with proper materials.
 *
 * @example
 * ```tsx
 * // Water surface
 * <AdvancedWater
 *     position={[0, 2, 0]}
 *     size={[200, 200]}
 *     causticIntensity={0.7}
 * />
 *
 * // Terrain receives caustics
 * <mesh geometry={terrainGeometry}>
 *     <meshStandardMaterial
 *         color={0x8a7a6a}
 *         roughness={0.9}
 *         // Caustics are projected via lighting
 *     />
 * </mesh>
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/water/Water.tsx#L59 AdvancedWater}
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/shaders/water.ts Water Caustics Shader}
 *
 * @category Advanced
 * @apiExample AdvancedWater with caustics projection
 */
export function Example_WaterWithCausticsProjection() {
  return {
    component: 'AdvancedWater',
    props: {
      position: [0, 2, 0] as [number, number, number],
      size: [200, 200] as [number, number],
      segments: 128,
      waterColor: 0x2a6a9a,
      causticIntensity: 0.7,
    },
    description: 'Water with caustics projected onto underwater terrain',
    apiCalls: ['AdvancedWater'],
    setup: {
      water: 'Position water surface at appropriate height',
      terrain: 'Ensure terrain is below water surface',
      lighting: 'Directional light simulates sun rays',
      caustics: 'Procedurally generated in shader',
    },
    features: [
      'Real-time caustics calculation',
      'Projected onto underlying geometry',
      'Animated caustic patterns',
      'Depth-aware intensity',
    ],
  };
}

/**
 * Example 8: Complete Water Scene Setup
 *
 * A complete scene showing best practices for water integration
 * including shorelines, depth transitions, and environmental setup.
 *
 * @example
 * ```tsx
 * function WaterScene() {
 *     return (
 *         <>
 *             {/* Lighting for water reflections *\/}
 *             <directionalLight position={[10, 20, 10]} intensity={1.5} />
 *             <ambientLight intensity={0.4} />
 *
 *             {/* Sky reflection *\/}
 *             <Sky sunPosition={[100, 20, 100]} />
 *
 *             {/* Main water body *\/}
 *             <AdvancedWater
 *                 position={[0, 0, 0]}
 *                 size={[300, 300]}
 *                 segments={256}
 *                 waterColor={0x2a5a8a}
 *                 causticIntensity={0.5}
 *             />
 *
 *             {/* Underwater terrain *\/}
 *             <mesh position={[0, -10, 0]}>
 *                 <planeGeometry args={[300, 300, 128, 128]} />
 *                 <meshStandardMaterial color={0x6a5a4a} />
 *             </mesh>
 *         </>
 *     );
 * }
 * ```
 *
 * @see {@link https://github.com/jbcom/nodejs-strata/blob/main/src/presets/water/Water.tsx Water Components}
 *
 * @category Complete
 * @apiExample Complete water scene integration
 */
export function Example_CompleteWaterScene() {
  return {
    description: 'Complete water scene with proper lighting and environment',
    components: [
      {
        type: 'AdvancedWater',
        props: {
          position: [0, 0, 0],
          size: [300, 300],
          segments: 256,
          waterColor: 0x2a5a8a,
          causticIntensity: 0.5,
        },
      },
      {
        type: 'directionalLight',
        props: {
          position: [10, 20, 10],
          intensity: 1.5,
          castShadow: true,
        },
      },
      {
        type: 'Sky',
        props: {
          sunPosition: [100, 20, 100],
        },
      },
    ],
    bestPractices: [
      'Position directional light to simulate sun',
      'Use sky component for realistic reflections',
      'Match water color to environment mood',
      'Adjust caustic intensity based on water clarity',
      'Use appropriate segment count for performance',
      'Consider shoreline vegetation integration',
    ],
  };
}

/**
 * All water examples exported for showcase
 */
export const WaterExamples = {
  Example_BasicWater,
  Example_AdvancedWaterWithCaustics,
  Example_CustomWaterMaterial,
  Example_DeepOceanWater,
  Example_TropicalLagoonWater,
  Example_MurkySwampWater,
  Example_WaterWithCausticsProjection,
  Example_CompleteWaterScene,
};
