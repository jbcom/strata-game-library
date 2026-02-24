import * as YUKA from 'yuka';
import type { AIPresetResult, PredatorPresetConfig } from './types';

/**
 * Predator Animal AI Preset.
 *
 * Patrols an area or wanders randomly until prey is detected within its radius,
 * then initiates a high-speed pursuit.
 *
 * @category Entities & Simulation
 * @example
 * ```typescript
 * const wolf = createPredatorPreset({
 *   pursuitSpeed: 15,
 *   detectionRadius: 25
 * });
 * ```
 */
export function createPredatorPreset(config: PredatorPresetConfig = {}): AIPresetResult {
  const {
    patrolWaypoints = [],
    pursuitSpeed = 12,
    detectionRadius = 20,
    maxSpeed = 12,
    maxForce = 15,
    mass = 2,
  } = config;

  const vehicle = new YUKA.Vehicle();
  vehicle.maxSpeed = maxSpeed;
  vehicle.maxForce = maxForce;
  vehicle.mass = mass;

  const wanderBehavior = new YUKA.WanderBehavior();
  wanderBehavior.radius = 3;
  wanderBehavior.distance = 8;
  wanderBehavior.jitter = 2;

  let followPathBehavior: YUKA.FollowPathBehavior | null = null;
  if (patrolWaypoints.length > 0) {
    const path = new YUKA.Path();
    path.loop = true;
    for (const [x, y, z] of patrolWaypoints) {
      path.add(new YUKA.Vector3(x, y, z));
    }
    followPathBehavior = new YUKA.FollowPathBehavior(path);
    followPathBehavior.active = true;
    wanderBehavior.active = false;
  } else {
    wanderBehavior.active = true;
  }

  const seekBehavior = new YUKA.SeekBehavior();
  seekBehavior.active = false;
  seekBehavior.weight = 2;

  const behaviors: YUKA.SteeringBehavior[] = [wanderBehavior, seekBehavior];
  vehicle.steering.add(wanderBehavior);
  vehicle.steering.add(seekBehavior);

  if (followPathBehavior) {
    behaviors.push(followPathBehavior);
    vehicle.steering.add(followPathBehavior);
  }

  class PatrolState extends YUKA.State<YUKA.Vehicle> {
    override enter(entity: YUKA.Vehicle): void {
      entity.maxSpeed = maxSpeed * 0.5;
      seekBehavior.active = false;
      if (followPathBehavior) {
        followPathBehavior.active = true;
        wanderBehavior.active = false;
      } else {
        wanderBehavior.active = true;
      }
    }
    override execute(): void {}
    override exit(): void {}
  }

  class PursueState extends YUKA.State<YUKA.Vehicle> {
    override enter(entity: YUKA.Vehicle): void {
      entity.maxSpeed = pursuitSpeed;
      wanderBehavior.active = false;
      if (followPathBehavior) {
        followPathBehavior.active = false;
      }
      seekBehavior.active = true;
    }
    override execute(): void {}
    override exit(): void {}
  }

  const stateMachine = new YUKA.StateMachine(vehicle);
  const patrolState = new PatrolState();
  const pursueState = new PursueState();
  stateMachine.currentState = patrolState;

  const update = (_delta: number, context?: { preyPosition?: YUKA.Vector3 }) => {
    if (context?.preyPosition) {
      const distance = vehicle.position.distanceTo(context.preyPosition);

      if (distance < detectionRadius) {
        if (stateMachine.currentState !== pursueState) {
          stateMachine.changeTo(pursueState);
        }
        seekBehavior.target = context.preyPosition;
      } else {
        if (stateMachine.currentState !== patrolState) {
          stateMachine.changeTo(patrolState);
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
