import type * as THREE from 'three';
import type { BiomeType } from '../../utils/texture-loader';
import type { CoveringDefinition } from '../coverings';
import type { MaterialDefinition } from '../materials';
import type {
  RuntimeBounds,
  RuntimeMaterialSlot,
  RuntimePhysicsProfile,
  RuntimeQuaternionTuple,
  RuntimeVector3Tuple,
} from '../runtime-types';
import type { SkeletonDefinition } from '../skeletons/types';

export type AIPresetName = 'guard' | 'prey' | 'predator' | 'flockMember' | 'follower';

export interface DropItem {
  item: string;
  count: number | [number, number];
  probability?: number;
}

export interface DropTable {
  guaranteed?: DropItem[];
  chance?: DropItem[];
}

export interface CreatureAssetDefinition {
  model?: string;
  rig?: string;
  animationClips?: Record<string, string>;
  boneMap?: Record<string, string>;
}

export interface CreatureDefinition {
  id: string;
  name: string;
  description?: string;

  // Composition
  skeleton: string | SkeletonDefinition;
  covering: CoveringDefinition;

  // Scale
  scale?: number;
  scaleVariation?: number; // Random variation

  // Stats
  stats: {
    health: number;
    speed: number;
    swimSpeed?: number;
    flySpeed?: number;
    stamina?: number;
    strength?: number;
  };

  // Behavior
  ai: AIPresetName | Record<string, unknown>; // AIPresetName or custom AIDefinition

  // Animations
  animations: {
    idle: string | THREE.AnimationClip;
    walk: string | THREE.AnimationClip;
    run: string | THREE.AnimationClip;
    swim?: string | THREE.AnimationClip;
    fly?: string | THREE.AnimationClip;
    attack?: string | THREE.AnimationClip;
    death?: string | THREE.AnimationClip;
    [key: string]: string | THREE.AnimationClip | undefined;
  };

  // Asset-backed rendering/animation
  assets?: CreatureAssetDefinition;

  // Spawning
  biomes: BiomeType[] | string[];
  spawnWeight: number; // Relative spawn chance
  packSize?: [number, number]; // Min, max pack size
  timeOfDay?: ('day' | 'night' | 'dawn' | 'dusk')[];

  // Drops
  drops?: DropTable;

  // Sounds
  sounds?: {
    idle?: string[];
    alert?: string;
    attack?: string;
    hurt?: string;
    death?: string;
  };
}

export interface CreateCreatureInput
  extends Partial<
    Omit<CreatureDefinition, 'skeleton' | 'covering' | 'stats' | 'ai' | 'animations'>
  > {
  skeleton: string | SkeletonDefinition;
  covering: Omit<CoveringDefinition, 'skeleton'> & Partial<Pick<CoveringDefinition, 'skeleton'>>;
  stats: CreatureDefinition['stats'];
  ai: CreatureDefinition['ai'];
  animations?: Partial<CreatureDefinition['animations']>;
}

export interface ResolvedCreatureMaterial {
  boneId: string;
  pattern: string;
  materialId: string;
  color?: string | THREE.Color;
  scale?: number;
  variation?: number;
  material: MaterialDefinition;
}

export interface CreatureRuntimeBone {
  id: string;
  boneId: string;
  parent?: string;
  shape: SkeletonDefinition['bones'][number]['shape'];
  size: RuntimeVector3Tuple;
  position: RuntimeVector3Tuple;
  rotation?: RuntimeQuaternionTuple;
  materialSlot: string;
  materialId: string;
  material: MaterialDefinition;
  volume: number;
  physics: RuntimePhysicsProfile;
  animationTargets: string[];
}

export interface CreatureRuntimeAnimationBinding {
  name: string;
  clip: string | THREE.AnimationClip;
  targetBones: string[];
}

export interface CreatureRuntimeSpawnProfile {
  biomes: CreatureDefinition['biomes'];
  spawnWeight: number;
  packSize?: [number, number];
  timeOfDay?: CreatureDefinition['timeOfDay'];
}

export interface CreatureRuntimeAssetBinding {
  model?: string;
  rig?: string;
  animationClips: Record<string, string>;
  boneMap: Record<string, string>;
}

export type CreatureRuntimeRigBindingStatus = 'matched' | 'missing' | 'unverified';

export interface CreatureRuntimeRigBindingSource {
  id: string;
  asset?: CreatureRuntimeAssetBinding;
  bones: Array<Pick<CreatureRuntimeBone, 'id' | 'boneId' | 'animationTargets'>>;
}

export interface CreatureRuntimeRigBoneBinding {
  runtimeBoneId: string;
  boneId: string;
  sourceBone: string;
  explicit: boolean;
  status: CreatureRuntimeRigBindingStatus;
  animationTargets: string[];
}

export interface CreatureRuntimeRigBindingCoverage {
  total: number;
  matched: number;
  missing: number;
  unverified: number;
  matchedRatio: number;
}

export interface CreatureRuntimeRigBindingPlan {
  creatureId: string;
  model?: string;
  rig?: string;
  sourceBones: string[];
  bindings: CreatureRuntimeRigBoneBinding[];
  matched: CreatureRuntimeRigBoneBinding[];
  missing: CreatureRuntimeRigBoneBinding[];
  unverified: CreatureRuntimeRigBoneBinding[];
  unmappedSourceBones: string[];
  coverage: CreatureRuntimeRigBindingCoverage;
}

export interface CreatureRuntimeAssembly {
  kind: 'creature';
  id: string;
  name: string;
  scale: number;
  bones: CreatureRuntimeBone[];
  materialSlots: Record<string, RuntimeMaterialSlot>;
  bounds: RuntimeBounds;
  physics: RuntimePhysicsProfile;
  animations: CreatureRuntimeAnimationBinding[];
  asset?: CreatureRuntimeAssetBinding;
  ikChains: SkeletonDefinition['ikChains'];
  spawn: CreatureRuntimeSpawnProfile;
  ai: CreatureDefinition['ai'];
  stats: CreatureDefinition['stats'];
  drops?: DropTable;
  sounds?: CreatureDefinition['sounds'];
}

export interface CreatureComposition {
  definition: CreatureDefinition;
  skeleton: SkeletonDefinition;
  scale: number;
  materialsByBone: Record<string, ResolvedCreatureMaterial>;
  runtime: CreatureRuntimeAssembly;
}
