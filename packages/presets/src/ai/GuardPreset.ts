import * as YUKA from 'yuka';
import type { AIPresetResult, GuardPresetConfig } from './types';

/**
 * Guard NPC AI Preset.
 *
 * Patrols a set of waypoints and automatically switches to chasing behavior
 * when a target enters its detection radius.
 *
 * @category Entities & Simulation
 * @example
 * ```typescript
 * const guard = createGuardPreset({
 *   patrolWaypoints: [[0,0,0], [10,0,0]],
 *   detectionRadius: 12
 * });
 * ```
 */
export function createGuardPreset(config: GuardPresetConfig): AIPresetResult {
  const {
    patrolWaypoints,
    detectionRadius = 15,
    chaseSpeed = 8,
    patrolSpeed = 3,
    maxSpeed = 8,
    maxForce = 10,
    mass = 1,
  } = config;

  if (!patrolWaypoints || patrolWaypoints.length === 0) {
    throw new Error('GuardPreset requires at least one patrol waypoint');
  }

  const vehicle = new YUKA.Vehicle();
  vehicle.maxSpeed = maxSpeed;
  vehicle.maxForce = maxForce;
  vehicle.mass = mass;

  const path = new YUKA.Path();
  path.loop = true;
  for (const [x, y, z] of patrolWaypoints) {
    path.add(new YUKA.Vector3(x, y, z));
  }

  const followPathBehavior = new YUKA.FollowPathBehavior(path);
  followPathBehavior.active = true;

  const seekBehavior = new YUKA.SeekBehavior();
  seekBehavior.active = false;

  const behaviors: YUKA.SteeringBehavior[] = [followPathBehavior, seekBehavior];
  vehicle.steering.add(followPathBehavior);
  vehicle.steering.add(seekBehavior);

  class PatrolState extends YUKA.State<YUKA.Vehicle> {
    enter(entity: YUKA.Vehicle): void {
      entity.maxSpeed = patrolSpeed;
      followPathBehavior.active = true;
      seekBehavior.active = false;
    }
    execute(): void {}
    exit(): void {}
  }

  class ChaseState extends YUKA.State<YUKA.Vehicle> {
    enter(entity: YUKA.Vehicle): void {
      entity.maxSpeed = chaseSpeed;
      followPathBehavior.active = false;
      seekBehavior.active = true;
    }
    execute(): void {}
    exit(): void {}
  }

  const stateMachine = new YUKA.StateMachine(vehicle);
  const patrolState = new PatrolState();
  const chaseState = new ChaseState();
  stateMachine.currentState = patrolState;

  const update = (_delta: number, context?: { playerPosition?: YUKA.Vector3 }) => {
    if (context?.playerPosition) {
      const distance = vehicle.position.distanceTo(context.playerPosition);

      if (distance < detectionRadius) {
        if (stateMachine.currentState !== chaseState) {
          stateMachine.changeTo(chaseState);
        }
        seekBehavior.target = context.playerPosition;
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
