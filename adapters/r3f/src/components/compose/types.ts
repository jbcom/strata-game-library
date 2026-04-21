import type { ThreeEvent } from '@react-three/fiber';
import type {
  CreateCreatureInput,
  CreatePropInput,
  CreatureComposition,
  CreatureRuntimeAssembly,
  CreatureRuntimeBone,
  MaterialDefinition,
  PropComposition,
  PropRuntimeAssembly,
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

export interface RuntimeMaterialOptions {
  transparentVolumetrics?: boolean;
  materialOverrides?: Record<string, THREE.Material | MaterialDefinition>;
}

export interface RuntimeShapeRenderContext {
  material: THREE.Material;
  materialSlot: RuntimeMaterialSlot;
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
}

export interface RuntimeCreatureProps extends RuntimeMaterialOptions {
  creature: RuntimeCreatureInput;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  renderBone?: (bone: CreatureRuntimeBone, context: RuntimeShapeRenderContext) => React.ReactNode;
  onBoneClick?: (bone: CreatureRuntimeBone, event: ThreeEvent<MouseEvent>) => void;
}
