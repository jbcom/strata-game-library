/**
 * Strata Presets - Organized game development primitives
 *
 * This module exports all preset systems organized by layer:
 * - Background: Sky, volumetrics, terrain
 * - Midground: Water, vegetation, instancing
 * - Foreground: Characters, fur, shells, molecular
 */

export type { InstanceData } from '../core/instancing';
export { createInstancedMesh, generateInstanceData } from '../core/instancing';
export * from '../core/marching-cubes';
export * from '../core/raymarching';
export type { BiomeData } from '../core/sdf';
export {
    calcNormal,
    fbm,
    getBiomeAt,
    getTerrainHeight,
    noise3D,
    opIntersection,
    opSmoothIntersection,
    opSmoothSubtraction,
    opSmoothUnion,
    opSubtraction,
    opUnion,
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
} from '../core/sdf';
// Background Layer
export * from '../core/sky';
export * from '../core/volumetrics';
export type {
    AIPresetConfig,
    AIPresetName,
    AIPresetResult,
    FlockConfig,
    FlockMemberPresetConfig,
    FollowerPresetConfig,
    GuardPresetConfig,
    PredatorPresetConfig,
    PreyPresetConfig,
} from './ai';
// AI presets
export {
    createFlock,
    createFlockMemberPreset,
    createFollowerPreset,
    createGuardPreset,
    createPredatorPreset,
    createPreyPreset,
} from './ai';
export type {
    GaitPreset,
    GaitPresetName,
    IKPreset,
    IKPresetName,
    LookAtPreset,
    LookAtPresetName,
    SpringPreset,
    SpringPresetName,
} from './animation';
// Animation presets
export {
    BOUNCY_SPRING_PRESET,
    blendGaitPresets,
    blendSpringPresets,
    CLOTH_SPRING_PRESET,
    CRAWL_GAIT_PRESET,
    createCustomGaitPreset,
    createCustomIKPreset,
    createCustomSpringPreset,
    FINGER_IK_PRESET,
    FLOPPY_SPRING_PRESET,
    gaitPresets,
    getGaitPreset,
    getIKPreset,
    getLookAtPreset,
    getSpringPreset,
    HAIR_SPRING_PRESET,
    HUMAN_ARM_IK_PRESET,
    HUMAN_LEG_IK_PRESET,
    ikPresets,
    JELLY_SPRING_PRESET,
    LAZY_LOOKAT_PRESET,
    LIMP_GAIT_PRESET,
    lookAtPresets,
    MARCH_GAIT_PRESET,
    ORGANIC_LOOKAT_PRESET,
    ROBOTIC_LOOKAT_PRESET,
    RUN_GAIT_PRESET,
    SMOOTH_LOOKAT_PRESET,
    SNAPPY_LOOKAT_PRESET,
    SNEAK_GAIT_PRESET,
    SPIDER_LEG_IK_PRESET,
    SPINE_IK_PRESET,
    STIFF_SPRING_PRESET,
    springPresets,
    TAIL_IK_PRESET,
    TENTACLE_IK_PRESET,
    WALK_GAIT_PRESET,
} from './animation';
export type {
    AmbienceLayer,
    AudioPreset,
    AudioPresetName,
    CombatSoundPreset,
    FootstepPreset,
    SpatialAudioConfig,
    SurfaceType,
    WeatherAudioPreset,
} from './audio';
// Audio presets
export {
    audioPresets,
    calculateWeatherAudioIntensity,
    combatSoundPresets,
    createCustomAudioPreset,
    footstepPresets,
    getAudioPreset,
    getCombatSoundPreset,
    getFootstepPreset,
    spatialAudioConfigs,
    weatherAudioPresets,
} from './audio';
export type { BillboardOptions } from './billboards';
export * from './billboards';
export type { CameraPreset, CameraPresetName } from './camera';
// Camera presets
export * from './camera';
export type { CharacterJoints, CharacterOptions, CharacterState } from './characters';
export * from './characters';
export type { CloudPreset, CloudPresetName } from './clouds';
// Clouds
export * from './clouds';
export type { DecalOptions, DecalPresetOptions } from './decals';
export * from './decals';
// Re-export types
export type { FurOptions, FurUniforms } from './fur';
// Foreground Layer
export * from './fur';
export type {
    ButtonPreset,
    InputPreset,
    InputPresetType,
    JoystickPreset,
    PlatePreset,
    SwitchPreset,
    TriggerPreset,
} from './input';
// Input presets
export * from './input';
export type { LightingPreset, LightingPresetName } from './lighting';
export * from './lighting';
export type { LODPreset, LODPresetName } from './lod';
// LOD presets
export * from './lod';
export type { AtomData, BondData, MolecularOptions } from './molecular';
export * from './molecular';
export type { ParticleEmitterOptions, ParticleSystem } from './particles';
export * from './particles';
export type {
    BuoyancyPreset,
    CharacterPreset,
    DestructiblePreset,
    MaterialPreset,
    VehiclePreset,
} from './physics';
// Physics presets
export {
    BOAT_BUOYANCY_PRESET,
    BOUNCY_MATERIAL_PRESET,
    buoyancyPresets,
    CAR_VEHICLE_PRESET,
    CONCRETE_MATERIAL_PRESET,
    characterPresets,
    destructiblePresets,
    FPS_CHARACTER_PRESET,
    GLASS_PRESET,
    getBuoyancyPreset,
    getCharacterPreset,
    getDestructiblePreset,
    getMaterialPreset,
    getVehiclePreset,
    HEAVY_BUOYANCY_PRESET,
    ICE_MATERIAL_PRESET,
    LIGHT_BUOYANCY_PRESET,
    MEDIUM_BUOYANCY_PRESET,
    METAL_MATERIAL_PRESET,
    MOTORCYCLE_VEHICLE_PRESET,
    MUD_MATERIAL_PRESET,
    materialPresets,
    PLATFORMER_CHARACTER_PRESET,
    RUBBER_MATERIAL_PRESET,
    SPORTS_CAR_PRESET,
    STONE_PRESET,
    TANK_CHARACTER_PRESET,
    THIRD_PERSON_CHARACTER_PRESET,
    TRUCK_VEHICLE_PRESET,
    vehiclePresets,
    WOOD_MATERIAL_PRESET,
    WOODEN_CRATE_PRESET,
} from './physics';
export type {
    PostProcessingEffect,
    PostProcessingOptions,
    PostProcessingPipeline,
} from './postprocessing';
export * from './postprocessing';
export type { ReflectionProbe, ReflectionProbeOptions } from './reflections';
export * from './reflections';
export type {
    ColorPalette,
    ColorPaletteName,
    CrystalPreset,
    CrystalPresetName,
    DissolvePreset,
    DissolvePresetName,
    ForcefieldPreset,
    ForcefieldPresetName,
    GlitchPreset,
    GlitchPresetName,
    GradientPreset,
    GradientPresetName,
    HologramPreset,
    HologramPresetName,
    ScanlinePreset,
    ScanlinePresetName,
    ToonPreset,
    ToonPresetName,
} from './shaders';
// Shader presets
export {
    colorPalettes,
    crystalPresets,
    dissolvePresets,
    forcefieldPresets,
    getColorPalette,
    getCrystalPreset,
    getDissolvePreset,
    getForcefieldPreset,
    getGlitchPreset,
    getGradientPreset,
    getHologramPreset,
    getScanlinePreset,
    getToonPreset,
    glitchPresets,
    gradientPresets,
    hologramPresets,
    scanlinePresets,
    toonPresets,
} from './shaders';
export type { ShadowSystem, ShadowSystemOptions } from './shadows';
// Lighting & Effects
export * from './shadows';
export type {
    InventoryItem,
    PlatformerState,
    PuzzleGameState,
    Quest,
    RPGPlayerStats,
    RPGState,
    SandboxBlock,
    SandboxEntity,
    SandboxState,
    SimpleCounterState,
    StatePreset,
    StatePresetName,
    Vec3,
} from './state';
// State presets
export {
    ALL_STATE_PRESETS,
    AUTOSAVE_CONFIG_DISABLED,
    AUTOSAVE_CONFIG_FREQUENT,
    AUTOSAVE_CONFIG_INFREQUENT,
    AUTOSAVE_CONFIG_MODERATE,
    addExperience,
    addInventoryItem,
    COUNTER_STATE_PRESET,
    collectCoin,
    completeQuest,
    createPlatformerState,
    createPuzzleState,
    createRPGState,
    createSandboxState,
    DEFAULT_COUNTER_STATE,
    DEFAULT_PLATFORMER_STATE,
    DEFAULT_PUZZLE_STATE,
    DEFAULT_RPG_STATE,
    DEFAULT_SANDBOX_STATE,
    getStatePreset,
    loseLife,
    PLATFORMER_STATE_PRESET,
    PUZZLE_STATE_PRESET,
    placeBlock,
    RPG_STATE_PRESET,
    removeBlock,
    SANDBOX_STATE_PRESET,
    unlockLevel,
} from './state';
export type { TerrainOptions } from './terrain';
export * from './terrain';
export type {
    CrosshairPreset,
    CrosshairPresetName,
    DialogPreset,
    DialogPresetName,
    HealthBarPreset,
    HealthBarPresetName,
    InventoryPreset,
    InventoryPresetName,
    MinimapPreset,
    MinimapPresetName,
    NotificationPreset,
    NotificationPresetName,
} from './ui';
// UI presets
export {
    CIRCLE_CROSSHAIR,
    CIRCULAR_MINIMAP,
    COMIC_DIALOG,
    COMPASS_MINIMAP,
    createCustomDialog,
    createCustomHealthBar,
    createCustomInventory,
    crosshairPresets,
    DEFAULT_CROSSHAIR,
    DOT_CROSSHAIR,
    dialogPresets,
    ERROR_NOTIFICATION,
    FPS_HEALTH_BAR,
    GRID_INVENTORY,
    getCrosshairPreset,
    getDialogPreset,
    getHealthBarPreset,
    getInventoryPreset,
    getMinimapPreset,
    getNotificationPreset,
    HOTBAR_INVENTORY,
    healthBarPresets,
    INFO_NOTIFICATION,
    inventoryPresets,
    LIST_INVENTORY,
    MINIMALIST_HEALTH_BAR,
    MMO_HEALTH_BAR,
    minimapPresets,
    notificationPresets,
    QUEST_NOTIFICATION,
    RADAR_MINIMAP,
    RETRO_HEALTH_BAR,
    RPG_DIALOG,
    RPG_HEALTH_BAR,
    SNIPER_CROSSHAIR,
    SQUARE_MINIMAP,
    SUBTITLE_DIALOG,
    SUCCESS_NOTIFICATION,
    TACTICAL_CROSSHAIR,
    VISUAL_NOVEL_DIALOG,
    WARNING_NOTIFICATION,
    WHEEL_INVENTORY,
} from './ui';
export type { VegetationOptions } from './vegetation';
export * from './vegetation';
// Midground Layer
export * from './water';
export type { WeatherPreset, WeatherPresetName } from './weather';
// Weather
export * from './weather';
