import type { ThreeEvent } from '@react-three/fiber';
import type {
  CreateCreatureInput,
  CreatePropInput,
  CreatureComposition,
  CreatureRuntimeAssembly,
  CreatureRuntimeBone,
  CreatureRuntimeRigBindingPlan,
  MaterialDefinition,
  PropComposition,
  PropRuntimeAssembly,
  PropRuntimeInteractionAction,
  PropRuntimeInteractionEffect,
  PropRuntimeInteractionResult,
  PropRuntimeInteractionState,
  PropRuntimeNode,
  RuntimeMaterialSlot,
  RuntimePhysicsProfile,
} from '@strata-game-library/core/compose';
import type React from 'react';
import type * as THREE from 'three';
import type { RuntimeAssetMaterialMode } from './RuntimeAssetMesh';

export type RuntimePropInput = string | CreatePropInput | PropComposition | PropRuntimeAssembly;

export type RuntimeCreatureInput =
  | string
  | CreateCreatureInput
  | CreatureComposition
  | CreatureRuntimeAssembly;

export type RuntimeCreatureAssetMode = 'auto' | 'asset' | 'runtime';

export type RuntimeCreatureAnimationRetargetDirection = 'runtime-to-source' | 'source-to-runtime';

export interface RuntimeCreatureAnimationRetargetOptions {
  direction?: RuntimeCreatureAnimationRetargetDirection;
  name?: string;
  includeUnverified?: boolean;
}

export interface RuntimeCreatureAnimationRetargetMetadata {
  direction: RuntimeCreatureAnimationRetargetDirection;
  renamedTracks: number;
  preservedTracks: number;
  trackNameMap: Record<string, string>;
}

/**
 * Animation action map returned by Three/Drei animation helpers.
 */
export type RuntimeCreatureAnimationActionMap = Record<
  string,
  THREE.AnimationAction | null | undefined
>;

/**
 * Playback options for runtime creature animation actions.
 */
export interface RuntimeCreatureAnimationPlaybackOptions {
  /** Fade-in duration in seconds. */
  fadeInDuration?: number;
  /** Fade-out duration in seconds, used by component cleanup and stop helpers. */
  fadeOutDuration?: number;
  /** Sets `AnimationAction.timeScale` before playback. */
  timeScale?: number;
  /** Sets `AnimationAction.clampWhenFinished` before playback. */
  clampWhenFinished?: boolean;
  /** Uses repeating playback when true and one-shot playback when false. */
  loop?: boolean;
  /** Optional explicit Three.js repetition count. */
  repetitions?: number;
  /** Resets the action before playing. Default: true. */
  reset?: boolean;
}

/**
 * Cross-fade options for runtime creature animation actions.
 */
export interface RuntimeCreatureAnimationCrossFadeOptions
  extends RuntimeCreatureAnimationPlaybackOptions {
  /** Source action or runtime logical animation id. Defaults to the controller's current action. */
  from?: string | THREE.AnimationAction;
  /** Cross-fade duration in seconds. Default: 0.2. */
  duration?: number;
  /** Enables Three.js time warping during the transition. Default: false. */
  warp?: boolean;
}

/**
 * Stop options for runtime creature animation actions.
 */
export interface RuntimeCreatureAnimationStopOptions {
  /** Fade-out duration in seconds. Defaults to immediate stop. */
  fadeOutDuration?: number;
}

/**
 * Context emitted when the R3F creature asset starts an animation action.
 */
export interface RuntimeCreatureAnimationActionContext {
  /** Runtime creature assembly that owns the animation. */
  creature: CreatureRuntimeAssembly;
  /** Runtime logical animation id requested by the caller. */
  animation: string;
  /** Resolved source clip name used to find the Three action. */
  clipName: string;
}

/**
 * Imperative controller for runtime creature animation actions.
 */
