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

// Particle Systems - React components
export { ParticleEmitter, ParticleBurst } from '../components';

export type { ParticleEmitterProps, ParticleEmitterRef, ParticleBurstProps } from '../components';

// Particle Systems - Core utilities
export { ParticleEmitter as CoreParticleEmitter, createParticleEmitter } from '../core';

export type {
    ParticleEmitterConfig,
    EmissionShape,
    ParticleForces,
    ParticleBehavior,
    EmitterShapeParams,
} from '../core';

// Weather Effects - React components
export { Rain, Snow, Lightning, WeatherEffects } from '../components';

export type { RainProps, SnowProps, LightningProps, WeatherSystemProps } from '../components';

// Weather Effects - Core utilities
export {
    WeatherSystem as CoreWeatherSystem,
    WindSimulation,
    createWeatherSystem,
    createWindSimulation,
    calculateTemperature,
    getPrecipitationType,
} from '../core';

export type {
    WeatherType,
    WeatherStateConfig,
    WeatherTransition,
    WindConfig,
    TemperatureConfig,
} from '../core';

// Weather state from components
export type { WeatherState } from '../components';

// Decals & Billboards - React components
export { Decal, Billboard, AnimatedBillboard, DecalPool } from '../components';

export type {
    DecalProps,
    DecalRef,
    BillboardProps,
    BillboardRef,
    AnimatedBillboardProps,
    AnimatedBillboardRef,
    DecalPoolProps,
    DecalPoolRef,
} from '../components';

// Decals & Billboards - Core utilities
export {
    DecalProjector,
    updateBillboardRotation,
    createBillboardMatrix,
    sortBillboardsByDepth,
    createSpriteSheetAnimation,
    updateSpriteSheetAnimation,
    getSpriteSheetUVs,
    applySpriteSheetFrame,
    createSpriteSheetMaterial,
    createDecalTexture,
    createBulletHoleTexture,
    createBloodSplatterTexture,
    createScorchMarkTexture,
    createFootprintTexture,
    createWaterPuddleTexture,
} from '../core';

export type {
    DecalProjectorConfig,
    DecalInstance,
    BillboardConfig,
    SpriteSheetConfig,
    SpriteAnimationState,
} from '../core';

// LOD System - React components
export { LODMesh, LODGroup, Impostor, LODVegetation } from '../components';

export type {
    LODMeshProps,
    LODMeshRef,
    LODGroupProps,
    LODGroupRef,
    ImpostorProps,
    ImpostorRef,
    LODVegetationProps,
    LODVegetationRef,
} from '../components';

// LOD System - Core utilities
export {
    LODManager,
    calculateLODLevel,
    createLODLevels,
    simplifyGeometry,
    generateLODGeometries,
    createImpostorTexture,
    createImpostorGeometry,
    updateImpostorUV,
    calculateImpostorAngle,
    interpolateLODMaterials,
    createDitherPattern,
    calculateScreenSpaceSize,
    shouldUseLOD,
    createVegetationLODLevels,
    calculateVegetationDensity,
    batchLODObjects,
} from '../core';

export type {
    LODLevel,
    LODConfig,
    LODState,
    ImpostorConfig,
    SimplificationOptions,
    VegetationLODConfig,
} from '../core';

// God Rays & Volumetric Lighting - React components
export { GodRays, LightShafts, VolumetricSpotlight, VolumetricPointLight } from '../components';

export type {
    GodRaysProps,
    GodRaysRef,
    VolumetricSpotlightProps,
    VolumetricSpotlightRef,
    VolumetricPointLightProps,
    VolumetricPointLightRef,
} from '../components';

// God Rays & Volumetric Lighting - Core utilities
export {
    createGodRaysMaterial,
    createVolumetricSpotlightMaterial,
    createVolumetricPointLightMaterial,
    createSpotlightConeGeometry,
    createPointLightSphereGeometry,
    calculateRadialBlur,
    calculateSunOcclusion,
    calculateScatteringIntensity,
    getLightScreenPosition,
    calculateGodRayIntensityFromAngle,
    updateGodRaysLightPosition,
    blendGodRayColors,
} from '../core';

export type {
    GodRaysMaterialOptions,
    VolumetricSpotlightMaterialOptions,
    VolumetricPointLightMaterialOptions,
    RadialBlurOptions,
    OcclusionResult,
    ScatteringParams,
} from '../core';
