/**
 * React component exports
 */

export type {
    StateConfig,
    YukaEntityManagerContextValue,
    YukaEntityManagerProps,
    YukaNavMeshProps,
    YukaNavMeshRef,
    YukaPathProps,
    YukaPathRef,
    YukaStateMachineProps,
    YukaStateMachineRef,
    YukaVehicleProps,
    YukaVehicleRef,
} from './AI';
// AI (YukaJS integration)
export {
    syncYukaToThree,
    threeVector3ToYuka,
    useYukaContext,
    YukaEntityManager,
    YukaNavMesh,
    YukaPath,
    YukaStateMachine,
    YukaVehicle,
    yukaVector3ToThree,
} from './AI';
export type {
    BlinkControllerProps,
    BlinkControllerRef,
    BreathingAnimationProps,
    BreathingAnimationRef,
    HeadTrackerProps,
    HeadTrackerRef,
    IKChainProps,
    IKChainRef,
    IKLimbProps,
    IKLimbRef,
    LookAtProps,
    LookAtRef,
    ProceduralWalkProps,
    ProceduralWalkRef,
    SpringBoneProps,
    SpringBoneRef,
    TailPhysicsProps,
    TailPhysicsRef,
} from './Animation';
// Animation
export {
    BlinkController,
    BreathingAnimation,
    HeadTracker,
    IKChain,
    IKLimb,
    LookAt,
    ProceduralWalk,
    SpringBone,
    TailPhysics,
} from './Animation';
export type {
    AmbientAudioProps,
    AmbientAudioRef,
    AudioContextValue,
    AudioEmitterProps,
    AudioEmitterRef,
    AudioEnvironmentProps,
    AudioListenerProps,
    AudioProviderProps,
    AudioZoneProps,
    AudioZoneRef,
    FootstepAudioProps,
    FootstepAudioRef,
    PositionalAudioProps,
    PositionalAudioRef,
    WeatherAudioProps,
} from './Audio';
// Audio
export {
    AmbientAudio,
    AudioEmitter,
    AudioEnvironment,
    AudioListener,
    AudioProvider,
    AudioZone,
    FootstepAudio,
    PositionalAudio,
    useAudioContext,
    useAudioManager,
    WeatherAudio,
} from './Audio';
export type {
    CameraShakeProps,
    CameraShakeRef,
    CameraTransitionProps,
    CinematicCameraProps,
    CinematicCameraRef,
    FollowCameraProps,
    FollowCameraRef,
    FPSCameraProps,
    FPSCameraRef,
    OrbitCameraProps,
    OrbitCameraRef,
} from './Camera';
// Camera
export {
    CameraShake,
    CinematicCamera,
    FollowCamera,
    FPSCamera,
    OrbitCamera,
    useCameraTransition,
} from './Camera';
export type { CloudLayerProps, CloudSkyProps, VolumetricCloudsProps } from './Clouds';
// Clouds
export { CloudLayer, CloudSky, VolumetricClouds } from './Clouds';
export type {
    AnimatedBillboardProps,
    AnimatedBillboardRef,
    BillboardProps,
    BillboardRef,
    DecalPoolProps,
    DecalPoolRef,
    DecalProps,
    DecalRef,
} from './Decals';
// Decals and Billboards
export { AnimatedBillboard, Billboard, Decal, DecalPool } from './Decals';
export type {
    GodRaysProps,
    GodRaysRef,
    VolumetricPointLightProps,
    VolumetricPointLightRef,
    VolumetricSpotlightProps,
    VolumetricSpotlightRef,
} from './GodRays';
// God Rays and Volumetric Lighting
export { GodRays, LightShafts, VolumetricPointLight, VolumetricSpotlight } from './GodRays';
export type {
    GroundSwitchProps,
    GroundSwitchRef,
    InputControlEvents,
    InputControlRef,
    Joystick3DProps,
    Joystick3DRef,
    PressurePlateProps,
    PressurePlateRef,
    TriggerBehavior,
    TriggerBehaviorConfig,
    TriggerComposerProps,
    TriggerComposerRef,
    TriggerConfig,
    TriggerMaterialConfig,
    TriggerShape,
    WallButtonProps,
    WallButtonRef,
} from './Input';
// Input Controls
export { GroundSwitch, Joystick3D, PressurePlate, TriggerComposer, WallButton } from './Input';
export type { BiomeData, InstanceData } from './Instancing';
// Instancing
export {
    GPUInstancedMesh,
    GrassInstances,
    generateInstanceData,
    RockInstances,
    TreeInstances,
} from './Instancing';
export type {
    ImpostorProps,
    ImpostorRef,
    LODGroupProps,
    LODGroupRef,
    LODMeshProps,
    LODMeshRef,
    LODVegetationProps,
    LODVegetationRef,
} from './LOD';
// LOD (Level of Detail)
export { Impostor, LODGroup, LODMesh, LODVegetation } from './LOD';
export type { ParticleBurstProps, ParticleEmitterProps, ParticleEmitterRef } from './Particles';
// Particles
export { ParticleBurst, ParticleEmitter } from './Particles';
export type {
    BuoyancyProps,
    BuoyancyRef,
    CharacterControllerProps,
    CharacterControllerRef,
    DestructibleProps,
    DestructibleRef,
    RagdollProps,
    RagdollRef,
    VehicleBodyProps,
    VehicleBodyRef,
} from './Physics';
// Physics
export { Buoyancy, CharacterController, Destructible, Ragdoll, VehicleBody } from './Physics';
export type {
    CinematicEffectsProps,
    DreamyEffectsProps,
    DynamicDOFProps,
    DynamicDOFRef,
    EffectStackProps,
    HorrorEffectsProps,
    MotionBlurEffectProps,
    NeonEffectsProps,
    RealisticEffectsProps,
    VintageEffectsProps,
} from './PostProcessing';
// Post-Processing
export {
    CinematicEffects,
    DreamyEffects,
    DynamicDOF,
    EffectStack,
    HorrorEffects,
    MotionBlurEffect,
    NeonEffects,
    RealisticEffects,
    VintageEffects,
} from './PostProcessing';
// Ray marching
export { Raymarching } from './Raymarching';
export type {
    CrystalMeshProps,
    CrystalMeshRef,
    DissolveMeshProps,
    DissolveMeshRef,
    ForcefieldProps,
    ForcefieldRef,
    GlitchMeshProps,
    GlitchMeshRef,
    GradientMeshProps,
    GradientMeshRef,
    HologramMeshProps,
    HologramMeshRef,
    OutlineProps,
    ToonMeshProps,
    ToonMeshRef,
} from './Shaders';
// Shader Components
export {
    CrystalMesh,
    DissolveMesh,
    Forcefield,
    GlitchMesh,
    GradientMesh,
    HologramMesh,
    Outline,
    ToonMesh,
} from './Shaders';
export type { TimeOfDayState, WeatherState } from './Sky';
// Sky
export { createTimeOfDay, ProceduralSky } from './Sky';
export type {
    AutoSaveConfig,
    CheckpointData,
    GameStateContextValue,
    GameStateProviderProps,
    GameStore,
    GameStoreApi,
    PersistGateProps,
    StateChangeEvent,
    StateDebuggerProps,
    UseAutoSaveOptions,
    UseAutoSaveReturn,
    UseCheckpointReturn,
    UseSaveLoadOptions,
    UseSaveLoadReturn,
    UseUndoReturn,
} from './State';
// State Management
export {
    GameStateContext,
    GameStateProvider,
    PersistGate,
    StateDebugger,
    useAutoSave,
    useCheckpoint,
    useGameState,
    useGameStateContext,
    useSaveLoad,
    useUndo,
} from './State';
export type {
    CrosshairProps,
    DamageNumberProps,
    DialogBoxProps,
    DialogBoxRef,
    HealthBarProps,
    HealthBarRef,
    InventoryProps,
    InventoryRef,
    MinimapProps,
    NameplateProps,
    NameplateRef,
    NotificationProps,
    ProgressBar3DProps,
    TooltipProps,
} from './UI';
// UI Components
export {
    Crosshair,
    DamageNumber,
    DialogBox,
    HealthBar,
    Inventory,
    Minimap,
    Nameplate,
    Notification,
    ProgressBar3D,
    Tooltip,
} from './UI';
// Volumetric effects
export {
    EnhancedFog,
    UnderwaterOverlay,
    VolumetricEffects,
    VolumetricFogMesh,
} from './VolumetricEffects';
// Water
export { AdvancedWater, Water } from './Water';
export type { LightningProps, RainProps, SnowProps, WeatherSystemProps } from './Weather';
// Weather
export { Lightning, Rain, Snow, WeatherSystem as WeatherEffects } from './Weather';
