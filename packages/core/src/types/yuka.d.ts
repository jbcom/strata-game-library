declare module 'yuka' {
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    clone(): Vector3;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    multiplyScalar(s: number): this;
    distanceTo(v: Vector3): number;
    applyRotation(q: Quaternion): this;
  }

  export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x: number, y: number, z: number, w: number): this;
  }

  export class Matrix4 {
    elements: number[];
  }

  export class GameEntity {
    name: string;
    active: boolean;
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    forward: Vector3;
    up: Vector3;
    boundingRadius: number;
    worldMatrix: Matrix4;
    neighbors: GameEntity[];
    neighborhoodRadius: number;
    updateNeighborhood: boolean;
    update(delta: number): this;
  }

  export class MovingEntity extends GameEntity {
    velocity: Vector3;
    maxSpeed: number;
  }

  export class Vehicle extends MovingEntity {
    mass: number;
    maxForce: number;
    steering: SteeringManager;
    smoother: Smoother | null;
  }

  export class SteeringManager {
    add(behavior: SteeringBehavior): this;
    remove(behavior: SteeringBehavior): this;
    clear(): this;
  }

  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  export class Smoother {
    constructor(count: number);
  }

  export class SteeringBehavior {
    active: boolean;
    weight: number;
  }

  export class SeekBehavior extends SteeringBehavior {
    target: Vector3;
  }

  export class FleeBehavior extends SteeringBehavior {
    target: Vector3;
    panicDistance: number;
  }

  export class ArriveBehavior extends SteeringBehavior {
    target: Vector3;
    deceleration: number;
    tolerance: number;
  }

  export class PursuitBehavior extends SteeringBehavior {
    constructor(evader?: Vehicle);
    evader: Vehicle | null;
  }

  export class EvadeBehavior extends SteeringBehavior {
    constructor(pursuer?: Vehicle);
    pursuer: Vehicle | null;
    panicDistance: number;
  }

  export class WanderBehavior extends SteeringBehavior {
    radius: number;
    distance: number;
    jitter: number;
  }

  export class FollowPathBehavior extends SteeringBehavior {
    constructor(path?: Path);
    path: Path | null;
    nextWaypointDistance: number;
  }

  export class SeparationBehavior extends SteeringBehavior {}

  export class AlignmentBehavior extends SteeringBehavior {}

  export class CohesionBehavior extends SteeringBehavior {}

  export class ObstacleAvoidanceBehavior extends SteeringBehavior {
    constructor(obstacles?: GameEntity[]);
    obstacles: GameEntity[];
    dBoxMinLength: number;
  }

  export class OffsetPursuitBehavior extends SteeringBehavior {
    constructor(leader?: Vehicle, offset?: Vector3);
    leader: Vehicle | null;
    offset: Vector3;
  }

  export class InterposeBehavior extends SteeringBehavior {
    constructor(entity1?: Vehicle, entity2?: Vehicle);
    entity1: Vehicle | null;
    entity2: Vehicle | null;
  }

  export class Path {
    loop: boolean;
    constructor();
    add(waypoint: Vector3): this;
    clear(): this;
    current(): Vector3;
    finished(): boolean;
    advance(): this;
  }

  export class EntityManager {
    constructor();
    add(entity: GameEntity): this;
    remove(entity: GameEntity): this;
    clear(): this;
    update(delta: number): this;
  }

  export class Time {
    constructor();
    getDelta(): number;
    getElapsed(): number;
    update(): this;
  }

  export class State<T extends GameEntity> {
    enter(entity: T): void;
    execute(entity: T): void;
    exit(entity: T): void;
  }

  export class StateMachine<T extends GameEntity> {
    owner: T;
    currentState: State<T> | null;
    previousState: State<T> | null;
    globalState: State<T> | null;
    constructor(owner: T);
    update(): this;
    changeTo(state: State<T>): this;
    revert(): this;
    in(state: State<T>): boolean;
    handleMessage(telegram: unknown): boolean;
  }

  export class Polygon {
    vertices: Vector3[];
    plane: { normal: Vector3; constant: number };
    centroid: Vector3;
    constructor();
    fromContour(contour: Vector3[]): this;
  }

  export class NavMesh {
    regions: Polygon[];
    constructor();
    fromPolygons(polygons: Polygon[]): this;
    findPath(from: Vector3, to: Vector3): Vector3[];
    getClosestRegion(point: Vector3): Polygon | null;
    getRandomRegion(): Polygon | null;
    clampMovement(
      currentRegion: Polygon,
      startPosition: Vector3,
      endPosition: Vector3,
      clampedPosition: Vector3
    ): Polygon | null;
  }

  export class NavMeshLoader {
    load(url: string): Promise<NavMesh>;
  }

  export class Trigger extends GameEntity {
    constructor(region?: TriggerRegion);
    region: TriggerRegion | null;
    check(entity: GameEntity): void;
    execute(entity: GameEntity): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  export class TriggerRegion {
    constructor();
  }

  export class SphericalTriggerRegion extends TriggerRegion {
    radius: number;
    constructor(radius?: number);
  }

  export class RectangularTriggerRegion extends TriggerRegion {
    size: Vector3;
    constructor(size?: Vector3);
  }

  export class Vision {
    owner: GameEntity | null;
    fieldOfView: number;
    range: number;
    constructor(owner?: GameEntity);
    visible(target: Vector3): boolean;
  }

  export class MemorySystem {
    owner: GameEntity | null;
    constructor(owner?: GameEntity);
    createRecord(entity: GameEntity): this;
    deleteRecord(entity: GameEntity): this;
    getRecord(entity: GameEntity): MemoryRecord | null;
    hasRecord(entity: GameEntity): boolean;
  }

  export class MemoryRecord {
    entity: GameEntity;
    lastSensedTime: number;
    timeBecameVisible: number;
    timeLastVisible: number;
    visible: boolean;
  }

  export class Think<T extends GameEntity> {
    owner: T;
    evaluators: GoalEvaluator<T>[];
    constructor(owner: T);
    addEvaluator(evaluator: GoalEvaluator<T>): this;
    arbitrate(): this;
    execute(): void;
    terminate(): void;
    activateIfInactive(): void;
  }

  export class Goal<T extends GameEntity> {
    owner: T;
    status: string;
    constructor(owner?: T);
    activate(): void;
    execute(): void;
    terminate(): void;
    addSubgoal(goal: Goal<T>): this;
  }

  export class GoalEvaluator<T extends GameEntity> {
    constructor(characterBias?: number);
    calculateDesirability(owner: T): number;
    setGoal(owner: T): void;
  }
}
