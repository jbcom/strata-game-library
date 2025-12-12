/**
 * YukaJS React Component Wrappers
 *
 * Integrates Yuka game AI library with React Three Fiber.
 * Provides steering behaviors, pathfinding, FSM, and perception.
 * @module components/AI
 */

import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type React from 'react';
import {
    createContext,
    forwardRef,
    type ReactNode,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react';
import * as THREE from 'three';
import * as YUKA from 'yuka';

/**
 * Context value provided by YukaEntityManager
 *
 * @property manager - The Yuka EntityManager instance
 * @property time - Yuka Time instance for delta time
 * @property register - Function to register entities
 * @property unregister - Function to unregister entities
 */
export interface YukaEntityManagerContextValue {
    manager: YUKA.EntityManager;
    time: YUKA.Time;
    register: (entity: YUKA.GameEntity) => void;
    unregister: (entity: YUKA.GameEntity) => void;
}

/**
 * Props for the YukaVehicle component
 *
 * @property maxSpeed - Maximum speed of the vehicle
 * @property maxForce - Maximum steering force
 * @property mass - Mass affecting momentum
 * @property position - Initial position [x, y, z]
 * @property rotation - Initial rotation [x, y, z]
 * @property children - Child components to render
 * @property onUpdate - Callback called each frame with vehicle and delta
 */
export interface YukaVehicleProps {
    maxSpeed?: number;
    maxForce?: number;
    mass?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    children?: ReactNode;
    onUpdate?: (vehicle: YUKA.Vehicle, delta: number) => void;
}

/**
 * Ref interface for YukaVehicle imperative control
 *
 * @property vehicle - The underlying Yuka Vehicle instance
 * @property addBehavior - Add a steering behavior
 * @property removeBehavior - Remove a steering behavior
 * @property clearBehaviors - Remove all behaviors
 */
export interface YukaVehicleRef {
    vehicle: YUKA.Vehicle;
    addBehavior: (behavior: YUKA.SteeringBehavior) => void;
    removeBehavior: (behavior: YUKA.SteeringBehavior) => void;
    clearBehaviors: () => void;
}

/**
 * Props for the YukaPath component
 *
 * @property waypoints - Array of waypoint positions [[x,y,z], ...]
 * @property loop - Whether the path loops back to start
 * @property visible - Show path visualization
 * @property color - Color of the path line
 * @property lineWidth - Width of the path line
 * @property showWaypoints - Show small spheres at waypoint positions
 * @property waypointSize - Size of waypoint spheres (default: 0.2)
 * @property waypointColor - Color of waypoint spheres
 * @property showDirection - Show direction arrows between waypoints
 */
export interface YukaPathProps {
    waypoints: Array<[number, number, number]>;
    loop?: boolean;
    visible?: boolean;
    color?: THREE.ColorRepresentation;
    lineWidth?: number;
    showWaypoints?: boolean;
    waypointSize?: number;
    waypointColor?: THREE.ColorRepresentation;
    showDirection?: boolean;
}

/**
 * Ref interface for YukaPath
 *
 * @property path - The underlying Yuka Path instance
 */
export interface YukaPathRef {
    path: YUKA.Path;
}

/**
 * Configuration for a state in the state machine
 *
 * @property name - Unique state name
 * @property onEnter - Called when entering this state
 * @property onExecute - Called each frame while in this state
 * @property onExit - Called when exiting this state
 */
export interface StateConfig {
    name: string;
    onEnter?: (entity: YUKA.GameEntity) => void;
    onExecute?: (entity: YUKA.GameEntity) => void;
    onExit?: (entity: YUKA.GameEntity) => void;
}

/**
 * Props for the YukaStateMachine component
 *
 * @property entity - The entity this state machine controls
 * @property states - Array of state configurations
 * @property initialState - Name of the starting state
 * @property globalState - Optional state that runs alongside current state
 */
export interface YukaStateMachineProps {
    entity?: YUKA.GameEntity;
    states: StateConfig[];
    initialState: string;
    globalState?: StateConfig;
}

/**
 * Ref interface for YukaStateMachine imperative control
 *
 * @property stateMachine - The underlying Yuka StateMachine
 * @property changeTo - Transition to a named state
 * @property revert - Return to previous state
 * @property getCurrentState - Get current state name
 */
export interface YukaStateMachineRef {
    stateMachine: YUKA.StateMachine<YUKA.GameEntity>;
    changeTo: (stateName: string) => void;
    revert: () => void;
    getCurrentState: () => string | null;
}

/**
 * Props for the YukaNavMesh component
 *
 * @property geometry - Three.js geometry to create nav mesh from
 * @property visible - Show nav mesh visualization
 * @property wireframe - Show as wireframe
 * @property color - Color of the visualization
 */
export interface YukaNavMeshProps {
    geometry: THREE.BufferGeometry;
    visible?: boolean;
    wireframe?: boolean;
    color?: THREE.ColorRepresentation;
}

/**
 * Ref interface for YukaNavMesh imperative control
 *
 * @property navMesh - The underlying Yuka NavMesh
 * @property findPath - Find path between two points
 * @property getRandomRegion - Get a random walkable region
 * @property getClosestRegion - Get closest region to a point
 */
export interface YukaNavMeshRef {
    navMesh: YUKA.NavMesh;
    findPath: (from: THREE.Vector3, to: THREE.Vector3) => THREE.Vector3[];
    getRandomRegion: () => YUKA.Polygon | null;
    getClosestRegion: (point: THREE.Vector3) => YUKA.Polygon | null;
}

const YukaContext = createContext<YukaEntityManagerContextValue | null>(null);

/**
 * Hook to access the Yuka context within a YukaEntityManager.
 * Must be used inside a YukaEntityManager component tree.
 *
 * @example
 * ```tsx
 * function AIComponent() {
 *   const { manager, register } = useYukaContext();
 *   // Access Yuka functionality
 * }
 * ```
 *
 * @returns YukaEntityManagerContextValue with manager and registration functions
 * @throws Error if used outside YukaEntityManager
 */
export function useYukaContext(): YukaEntityManagerContextValue {
    const context = useContext(YukaContext);
    if (!context) {
        throw new Error('useYukaContext must be used within a YukaEntityManager');
    }
    return context;
}

function syncYukaToThree(yukaEntity: YUKA.GameEntity, threeObject: THREE.Object3D): void {
    const matrix = yukaEntity.worldMatrix;
    threeObject.matrix.set(
        matrix.elements[0],
        matrix.elements[3],
        matrix.elements[6],
        0,
        matrix.elements[1],
        matrix.elements[4],
        matrix.elements[7],
        0,
        matrix.elements[2],
        matrix.elements[5],
        matrix.elements[8],
        0,
        yukaEntity.position.x,
        yukaEntity.position.y,
        yukaEntity.position.z,
        1
    );
    threeObject.matrixAutoUpdate = false;
    threeObject.matrixWorldNeedsUpdate = true;
}

function yukaVector3ToThree(yukaVec: YUKA.Vector3): THREE.Vector3 {
    return new THREE.Vector3(yukaVec.x, yukaVec.y, yukaVec.z);
}

function threeVector3ToYuka(threeVec: THREE.Vector3): YUKA.Vector3 {
    return new YUKA.Vector3(threeVec.x, threeVec.y, threeVec.z);
}

/**
 * Props for the YukaEntityManager component
 *
 * @property children - Child components that can use Yuka AI
 */
export interface YukaEntityManagerProps {
    children?: ReactNode;
}

/**
 * Context provider that manages Yuka AI entities and updates them each frame.
 * Must wrap all Yuka-related components in your scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <YukaEntityManager>
 *     <YukaVehicle maxSpeed={5}>
 *       <mesh>
 *         <boxGeometry />
 *         <meshStandardMaterial />
 *       </mesh>
 *     </YukaVehicle>
 *     <YukaPath waypoints={[[0,0,0], [10,0,0], [10,0,10]]} />
 *   </YukaEntityManager>
 * </Canvas>
 * ```
 *
 * @param props - YukaEntityManagerProps
 * @returns Provider component for Yuka AI context
 */
export function YukaEntityManager({ children }: YukaEntityManagerProps): React.JSX.Element {
    const managerRef = useRef<YUKA.EntityManager>(new YUKA.EntityManager());
    const timeRef = useRef<YUKA.Time>(new YUKA.Time());

    const register = (entity: YUKA.GameEntity) => {
        managerRef.current.add(entity);
    };

    const unregister = (entity: YUKA.GameEntity) => {
        managerRef.current.remove(entity);
    };

    useFrame(() => {
        const delta = timeRef.current.update().getDelta();
        managerRef.current.update(delta);
    });

    const contextValue = useMemo<YukaEntityManagerContextValue>(
        () => ({
            manager: managerRef.current,
            time: timeRef.current,
            register,
            unregister,
        }),
        [register, unregister]
    );

    return <YukaContext.Provider value={contextValue}>{children}</YukaContext.Provider>;
}

/**
 * Autonomous vehicle agent with steering behaviors.
 * Syncs Yuka AI transforms to Three.js objects automatically.
 *
 * @example
 * ```tsx
 * // Basic wandering agent
 * const vehicleRef = useRef<YukaVehicleRef>(null);
 *
 * useEffect(() => {
 *   const wander = new YUKA.WanderBehavior();
 *   vehicleRef.current?.addBehavior(wander);
 * }, []);
 *
 * <YukaVehicle
 *   ref={vehicleRef}
 *   maxSpeed={3}
 *   position={[0, 0, 0]}
 * >
 *   <mesh><boxGeometry /></mesh>
 * </YukaVehicle>
 *
 * // Path following agent
 * <YukaVehicle
 *   maxSpeed={5}
 *   onUpdate={(vehicle) => {
 *     const follow = new YUKA.FollowPathBehavior(path);
 *     vehicle.steering.add(follow);
 *   }}
 * >
 *   <EnemyModel />
 * </YukaVehicle>
 * ```
 *
 * @param props - YukaVehicleProps configuration
 * @returns React element containing the vehicle group
 */
export const YukaVehicle = forwardRef<YukaVehicleRef, YukaVehicleProps>(function YukaVehicle(
    {
        maxSpeed = 5,
        maxForce = 10,
        mass = 1,
        position = [0, 0, 0],
        rotation = [0, 0, 0],
        children,
        onUpdate,
    },
    ref
) {
    const { register, unregister } = useYukaContext();
    const groupRef = useRef<THREE.Group>(null);
    const vehicleRef = useRef<YUKA.Vehicle>(new YUKA.Vehicle());

    useEffect(() => {
        const vehicle = vehicleRef.current;
        vehicle.maxSpeed = maxSpeed;
        vehicle.maxForce = maxForce;
        vehicle.mass = mass;
        vehicle.position.set(position[0], position[1], position[2]);

        const euler = new THREE.Euler(rotation[0], rotation[1], rotation[2]);
        const quaternion = new THREE.Quaternion().setFromEuler(euler);
        vehicle.rotation.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

        register(vehicle);

        return () => {
            unregister(vehicle);
        };
    }, [register, unregister, maxSpeed, maxForce, mass, position, rotation]);

    useFrame((_, delta) => {
        const vehicle = vehicleRef.current;
        const group = groupRef.current;

        if (group) {
            syncYukaToThree(vehicle, group);
        }

        if (onUpdate) {
            onUpdate(vehicle, delta);
        }
    });

    useImperativeHandle(
        ref,
        () => ({
            vehicle: vehicleRef.current,
            addBehavior: (behavior: YUKA.SteeringBehavior) => {
                vehicleRef.current.steering.add(behavior);
            },
            removeBehavior: (behavior: YUKA.SteeringBehavior) => {
                vehicleRef.current.steering.remove(behavior);
            },
            clearBehaviors: () => {
                vehicleRef.current.steering.clear();
            },
        }),
        []
    );

    return <group ref={groupRef}>{children}</group>;
});

/**
 * Path definition component for AI agents to follow.
 * Provides waypoints for FollowPathBehavior and path visualization.
 *
 * @example
 * ```tsx
 * // Patrol path with visualization
 * const pathRef = useRef<YukaPathRef>(null);
 *
 * <YukaPath
 *   ref={pathRef}
 *   waypoints={[
 *     [0, 0, 0],
 *     [10, 0, 0],
 *     [10, 0, 10],
 *     [0, 0, 10]
 *   ]}
 *   loop={true}
 *   visible={true}
 *   color="#00ff00"
 *   showWaypoints={true}
 *   showDirection={true}
 * />
 *
 * // Use with FollowPathBehavior
 * useEffect(() => {
 *   const follow = new YUKA.FollowPathBehavior(pathRef.current.path);
 *   vehicleRef.current?.addBehavior(follow);
 * }, []);
 * ```
 *
 * @param props - YukaPathProps configuration
 * @returns React element with optional path visualization
 */
export const YukaPath = forwardRef<YukaPathRef, YukaPathProps>(function YukaPath(
    {
        waypoints,
        loop = false,
        visible = false,
        color = 0x00ff00,
        lineWidth = 2,
        showWaypoints = false,
        waypointSize = 0.2,
        waypointColor,
        showDirection = false,
    },
    ref
) {
    const pathRef = useRef<YUKA.Path>(new YUKA.Path());

    useEffect(() => {
        const path = pathRef.current;
        path.clear();
        path.loop = loop;

        for (const [x, y, z] of waypoints) {
            path.add(new YUKA.Vector3(x, y, z));
        }
    }, [waypoints, loop]);

    useImperativeHandle(
        ref,
        () => ({
            path: pathRef.current,
        }),
        []
    );

    const linePoints = useMemo(() => {
        if (!visible || waypoints.length < 2) return null;

        const points: Array<[number, number, number]> = [...waypoints];
        if (loop && points.length > 2) {
            points.push(waypoints[0]);
        }
        return points;
    }, [waypoints, loop, visible]);

    const directionArrows = useMemo(() => {
        if (!showDirection || !visible || waypoints.length < 2) return [];

        const arrows: Array<{
            position: [number, number, number];
            rotation: [number, number, number];
        }> = [];

        const pointCount = loop ? waypoints.length : waypoints.length - 1;
        for (let i = 0; i < pointCount; i++) {
            const from = waypoints[i];
            const to = waypoints[(i + 1) % waypoints.length];

            const midX = (from[0] + to[0]) / 2;
            const midY = (from[1] + to[1]) / 2;
            const midZ = (from[2] + to[2]) / 2;

            const dx = to[0] - from[0];
            const dy = to[1] - from[1];
            const dz = to[2] - from[2];
            const yaw = Math.atan2(dx, dz);
            const pitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));

            arrows.push({
                position: [midX, midY, midZ],
                rotation: [pitch, yaw, 0],
            });
        }

        return arrows;
    }, [waypoints, loop, showDirection, visible]);

    const effectiveWaypointColor = waypointColor ?? color;

    if (!visible) {
        return null;
    }

    return (
        <group>
            {linePoints && linePoints.length >= 2 && (
                <Line points={linePoints} color={color} lineWidth={lineWidth} />
            )}

            {showWaypoints &&
                waypoints.map((wp, index) => (
                    <mesh key={`waypoint-${index}`} position={wp}>
                        <sphereGeometry args={[waypointSize, 8, 8]} />
                        <meshBasicMaterial color={effectiveWaypointColor} />
                    </mesh>
                ))}

            {showDirection &&
                directionArrows.map((arrow, index) => (
                    <mesh
                        key={`arrow-${index}`}
                        position={arrow.position}
                        rotation={arrow.rotation}
                    >
                        <coneGeometry args={[waypointSize * 0.5, waypointSize * 1.5, 6]} />
                        <meshBasicMaterial color={color} />
                    </mesh>
                ))}
        </group>
    );
});

