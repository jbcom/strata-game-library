/**
 * Strata Presets - Organized game development primitives
 *
 * This module exports all preset systems organized by layer:
 * - Background: Sky, volumetrics, terrain
 * - Midground: Water, vegetation, instancing
 * - Foreground: Characters, fur, shells, molecular
 */

// Background Layer
export * from '../core/sky';
export * from '../core/volumetrics';
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
} from '../core/sdf';
export type { BiomeData } from '../core/sdf';
export * from '../core/marching-cubes';
export * from './terrain';

// Midground Layer
export * from './water';
export { generateInstanceData, createInstancedMesh } from '../core/instancing';
export type { InstanceData } from '../core/instancing';
export * from '../core/raymarching';
export * from './vegetation';

// Foreground Layer
export * from './fur';
export * from './characters';
export * from './molecular';
export * from './particles';
export * from './decals';
export * from './billboards';

// Lighting & Effects
export * from './shadows';
export * from './postprocessing';
export * from './reflections';
export * from './lighting';

// Weather
export * from './weather';

// Clouds
export * from './clouds';

// Re-export types
export type { FurOptions, FurUniforms } from './fur';
export type { CharacterJoints, CharacterOptions, CharacterState } from './characters';
export type { MolecularOptions, AtomData, BondData } from './molecular';
export type { TerrainOptions } from './terrain';
export type { VegetationOptions } from './vegetation';
export type { ParticleEmitterOptions, ParticleSystem } from './particles';
export type { DecalOptions, DecalPresetOptions } from './decals';
export type { BillboardOptions } from './billboards';
export type { ShadowSystemOptions, ShadowSystem } from './shadows';
export type {
    PostProcessingOptions,
    PostProcessingEffect,
    PostProcessingPipeline,
} from './postprocessing';
export type { ReflectionProbeOptions, ReflectionProbe } from './reflections';
export type { WeatherPreset, WeatherPresetName } from './weather';
export type { CloudPreset, CloudPresetName } from './clouds';
export type { LightingPreset, LightingPresetName } from './lighting';

// Camera presets
export * from './camera';
export type { CameraPreset, CameraPresetName } from './camera';

// LOD presets
export * from './lod';
export type { LODPreset, LODPresetName } from './lod';

// Input presets
export * from './input';
export type {
    InputPreset,
    JoystickPreset,
    SwitchPreset,
    PlatePreset,
    ButtonPreset,
    TriggerPreset,
    InputPresetType,
} from './input';

// AI presets
export {
    createGuardPreset,
    createPreyPreset,
    createPredatorPreset,
    createFlockMemberPreset,
    createFollowerPreset,
    createFlock,
} from './ai';
export type {
    AIPresetConfig,
    GuardPresetConfig,
    PreyPresetConfig,
    PredatorPresetConfig,
    FlockMemberPresetConfig,
    FollowerPresetConfig,
    AIPresetResult,
    FlockConfig,
    AIPresetName,
} from './ai';

// Audio presets
export {
    audioPresets,
    footstepPresets,
    combatSoundPresets,
    weatherAudioPresets,
    spatialAudioConfigs,
    getAudioPreset,
    getFootstepPreset,
    getCombatSoundPreset,
    createCustomAudioPreset,
    calculateWeatherAudioIntensity,
} from './audio';
export type {
    AudioPresetName,
    SurfaceType,
    AmbienceLayer,
    AudioPreset,
    FootstepPreset,
    CombatSoundPreset,
    WeatherAudioPreset,
    SpatialAudioConfig,
} from './audio';

