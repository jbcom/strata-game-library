/**
 * Opt-in Yuka integration for Strata games rendered with React Three Fiber.
 *
 * Install the `yuka`, `three`, `react`, and `@react-three/fiber` peer
 * dependencies, then import this surface from `strata-game-library/yuka`.
 * @packageDocumentation
 */

export type {
  StateConfig,
  YukaEntityManagerContextValue,
  YukaEntityManagerProps,
  YukaNavMeshProps,
  YukaNavMeshRef,
  YukaPathProps,
  YukaPathRef,
  YukaStateMachineProps,
  YukaStateMachineRef,
  YukaVehicleProps,
  YukaVehicleRef,
} from './components/index.js';
export {
  createPolygonsFromGeometry,
  syncYukaToThree,
  threeVector3ToYuka,
  useYukaContext,
  YukaEntityManager,
  YukaNavMesh,
  YukaPath,
  YukaStateMachine,
  YukaVehicle,
  yukaVector3ToThree,
} from './components/index.js';
export type {
  UseAlignmentOptions,
  UseArriveOptions,
  UseCohesionOptions,
  UseEvadeOptions,
  UseFleeOptions,
  UseFollowPathOptions,
  UseInterposeOptions,
  UseObstacleAvoidanceOptions,
  UseOffsetPursuitOptions,
  UsePursueOptions,
  UseSeekOptions,
  UseSeparationOptions,
  UseWanderOptions,
} from './useYuka.js';
export {
  useAlignment,
  useArrive,
  useCohesion,
  useEvade,
  useFlee,
  useFollowPath,
  useInterpose,
  useObstacleAvoidance,
  useOffsetPursuit,
  usePursue,
  useSeek,
  useSeparation,
  useWander,
  YUKA,
} from './useYuka.js';