class YukaState extends YUKA.State<YUKA.GameEntity> {
    name: string;
    private _onEnter?: (entity: YUKA.GameEntity) => void;
    private _onExecute?: (entity: YUKA.GameEntity) => void;
    private _onExit?: (entity: YUKA.GameEntity) => void;

    constructor(config: StateConfig) {
        super();
        this.name = config.name;
        this._onEnter = config.onEnter;
        this._onExecute = config.onExecute;
        this._onExit = config.onExit;
    }

    enter(entity: YUKA.GameEntity): void {
        if (this._onEnter) this._onEnter(entity);
    }

    execute(entity: YUKA.GameEntity): void {
        if (this._onExecute) this._onExecute(entity);
    }

    exit(entity: YUKA.GameEntity): void {
        if (this._onExit) this._onExit(entity);
    }
}

/**
 * Finite State Machine component for AI behavior control.
 * Manages state transitions with enter/execute/exit callbacks.
 *
 * @example
 * ```tsx
 * // Enemy AI with patrol and chase states
 * const stateRef = useRef<YukaStateMachineRef>(null);
 *
 * const states: StateConfig[] = [
 *   {
 *     name: 'patrol',
 *     onEnter: () => console.log('Starting patrol'),
 *     onExecute: (entity) => {
 *       if (canSeePlayer(entity)) {
 *         stateRef.current?.changeTo('chase');
 *       }
 *     }
 *   },
 *   {
 *     name: 'chase',
 *     onEnter: () => console.log('Chasing player!'),
 *     onExecute: (entity) => {
 *       if (!canSeePlayer(entity)) {
 *         stateRef.current?.revert();
 *       }
 *     }
 *   }
 * ];
 *
 * <YukaStateMachine
 *   ref={stateRef}
 *   states={states}
 *   initialState="patrol"
 * />
 * ```
 *
 * @param props - YukaStateMachineProps configuration
 * @returns null (logic only component)
 */