export interface RuntimeCreatureAnimationController {
  /** Runtime creature assembly controlled by this instance. */
  creature: CreatureRuntimeAssembly;
  /** Available Three actions keyed by source clip name. */
  actions: RuntimeCreatureAnimationActionMap;
  /** Last action successfully started through this controller. */
  current?: THREE.AnimationAction;
  /** Resolves a runtime logical animation id to the source clip name. */
  resolveClipName: (animation: string) => string;
  /** Returns an action by runtime logical animation id or source clip name. */
  getAction: (animation: string) => THREE.AnimationAction | undefined;
  /** Starts an action by runtime logical animation id or source clip name. */
  play: (
    animation: string,
    options?: RuntimeCreatureAnimationPlaybackOptions
  ) => THREE.AnimationAction | undefined;
  /** Cross-fades from the current/source action into a target action. */
  crossFade: (
    animation: string,
    options?: RuntimeCreatureAnimationCrossFadeOptions
  ) => THREE.AnimationAction | undefined;
  /** Stops an action by runtime logical animation id or source clip name. */
  stop: (animation: string, options?: RuntimeCreatureAnimationStopOptions) => boolean;
  /** Stops every available action. */
  stopAll: (options?: RuntimeCreatureAnimationStopOptions) => void;
}

/**
 * Transition strategy for runtime creature animation states.
 */
export type RuntimeCreatureAnimationStateTransitionMode = 'auto' | 'play' | 'crossFade';

/**
 * Context passed to runtime creature animation state guards.
 */
export interface RuntimeCreatureAnimationStateGuardContext {
  /** State currently active on the state controller. */
  currentState?: string;
  /** State being entered. */
  nextState: string;
  /** Definition for the state being entered. */
  definition: RuntimeCreatureAnimationStateDefinition;
  /** Underlying runtime creature animation action controller. */
  controller: RuntimeCreatureAnimationController;
  /** State controller evaluating the guard. */
  stateController: RuntimeCreatureAnimationStateController;
}

/**
 * Guard used to allow or block a named animation state transition.
 */
export type RuntimeCreatureAnimationStateGuard = (
  context: RuntimeCreatureAnimationStateGuardContext
) => boolean;

/**
 * A named runtime creature animation state.
 */
export interface RuntimeCreatureAnimationStateDefinition {
  /** Runtime logical animation id or source clip name entered for this state. */
  animation: string;
  /** Optional guard that must pass before this state can be entered. */
  guard?: RuntimeCreatureAnimationStateGuard;
  /** Playback defaults used whenever this state is entered. */
  playback?: RuntimeCreatureAnimationPlaybackOptions;
  /** Cross-fade defaults used when this state transitions from another action. */
  transition?: RuntimeCreatureAnimationCrossFadeOptions;
}

/**
 * Per-transition overrides for runtime creature animation states.
 */
export interface RuntimeCreatureAnimationStateEnterOptions
  extends RuntimeCreatureAnimationCrossFadeOptions {
  /** Forces play or cross-fade behavior. Default: auto. */
  mode?: RuntimeCreatureAnimationStateTransitionMode;
  /** Stops the previous action after the new action starts. Default: false. */
  stopPrevious?: boolean;
  /** Stop options used when `stopPrevious` is enabled. */
  previousStop?: RuntimeCreatureAnimationStopOptions;
}

/**
 * Imperative state controller for logical runtime creature animation states.
 */
export interface RuntimeCreatureAnimationStateController {
  /** Underlying runtime creature animation action controller. */
  controller: RuntimeCreatureAnimationController;
  /** Available named states. */
  states: Record<string, RuntimeCreatureAnimationStateDefinition>;
  /** Last state successfully entered through this controller. */
  currentState?: string;
  /** Returns a named state definition. */
  getState: (state: string) => RuntimeCreatureAnimationStateDefinition | undefined;
  /** Returns whether a named state exists and passes its guard. */
  canEnter: (state: string) => boolean;
  /** Enters a named animation state and starts the mapped action. */
  enter: (
    state: string,
    options?: RuntimeCreatureAnimationStateEnterOptions
  ) => THREE.AnimationAction | undefined;
}

/**
 * Vector-like pose value accepted by runtime creature pose helpers.
 */
export type RuntimeCreaturePoseVector = [number, number, number] | THREE.Vector3;

/**
 * Quaternion-like pose value accepted by runtime creature pose helpers.
 */
export type RuntimeCreaturePoseQuaternion = [number, number, number, number] | THREE.Quaternion;

/**
 * Scale value accepted by runtime creature pose helpers.
 */
export type RuntimeCreaturePoseScale = number | RuntimeCreaturePoseVector;

/**
 * Transform channel applied by runtime creature pose helpers.
 */
export type RuntimeCreaturePoseChannel = 'position' | 'rotation' | 'scale';

/**
 * Per-bone transform used by runtime creature pose helpers.
 */
