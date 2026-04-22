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
  PropRuntimeInteractionResult,
  PropRuntimeInteractionState,
  PropRuntimeNode,
  RuntimeMaterialSlot,
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
}

export type RuntimePropInteractionHandler = (
  result: PropRuntimeInteractionResult,
  context: RuntimePropInteractionContext
) => void;

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
