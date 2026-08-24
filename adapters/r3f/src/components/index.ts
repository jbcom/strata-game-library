/**
 * React component exports.
 *
 * This module exports all React components for building games with Strata.
 * Components are organized by category for easy discovery.
 *
 * @packageDocumentation
 * @module components
 * @category Components
 *
 * @example
 * ```tsx
 * import {
 *   // AI
 *   AIAgent, SteeringBehavior,
 *   // Animation
 *   AnimationController,
 *   // Camera
 *   FollowCamera, FixedPerspectiveCamera,
 *   // Parallax
 *   ParallaxBackground, ProceduralBackgroundComponent,
 *   // UI
 *   VirtualJoystick, ScreenFlash,
 * } from '@strata-game-library/core';
 * ```
 */

export { YukaEntityManager, YukaNavMesh, YukaPath, YukaStateMachine, YukaVehicle, createPolygonsFromGeometry, syncYukaToThree, threeVector3ToYuka, useYukaContext, yukaVector3ToThree } from "./ai";
export type { StateConfig, YukaEntityManagerContextValue, YukaEntityManagerProps, YukaNavMeshProps, YukaNavMeshRef, YukaPathProps, YukaPathRef, YukaStateMachineProps, YukaStateMachineRef, YukaVehicleProps, YukaVehicleRef } from "./ai";
export { BlinkController, BreathingAnimation, HeadTracker, IKChain, IKLimb, LookAt, ProceduralWalk, SpringBone, TailPhysics } from "./animation";
export type { BlinkControllerProps, BlinkControllerRef, BreathingAnimationProps, BreathingAnimationRef, HeadTrackerProps, HeadTrackerRef, IKChainProps, IKChainRef, IKLimbProps, IKLimbRef, LookAtProps, LookAtRef, ProceduralWalkProps, ProceduralWalkRef, SpringBoneProps, SpringBoneRef, TailPhysicsProps, TailPhysicsRef } from "./animation";
export { AmbientAudio, AudioEmitter, AudioEnvironment, AudioListener, AudioProvider, AudioZone, FootstepAudio, PositionalAudio, WeatherAudio, useAudioContext, useAudioListener, useAudioManager, useSpatialAudio } from "./audio";
export type { AmbientAudioProps, AmbientAudioRef, AudioContextValue, AudioEmitterProps, AudioEmitterRef, AudioEnvironmentProps, AudioListenerProps, AudioProviderProps, AudioZoneProps, AudioZoneRef, FootstepAudioProps, FootstepAudioRef, PositionalAudioProps, PositionalAudioRef, WeatherAudioProps } from "./audio";
export { CameraShake, CinematicCamera, FPSCamera, FixedPerspectiveCamera, FollowCamera, GyroscopeCamera, OrbitCamera, getCameraPosition, screenToWorld, useCameraTransition } from "./camera";
export type { CameraShakeProps, CameraShakeRef, CameraTransitionConfig, CinematicCameraProps, CinematicCameraRef, FPSCameraProps, FPSCameraRef, FixedPerspectiveCameraProps, FollowCameraProps, FollowCameraRef, GyroscopeCameraProps, OrbitCameraProps, OrbitCameraRef, PerspectivePreset } from "./camera";
export { CloudLayer, CloudSky, VolumetricClouds } from "./clouds";
export type { CloudLayerProps, CloudSkyProps, VolumetricCloudsProps } from "./clouds";
export { RUNTIME_PROP_CANNON_BODY_TYPES, RUNTIME_PROP_RAPIER_BODY_TYPES, RuntimeAssetMesh, RuntimeCreature, RuntimeCreatureAsset, RuntimeGeometry, RuntimeProp, RuntimePropInteractionPanel, applyRuntimeCreatureAnimationBlend, applyRuntimeCreatureIKPose, applyRuntimeCreaturePose, applyRuntimePropInteractionPhysicsEffects, attachRuntimePropCannonPhysicsHandle, attachRuntimePropPhysicsHandle, attachRuntimePropRapierPhysicsHandle, collectRuntimeCreatureSourceBoneNames, createRuntimeCreatureAnimationController, createRuntimeCreatureAnimationGraphController, createRuntimeCreatureAnimationStateController, createRuntimeCreatureAnimationTrackNameMap, createRuntimeCreatureAssetRigBinding, createRuntimeCreatureIKPose, createRuntimeCreaturePoseTargetMap, createRuntimeGeometry, createRuntimeMaterial, createRuntimePropCannonPhysicsHandle, createRuntimePropObjectPhysicsAdapter, createRuntimePropRapierPhysicsHandle, crossFadeRuntimeCreatureAnimationAction, getDefaultRuntimePropInteractionAction, playRuntimeCreatureAnimationAction, resolveRuntimeCreatureAnimationClipName, resolveRuntimeMaterial, retargetRuntimeCreatureAnimationClip, stopRuntimeCreatureAnimationAction, useRuntimePropInteractionController } from "./compose";
export type { RuntimeAssetMaterialMode, RuntimeCreatureAnimationActionContext, RuntimeCreatureAnimationActionMap, RuntimeCreatureAnimationBlendApplication, RuntimeCreatureAnimationBlendEntry, RuntimeCreatureAnimationBlendOptions, RuntimeCreatureAnimationController, RuntimeCreatureAnimationCrossFadeOptions, RuntimeCreatureAnimationGraphController, RuntimeCreatureAnimationGraphControllerOptions, RuntimeCreatureAnimationGraphTransitionContext, RuntimeCreatureAnimationGraphTransitionGuard, RuntimeCreatureAnimationGraphTransitionGuardMap, RuntimeCreatureAnimationPlaybackOptions, RuntimeCreatureAnimationRetargetDirection, RuntimeCreatureAnimationRetargetMetadata, RuntimeCreatureAnimationRetargetOptions, RuntimeCreatureAnimationStateController, RuntimeCreatureAnimationStateDefinition, RuntimeCreatureAnimationStateEnterOptions, RuntimeCreatureAnimationStateGuard, RuntimeCreatureAnimationStateGuardContext, RuntimeCreatureAnimationStateTransitionMode, RuntimeCreatureAnimationStopOptions, RuntimeCreatureAssetMode, RuntimeCreatureAssetProps, RuntimeCreatureIKChainPose, RuntimeCreatureIKPoseApplication, RuntimeCreatureIKPoseOptions, RuntimeCreatureIKTarget, RuntimeCreatureIKTargetMap, RuntimeCreatureInput, RuntimeCreaturePose, RuntimeCreaturePoseApplication, RuntimeCreaturePoseChannel, RuntimeCreaturePoseOptions, RuntimeCreaturePoseQuaternion, RuntimeCreaturePoseScale, RuntimeCreaturePoseTransform, RuntimeCreaturePoseVector, RuntimeCreatureProps, RuntimeMaterialOptions, RuntimePropCannonBodyHandle, RuntimePropCannonBodyType, RuntimePropCannonPhysicsHandleOptions, RuntimePropInput, RuntimePropInteractionContext, RuntimePropInteractionControllerOptions, RuntimePropInteractionControllerState, RuntimePropInteractionHandler, RuntimePropInteractionPanelContext, RuntimePropInteractionPanelProps, RuntimePropInteractionPanelResultContext, RuntimePropInteractionSelector, RuntimePropObjectPhysicsAdapterOptions, RuntimePropPhysicsAdapter, RuntimePropPhysicsAdapterContext, RuntimePropPhysicsApplication, RuntimePropPhysicsApplicationOptions, RuntimePropPhysicsEffect, RuntimePropPhysicsHandle, RuntimePropPhysicsHandleAttachOptions, RuntimePropPhysicsObjectState, RuntimePropProps, RuntimePropRapierBodyType, RuntimePropRapierColliderHandle, RuntimePropRapierPhysicsHandleOptions, RuntimePropRapierRigidBodyHandle, RuntimeShapeRenderContext } from "./compose";
export { AnimatedBillboard, Billboard, Decal, DecalPool } from "./decals";
export type { AnimatedBillboardProps, AnimatedBillboardRef, BillboardConfig, BillboardProps, BillboardRef, DecalInstance, DecalPoolProps, DecalPoolRef, DecalProjectorConfig, DecalProps, DecalRef, SpriteAnimationState, SpriteSheetConfig } from "./decals";
export { GroundSwitch, Joystick3D, PressurePlate, TriggerComposer, WallButton } from "./input";
export type { DragState, GroundSwitchProps, GroundSwitchRef, InputAxis, InputControlEvents, InputControlRef, InputEvent, Joystick3DProps, Joystick3DRef, PressurePlateProps, PressurePlateRef, TriggerBehavior, TriggerBehaviorConfig, TriggerComposerProps, TriggerComposerRef, TriggerConfig, TriggerMaterialConfig, TriggerShape, WallButtonProps, WallButtonRef } from "./input";
export { DEFAULT_BIOMES, GPUInstancedMesh, GrassInstances, RockInstances, TreeInstances, generateBiomeInstanceData } from "./instancing";
export type { GPUInstancedMeshProps, VegetationProps } from "./instancing";
export { Impostor, LODGroup, LODMesh, LODVegetation } from "./lod";
export type { ImpostorConfig, ImpostorProps, ImpostorRef, LODConfig, LODGroupProps, LODGroupRef, LODLevel, LODMeshProps, LODMeshRef, LODState, LODVegetationProps, LODVegetationRef, VegetationLODConfig } from "./lod";
export { InfiniteRepeater, ParallaxBackground, ParallaxLayer, ProceduralBackgroundComponent, SideScrollerBackground, calculateRepeats, generateBackgroundLayers, useParallax } from "./parallax";
export type { GeneratedLayer, InfiniteRepeaterProps, ParallaxAnimationData, ParallaxBackgroundProps, ParallaxElement, ParallaxGradientData, ParallaxLayerConfig, ParallaxLayerProps, ParallaxParticleData, ParallaxShapeData, ParallaxState, ProceduralBackgroundComponentProps, ProceduralBackgroundConfig, SideScrollerBackgroundProps, UseParallaxOptions, UseParallaxReturn } from "./parallax";
export { ParticleBurst, ParticleEmitter, toVector3 } from "./particles";
export type { EmissionShape, EmitterShapeParams, ParticleBehavior, ParticleBurstProps, ParticleEmitterProps, ParticleEmitterRef, ParticleForces } from "./particles";
export { Buoyancy, CharacterController, Destructible, Ragdoll, VehicleBody } from "./physics";
export type { BuoyancyProps, BuoyancyRef, CharacterControllerProps, CharacterControllerRef, DestructibleProps, DestructibleRef, RagdollProps, RagdollRef, VehicleBodyProps, VehicleBodyRef } from "./physics";
export { CinematicEffects, DreamyEffects, DynamicDOF, EffectStack, HorrorEffects, MotionBlurEffect, NeonEffects, RealisticEffects, VintageEffects } from "./postprocessing";
export type { BloomSettings, BrightnessContrastSettings, ChromaticAberrationSettings, CinematicEffectsProps, ColorGradingSettings, DOFSettings, DreamyEffectsProps, DynamicDOFProps, DynamicDOFRef, EffectPresetProps, EffectStackProps, FilmGrainSettings, HorrorEffectsProps, MotionBlurEffectProps, NeonEffectsProps, PostProcessingPreset, RealisticEffectsProps, SSAOSettings, SepiaSettings, VignetteSettings, VintageEffectsProps } from "./postprocessing";
export { CrystalMesh, DissolveMesh, Forcefield, GlitchMesh, GradientMesh, HologramMesh, Outline, Raymarching, ToonMesh } from "./shaders";
export type { CrystalMeshProps, CrystalMeshRef, DissolveMeshProps, DissolveMeshRef, ForcefieldProps, ForcefieldRef, GlitchMeshProps, GlitchMeshRef, GradientMeshProps, GradientMeshRef, HologramMeshProps, HologramMeshRef, OutlineProps, RaymarchingProps, ShaderMeshProps, ShaderMeshRef, ToonMeshProps, ToonMeshRef } from "./shaders";
export { ProceduralSky, createTimeOfDay } from "./sky";
export type { ProceduralSkyProps, TimeOfDayState, WeatherState } from "./sky";
export { GameStateContext, GameStateProvider, PersistGate, StateDebugger, useAutoSave, useCheckpoint, useGameState, useGameStateContext, useSaveLoad, useUndo } from "./state";
export type { AutoSaveConfig, CheckpointData, GameStateContextValue, GameStateProviderProps, GameStore, GameStoreApi, PersistGateProps, StateChangeEvent, StateDebuggerProps, UseAutoSaveOptions, UseAutoSaveReturn, UseCheckpointReturn, UseSaveLoadOptions, UseSaveLoadReturn, UseUndoReturn } from "./state";
export { Crosshair, DamageNumber, DialogBox, GameHUD, HealthBar, Inventory, KillStreakNotification, Minimap, Nameplate, Notification, PauseMenu, ProgressBar3D, SceneCard, ScreenFlash, Tooltip, VirtualJoystick, createGameHUD, createPauseMenu, createSceneCard } from "./ui";
export type { CrosshairConfig, CrosshairProps, DamageNumberConfig, DamageNumberProps, DialogBoxProps, DialogBoxRef, DialogChoice, DialogConfig, DialogLine, GameHUDProps, HealthBarProps, HealthBarRef, InventoryConfig, InventoryProps, InventoryRef, InventorySlot, JoystickVector, KillStreakNotificationProps, MinimapConfig, MinimapProps, NameplateConfig, NameplateProps, NameplateRef, NotificationConfig, NotificationProps, PauseMenuProps, ProgressBar3DProps, ProgressBarConfig, SceneCardProps, ScreenFlashProps, TooltipConfig, TooltipProps, UIAnchor, VirtualJoystickProps } from "./ui";
export { EnhancedFog, GodRays, LightShafts, UnderwaterOverlay, VolumetricEffects, VolumetricFogMesh, VolumetricPointLight, VolumetricSpotlight } from "./volumetrics";
export type { EnhancedFogProps, GodRaysProps, GodRaysRef, UnderwaterOverlayProps, UnderwaterSettings, VolumetricEffectsProps, VolumetricFogMeshProps, VolumetricFogSettings, VolumetricPointLightProps, VolumetricPointLightRef, VolumetricSpotlightProps, VolumetricSpotlightRef } from "./volumetrics";
export { AdvancedWater, Water } from "./water";
export type { AdvancedWaterProps, WaterProps } from "./water";
export { Lightning, Rain, Snow, WeatherSystem } from "./weather";
export type { LightningProps, RainProps, SnowProps, WeatherSystemProps } from "./weather";
