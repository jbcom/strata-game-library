/**
 * Hooks Tests
 *
 * Tests for useKeyboardControls and useYuka hook exports.
 *
 * @module hooks/__tests__/hooks.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('yuka', () => {
  class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }
  class GameEntity {
    position = new Vector3();
  }
  class Vehicle extends GameEntity {
    maxSpeed = 1;
  }
  class SteeringBehavior {
    weight = 1;
  }
  class SeekBehavior extends SteeringBehavior {
    target = new Vector3();
  }
  class FleeBehavior extends SteeringBehavior {
    target = new Vector3();
    panicDistance = 10;
  }
  class ArriveBehavior extends SteeringBehavior {
    target = new Vector3();
    deceleration = 3;
    tolerance = 0.1;
  }
  class PursuitBehavior extends SteeringBehavior {
    evader: Vehicle;
    constructor(evader: Vehicle) {
      super();
      this.evader = evader;
    }
  }
  class EvadeBehavior extends SteeringBehavior {
    pursuer: Vehicle;
    panicDistance = 10;
    constructor(pursuer: Vehicle) {
      super();
      this.pursuer = pursuer;
    }
  }
  class WanderBehavior extends SteeringBehavior {
    radius = 1;
    distance = 5;
    jitter = 5;
  }
  class Path {
    loop = false;
  }
  class FollowPathBehavior extends SteeringBehavior {
    path: Path;
    nextWaypointDistance = 1;
    constructor(path: Path) {
      super();
      this.path = path;
    }
  }
  class SeparationBehavior extends SteeringBehavior {}
  class AlignmentBehavior extends SteeringBehavior {}
  class CohesionBehavior extends SteeringBehavior {}
  class ObstacleAvoidanceBehavior extends SteeringBehavior {
    obstacles: GameEntity[];
    dBoxMinLength = 4;
    constructor(obstacles: GameEntity[]) {
      super();
      this.obstacles = obstacles;
    }
  }
  class OffsetPursuitBehavior extends SteeringBehavior {
    constructor(_leader: Vehicle, _offset: Vector3) {
      super();
    }
  }
  class InterposeBehavior extends SteeringBehavior {
    entity1: Vehicle;
    entity2: Vehicle;
    constructor(entity1: Vehicle, entity2: Vehicle) {
      super();
      this.entity1 = entity1;
      this.entity2 = entity2;
    }
  }
  class Polygon {
    fromContour(_points: Vector3[]) {}
  }
  class EntityManager {}
  class Time {}
  class StateMachine {}
  class NavMesh {}

  return {
    Vector3,
    GameEntity,
    Vehicle,
    SteeringBehavior,
    SeekBehavior,
    FleeBehavior,
    ArriveBehavior,
    PursuitBehavior,
    EvadeBehavior,
    WanderBehavior,
    Path,
    FollowPathBehavior,
    SeparationBehavior,
    AlignmentBehavior,
    CohesionBehavior,
    ObstacleAvoidanceBehavior,
    OffsetPursuitBehavior,
    InterposeBehavior,
    Polygon,
    EntityManager,
    Time,
    StateMachine,
    NavMesh,
  };
});

describe('Hooks exports', () => {
  it('should export useKeyboardControls from index', async () => {
    const hooks = await import('../index');
    expect(hooks.useKeyboardControls).toBeDefined();
    expect(typeof hooks.useKeyboardControls).toBe('function');
  });

  it('should export all Yuka behavior hooks from index', async () => {
    const hooks = await import('../index');

    expect(hooks.useSeek).toBeDefined();
    expect(hooks.useFlee).toBeDefined();
    expect(hooks.useArrive).toBeDefined();
    expect(hooks.usePursue).toBeDefined();
    expect(hooks.useEvade).toBeDefined();
    expect(hooks.useWander).toBeDefined();
    expect(hooks.useFollowPath).toBeDefined();
    expect(hooks.useSeparation).toBeDefined();
    expect(hooks.useAlignment).toBeDefined();
    expect(hooks.useCohesion).toBeDefined();
    expect(hooks.useObstacleAvoidance).toBeDefined();
    expect(hooks.useOffsetPursuit).toBeDefined();
    expect(hooks.useInterpose).toBeDefined();
  });

  it('should re-export the YUKA namespace', async () => {
    const hooks = await import('../index');
    expect(hooks.YUKA).toBeDefined();
  });
});

describe('DEFAULT_KEYBOARD_MAPPING', () => {
  it('should export the default keyboard mapping', async () => {
    const { DEFAULT_KEYBOARD_MAPPING } = await import('../useKeyboardControls');
    expect(DEFAULT_KEYBOARD_MAPPING).toBeDefined();
    expect(typeof DEFAULT_KEYBOARD_MAPPING).toBe('object');
  });

  it('should map WASD keys to movement actions', async () => {
    const { DEFAULT_KEYBOARD_MAPPING } = await import('../useKeyboardControls');

    expect(DEFAULT_KEYBOARD_MAPPING.w).toBe('forward');
    expect(DEFAULT_KEYBOARD_MAPPING.s).toBe('backward');
    expect(DEFAULT_KEYBOARD_MAPPING.a).toBe('left');
    expect(DEFAULT_KEYBOARD_MAPPING.d).toBe('right');
  });

  it('should map arrow keys to movement actions', async () => {
    const { DEFAULT_KEYBOARD_MAPPING } = await import('../useKeyboardControls');

    expect(DEFAULT_KEYBOARD_MAPPING.arrowup).toBe('forward');
    expect(DEFAULT_KEYBOARD_MAPPING.arrowdown).toBe('backward');
    expect(DEFAULT_KEYBOARD_MAPPING.arrowleft).toBe('left');
    expect(DEFAULT_KEYBOARD_MAPPING.arrowright).toBe('right');
  });

  it('should map space to fire', async () => {
    const { DEFAULT_KEYBOARD_MAPPING } = await import('../useKeyboardControls');
    expect(DEFAULT_KEYBOARD_MAPPING[' ']).toBe('fire');
  });

  it('should map shift to sprint', async () => {
    const { DEFAULT_KEYBOARD_MAPPING } = await import('../useKeyboardControls');
    expect(DEFAULT_KEYBOARD_MAPPING.shift).toBe('sprint');
  });
});

describe('Keyboard action tracking', () => {
  it('should track key state as boolean map', () => {
    const actions: Record<string, boolean> = {};
    const mapping: Record<string, string> = { w: 'forward', s: 'backward' };

    // Simulate keydown
    const key = 'w';
    const action = mapping[key];
    if (action) {
      actions[action] = true;
    }
    expect(actions.forward).toBe(true);

    // Simulate keyup
    actions[action] = false;
    expect(actions.forward).toBe(false);
  });

  it('should lowercase key before lookup', () => {
    const mapping: Record<string, string> = { w: 'forward' };
    const key = 'W';
    const action = mapping[key.toLowerCase()];
    expect(action).toBe('forward');
  });

  it('should ignore unmapped keys', () => {
    const mapping: Record<string, string> = { w: 'forward' };
    const actions: Record<string, boolean> = {};

    const key = 'q';
    const action = mapping[key];
    if (action) {
      actions[action] = true;
    }

    expect(Object.keys(actions)).toHaveLength(0);
  });
});
