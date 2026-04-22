import type { MaterialDefinition, MaterialPhysics } from './materials/types';

/**
 * Serializable vector tuple used by adapter-neutral runtime assembly plans.
 */
export type RuntimeVector3Tuple = [number, number, number];

/**
 * Serializable quaternion tuple used by adapter-neutral runtime assembly plans.
 */
export type RuntimeQuaternionTuple = [number, number, number, number];

/**
 * Axis-aligned local-space bounds for a composed runtime object.
 */
export interface RuntimeBounds {
  min: RuntimeVector3Tuple;
  max: RuntimeVector3Tuple;
  size: RuntimeVector3Tuple;
  center: RuntimeVector3Tuple;
}

/**
 * Material slot resolved for runtime assembly and future material swapping.
 */
export interface RuntimeMaterialSlot {
  id: string;
  materialId: string;
  material: MaterialDefinition;
  physics?: MaterialPhysics;
  swappableWith?: string[];
}

/**
 * Physics metadata derived from explicit definitions and resolved materials.
 */
export interface RuntimePhysicsProfile {
  mode?: 'static' | 'dynamic' | 'kinematic';
  mass?: number;
  density?: number;
  friction?: number;
  restitution?: number;
  source: 'definition' | 'material' | 'mixed' | 'implicit';
}
