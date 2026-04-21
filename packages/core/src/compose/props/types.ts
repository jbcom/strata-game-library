import type * as THREE from 'three';
import type { MaterialDefinition } from '../materials';
import type {
  RuntimeBounds,
  RuntimeMaterialSlot,
  RuntimePhysicsProfile,
  RuntimeQuaternionTuple,
  RuntimeVector3Tuple,
} from '../runtime-types';

export interface PropComponent {
  shape: 'box' | 'cylinder' | 'sphere' | 'capsule' | 'mesh';
  size: [number, number, number];
  position: [number, number, number] | THREE.Vector3;
  rotation?: [number, number, number, number] | THREE.Quaternion;
  material: string;

  // For mesh shape
  mesh?: string; // Path to GLB/mesh
}

export interface PropDefinition {
  id: string;
  name: string;

  // Composition
  components: PropComponent[];

  // Physics
  physics?: {
    type: 'static' | 'dynamic' | 'kinematic';
    mass?: number;
    friction?: number;
    restitution?: number;
  };

  // Interaction
  interaction?: {
    type: 'container' | 'seat' | 'door' | 'switch' | 'collectible';
    capacity?: number; // For containers
    contents?: string[]; // For containers
    action?: string; // For switches
  };

  // Audio
  audio?: {
    impact?: string; // Sound on collision
    interaction?: string; // Sound on interact
  };
}

export type PropInteractionType = NonNullable<PropDefinition['interaction']>['type'];

export interface PropRuntimeInteractionAction {
  id: string;
  type: PropInteractionType;
  action: string;
  label: string;
  enabled: boolean;
  nodeIds: string[];
  audio?: string;
  payload?: {
    capacity?: number;
    contents?: string[];
    command?: string;
  };
}

export interface CreatePropInput extends Partial<Omit<PropDefinition, 'components'>> {
  components: PropComponent[];
}

export interface ResolvedPropComponent extends Omit<PropComponent, 'material'> {
  materialId: string;
  material: MaterialDefinition;
}

export interface PropRuntimeNode {
  id: string;
  componentIndex: number;
  shape: PropComponent['shape'];
  size: RuntimeVector3Tuple;
  position: RuntimeVector3Tuple;
  rotation?: RuntimeQuaternionTuple;
  mesh?: string;
  materialSlot: string;
  materialId: string;
  material: MaterialDefinition;
  volume: number;
  physics: RuntimePhysicsProfile;
  interaction?: PropDefinition['interaction'];
}

export interface PropRuntimeAssembly {
  kind: 'prop';
  id: string;
  name: string;
  nodes: PropRuntimeNode[];
  materialSlots: Record<string, RuntimeMaterialSlot>;
  bounds: RuntimeBounds;
  physics: RuntimePhysicsProfile;
  interaction?: PropDefinition['interaction'];
  interactionActions: PropRuntimeInteractionAction[];
  audio?: PropDefinition['audio'];
}

export interface PropComposition {
  definition: PropDefinition;
  components: ResolvedPropComponent[];
  runtime: PropRuntimeAssembly;
}