export const YukaStateMachine = forwardRef<YukaStateMachineRef, YukaStateMachineProps>(
    function YukaStateMachine({ entity, states, initialState, globalState }, ref) {
        const stateMachineRef = useRef<YUKA.StateMachine<YUKA.GameEntity> | null>(null);
        const statesMapRef = useRef<Map<string, YukaState>>(new Map());
        const dummyEntityRef = useRef<YUKA.GameEntity>(new YUKA.GameEntity());

        useEffect(() => {
            const targetEntity = entity || dummyEntityRef.current;
            const sm = new YUKA.StateMachine(targetEntity);
            stateMachineRef.current = sm;
            statesMapRef.current.clear();

            for (const config of states) {
                const state = new YukaState(config);
                statesMapRef.current.set(config.name, state);
            }

            if (globalState) {
                sm.globalState = new YukaState(globalState);
            }

            const initial = statesMapRef.current.get(initialState);
            if (initial) {
                sm.currentState = initial;
                initial.enter(targetEntity);
            }

            return () => {
                stateMachineRef.current = null;
            };
        }, [entity, states, initialState, globalState]);

        useFrame(() => {
            if (stateMachineRef.current) {
                stateMachineRef.current.update();
            }
        });

        useImperativeHandle(
            ref,
            () => ({
                // Use getter to return current value instead of captured null
                get stateMachine() {
                    return stateMachineRef.current!;
                },
                changeTo: (stateName: string) => {
                    const sm = stateMachineRef.current;
                    const state = statesMapRef.current.get(stateName);
                    if (sm && state) {
                        sm.changeTo(state);
                    }
                },
                revert: () => {
                    stateMachineRef.current?.revert();
                },
                getCurrentState: () => {
                    const current = stateMachineRef.current?.currentState;
                    if (current && current instanceof YukaState) {
                        return current.name;
                    }
                    return null;
                },
            }),
            []
        );

        return null;
    }
);

