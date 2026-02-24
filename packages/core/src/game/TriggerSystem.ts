import * as THREE from 'three';
import type { BaseEntity, StrataWorld, SystemFn } from '../core/ecs/types';

/**
 * Types of triggers supported by the system.
 */
export type TriggerType = 'proximity' | 'collision' | 'interaction' | 'timed';

/**
 * Geometric shapes for spatial triggers.
 */
export type TriggerShape = 'sphere' | 'box' | 'cylinder';

/**
 * Component data for a trigger.
 */
export interface TriggerComponent<T extends BaseEntity = any> {
  /** Unique identifier for the trigger. */
  id: string;
  /** The activation method for this trigger. */
  type: TriggerType;
  /** The spatial shape of the trigger (for 'proximity' and 'collision'). */
  shape?: TriggerShape;
  /** Radius for 'sphere' and 'cylinder' shapes. */
  radius?: number;
  /** Dimensions [x, y, z] for 'box' shape. */
  size?: [number, number, number];
  /** Optional condition function that must return true for the trigger to fire. */
  condition?: (entity: T, trigger: T) => boolean;
  /** The action to execute when the trigger is activated. */
  action: (entity: T, trigger: T) => void;
  /** Minimum time between activations in seconds. */
  cooldown?: number;
  /** If true, the trigger will only fire once and then disable itself. */
  once?: boolean;
  /** Whether the trigger is currently active. */
  enabled?: boolean;
  /** Timestamp of the last activation. */
  lastTriggered?: number;
  /** Number of times the trigger has been activated. */
  triggerCount?: number;
}

/**
 * Required components for a trigger entity.
 */
export interface TriggerEntity extends BaseEntity {
  trigger: TriggerComponent<any>;
  transform: {
    position: THREE.Vector3;
    rotation?: THREE.Euler;
    scale?: THREE.Vector3;
  };
}

/**
 * Required components for an entity that can activate triggers.
 */
export interface TriggerableEntity extends BaseEntity {
  triggerable: boolean;
  transform: {
    position: THREE.Vector3;
  };
}

/**
 * Creates a TriggerSystem for the ECS world.
 *
 * This system handles spatial proximity checks, cooldowns, and trigger lifecycle.
 * It expects entities with 'trigger' and 'transform' components, and 'triggerable'
 * entities with 'transform' components.
 *
 * @returns An ECS SystemFn
 *
 * @example
 * ```typescript
 * const triggerSystem = createTriggerSystem();
 * world.addSystem(triggerSystem);
 * ```
 */
export function createTriggerSystem<T extends TriggerEntity & TriggerableEntity>(): SystemFn<T> {
  const tempVec1 = new THREE.Vector3();
  const tempVec2 = new THREE.Vector3();

  return (world: StrataWorld<T>, _deltaTime: number) => {
    const triggers = world.query('trigger', 'transform');
    const triggerables = world.query('triggerable', 'transform');
    const now = performance.now() / 1000;

    for (const triggerEntity of triggers) {
      const t = triggerEntity.trigger;

      if (t.enabled === false) continue;
      if (t.once && (t.triggerCount ?? 0) > 0) continue;

      if (t.cooldown !== undefined && t.lastTriggered !== undefined) {
        if (now - t.lastTriggered < t.cooldown) continue;
      }

      for (const targetEntity of triggerables) {
        // Don't trigger on yourself
        if (targetEntity.id === triggerEntity.id) continue;

        if (isInRange(triggerEntity, targetEntity)) {
          if (!t.condition || t.condition(targetEntity, triggerEntity)) {
            t.lastTriggered = now;
            t.triggerCount = (t.triggerCount ?? 0) + 1;

            t.action(targetEntity, triggerEntity);

            if (t.once) break;
          }
        }
      }
    }
  };

  /**
   * Checks if a target entity is within the spatial range of a trigger.
   */
  function isInRange(triggerEntity: TriggerEntity, targetEntity: TriggerableEntity): boolean {
    const t = triggerEntity.trigger;
    const pos1 = triggerEntity.transform.position;
    const pos2 = targetEntity.transform.position;

    if (t.type === 'proximity' || t.type === 'collision') {
      switch (t.shape) {
        case 'sphere': {
          const radius = t.radius ?? 1;
          return pos1.distanceTo(pos2) <= radius;
        }
        case 'box': {
          const size = t.size ?? [1, 1, 1];
          tempVec1.set(pos1.x - size[0] / 2, pos1.y - size[1] / 2, pos1.z - size[2] / 2);
          tempVec2.set(pos1.x + size[0] / 2, pos1.y + size[1] / 2, pos1.z + size[2] / 2);
          return (
            pos2.x >= tempVec1.x &&
            pos2.x <= tempVec2.x &&
            pos2.y >= tempVec1.y &&
            pos2.y <= tempVec2.y &&
            pos2.z >= tempVec1.z &&
            pos2.z <= tempVec2.z
          );
        }
        case 'cylinder': {
          const radius = t.radius ?? 1;
          const height = t.size ? t.size[1] : 2;
          const dx = pos1.x - pos2.x;
          const dz = pos1.z - pos2.z;
          const dy = Math.abs(pos1.y - pos2.y);
          return dx * dx + dz * dz <= radius * radius && dy <= height / 2;
        }
        default:
          // Default to simple distance check if no shape provided
          return pos1.distanceTo(pos2) <= (t.radius ?? 1);
      }
    }

    return false;
  }
}