export interface RuntimeCreaturePoseTransform {
  position?: RuntimeCreaturePoseVector;
  rotation?: RuntimeCreaturePoseQuaternion;
  scale?: RuntimeCreaturePoseScale;
}

/**
 * Pose map keyed by runtime bone id, logical bone id, or source rig bone name.
 */
export type RuntimeCreaturePose = Record<string, RuntimeCreaturePoseTransform>;

/**
 * Options for resolving and applying runtime creature poses.
 */
export interface RuntimeCreaturePoseOptions {
  /** Includes unverified rig bindings when applying aliases. Default: true. */
  includeUnverified?: boolean;
}

/**
 * Result entry for a transform applied to a Three object.
 */
export interface RuntimeCreaturePoseApplication {
  /** Pose key that matched the target object. */
  key: string;
  /** Three object that received the transform. */
  object: THREE.Object3D;
  /** Rig binding matched by the pose key, if available. */
  binding?: CreatureRuntimeRigBindingPlan['bindings'][number];
  /** Original transform applied to the object. */
  transform: RuntimeCreaturePoseTransform;
  /** Channels applied from the transform. */
  applied: RuntimeCreaturePoseChannel[];
}

export interface RuntimeMaterialOptions {
  transparentVolumetrics?: boolean;
  materialOverrides?: Record<string, THREE.Material | MaterialDefinition>;
}

export interface RuntimeShapeRenderContext {
  material: THREE.Material;
  materialSlot: RuntimeMaterialSlot;
}

export type RuntimePropInteractionSelector = (
  node: PropRuntimeNode,
  runtime: PropRuntimeAssembly
) => string | PropRuntimeInteractionAction | null | undefined;

export interface RuntimePropInteractionContext {
  runtime: PropRuntimeAssembly;
  node: PropRuntimeNode;
  event: ThreeEvent<MouseEvent>;
  physicsApplications: RuntimePropPhysicsApplication[];
}

export type RuntimePropInteractionHandler = (
  result: PropRuntimeInteractionResult,
  context: RuntimePropInteractionContext
) => void;

export type RuntimePropPhysicsEffect = Extract<PropRuntimeInteractionEffect, { type: 'physics' }>;

export interface RuntimePropPhysicsObjectState {
  mode?: RuntimePhysicsProfile['mode'];
  colliderEnabled?: boolean;
  awake?: boolean;
  lastOperation: RuntimePropPhysicsEffect['operation'];
}

export interface RuntimePropPhysicsApplication {
  effect: RuntimePropPhysicsEffect;
  node: PropRuntimeNode;
  object: THREE.Object3D;
  state: RuntimePropPhysicsObjectState;
}

export interface RuntimePropPhysicsAdapterContext {
  runtime: PropRuntimeAssembly;
  result: PropRuntimeInteractionResult;
  effect: RuntimePropPhysicsEffect;
  node: PropRuntimeNode;
  object: THREE.Object3D;
  state: RuntimePropPhysicsObjectState;
}

export interface RuntimePropPhysicsAdapter {
  setMode?: (context: RuntimePropPhysicsAdapterContext) => void;
  setColliderEnabled?: (enabled: boolean, context: RuntimePropPhysicsAdapterContext) => void;
  wakeBody?: (context: RuntimePropPhysicsAdapterContext) => void;
}

/**
 * Engine-owned physics handle that can be attached to runtime prop objects.
 */
export interface RuntimePropPhysicsHandle {
  /** Applies a static, dynamic, or kinematic body mode. */
  setMode?: (
    mode: RuntimePhysicsProfile['mode'],
    context: RuntimePropPhysicsAdapterContext
  ) => void;
  /** Enables or disables the object's collider shape. */
  setColliderEnabled?: (enabled: boolean, context: RuntimePropPhysicsAdapterContext) => void;
  /** Wakes the engine body if the backend supports sleeping. */
  wakeBody?: (context: RuntimePropPhysicsAdapterContext) => void;
}

/**
 * Options for attaching a physics handle to a Three object.
 */
export interface RuntimePropPhysicsHandleAttachOptions {
  /** Object userData key. Default: `strataRuntimePhysicsHandle`. */
  handleKey?: string;
}

/**
 * Options for creating an object-userData-backed prop physics adapter.
 */
