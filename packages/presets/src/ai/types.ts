import type * as YUKA from 'yuka';

/**
 * Base configuration for all AI presets.
 * @category Entities & Simulation
 */
export interface AIPresetConfig {
  /** Maximum movement speed. */
  maxSpeed?: number;
  /** Maximum steering force. */
  maxForce?: number;
  /** Physical mass affecting momentum. */
  mass?: number;
}

/**
 * Configuration for the Guard NPC preset.
 * @category Entities & Simulation
 */
export interface GuardPresetConfig extends AIPresetConfig {
  /** Path points for the guard to patrol. */
  patrolWaypoints: Array<[number, number, number]>;
  /** Radius within which the guard detects targets. Default: 15. */
  detectionRadius?: number;
  /** Speed when chasing a detected target. Default: 8. */
  chaseSpeed?: number;
  /** Speed when patrolling the waypoints. Default: 3. */
  patrolSpeed?: number;
}

/**
 * Configuration for the Prey animal preset.
 * @category Entities & Simulation
 */
export interface PreyPresetConfig extends AIPresetConfig {
  /** Radius for the random wandering behavior. Default: 2. */
  wanderRadius?: number;
  /** Distance at which the prey starts fleeing from threats. Default: 10. */
  fleeDistance?: number;
  /** Speed when fleeing from a threat. Default: 10. */
  fleeSpeed?: number;
}

/**
 * Configuration for the Predator animal preset.
 * @category Entities & Simulation
 */
export interface PredatorPresetConfig extends AIPresetConfig {
  /** Optional path points for patrolling. If omitted, uses wandering. */
  patrolWaypoints?: Array<[number, number, number]>;
  /** Speed when pursuing detected prey. Default: 12. */
  pursuitSpeed?: number;
  /** Radius within which the predator detects prey. Default: 20. */
  detectionRadius?: number;
}

/**
 * Configuration for a member of a flock.
 * @category Entities & Simulation
 */
export interface FlockMemberPresetConfig extends AIPresetConfig {
  /** Weight of the separation steering behavior. Default: 1.5. */
  separationWeight?: number;
  /** Weight of the alignment steering behavior. Default: 1.0. */
  alignmentWeight?: number;
  /** Weight of the cohesion steering behavior. Default: 1.0. */
  cohesionWeight?: number;
  /** Radius for neighborhood detection. Default: 10. */
  neighborRadius?: number;
}

/**
 * Configuration for a follower NPC.
 * @category Entities & Simulation
 */
export interface FollowerPresetConfig extends AIPresetConfig {
  /** Positional offset relative to the leader. Default: [-3, 0, -3]. */
  offset?: [number, number, number];
  /** Target distance to maintain from the leader. Default: 5. */
  followDistance?: number;
}

/**
 * Result of creating an AI preset.
 * @category Entities & Simulation
 */
export interface AIPresetResult {
  /** The Yuka vehicle instance. */
  vehicle: YUKA.Vehicle;
  /** List of active steering behaviors. */
  behaviors: YUKA.SteeringBehavior[];
  /** Optional state machine for behavioral transitions. */
  stateMachine?: YUKA.StateMachine<YUKA.Vehicle>;
  /** Optional update function to be called each frame. */
  update?: (delta: number, context?: Record<string, unknown>) => void;
}

/** Valid names for built-in AI presets. @category Entities & Simulation */
export type AIPresetName = 'guard' | 'prey' | 'predator' | 'flockMember' | 'follower';
