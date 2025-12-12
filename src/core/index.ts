/**
 * Core algorithm exports
 */

// Shared utilities
export * from './shared';

// ECS module
export * from './ecs';

// Core modules (pure TypeScript, no React)
export { generateInstanceData, createInstancedMesh } from './instancing';
export type { InstanceData, BiomeData as InstancingBiomeData } from './instancing';

// Weather system
export {
    WeatherSystem,
    WindSimulation,
    createWeatherSystem,
    createWindSimulation,
    calculateTemperature,
    getPrecipitationType,
} from './weather';
export type {
    WeatherType,
    WeatherStateConfig,
    WeatherTransition,
    WindConfig,
    TemperatureConfig,
} from './weather';

// Particles (pure TypeScript)
export { ParticleEmitter, createParticleEmitter } from './particles';
export type {
    ParticleEmitterConfig,
    EmissionShape,
    ParticleForces,
    ParticleBehavior,
    EmitterShapeParams,
} from './particles';

export * from './water';
export * from './raymarching';
export * from './sky';
export * from './volumetrics';
export * from './clouds';
export * from './godRays';

// SDF primitives and operations
export {
    // Primitives
    sdSphere,
    sdBox,
    sdPlane,
    sdCapsule,
    sdTorus,
    sdCone,

    // Boolean operations
    opUnion,
    opSubtraction,
    opIntersection,
    opSmoothUnion,
    opSmoothSubtraction,
    opSmoothIntersection,

    // Noise functions
    noise3D,
    fbm,
    warpedFbm,

    // Terrain
    getBiomeAt,
    getTerrainHeight,
    sdCaves,
    sdTerrain,
    sdRock,

    // Utilities
    calcNormal,
} from './sdf';
export type { BiomeData as SDFBiomeData } from './sdf';

// Marching cubes
export {
    marchingCubes,
    createGeometryFromMarchingCubes,
    generateTerrainChunk,
} from './marching-cubes';
export type { MarchingCubesResult, MarchingCubesOptions, TerrainChunk } from './marching-cubes';

// Camera utilities
export {
    lerp,
    lerpVector3,
    slerp,
    smoothDamp,
    smoothDampVector3,
    CameraShake,
    FOVTransition,
    easeInOutCubic,
    easeOutCubic,
    easeInCubic,
    easeOutElastic,
    evaluateCatmullRom,
    calculateLookAhead,
    calculateHeadBob,
    calculateScreenShakeIntensity,
} from './camera';
export type {
    CameraShakeConfig,
    FOVTransitionConfig,
    CameraPath,
    ScreenShakeIntensity,
} from './camera';

// Decals and billboards
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
} from './decals';
export type {
    DecalProjectorConfig,
    DecalInstance,
    BillboardConfig,
    SpriteSheetConfig,
    SpriteAnimationState,
} from './decals';

// LOD (Level of Detail)
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
} from './lod';
export type {
    LODLevel,
    LODConfig,
    LODState,
    ImpostorConfig,
    SimplificationOptions,
    VegetationLODConfig,
} from './lod';

// Input system
export {
    InputManager,
    InputStateMachine,
    HapticFeedback,
    createInputManager,
    normalizeAxisValue,
    clampAxis,
    axisToAngle,
    axisToMagnitude,
    angleToAxis,
} from './input';
export type {
    DragState,
    InputAxis,
    InputEvent,
    HapticPattern,
    GamepadState,
    PointerState,
    InputManagerConfig,
} from './input';

// Audio system
// Note: Howl and Howler from howler.js are not re-exported to avoid tight coupling.
// Import directly from 'howler' if needed.
export {
    SoundManager,
    SpatialAudio,
    createSoundManager,
    createSpatialAudio,
    ENVIRONMENT_PRESETS,
    DEFAULT_SPATIAL_CONFIG,
    isAudioContextUnlocked,
    unlockAudioContext,
    setupAutoUnlock,
    getAudioContext,
    suspendAudioContext,
    resumeAudioContext,
} from './audio';
export type {
    AudioConfig,
    SoundConfig,
    SpatialConfig,
    AudioBus,
    AudioMixer,
    DistanceModel,
    AudioFormat,
    EnvironmentPreset,
    EnvironmentEffectConfig,
    AudioListenerState,
} from './audio';

