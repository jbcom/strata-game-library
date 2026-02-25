/**
 * @strata-game-library/reactylon
 *
 * Babylon.js adapter for Strata Game Library via Reactylon.
 * Wraps core algorithms with Babylon.js rendering.
 *
 * Components:
 * - StrataWater: Animated water surface with caustics and foam
 * - StrataSky: Procedural sky with day/night cycles and weather
 * - StrataTerrain: Noise-based terrain with slope-dependent coloring
 *
 * Hooks:
 * - useStrataScene: Configure fog, ambient light, and physics
 *
 * Materials (for direct Babylon.js integration):
 * - createBabylonWaterShaderMaterial
 * - createBabylonSkyShaderMaterial
 * - createBabylonTerrainShaderMaterial
 *
 * @packageDocumentation
 */

// Components
export { StrataWater, type StrataWaterProps } from './components/Water.js';
export {
  StrataSky,
  createTimeOfDay,
  type StrataSkyProps,
  type TimeOfDayState,
  type WeatherState,
} from './components/Sky.js';
export {
  StrataTerrain,
  useStrataTerrainMaterial,
  type StrataTerrainProps,
} from './components/Terrain.js';

// Hooks
export {
  useStrataScene,
  type StrataSceneConfig,
  type StrataSceneResult,
  type FogConfig,
  type AmbientLightConfig,
  type PhysicsConfig,
} from './hooks/useStrataScene.js';

// Material factories (for direct Babylon.js integration without Reactylon JSX)
export {
  createBabylonWaterShaderMaterial,
  type BabylonWaterMaterialOptions,
  type BabylonWaterMaterialHandle,
  type WaterUniformValues,
  createBabylonSkyShaderMaterial,
  type BabylonSkyMaterialOptions,
  type BabylonSkyMaterialHandle,
  type SkyUniformValues,
  createBabylonTerrainShaderMaterial,
  type BabylonTerrainMaterialOptions,
  type BabylonTerrainMaterialHandle,
  type TerrainUniformValues,
} from './materials/index.js';

// Version
export { version } from './version.js';
