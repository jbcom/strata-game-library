/**
 * React component exports
 */

// Water
export { Water, AdvancedWater } from './Water';

// Instancing
export {
    GPUInstancedMesh,
    GrassInstances,
    TreeInstances,
    RockInstances,
    generateInstanceData,
} from './Instancing';
export type { InstanceData, BiomeData } from './Instancing';

// Sky
export { ProceduralSky, createTimeOfDay } from './Sky';
export type { TimeOfDayState, WeatherState } from './Sky';

// Clouds
export { CloudLayer, CloudSky, VolumetricClouds } from './Clouds';
export type { CloudLayerProps, CloudSkyProps, VolumetricCloudsProps } from './Clouds';

// Volumetric effects
export {
    VolumetricEffects,
    VolumetricFogMesh,
    UnderwaterOverlay,
    EnhancedFog,
} from './VolumetricEffects';

// Ray marching
export { Raymarching } from './Raymarching';

// Particles
export { ParticleEmitter, ParticleBurst } from './Particles';
export type { ParticleEmitterProps, ParticleEmitterRef, ParticleBurstProps } from './Particles';

// Weather
export { Rain, Snow, Lightning, WeatherSystem as WeatherEffects } from './Weather';
export type { RainProps, SnowProps, LightningProps, WeatherSystemProps } from './Weather';

// Camera
export {
    FollowCamera,
    OrbitCamera,
    FPSCamera,
    CinematicCamera,
    CameraShake,
    useCameraTransition,
} from './Camera';
export type {
    FollowCameraProps,
    FollowCameraRef,
    OrbitCameraProps,
    OrbitCameraRef,
    FPSCameraProps,
    FPSCameraRef,
    CinematicCameraProps,
    CinematicCameraRef,
    CameraShakeProps,
    CameraShakeRef,
    CameraTransitionProps,
} from './Camera';

// Decals and Billboards
export {
    Decal,
    Billboard,
    AnimatedBillboard,
    DecalPool,
} from './Decals';
export type {
    DecalProps,
    DecalRef,
    BillboardProps,
    BillboardRef,
    AnimatedBillboardProps,
    AnimatedBillboardRef,
    DecalPoolProps,
    DecalPoolRef,
} from './Decals';

// LOD (Level of Detail)
export {
    LODMesh,
    LODGroup,
    Impostor,
    LODVegetation,
} from './LOD';
export type {
    LODMeshProps,
    LODMeshRef,
    LODGroupProps,
    LODGroupRef,
    ImpostorProps,
    ImpostorRef,
    LODVegetationProps,
    LODVegetationRef,
} from './LOD';

// God Rays and Volumetric Lighting
export {
    GodRays,
    LightShafts,
    VolumetricSpotlight,
    VolumetricPointLight,
} from './GodRays';
export type {
    GodRaysProps,
    GodRaysRef,
    VolumetricSpotlightProps,
    VolumetricSpotlightRef,
    VolumetricPointLightProps,
    VolumetricPointLightRef,
} from './GodRays';

// Input Controls
export {
    Joystick3D,
    GroundSwitch,
    PressurePlate,
    WallButton,
    TriggerComposer,
} from './Input';
export type {
    InputControlRef,
    InputControlEvents,
    Joystick3DProps,
    Joystick3DRef,
    GroundSwitchProps,
    GroundSwitchRef,
    PressurePlateProps,
    PressurePlateRef,
    WallButtonProps,
    WallButtonRef,
    TriggerShape,
    TriggerBehavior,
    TriggerConfig,
    TriggerMaterialConfig,
    TriggerBehaviorConfig,
    TriggerComposerProps,
    TriggerComposerRef,
} from './Input';

// AI (YukaJS integration)
export {
    YukaEntityManager,
    YukaVehicle,
    YukaPath,
    YukaStateMachine,
    YukaNavMesh,
    useYukaContext,
    yukaVector3ToThree,
    threeVector3ToYuka,
    syncYukaToThree,
} from './AI';
export type {
    YukaEntityManagerContextValue,
    YukaEntityManagerProps,
    YukaVehicleProps,
    YukaVehicleRef,
    YukaPathProps,
    YukaPathRef,
    StateConfig,
    YukaStateMachineProps,
    YukaStateMachineRef,
    YukaNavMeshProps,
    YukaNavMeshRef,
} from './AI';

// Audio
export {
    AudioProvider,
    AudioListener,
    PositionalAudio,
    AmbientAudio,
    AudioZone,
    AudioEmitter,
    AudioEnvironment,
    FootstepAudio,
    WeatherAudio,
    useAudioContext,
    useAudioManager,
} from './Audio';
export type {
    AudioContextValue,
    AudioProviderProps,
    AudioListenerProps,
    PositionalAudioProps,
    PositionalAudioRef,
    AmbientAudioProps,
    AmbientAudioRef,
    AudioZoneProps,
    AudioZoneRef,
    AudioEmitterProps,
    AudioEmitterRef,
    AudioEnvironmentProps,
    FootstepAudioProps,
    FootstepAudioRef,
    WeatherAudioProps,
} from './Audio';

// Physics
export {
    CharacterController,
    VehicleBody,
    Destructible,
    Buoyancy,
    Ragdoll,
} from './Physics';
export type {
    CharacterControllerProps,
    CharacterControllerRef,
    VehicleBodyProps,
    VehicleBodyRef,
    DestructibleProps,
    DestructibleRef,
    BuoyancyProps,
    BuoyancyRef,
    RagdollProps,
    RagdollRef,
} from './Physics';

// Post-Processing
export {
    EffectStack,
    CinematicEffects,
    DreamyEffects,
    HorrorEffects,
    NeonEffects,
    RealisticEffects,
    VintageEffects,
    DynamicDOF,
    MotionBlurEffect,
} from './PostProcessing';
export type {
    EffectStackProps,
    CinematicEffectsProps,
    DreamyEffectsProps,
    HorrorEffectsProps,
    NeonEffectsProps,
    RealisticEffectsProps,
    VintageEffectsProps,
    DynamicDOFProps,
    DynamicDOFRef,
    MotionBlurEffectProps,
} from './PostProcessing';
