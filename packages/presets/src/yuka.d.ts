declare module 'yuka' {
  export class Vehicle {
    position: Vector3;
    velocity: Vector3;
    maxSpeed: number;
    maxForce: number;
    mass: number;
    steering: SteeringManager;
    neighborhoodRadius: number;
    updateNeighborhood: boolean;
    update(delta: number): this;
  }

  export class SteeringManager {
    add(behavior: SteeringBehavior): this;
  }

  export class SteeringBehavior {
    active: boolean;
    weight: number;
  }

  export class SeekBehavior extends SteeringBehavior {
    constructor(target?: Vector3);
    target: Vector3;
  }

  export class FleeBehavior extends SteeringBehavior {
    constructor(target?: Vector3, panicDistance?: number);
    target: Vector3;
    panicDistance: number;
  }

  export class ArriveBehavior extends SteeringBehavior {
    constructor(target?: Vector3, deceleration?: number, tolerance?: number);
    target: Vector3;
    deceleration: number;
    tolerance: number;
  }

  export class WanderBehavior extends SteeringBehavior {
    constructor(radius?: number, distance?: number, jitter?: number);
    radius: number;
    distance: number;
    jitter: number;
  }

  export class SeparationBehavior extends SteeringBehavior {
    constructor();
  }

  export class AlignmentBehavior extends SteeringBehavior {
    constructor();
  }

  export class CohesionBehavior extends SteeringBehavior {
    constructor();
  }

  export class PursuitBehavior extends SteeringBehavior {
    constructor(evader?: Vehicle);
    evader: Vehicle | null;
  }

  export class EvadeBehavior extends SteeringBehavior {
    constructor(pursuer?: Vehicle);
    pursuer: Vehicle | null;
  }

  export class FollowPathBehavior extends SteeringBehavior {
    constructor(path?: Path, nextWaypointDistance?: number);
    path: Path;
    nextWaypointDistance: number;
  }

  export class Path {
    constructor();
    add(waypoint: Vector3): this;
    clear(): this;
    loop: boolean;
  }

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    clone(): Vector3;
    applyRotation(q: Quaternion): this;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    multiplyScalar(s: number): this;
    normalize(): this;
    length(): number;
    distanceTo(v: Vector3): number;
  }

  export class EntityManager {
    add(entity: GameEntity): this;
    remove(entity: GameEntity): this;
    update(delta: number): this;
    entities: GameEntity[];
  }

  export class GameEntity {
    name: string;
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    boundingRadius: number;
    active: boolean;
  }

  export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
  }

  export class StateMachine<T> {
    constructor(owner?: T);
    owner: T;
    currentState: State<T>;
    previousState: State<T>;
    globalState: State<T>;
    add(id: string, state: State<T>): this;
    changeTo(state: State<T>): this;
    update(): this;
  }

  export class State<T> {
    enter(owner: T): void;
    execute(owner: T): void;
    exit(owner: T): void;
  }
}
