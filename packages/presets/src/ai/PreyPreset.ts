import * as YUKA from 'yuka';
import type { AIPresetResult, PreyPresetConfig } from './types';

/**
 * Prey Animal AI Preset.
 *
 * Randomly wanders within a defined radius and flees from threats that enter
 * its panic distance. Ideal for neutral wildlife or passive NPCs.
 *
 * @category Entities & Simulation
 * @example
 * ```typescript
 * const rabbit = createPreyPreset({
 *   wanderRadius: 5,
 *   fleeDistance: 8
 * });
 * ```
 */
export function createPreyPreset(config: PreyPresetConfig = {}): AIPresetResult {
  const {
    wanderRadius = 2,
    fleeDistance = 10,
    fleeSpeed = 10,
    maxSpeed = 6,
    maxForce = 8,
    mass = 1,
  } = config;

  const vehicle = new YUKA.Vehicle();
  vehicle.maxSpeed = maxSpeed;
  vehicle.maxForce = maxForce;
  vehicle.mass = mass;

  const wanderBehavior = new YUKA.WanderBehavior();
  wanderBehavior.radius = wanderRadius;
  wanderBehavior.distance = 5;
  wanderBehavior.jitter = 3;
  wanderBehavior.active = true;

  const fleeBehavior = new YUKA.FleeBehavior();
  fleeBehavior.panicDistance = fleeDistance;
  fleeBehavior.active = false;
  fleeBehavior.weight = 2;

  const behaviors: YUKA.SteeringBehavior[] = [wanderBehavior, fleeBehavior];
  vehicle.steering.add(wanderBehavior);
  vehicle.steering.add(fleeBehavior);

  class WanderState extends YUKA.State<YUKA.Vehicle> {
    enter(entity: YUKA.Vehicle): void {
      entity.maxSpeed = maxSpeed;
      wanderBehavior.active = true;
      fleeBehavior.active = false;
    }
    execute(): void {}
    exit(): void {}
  }

  class FleeState extends YUKA.State<YUKA.Vehicle> {
    enter(entity: YUKA.Vehicle): void {
      entity.maxSpeed = fleeSpeed;
      wanderBehavior.active = false;
      fleeBehavior.active = true;
    }
    execute(): void {}
    exit(): void {}
  }

  const stateMachine = new YUKA.StateMachine(vehicle);
  const wanderState = new WanderState();
  const fleeState = new FleeState();
  stateMachine.currentState = wanderState;

  const update = (_delta: number, context?: { threatPosition?: YUKA.Vector3 }) => {
    if (context?.threatPosition) {
      const distance = vehicle.position.distanceTo(context.threatPosition);

      if (distance < fleeDistance) {
        if (stateMachine.currentState !== fleeState) {
          stateMachine.changeTo(fleeState);
        }
        fleeBehavior.target = context.threatPosition;
      } else {
        if (stateMachine.currentState !== wanderState) {
          stateMachine.changeTo(wanderState);
        }
      }
    }

    stateMachine.update();
  };

  return {
    vehicle,
    behaviors,
    stateMachine,
    update,
  };
}
