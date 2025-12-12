/**
 * Core algorithm exports
 */

export type {
    BoneChain,
    BoneConstraint,
    GaitConfig,
    GaitState,
    IKSolverResult,
    LookAtConfig,
    LookAtState,
    SpringConfig,
    SpringState,
} from './animation';
// Animation system
export {
    CCDSolver,
    calculateBoneRotation,
    clampAngle,
    // Alias to avoid potential collision with camera utilities
    clampAngle as animationClampAngle,
    createBoneChain,
    createBoneChainFromLengths,
    dampedSpring,
    dampedSpringVector3,
    FABRIKSolver,
    hermiteInterpolate,
    LookAtController,
    ProceduralGait,
    SpringChain,
    SpringDynamics,
    sampleCurve,
    TwoBoneIKSolver,
} from './animation';
export type {
    AudioBus,
    AudioConfig,
    AudioFormat,
    AudioListenerState,
    AudioMixer,
    DistanceModel,
    EnvironmentEffectConfig,
    EnvironmentPreset,
    SoundConfig,
    SpatialConfig,
} from './audio';
// Audio system
export {
    createSoundManager,
    createSpatialAudio,
    DEFAULT_SPATIAL_CONFIG,
    ENVIRONMENT_PRESETS,
    getAudioContext,
    Howl,
    Howler,
    isAudioContextUnlocked,
    resumeAudioContext,
    SoundManager,
    SpatialAudio,
    setupAutoUnlock,
    suspendAudioContext,
    unlockAudioContext,
} from './audio';
export type {
    CameraPath,
    CameraShakeConfig,
    FOVTransitionConfig,
    ScreenShakeIntensity,
} from './camera';
// Camera utilities
export {
    CameraShake,
    calculateHeadBob,
    calculateLookAhead,
    calculateScreenShakeIntensity,
    easeInCubic,
    easeInOutCubic,
    easeOutCubic,
    easeOutElastic,
    evaluateCatmullRom,
    FOVTransition,
    lerp,
    lerpVector3,
    slerp,
    smoothDamp,
    smoothDampVector3,
} from './camera';
export * from './clouds';
export type {
    BillboardConfig,
    DecalInstance,
    DecalProjectorConfig,
    SpriteAnimationState,
    SpriteSheetConfig,
} from './decals';
// Decals
export * from './decals';
// Decals and billboards
export {
    applySpriteSheetFrame,
    createBillboardMatrix,
    createBloodSplatterTexture,
    createBulletHoleTexture,
    createDecalTexture,
    createFootprintTexture,
    createScorchMarkTexture,
    createSpriteSheetAnimation,
    createSpriteSheetMaterial,
    createWaterPuddleTexture,
    DecalProjector,
    getSpriteSheetUVs,
    sortBillboardsByDepth,
    updateBillboardRotation,
    updateSpriteSheetAnimation,
} from './decals';
// ECS module
export * from './ecs';
export * from './godRays';
export type {
    DragState,
    GamepadState,
    HapticPattern,
    InputAxis,
    InputEvent,
    InputManagerConfig,
    PointerState,
} from './input';
// Input system
export {
    angleToAxis,
    axisToAngle,
    axisToMagnitude,
    clampAxis,
    createInputManager,
    HapticFeedback,
    InputManager,
    InputStateMachine,
    normalizeAxisValue,
} from './input';
export type { BiomeData as InstancingBiomeData, InstanceData } from './instancing';
// Core modules (pure TypeScript, no React)
export { createInstancedMesh, generateInstanceData } from './instancing';
export type {
    ImpostorConfig,
    LODConfig,
    LODLevel,
    LODState,
    SimplificationOptions,
    VegetationLODConfig,
} from './lod';
// LOD
export * from './lod';
// LOD (Level of Detail)
export {
    batchLODObjects,
    calculateImpostorAngle,
    calculateLODLevel,
    calculateScreenSpaceSize,
    calculateVegetationDensity,
    createDitherPattern,
    createImpostorGeometry,
    createImpostorTexture,
    createLODLevels,
    createVegetationLODLevels,
    generateLODGeometries,
    interpolateLODMaterials,
    LODManager,
    shouldUseLOD,
    simplifyGeometry,
    updateImpostorUV,
} from './lod';
export type { MarchingCubesOptions, MarchingCubesResult, TerrainChunk } from './marching-cubes';
// Marching cubes
export {
    createGeometryFromMarchingCubes,
    generateTerrainChunk,
    marchingCubes,
} from './marching-cubes';
export type {
    EmissionShape,
    EmitterShapeParams,
    ParticleBehavior,
    ParticleEmitterConfig,
    ParticleForces,
} from './particles';
// Particles (pure TypeScript)
export { createParticleEmitter, ParticleEmitter } from './particles';
export type {
    BuoyancyConfig,
    CharacterControllerConfig,
    CollisionFilter,
    DestructibleConfig,
    PhysicsConfig,
    PhysicsMaterial,
    RagdollBodyPart,
    RagdollConfig,
    RagdollJointConfig,
    VehicleConfig,
    WheelConfig,
} from './physics';
// Physics system
export {
    applyDrag,
    CollisionLayer,
    calculateBuoyancyForce,
    calculateExplosionForce,
    calculateForce,
    calculateImpulse,
    calculateJumpImpulse,
    calculateLandingVelocity,
    calculateSlopeAngle,
    calculateSteeringAngle,
    calculateSuspensionForce,
    collisionFilters,
    createDefaultBuoyancyConfig,
    createDefaultCharacterConfig,
    createDefaultDestructibleConfig,
    createDefaultPhysicsConfig,
    createDefaultVehicleConfig,
    createHumanoidRagdoll,
    generateDebrisVelocity,
    isWalkableSlope,
    projectVelocityOntoGround,
} from './physics';
export type {
    BloomSettings,
    BrightnessContrastSettings,
    ChromaticAberrationSettings,
    ColorGradingSettings,
    DOFSettings,
    FilmGrainSettings,
    LUTConfig,
    NoiseSettings,
    PostProcessingMood,
    PostProcessingPreset,
    SepiaSettings,
    SSAOSettings,
    ToneMappingSettings,
    VignetteSettings,
} from './postProcessing';
// Post-Processing utilities
export {
    apertureToBokehScale,
    blendPostProcessingPresets,
    calculateFocusDistance,
    calculateFocusDistanceToMesh,
    defaultEffectSettings,
    dofScenarios,
    focalLengthToFOV,
    fovToFocalLength,
    getTimeOfDayEffects,
    lutConfigs,
} from './postProcessing';
export * from './raymarching';
export type { BiomeData as SDFBiomeData } from './sdf';
// SDF primitives and operations
export {
    // Utilities
    calcNormal,
    fbm,
    // Terrain
    getBiomeAt,
    getTerrainHeight,
    // Noise functions
    noise3D,
    opIntersection,
    opSmoothIntersection,
    opSmoothSubtraction,
    opSmoothUnion,
    opSubtraction,
    // Boolean operations
    opUnion,
    sdBox,
    sdCapsule,
    sdCaves,
    sdCone,
    sdPlane,
    sdRock,
    // Primitives
    sdSphere,
    sdTerrain,
    sdTorus,
    warpedFbm,
} from './sdf';
export type {
    AnimationChunk,
    ColorChunk,
    EffectsChunk,
    LightingChunk,
    NoiseChunk,
    ShaderChunkCategory,
    ShaderUniform,
    ShaderUniforms,
    UVChunk,
} from './shaders';
// Shader utilities
export {
    animationSnippet,
    buildFragmentShader,
    buildVertexShader,
    colorSnippet,
    composeShaderChunks,
    createColorUniform,
    createProgressUniform,
    createTimeUniform,
    createVector2Uniform,
    createVector3Uniform,
    lightingSnippet,
    noiseSnippet,
    ShaderChunks,
} from './shaders';
// Shared utilities
export * from './shared';
export * from './sky';
export type {
    AutoSaveConfig,
    CheckpointData,
    CheckpointOptions,
    GameStore,
    GameStoreActions,
    GameStoreApi,
    GameStoreState,
    PersistenceAdapter,
    SaveData,
    StateChangeEvent,
    StateChangeType,
    StateListener,
    StoreConfig,
} from './state';
// State management system (Zustand-based)
export {
    calculateChecksum,
    create,
    createGameStore,
    createPersistenceAdapter,
    createWebPersistenceAdapter,
    immer,
    temporal,
    useStore,
    verifyChecksum,
    webPersistenceAdapter,
} from './state';
export type {
    CrosshairConfig,
    DamageNumberConfig,
    DialogChoice,
    DialogConfig,
    DialogLine,
    InventoryConfig,
    InventorySlot,
    MinimapConfig,
    MinimapMarker,
    NameplateConfig,
    NotificationConfig,
    ProgressBarConfig,
    ScreenPosition,
    TextDirection,
    TooltipConfig,
    UIAnchor,
} from './ui';
// UI system
export {
    calculateFade,
    clampProgress,
    createDefaultCrosshair,
    createDefaultDamageNumber,
    createDefaultDialog,
    createDefaultInventory,
    createDefaultMinimap,
    createDefaultNameplate,
    createDefaultNotification,
    createDefaultProgressBar,
    createDefaultTooltip,
    easeOutCubic as uiEaseOutCubic,
    easeOutElastic as uiEaseOutElastic,
    formatNumber,
    formatProgressText,
    getAnchorOffset,
    getDamageNumberColor,
    getNotificationColor,
    getNotificationIcon,
    getTextDirection,
    // UI-specific aliases for lerp/easing functions
    lerp as uiLerp,
    screenToWorld,
    worldToScreen,
} from './ui';
export * from './volumetrics';
export * from './water';
export type {
    TemperatureConfig,
    WeatherStateConfig,
    WeatherTransition,
    WeatherType,
    WindConfig,
} from './weather';
// Weather system
export {
    calculateTemperature,
    createWeatherSystem,
    createWindSimulation,
    getPrecipitationType,
    WeatherSystem,
    WindSimulation,
} from './weather';
