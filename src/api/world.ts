/**
 * @module World
 * @category World Building
 *
 * World Building - Terrain, Water, Vegetation, and Sky
 *
 * These systems form the foundation of your 3D world. Start here when
 * building environments, landscapes, and outdoor scenes.
 *
 * @example
 * ```tsx
 * import { Terrain, Water, GrassInstances, ProceduralSky } from '@jbcom/strata/api/world';
 *
 * function Scene() {
 *   return (
 *     <>
 *       <ProceduralSky timeOfDay={createTimeOfDay(14, 30)} />
 *       <Terrain size={256} resolution={64} />
 *       <Water size={100} />
 *       <GrassInstances count={5000} />
 *     </>
 *   );
 * }
 * ```
 */

// Terrain Generation
export {
    sdSphere,
    sdBox,
    sdPlane,
    sdCapsule,
    sdTorus,
    sdCone,
    opUnion,
    opSubtraction,
    opIntersection,
    opSmoothUnion,
    opSmoothSubtraction,
    opSmoothIntersection,
    noise3D,
    fbm,
    warpedFbm,
    getBiomeAt,
    getTerrainHeight,
    sdCaves,
    sdTerrain,
    sdRock,
    calcNormal,
    marchingCubes,
    createGeometryFromMarchingCubes,
    generateTerrainChunk,
    createWaterMaterial,
    createAdvancedWaterMaterial,
    createWaterGeometry,
    createInstancedMesh,
    createSkyMaterial,
    createSkyGeometry,
    createCloudLayerMaterial,
    createVolumetricCloudMaterial,
    createCloudLayerGeometry,
    createVolumetricCloudGeometry,
    adaptCloudColorsForTimeOfDay,
    calculateWindOffset,
    fbmNoise2D,
    sampleCloudDensity,
    createDefaultCloudSkyConfig,
    createVolumetricFogMeshMaterial,
    createUnderwaterOverlayMaterial,
} from '../core';

export type {
    SDFBiomeData,
    MarchingCubesResult,
    MarchingCubesOptions,
    TerrainChunk,
    InstanceData,
    InstancingBiomeData,
    CloudLayerConfig,
    CloudMaterialOptions,
    VolumetricCloudOptions,
    CloudSkyConfig,
} from '../core';

// Water Systems
export { Water, AdvancedWater } from '../components';

export type { AdvancedWaterMaterialOptions } from '../presets/water';

// Vegetation
export {
    GPUInstancedMesh,
    GrassInstances,
    TreeInstances,
    RockInstances,
    generateInstanceData,
} from '../components';

// Sky & Atmosphere
export {
    ProceduralSky,
    createTimeOfDay,
    CloudLayer,
    CloudSky,
    VolumetricClouds,
} from '../components';

export type {
    TimeOfDayState,
    CloudLayerProps,
    CloudSkyProps,
    VolumetricCloudsProps,
} from '../components';

// Volumetric Effects
export {
    VolumetricEffects,
    VolumetricFogMesh,
    UnderwaterOverlay,
    EnhancedFog,
} from '../components';
