import * as YUKA from 'yuka';
import type { AIPresetResult, FollowerPresetConfig } from './types';

/**
 * NPC Follower AI Preset.
 *
 * Automatically tracks and follows a leader entity at a specified offset
 * and distance. Ideal for companion NPCs or squad members.
 *
 * @category Entities & Simulation
 * @example
 * ```typescript
 * const companion = createFollowerPreset({
 *   offset: [-2, 0, -2],
 *   followDistance: 3
 * });
 * ```
 */
export function createFollowerPreset(config: FollowerPresetConfig = {}): AIPresetResult {
  const {
    offset = [-3, 0, -3],
    followDistance = 5,
    maxSpeed = 6,
    maxForce = 10,
    mass = 1,
  } = config;

  const vehicle = new YUKA.Vehicle();
  vehicle.maxSpeed = maxSpeed;
  vehicle.maxForce = maxForce;
  vehicle.mass = mass;

  const arriveBehavior = new YUKA.ArriveBehavior();
  arriveBehavior.deceleration = Math.max(1, followDistance / 2);
  arriveBehavior.tolerance = followDistance * 0.1;

  const behaviors: YUKA.SteeringBehavior[] = [arriveBehavior];
  vehicle.steering.add(arriveBehavior);

  const offsetVector = new YUKA.Vector3(offset[0], offset[1], offset[2]);

  const update = (
    _delta: number,
    context?: { leaderPosition?: YUKA.Vector3; leaderRotation?: YUKA.Quaternion }
  ) => {
    if (context?.leaderPosition) {
      const targetPosition = context.leaderPosition.clone();

      if (context.leaderRotation) {
        const rotatedOffset = offsetVector.clone();
        rotatedOffset.applyRotation(context.leaderRotation);
        targetPosition.add(rotatedOffset);
      } else {
        targetPosition.add(offsetVector);
      }

      arriveBehavior.target = targetPosition;
    }
  };

  return {
    vehicle,
    behaviors,
    update,
  };
}
