/**
 * @module Effects
 * @category Effects & Atmosphere
 *
 * Effects & Atmosphere - Particles, Weather, Lighting, and Decals
 *
 * Visual effects that bring your world to life - from rain and snow
 * to explosions and god rays.
 *
 * @example
 * ```tsx
 * import { ParticleEmitter, Rain, GodRays } from '@jbcom/strata/api/effects';
 *
 * function WeatherScene() {
 *   return (
 *     <>
 *       <Rain intensity={0.5} />
 *       <GodRays lightPosition={[10, 20, 0]} />
 *       <ParticleEmitter preset="fire" position={[0, 0, 0]} />
 *     </>
 *   );
 * }
 * ```
 */

// Weather state from components
export type {
    AnimatedBillboardProps,
    AnimatedBillboardRef,
    BillboardProps,
    BillboardRef,
    DecalPoolProps,
    DecalPoolRef,
    DecalProps,
    DecalRef,
    GodRaysProps,
    GodRaysRef,
    ImpostorProps,
    ImpostorRef,
    LightningProps,
    LODGroupProps,
    LODGroupRef,
    LODMeshProps,
    LODMeshRef,
    LODVegetationProps,
    LODVegetationRef,
    ParticleBurstProps,
    ParticleEmitterProps,
    ParticleEmitterRef,
    RainProps,
    SnowProps,
    VolumetricPointLightProps,
    VolumetricPointLightRef,
    VolumetricSpotlightProps,
    VolumetricSpotlightRef,
    WeatherState,
    WeatherSystemProps,
} from '../components';
// Particle Systems - React components
// Weather Effects - React components
// Decals & Billboards - React components
// LOD System - React components
// God Rays & Volumetric Lighting - React components
export {
    AnimatedBillboard,
    Billboard,
    Decal,
    DecalPool,
    GodRays,
    Impostor,
    Lightning,
    LightShafts,
    LODGroup,
    LODMesh,
    LODVegetation,
    ParticleBurst,
    ParticleEmitter,
    Rain,
    Snow,
    VolumetricPointLight,
    VolumetricSpotlight,
} from '../components';
export type {
    BillboardConfig,
    DecalInstance,
    DecalProjectorConfig,
    EmissionShape,
    EmitterShapeParams,
    GodRaysMaterialOptions,
    ImpostorConfig,
    LODConfig,
    LODLevel,
    LODState,
    ParticleBehavior,
    ParticleEmitterConfig,
    ParticleForces,
    SimplificationOptions,
    SpriteAnimationState,
    SpriteSheetConfig,
    TemperatureConfig,
    VegetationLODConfig,
    VolumetricPointLightMaterialOptions,
    VolumetricSpotlightMaterialOptions,
    WeatherStateConfig,
    WeatherTransition,
    WeatherType,
    WindConfig,
} from '../core';
// Particle Systems - Core utilities
// Weather Effects - Core utilities
// Decals & Billboards - Core utilities
// LOD System - Core utilities
// God Rays & Volumetric Lighting - Core utilities
export {
    applySpriteSheetFrame,
    batchLODObjects,
    blendGodRayColors,
    calculateGodRayIntensityFromAngle,
    calculateImpostorAngle,
    calculateLODLevel,
    calculateScatteringIntensity,
    calculateScreenSpaceSize,
    calculateTemperature,
    calculateVegetationDensity,
    createBillboardMatrix,
    createBloodSplatterTexture,
    createBulletHoleTexture,
    createDecalTexture,
    createDitherPattern,
    createFootprintTexture,
    createGodRaysMaterial,
    createImpostorGeometry,
    createImpostorTexture,
    createLODLevels,
    createParticleEmitter,
    createPointLightSphereGeometry,
    createScorchMarkTexture,
    createSpotlightConeGeometry,
    createSpriteSheetAnimation,
    createSpriteSheetMaterial,
    createVegetationLODLevels,
    createVolumetricPointLightMaterial,
    createVolumetricSpotlightMaterial,
    createWaterPuddleTexture,
    createWeatherSystem,
    createWindSimulation,
    DecalProjector,
    generateLODGeometries,
    getLightScreenPosition,
    getPrecipitationType,
    getSpriteSheetUVs,
    interpolateLODMaterials,
    LODManager,
    ParticleEmitter as CoreParticleEmitter,
    shouldUseLOD,
    simplifyGeometry,
    sortBillboardsByDepth,
    updateBillboardRotation,
    updateImpostorUV,
    updateSpriteSheetAnimation,
    WeatherSystem as CoreWeatherSystem,
    WindSimulation,
} from '../core';
