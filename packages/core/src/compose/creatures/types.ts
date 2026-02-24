import type * as THREE from 'three';
import type { BiomeType } from '../../utils/texture-loader';
import type { CoveringDefinition } from '../coverings';
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