// Physics system
export {
    CollisionLayer,
    collisionFilters,
    calculateImpulse,
    calculateForce,
    calculateJumpImpulse,
    calculateLandingVelocity,
    applyDrag,
    calculateBuoyancyForce,
    calculateSlopeAngle,
    isWalkableSlope,
    projectVelocityOntoGround,
    calculateSteeringAngle,
    calculateSuspensionForce,
    calculateExplosionForce,
    generateDebrisVelocity,
    createDefaultPhysicsConfig,
    createDefaultCharacterConfig,
    createDefaultVehicleConfig,
    createHumanoidRagdoll,
    createDefaultDestructibleConfig,
    createDefaultBuoyancyConfig,
} from './physics';
export type {
    PhysicsConfig,
    CollisionFilter,
    CharacterControllerConfig,
    VehicleConfig,
    WheelConfig,
    RagdollJointConfig,
    RagdollBodyPart,
    RagdollConfig,
    PhysicsMaterial,
    DestructibleConfig,
    BuoyancyConfig,
} from './physics';

// Post-Processing utilities
export {
    calculateFocusDistance,
    calculateFocusDistanceToMesh,
    focalLengthToFOV,
    fovToFocalLength,
    apertureToBokehScale,
    dofScenarios,
    defaultEffectSettings,
    lutConfigs,
    blendPostProcessingPresets,
    getTimeOfDayEffects,
} from './postProcessing';
export type {
    PostProcessingMood,
    PostProcessingPreset,
    BloomSettings,
    DOFSettings,
    VignetteSettings,
    ChromaticAberrationSettings,
    FilmGrainSettings,
    ColorGradingSettings,
    SSAOSettings,
    ToneMappingSettings,
    NoiseSettings,
    BrightnessContrastSettings,
    SepiaSettings,
    LUTConfig,
} from './postProcessing';

// Animation system
export {
    FABRIKSolver,
    CCDSolver,
    TwoBoneIKSolver,
    LookAtController,
    SpringDynamics,
    SpringChain,
    ProceduralGait,
    createBoneChain,
    createBoneChainFromLengths,
    // Alias to avoid potential collision with camera utilities
    clampAngle as animationClampAngle,
    dampedSpring,
    dampedSpringVector3,
    hermiteInterpolate,
    sampleCurve,
    calculateBoneRotation,
} from './animation';
export type {
    BoneChain,
    BoneConstraint,
    IKSolverResult,
    SpringConfig,
    SpringState,
    GaitConfig,
    GaitState,
    LookAtConfig,
    LookAtState,
} from './animation';

// State management system (Zustand-based)
// Note: Zustand's create, useStore, temporal, and immer are not re-exported.
// Import directly from 'zustand' and related packages if needed.
export {
    createGameStore,
    createPersistenceAdapter,
    calculateChecksum,
    verifyChecksum,
    webPersistenceAdapter,
    createWebPersistenceAdapter,
} from './state';
export type {
    GameStore,
    GameStoreApi,
    GameStoreState,
    GameStoreActions,
    StoreConfig,
    SaveData,
    CheckpointData,
    CheckpointOptions,
    PersistenceAdapter,
    StateChangeType,
    StateChangeEvent,
    StateListener,
    AutoSaveConfig,
} from './state';

// UI system
// Note: lerp, easeOutCubic, easeOutElastic are available from the camera module.
// UI-specific aliases removed to avoid duplicate exports.
export {
    getAnchorOffset,
    worldToScreen,
    screenToWorld,
    calculateFade,
    formatProgressText,
    clampProgress,
    getTextDirection,
    createDefaultProgressBar,
    createDefaultInventory,
    createDefaultDialog,
    createDefaultTooltip,
    createDefaultNotification,
    createDefaultMinimap,
    createDefaultCrosshair,
    createDefaultDamageNumber,
    createDefaultNameplate,
    getDamageNumberColor,
    formatNumber,
    getNotificationIcon,
    getNotificationColor,
} from './ui';
export type {
    UIAnchor,
    TextDirection,
    ProgressBarConfig,
    InventorySlot,
    InventoryConfig,
    DialogLine,
    DialogChoice,
    DialogConfig,
    TooltipConfig,
    NotificationConfig,
    MinimapConfig,
    MinimapMarker,
    CrosshairConfig,
    DamageNumberConfig,
    NameplateConfig,
    ScreenPosition,
} from './ui';

// Shader utilities
export {
    ShaderChunks,
    createTimeUniform,
    createProgressUniform,
    createColorUniform,
    createVector2Uniform,
    createVector3Uniform,
    composeShaderChunks,
    buildVertexShader,
    buildFragmentShader,
    noiseSnippet,
    lightingSnippet,
    colorSnippet,
    animationSnippet,
} from './shaders';
export type {
    ShaderUniform,
    ShaderUniforms,
    ShaderChunkCategory,
    NoiseChunk,
    LightingChunk,
    UVChunk,
    ColorChunk,
    AnimationChunk,
    EffectsChunk,
} from './shaders';

// Decals
export * from './decals';

// LOD
export * from './lod';
