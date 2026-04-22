import type {
  CreateCreatureInput,
  CreatePropInput,
  CreatureComposition,
  CreatureRuntimeAssembly,
  CreatureRuntimeBone,
  CreatureRuntimeRigBindingPlan,
  MaterialDefinition,
  MaterialProceduralBakePlan,
  MaterialProceduralPlan,
  PropComposition,
  PropRuntimeAssembly,
  PropRuntimeNode,
  RuntimeBounds,
  RuntimeMaterialSlot,
  RuntimePhysicsProfile,
  RuntimeQuaternionTuple,
  RuntimeVector3Tuple,
} from '@strata-game-library/core/compose';

export type ReactylonPropInput = string | CreatePropInput | PropComposition | PropRuntimeAssembly;

export type ReactylonCreatureInput =
  | string
  | CreateCreatureInput
  | CreatureComposition
  | CreatureRuntimeAssembly;

export type ReactylonColorValue = string | number | RuntimeVector3Tuple;

export interface ReactylonRuntimeMaterialOptions {
  transparentVolumetrics?: boolean;
  materialOverrides?: Record<string, string | MaterialDefinition>;
}

export interface ReactylonRuntimeMaterialDescriptor {
  id: string;
  materialId: string;
  type: MaterialDefinition['type'];
  baseColor: ReactylonColorValue;
  roughness: number;
  metalness: number;
  normalScale?: number;
  transparent: boolean;
  opacity: number;
  physics?: RuntimeMaterialSlot['physics'];
  swappableWith: string[];
  traits?: MaterialDefinition['traits'];
  procedural?: MaterialProceduralPlan;
  proceduralBake?: MaterialProceduralBakePlan;
}

export interface ReactylonRuntimePropNodeDescriptor {
  id: string;
  componentIndex: number;
  shape: PropRuntimeNode['shape'];
  size: RuntimeVector3Tuple;
  position: RuntimeVector3Tuple;
  rotation?: RuntimeQuaternionTuple;
  mesh?: string;
  materialSlot: string;
  materialId: string;
  volume: number;
  physics: RuntimePhysicsProfile;
  interaction?: PropRuntimeNode['interaction'];
}

export interface ReactylonRuntimeCreatureBoneDescriptor {
  id: string;
  boneId: string;
  parent?: string;
  shape: CreatureRuntimeBone['shape'];
  size: RuntimeVector3Tuple;
  position: RuntimeVector3Tuple;
  rotation?: RuntimeQuaternionTuple;
  materialSlot: string;
  materialId: string;
  volume: number;
  physics: RuntimePhysicsProfile;
  animationTargets: string[];
}

export interface ReactylonRuntimePropDescriptor {
  kind: 'prop';
  id: string;
  name: string;
  position: RuntimeVector3Tuple;
  rotation?: RuntimeQuaternionTuple;
  scale: RuntimeVector3Tuple;
  nodes: ReactylonRuntimePropNodeDescriptor[];
  materialSlots: Record<string, ReactylonRuntimeMaterialDescriptor>;
  bounds: RuntimeBounds;
  physics: RuntimePhysicsProfile;
  interaction?: PropRuntimeAssembly['interaction'];
  interactionActions: PropRuntimeAssembly['interactionActions'];
  audio?: PropRuntimeAssembly['audio'];
}

export interface ReactylonRuntimeCreatureDescriptor {
  kind: 'creature';
  id: string;
  name: string;
  position: RuntimeVector3Tuple;
  rotation?: RuntimeQuaternionTuple;
  resolvedScale: number;
  scale: RuntimeVector3Tuple;
  bones: ReactylonRuntimeCreatureBoneDescriptor[];
  materialSlots: Record<string, ReactylonRuntimeMaterialDescriptor>;
  bounds: RuntimeBounds;
  physics: RuntimePhysicsProfile;
  animations: CreatureRuntimeAssembly['animations'];
  asset: CreatureRuntimeAssembly['asset'];
  rigBinding: CreatureRuntimeRigBindingPlan;
  ikChains: CreatureRuntimeAssembly['ikChains'];
  spawn: CreatureRuntimeAssembly['spawn'];
  ai: CreatureRuntimeAssembly['ai'];
  stats: CreatureRuntimeAssembly['stats'];
  drops: CreatureRuntimeAssembly['drops'];
  sounds: CreatureRuntimeAssembly['sounds'];
}

export interface ReactylonRuntimeTransformOptions {
  position?: RuntimeVector3Tuple;
  rotation?: RuntimeQuaternionTuple;
  scale?: number | RuntimeVector3Tuple;
}

export interface StrataRuntimePropProps
  extends ReactylonRuntimeMaterialOptions,
    ReactylonRuntimeTransformOptions {
  prop: ReactylonPropInput;
  visible?: boolean;
  onResolve?: (descriptor: ReactylonRuntimePropDescriptor) => void;
}

export interface StrataRuntimeCreatureProps
  extends ReactylonRuntimeMaterialOptions,
    ReactylonRuntimeTransformOptions {
  creature: ReactylonCreatureInput;
  visible?: boolean;
  onResolve?: (descriptor: ReactylonRuntimeCreatureDescriptor) => void;
}
