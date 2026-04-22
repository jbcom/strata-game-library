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

export interface RuntimeCreatureProps extends RuntimeMaterialOptions {
  creature: RuntimeCreatureInput;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  assetMode?: RuntimeCreatureAssetMode;
  animation?: string;
  onRigBinding?: (plan: CreatureRuntimeRigBindingPlan) => void;
  renderBone?: (bone: CreatureRuntimeBone, context: RuntimeShapeRenderContext) => React.ReactNode;
  onBoneClick?: (bone: CreatureRuntimeBone, event: ThreeEvent<MouseEvent>) => void;
}