// Physics presets
export {
    characterPresets,
    vehiclePresets,
    materialPresets,
    destructiblePresets,
    buoyancyPresets,
    getCharacterPreset,
    getVehiclePreset,
    getMaterialPreset,
    getDestructiblePreset,
    getBuoyancyPreset,
    FPS_CHARACTER_PRESET,
    THIRD_PERSON_CHARACTER_PRESET,
    PLATFORMER_CHARACTER_PRESET,
    TANK_CHARACTER_PRESET,
    CAR_VEHICLE_PRESET,
    TRUCK_VEHICLE_PRESET,
    MOTORCYCLE_VEHICLE_PRESET,
    SPORTS_CAR_PRESET,
    ICE_MATERIAL_PRESET,
    RUBBER_MATERIAL_PRESET,
    METAL_MATERIAL_PRESET,
    WOOD_MATERIAL_PRESET,
    CONCRETE_MATERIAL_PRESET,
    BOUNCY_MATERIAL_PRESET,
    MUD_MATERIAL_PRESET,
    WOODEN_CRATE_PRESET,
    GLASS_PRESET,
    STONE_PRESET,
    LIGHT_BUOYANCY_PRESET,
    MEDIUM_BUOYANCY_PRESET,
    HEAVY_BUOYANCY_PRESET,
    BOAT_BUOYANCY_PRESET,
} from './physics';
export type {
    CharacterPreset,
    VehiclePreset,
    MaterialPreset,
    DestructiblePreset,
    BuoyancyPreset,
} from './physics';

// Animation presets
export {
    ikPresets,
    springPresets,
    gaitPresets,
    lookAtPresets,
    HUMAN_ARM_IK_PRESET,
    HUMAN_LEG_IK_PRESET,
    SPIDER_LEG_IK_PRESET,
    TENTACLE_IK_PRESET,
    FINGER_IK_PRESET,
    SPINE_IK_PRESET,
    TAIL_IK_PRESET,
    STIFF_SPRING_PRESET,
    BOUNCY_SPRING_PRESET,
    FLOPPY_SPRING_PRESET,
    HAIR_SPRING_PRESET,
    CLOTH_SPRING_PRESET,
    JELLY_SPRING_PRESET,
    WALK_GAIT_PRESET,
    RUN_GAIT_PRESET,
    SNEAK_GAIT_PRESET,
    LIMP_GAIT_PRESET,
    MARCH_GAIT_PRESET,
    CRAWL_GAIT_PRESET,
    LAZY_LOOKAT_PRESET,
    SNAPPY_LOOKAT_PRESET,
    SMOOTH_LOOKAT_PRESET,
    ROBOTIC_LOOKAT_PRESET,
    ORGANIC_LOOKAT_PRESET,
    getIKPreset,
    getSpringPreset,
    getGaitPreset,
    getLookAtPreset,
    createCustomIKPreset,
    createCustomSpringPreset,
    createCustomGaitPreset,
    blendSpringPresets,
    blendGaitPresets,
} from './animation';
export type {
    IKPreset,
    SpringPreset,
    GaitPreset,
    LookAtPreset,
    IKPresetName,
    SpringPresetName,
    GaitPresetName,
    LookAtPresetName,
} from './animation';

// State presets
export {
    DEFAULT_RPG_STATE,
    DEFAULT_PUZZLE_STATE,
    DEFAULT_PLATFORMER_STATE,
    DEFAULT_SANDBOX_STATE,
    DEFAULT_COUNTER_STATE,
    RPG_STATE_PRESET,
    PUZZLE_STATE_PRESET,
    PLATFORMER_STATE_PRESET,
    SANDBOX_STATE_PRESET,
    COUNTER_STATE_PRESET,
    ALL_STATE_PRESETS,
    getStatePreset,
    AUTOSAVE_CONFIG_FREQUENT,
    AUTOSAVE_CONFIG_MODERATE,
    AUTOSAVE_CONFIG_INFREQUENT,
    AUTOSAVE_CONFIG_DISABLED,
    createRPGState,
    createPuzzleState,
    createPlatformerState,
    createSandboxState,
    addExperience,
    addInventoryItem,
    completeQuest,
    unlockLevel,
    collectCoin,
    loseLife,
    placeBlock,
    removeBlock,
} from './state';
export type {
    RPGPlayerStats,
    InventoryItem,
    Quest,
    RPGState,
    PuzzleGameState,
    PlatformerState,
    Vec3,
    SandboxBlock,
    SandboxEntity,
    SandboxState,
    SimpleCounterState,
    StatePresetName,
    StatePreset,
} from './state';
