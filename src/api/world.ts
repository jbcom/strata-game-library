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

export type {
    CloudLayerProps,
    CloudSkyProps,
    TimeOfDayState,
    VolumetricCloudsProps,
} from '../components';
// Water Systems
// Vegetation
// Sky & Atmosphere
// Volumetric Effects
export {
    AdvancedWater,
    CloudLayer,
    CloudSky,
    createTimeOfDay,
    EnhancedFog,
    GPUInstancedMesh,
    GrassInstances,
    ProceduralSky,
    RockInstances,
    TreeInstances,
    UnderwaterOverlay,
    VolumetricClouds,
    VolumetricEffects,
    VolumetricFogMesh,
    Water,
} from '../components';
export type {
    AdvancedWaterMaterialOptions,
    BiomeData,
    CloudLayerConfig,
    CloudMaterialOptions,
    CloudSkyConfig,
    InstanceData,
    MarchingCubesOptions,
    MarchingCubesResult,
    TerrainChunk,
    VolumetricCloudOptions,
} from '../core';
// Terrain Generation
export {
    adaptCloudColorsForTimeOfDay,
    calcNormal,
    calculateWindOffset,
    createAdvancedWaterMaterial,
    createCloudLayerGeometry,
    createCloudLayerMaterial,
    createDefaultCloudSkyConfig,
    createGeometryFromMarchingCubes,
    createInstancedMesh,
    createSkyGeometry,
    createSkyMaterial,
    createUnderwaterOverlayMaterial,
    createVolumetricCloudGeometry,
    createVolumetricCloudMaterial,
    createVolumetricFogMeshMaterial,
    createWaterGeometry,
    createWaterMaterial,
    fbm,
    fbmNoise2D,
    generateTerrainChunk,
    getBiomeAt,
    getTerrainHeight,
    marchingCubes,
    noise3D,
    opIntersection,
    opSmoothIntersection,
    opSmoothSubtraction,
    opSmoothUnion,
    opSubtraction,
    opUnion,
    sampleCloudDensity,
    sdBox,
    sdCapsule,
    sdCaves,
    sdCone,
    sdPlane,
    sdRock,
    sdSphere,
    sdTerrain,
    sdTorus,
    warpedFbm,
} from '../core';