export interface RuntimePropObjectPhysicsAdapterOptions {
  /** Object userData key used to find handles. Default: `strataRuntimePhysicsHandle`. */
  handleKey?: string;
  /** Optional custom resolver for engine-owned physics handles. */
  resolveHandle?: (
    context: RuntimePropPhysicsAdapterContext
  ) => RuntimePropPhysicsHandle | null | undefined;
}

/**
 * Numeric Cannon body type value.
 */
export type RuntimePropCannonBodyType = number;

/**
 * Minimal Cannon/cannon-es body surface used by Strata runtime prop physics effects.
 */
export interface RuntimePropCannonBodyHandle {
  /** Cannon body type value. */
  type?: RuntimePropCannonBodyType;
  /** Cannon collision filter mask used to enable or disable collisions. */
  collisionFilterMask?: number;
  /** Wakes the Cannon body. */
  wakeUp?: () => void;
}

/**
 * Options for creating a Cannon-backed runtime prop physics handle.
 */
export interface RuntimePropCannonPhysicsHandleOptions {
  /** Cannon body to update when prop physics effects change body mode or collider state. */
  body?: RuntimePropCannonBodyHandle | null;
  /** Overrides Strata mode to Cannon body-type numeric mappings. */
  bodyTypes?: Partial<
    Record<NonNullable<RuntimePhysicsProfile['mode']>, RuntimePropCannonBodyType>
  >;
  /** Collision mask used when enabling collisions. Default: initial body mask or -1. */
  enabledCollisionFilterMask?: number;
  /** Collision mask used when disabling collisions. Default: 0. */
  disabledCollisionFilterMask?: number;
  /** Whether Cannon body-type changes should wake the body. Default: true. */
  wakeUp?: boolean;
}

/**
 * Numeric Rapier rigid-body type value.
 */
export type RuntimePropRapierBodyType = number;

/**
 * Minimal Rapier rigid-body surface used by Strata runtime prop physics effects.
 */
export interface RuntimePropRapierRigidBodyHandle {
  /** Changes the Rapier rigid-body type. */
  setBodyType?: (type: RuntimePropRapierBodyType, wakeUp: boolean) => void;
  /** Enables or disables the whole Rapier body. */
  setEnabled?: (enabled: boolean) => void;
  /** Wakes the Rapier body. */
  wakeUp?: () => void;
}

/**
 * Minimal Rapier collider surface used by Strata runtime prop physics effects.
 */
export interface RuntimePropRapierColliderHandle {
  /** Enables or disables the Rapier collider. */
  setEnabled?: (enabled: boolean) => void;
}

/**
 * Options for creating a Rapier-backed runtime prop physics handle.
 */
export interface RuntimePropRapierPhysicsHandleOptions {
  /** Rapier rigid body to update when prop physics effects change body mode. */
  body?: RuntimePropRapierRigidBodyHandle | null;
  /** Rapier colliders to enable or disable for collider effects. */
  colliders?: readonly (RuntimePropRapierColliderHandle | null | undefined)[];
  /** Overrides Strata mode to Rapier body-type numeric mappings. */
  bodyTypes?: Partial<
    Record<NonNullable<RuntimePhysicsProfile['mode']>, RuntimePropRapierBodyType>
  >;
  /** Whether Rapier body-type changes should wake the body. Default: true. */
  wakeUp?: boolean;
  /** Also toggles the whole body when collider effects enable/disable colliders. */
  disableBodyWhenColliderDisabled?: boolean;
}

export interface RuntimePropPhysicsApplicationOptions {
  adapter?: RuntimePropPhysicsAdapter;
}

export interface RuntimePropProps extends RuntimeMaterialOptions {
  prop: RuntimePropInput;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  assetMaterialMode?: RuntimeAssetMaterialMode;
  renderNode?: (node: PropRuntimeNode, context: RuntimeShapeRenderContext) => React.ReactNode;
  onNodeClick?: (node: PropRuntimeNode, event: ThreeEvent<MouseEvent>) => void;
  interactionState?: PropRuntimeInteractionState;
  selectInteractionAction?: RuntimePropInteractionSelector;
  onInteraction?: RuntimePropInteractionHandler;
  applyPhysicsEffects?: boolean;
  physicsAdapter?: RuntimePropPhysicsAdapter;
}

/**
 * Options for creating an R3F prop interaction controller bridge.
 */
export interface RuntimePropInteractionControllerOptions {
  /** Initial prop interaction state copied into the controller. */
  initialState?: PropRuntimeInteractionState;
}