/**
 * Navigation mesh component for AI pathfinding.
 * Creates a walkable surface from Three.js geometry for A* pathfinding.
 *
 * @example
 * ```tsx
 * // Create nav mesh from floor geometry
 * const navMeshRef = useRef<YukaNavMeshRef>(null);
 *
 * <YukaNavMesh
 *   ref={navMeshRef}
 *   geometry={floorGeometry}
 *   visible={debugMode}
 *   wireframe={true}
 *   color="#0088ff"
 * />
 *
 * // Find path for AI movement
 * const handleClick = (target: THREE.Vector3) => {
 *   const path = navMeshRef.current?.findPath(
 *     agentPosition,
 *     target
 *   );
 *   if (path) {
 *     moveAlongPath(path);
 *   }
 * };
 *
 * // Get random patrol point
 * const getPatrolPoint = () => {
 *   const region = navMeshRef.current?.getRandomRegion();
 *   return region?.centroid;
 * };
 * ```
 *
 * @param props - YukaNavMeshProps configuration
 * @returns React element with optional nav mesh visualization
 */
export const YukaNavMesh = forwardRef<YukaNavMeshRef, YukaNavMeshProps>(function YukaNavMesh(
    { geometry, visible = false, wireframe = true, color = 0x0088ff },
    ref
) {
    const navMeshRef = useRef<YUKA.NavMesh>(new YUKA.NavMesh());
    const meshRef = useRef<THREE.Mesh>(null);

    useEffect(() => {
        const navMesh = navMeshRef.current;

        const positionAttr = geometry.getAttribute('position');
        const indexAttr = geometry.getIndex();

        if (!positionAttr) return;

        const vertices: number[] = [];
        for (let i = 0; i < positionAttr.count; i++) {
            vertices.push(positionAttr.getX(i), positionAttr.getY(i), positionAttr.getZ(i));
        }

        const indices: number[] = [];
        if (indexAttr) {
            for (let i = 0; i < indexAttr.count; i++) {
                indices.push(indexAttr.getX(i));
            }
        } else {
            for (let i = 0; i < positionAttr.count; i++) {
                indices.push(i);
            }
        }

        navMesh.fromPolygons(createPolygonsFromGeometry(vertices, indices));
    }, [geometry]);

    useImperativeHandle(
        ref,
        () => ({
            navMesh: navMeshRef.current,
            findPath: (from: THREE.Vector3, to: THREE.Vector3) => {
                const fromYuka = threeVector3ToYuka(from);
                const toYuka = threeVector3ToYuka(to);
                const path = navMeshRef.current.findPath(fromYuka, toYuka);
                return path.map((p: YUKA.Vector3) => yukaVector3ToThree(p));
            },
            getRandomRegion: () => {
                const regions = navMeshRef.current.regions;
                if (regions.length === 0) return null;
                return regions[Math.floor(Math.random() * regions.length)];
            },
            getClosestRegion: (point: THREE.Vector3) => {
                const yukaPoint = threeVector3ToYuka(point);
                return navMeshRef.current.getClosestRegion(yukaPoint);
            },
        }),
        []
    );

    if (!visible) {
        return null;
    }

    return (
        <mesh ref={meshRef}>
            <primitive object={geometry} attach="geometry" />
            <meshBasicMaterial
                color={color}
                wireframe={wireframe}
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
});

function createPolygonsFromGeometry(vertices: number[], indices: number[]): YUKA.Polygon[] {
    const polygons: YUKA.Polygon[] = [];

    for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i] * 3;
        const i1 = indices[i + 1] * 3;
        const i2 = indices[i + 2] * 3;

        const v0 = new YUKA.Vector3(vertices[i0], vertices[i0 + 1], vertices[i0 + 2]);
        const v1 = new YUKA.Vector3(vertices[i1], vertices[i1 + 1], vertices[i1 + 2]);
        const v2 = new YUKA.Vector3(vertices[i2], vertices[i2 + 1], vertices[i2 + 2]);

        const polygon = new YUKA.Polygon();
        polygon.fromContour([v0, v1, v2]);
        polygons.push(polygon);
    }

    return polygons;
}

export { yukaVector3ToThree, threeVector3ToYuka, syncYukaToThree };
