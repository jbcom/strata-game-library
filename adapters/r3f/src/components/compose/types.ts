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
  retargetAnimation?: boolean | RuntimeCreatureAnimationRetargetOptions;
  onRigBinding?: (plan: CreatureRuntimeRigBindingPlan) => void;
  renderBone?: (bone: CreatureRuntimeBone, context: RuntimeShapeRenderContext) => React.ReactNode;
  onBoneClick?: (bone: CreatureRuntimeBone, event: ThreeEvent<MouseEvent>) => void;
}
