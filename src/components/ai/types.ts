import type { ReactNode } from 'react';
import type * as THREE from 'three';
import type * as YUKA from 'yuka';

/**
 * Context value provided by YukaEntityManager.
 * @category Entities & Simulation
 */
export interface YukaEntityManagerContextValue {
    /** The Yuka EntityManager instance. */
    manager: YUKA.EntityManager;
    /** Yuka Time instance for delta time calculations. */
    time: YUKA.Time;
    /** Function to register entities with the manager. */
    register: (entity: YUKA.GameEntity) => void;
    /** Function to unregister entities from the manager. */
    unregister: (entity: YUKA.GameEntity) => void;
}

/**
 * Props for the YukaEntityManager component.
 * @category Entities & Simulation
 */
export interface YukaEntityManagerProps {
    /** Child components that will have access to the Yuka context. */
    children?: ReactNode;
}

/**
 * Props for the YukaVehicle component.
 * @category Entities & Simulation
 */
export interface YukaVehicleProps {
    /** Maximum speed of the vehicle. Default: 5. */
    maxSpeed?: number;
    /** Maximum steering force. Default: 10. */
    maxForce?: number;
    /** Mass affecting momentum. Default: 1. */
    mass?: number;
    /** Initial position [x, y, z]. Default: [0, 0, 0]. */
    position?: [number, number, number];
    /** Initial rotation [x, y, z] in radians. Default: [0, 0, 0]. */
    rotation?: [number, number, number];
    /** Child components to render (visual representation). */
    children?: ReactNode;
    /** Callback called each frame with vehicle and delta time. */
    onUpdate?: (vehicle: YUKA.Vehicle, delta: number) => void;
}

/**
 * Ref interface for YukaVehicle imperative control.
 * @category Entities & Simulation
 */
export interface YukaVehicleRef {
    /** The underlying Yuka Vehicle instance. */
    vehicle: YUKA.Vehicle;
    /** Add a steering behavior to the vehicle. */
    addBehavior: (behavior: YUKA.SteeringBehavior) => void;
    /** Remove a steering behavior from the vehicle. */
    removeBehavior: (behavior: YUKA.SteeringBehavior) => void;
    /** Remove all steering behaviors. */
    clearBehaviors: () => void;
}

/**
 * Props for the YukaPath component.
 * @category Entities & Simulation
 */
export interface YukaPathProps {
    /** Array of waypoint positions [[x,y,z], ...]. */
    waypoints: Array<[number, number, number]>;
    /** Whether the path loops back to the start. Default: false. */
    loop?: boolean;
    /** Show path visualization. Default: false. */
    visible?: boolean;
    /** Color of the path line. Default: 0x00ff00. */
    color?: THREE.ColorRepresentation;
    /** Width of the path line. Default: 2. */
    lineWidth?: number;
    /** Show small spheres at waypoint positions. Default: false. */
    showWaypoints?: boolean;
    /** Size of waypoint spheres. Default: 0.2. */
    waypointSize?: number;
    /** Color of waypoint spheres. Defaults to path color. */
    waypointColor?: THREE.ColorRepresentation;
    /** Show direction arrows between waypoints. Default: false. */
    showDirection?: boolean;
}

/**
 * Ref interface for YukaPath.
 * @category Entities & Simulation
 */
export interface YukaPathRef {
    /** The underlying Yuka Path instance. */
    path: YUKA.Path;
}

/**
 * Configuration for a state in the state machine.
 * @category Entities & Simulation
 */
export interface StateConfig {
    /** Unique state name. */
    name: string;
    /** Called when entering this state. */
    onEnter?: (entity: YUKA.GameEntity) => void;
    /** Called each frame while in this state. */
    onExecute?: (entity: YUKA.GameEntity) => void;
    /** Called when exiting this state. */
    onExit?: (entity: YUKA.GameEntity) => void;
}

/**
 * Props for the YukaStateMachine component.
 * @category Entities & Simulation
 */
export interface YukaStateMachineProps {
    /** The entity this state machine controls. If omitted, a dummy entity is used. */
    entity?: YUKA.GameEntity;
    /** Array of state configurations. */
    states: StateConfig[];
    /** Name of the starting state. */
    initialState: string;
    /** Optional state that runs alongside the current state. */
    globalState?: StateConfig;
}

/**
 * Ref interface for YukaStateMachine imperative control.
 * @category Entities & Simulation
 */
export interface YukaStateMachineRef {
    /** The underlying Yuka StateMachine. */
    stateMachine: YUKA.StateMachine<YUKA.GameEntity>;
    /** Transition to a named state. */
    changeTo: (stateName: string) => void;
    /** Return to the previous state. */
    revert: () => void;
    /** Get current state name. */
    getCurrentState: () => string | null;
}

/**
 * Props for the YukaNavMesh component.
 * @category Entities & Simulation
 */
export interface YukaNavMeshProps {
    /** Three.js geometry to create nav mesh from. */
    geometry: THREE.BufferGeometry;
    /** Show nav mesh visualization. Default: false. */
    visible?: boolean;
    /** Show as wireframe. Default: true. */
    wireframe?: boolean;
    /** Color of the visualization. Default: 0x0088ff. */
    color?: THREE.ColorRepresentation;
}

/**
 * Ref interface for YukaNavMesh imperative control.
 * @category Entities & Simulation
 */
export interface YukaNavMeshRef {
    /** The underlying Yuka NavMesh instance. */
    navMesh: YUKA.NavMesh;
    /** Find a path between two world positions. */
    findPath: (from: THREE.Vector3, to: THREE.Vector3) => THREE.Vector3[];
    /** Get a random walkable region. */
    getRandomRegion: () => YUKA.Polygon | null;
    /** Get the closest region to a point. */
    getClosestRegion: (point: THREE.Vector3) => YUKA.Polygon | null;
}