/**
 * React-facing state and commands for executing prop interaction actions.
 */
export interface RuntimePropInteractionControllerState {
  /** Resolved prop runtime assembly backing the controller. */
  runtime: PropRuntimeAssembly;
  /** Latest controller state mirrored into React state. */
  state: PropRuntimeInteractionState;
  /** Replaces the current controller state and returns the cloned result. */
  setState: (state: PropRuntimeInteractionState) => PropRuntimeInteractionState;
  /** Resets the controller to its initial state or an explicit replacement state. */
  reset: (state?: PropRuntimeInteractionState) => PropRuntimeInteractionState;
  /** Executes a prop interaction action and updates React state to the result state. */
  execute: (action: string | PropRuntimeInteractionAction) => PropRuntimeInteractionResult;
}

/**
 * Shared context passed to prop interaction panel callbacks.
 */
export interface RuntimePropInteractionPanelContext {
  /** Resolved prop runtime assembly shown by the panel. */
  runtime: PropRuntimeAssembly;
  /** Current interaction state at the time the callback runs. */
  state: PropRuntimeInteractionState;
}

/**
 * Context passed after the interaction panel executes an action.
 */
export interface RuntimePropInteractionPanelResultContext
  extends RuntimePropInteractionPanelContext {
  /** Result returned by the core prop interaction controller. */
  result: PropRuntimeInteractionResult;
}

/**
 * Props for the prefabbed R3F prop interaction panel.
 */
export interface RuntimePropInteractionPanelProps {
  /** Prop input resolved into runtime interaction actions. */
  prop: RuntimePropInput;
  /** Initial interaction state copied into the internal controller. */
  initialState?: PropRuntimeInteractionState;
  /** Optional explicit action list; defaults to `runtime.interactionActions`. */
  actions?: PropRuntimeInteractionAction[];
  /** Panel title. Defaults to the prop runtime name. */
  title?: React.ReactNode;
  /** Label shown when no actions are available after filtering. */
  emptyLabel?: React.ReactNode;
  /** Toggles the state summary row. Default: true. */
  showState?: boolean;
  /** Toggles the last execution status row. Default: true. */
  showStatus?: boolean;
  /** Toggles the reset button. Default: true. */
  showReset?: boolean;
  /** Custom root class name. */
  className?: string;
  /** Custom root style merged after the default panel style. */
  style?: React.CSSProperties;
  /** Custom button style merged after the default action button style. */
  buttonStyle?: React.CSSProperties;
  /** Filters visible actions. */
  actionFilter?: (
    action: PropRuntimeInteractionAction,
    context: RuntimePropInteractionPanelContext
  ) => boolean;
  /** Overrides an action label. */
  actionLabel?: (
    action: PropRuntimeInteractionAction,
    context: RuntimePropInteractionPanelContext
  ) => React.ReactNode;
  /** Adds adapter-owned disable rules on top of core enabled/disabled state. */
  actionDisabled?: (
    action: PropRuntimeInteractionAction,
    context: RuntimePropInteractionPanelContext
  ) => boolean;
  /** Called after an action executes through the core controller. */
  onInteraction?: (
    result: PropRuntimeInteractionResult,
    context: RuntimePropInteractionPanelResultContext
  ) => void;
  /** Called whenever panel-owned interaction state changes. */
  onStateChange?: (
    state: PropRuntimeInteractionState,
    context: RuntimePropInteractionPanelContext
  ) => void;
}

export interface RuntimeCreatureProps extends RuntimeMaterialOptions {
  creature: RuntimeCreatureInput;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  assetMode?: RuntimeCreatureAssetMode;
  animation?: string;
  animationPlayback?: RuntimeCreatureAnimationPlaybackOptions;
  retargetAnimation?: boolean | RuntimeCreatureAnimationRetargetOptions;
  onRigBinding?: (plan: CreatureRuntimeRigBindingPlan) => void;
  onAnimationController?: (controller: RuntimeCreatureAnimationController) => void;
  onAnimationAction?: (
    action: THREE.AnimationAction,
    context: RuntimeCreatureAnimationActionContext
  ) => void;
  renderBone?: (bone: CreatureRuntimeBone, context: RuntimeShapeRenderContext) => React.ReactNode;
  onBoneClick?: (bone: CreatureRuntimeBone, event: ThreeEvent<MouseEvent>) => void;
}
