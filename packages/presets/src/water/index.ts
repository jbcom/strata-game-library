/**
 * Water Materials and Geometry - Core TypeScript (no React).
 * @packageDocumentation
 * @module presets/water
 */

import { createAdvancedWaterMaterial, createWaterMaterial } from '@strata-game-library/core';

export { createWaterMaterial, createAdvancedWaterMaterial };

/**
 * Tropical Ocean Water Preset
 */
export const tropicalOceanWater = {
  waterColor: 0x00ffcc,
  deepWaterColor: 0x003366,
  foamColor: 0xffffff,
  causticIntensity: 0.6,
};

/**
 * Arctic/Icy Water Preset
 */
export const arcticWater = {
  waterColor: 0x88ccff,
  deepWaterColor: 0x001133,
  foamColor: 0xeeeeee,
  causticIntensity: 0.2,
};

/**
 * Swamp/Murky Water Preset
 */
export const swampWater = {
  waterColor: 0x445522,
  deepWaterColor: 0x112200,
  foamColor: 0x889966,
  causticIntensity: 0.1,
};
