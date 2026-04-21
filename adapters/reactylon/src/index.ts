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
 * - StrataRuntimeProp / StrataRuntimeCreature: Composition runtime descriptors and Babylon instantiation helpers
 *
 * Hooks:
 * - useStrataScene: Configure fog, ambient light, and physics
 *
 * Materials (for direct Babylon.js integration):
 * - createBabylonRuntimeMaterial
 * - instantiateBabylonRuntimeProp
 * - instantiateBabylonRuntimePropAsync
 * - instantiateBabylonRuntimeCreature
 * - instantiateBabylonRuntimeCreatureAsset
 * - createBabylonWaterShaderMaterial
 * - createBabylonSkyShaderMaterial
 * - createBabylonTerrainShaderMaterial
 *
 * @packageDocumentation
 */

export {
  type BabylonRuntimeAssetLoader,
  type BabylonRuntimeAssetLoaderContext,
  type BabylonRuntimeAssetLoadingOptions,
  type BabylonRuntimeAssetLoadResult,
  type BabylonRuntimeCreatureAssetInstantiationOptions,
  type BabylonRuntimeCreatureInstance,
  type BabylonRuntimeCreatureInstantiationOptions,
  type BabylonRuntimeCreatureMeshFactory,
  type BabylonRuntimeInstantiationOptions,
  type BabylonRuntimeMaterialFactory,
  type BabylonRuntimeMaterialOptions,
  type BabylonRuntimeMeshFactoryContext,
  type BabylonRuntimePropAssetInstantiationOptions,
  type BabylonRuntimePropInstance,
  type BabylonRuntimePropInstantiationOptions,
  type BabylonRuntimePropMeshFactory,
  createBabylonRuntimeMaterial,
  createReactylonRuntimeMaterialDescriptor,
  instantiateBabylonRuntimeCreature,
  instantiateBabylonRuntimeCreatureAsset,
  instantiateBabylonRuntimeProp,
  instantiateBabylonRuntimePropAsync,
  type ReactylonCreatureInput,
  type ReactylonPropInput,
  type ReactylonRuntimeCreatureBoneDescriptor,
  type ReactylonRuntimeCreatureDescriptor,
  type ReactylonRuntimeMaterialDescriptor,
  type ReactylonRuntimeMaterialOptions,
  type ReactylonRuntimePropDescriptor,
  type ReactylonRuntimePropNodeDescriptor,
  type ReactylonRuntimeTransformOptions,
  resolveReactylonRuntimeCreature,
  resolveReactylonRuntimeProp,
  StrataRuntimeCreature,
  type StrataRuntimeCreatureProps,
  StrataRuntimeProp,
  type StrataRuntimePropProps,
} from './components/compose/index.js';
export {
  createTimeOfDay,
  StrataSky,
  type StrataSkyProps,
  type TimeOfDayState,
  type WeatherState,
} from './components/Sky.js';
export {
  StrataTerrain,
  type StrataTerrainProps,
  useStrataTerrainMaterial,
} from './components/Terrain.js';
// Components
export { StrataWater, type StrataWaterProps } from './components/Water.js';

// Hooks
export {
  type AmbientLightConfig,
  type FogConfig,
  type PhysicsConfig,
  type StrataSceneConfig,
  type StrataSceneResult,
  useStrataScene,
} from './hooks/useStrataScene.js';

// Material factories (for direct Babylon.js integration without Reactylon JSX)
export {
  type BabylonSkyMaterialHandle,
  type BabylonSkyMaterialOptions,
  type BabylonTerrainMaterialHandle,
  type BabylonTerrainMaterialOptions,
  type BabylonWaterMaterialHandle,
  type BabylonWaterMaterialOptions,
  createBabylonSkyShaderMaterial,
  createBabylonTerrainShaderMaterial,
  createBabylonWaterShaderMaterial,
  type SkyUniformValues,
  type TerrainUniformValues,
  type WaterUniformValues,
} from './materials/index.js';

// Version
export { version } from './version.js';
