import * as YUKA from 'yuka';
import type { AIPresetResult, FlockMemberPresetConfig } from './types';

/**
 * Flock Member AI Preset.
 *
 * Implements standard Reynolds flocking behaviors including alignment, cohesion,
 * and separation. Ideal for schools of fish, bird flocks, or large crowds.
 *
 * @category Entities & Simulation
 * @example
 * ```typescript
 * const bird = createFlockMemberPreset({
 *   neighborRadius: 5,
 *   cohesionWeight: 1.5
 * });
 * ```
 */
export function createFlockMemberPreset(config: FlockMemberPresetConfig = {}): AIPresetResult {
  const {
    separationWeight = 1.5,
    alignmentWeight = 1.0,
    cohesionWeight = 1.0,
    neighborRadius = 10,
    maxSpeed = 5,
    maxForce = 8,
    mass = 1,
  } = config;

  const vehicle = new YUKA.Vehicle();
  vehicle.maxSpeed = maxSpeed;
  vehicle.maxForce = maxForce;
  vehicle.mass = mass;
  vehicle.updateNeighborhood = true;
  vehicle.neighborhoodRadius = neighborRadius;

  const separationBehavior = new YUKA.SeparationBehavior();
  separationBehavior.weight = separationWeight;

  const alignmentBehavior = new YUKA.AlignmentBehavior();
  alignmentBehavior.weight = alignmentWeight;

  const cohesionBehavior = new YUKA.CohesionBehavior();
  cohesionBehavior.weight = cohesionWeight;

  const wanderBehavior = new YUKA.WanderBehavior();
  wanderBehavior.weight = 0.5;
  wanderBehavior.radius = 1;
  wanderBehavior.distance = 3;
  wanderBehavior.jitter = 1;

  const behaviors: YUKA.SteeringBehavior[] = [
    separationBehavior,
    alignmentBehavior,
    cohesionBehavior,
    wanderBehavior,
  ];

  vehicle.steering.add(separationBehavior);
  vehicle.steering.add(alignmentBehavior);
  vehicle.steering.add(cohesionBehavior);
  vehicle.steering.add(wanderBehavior);

  return {
    vehicle,
    behaviors,
  };
}
