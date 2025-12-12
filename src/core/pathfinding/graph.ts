/**
 * Graph utilities for the Strata Pathfinding module.
 * Wraps ngraph.graph with type-safe helpers for game pathfinding.
 *
 * @module core/pathfinding/graph
 * @public
 */

import type { Graph as NGraph, Link as NLink, Node as NNode } from 'ngraph.graph';
import createNGraph from 'ngraph.graph';
import type { NavMesh, Polygon } from 'yuka';
import type {
    EdgeData,
    GraphEdge,
    GraphNode,
    NavMeshConversionOptions,
    NodeData,
    NodeId,
    Position3D,
    StrataGraph,
} from './types';

/**
 * Extended graph type with Strata utilities.
 */
export interface StrataGraphInstance<N = NodeData, E = EdgeData> extends StrataGraph<N, E> {
    readonly nativeGraph: NGraph<N, E>;
    clear(): void;
}

/**
 * Creates a new graph instance for pathfinding.
 *
 * @returns A new Strata graph wrapper around ngraph
 *
 * @example
 * ```typescript
 * import { createGraph, addNode, addEdge } from '@jbcom/strata/core/pathfinding';
 *
 * const graph = createGraph();
 * addNode(graph, 'A', { x: 0, y: 0, z: 0 });
 * addNode(graph, 'B', { x: 10, y: 0, z: 0 });
 * addEdge(graph, 'A', 'B');
 *
 * console.log(graph.getNodeCount()); // 2
 * console.log(graph.hasEdge('A', 'B')); // true
 * ```
 */
export function createGraph<N = NodeData, E = EdgeData>(): StrataGraphInstance<N, E> {
    const nativeGraph = createNGraph<N, E>();

    const wrapper: StrataGraphInstance<N, E> = {
        get nativeGraph() {
            return nativeGraph;
        },

        getNodeCount(): number {
            return nativeGraph.getNodeCount();
        },

        getEdgeCount(): number {
            return nativeGraph.getLinkCount();
        },

        hasNode(nodeId: NodeId): boolean {
            return nativeGraph.getNode(nodeId) !== undefined;
        },

        hasEdge(fromId: NodeId, toId: NodeId): boolean {
            return nativeGraph.getLink(fromId, toId) !== undefined;
        },

        addNode(nodeId: NodeId, data?: N): void {
            nativeGraph.addNode(nodeId, data as N);
        },

        addEdge(fromId: NodeId, toId: NodeId, data?: E): void {
            nativeGraph.addLink(fromId, toId, data as E);
        },

        removeNode(nodeId: NodeId): void {
            nativeGraph.removeNode(nodeId);
        },

        removeEdge(fromId: NodeId, toId: NodeId): void {
            const link = nativeGraph.getLink(fromId, toId);
            if (link) {
                nativeGraph.removeLink(link);
            }
        },

        getNode(nodeId: NodeId): GraphNode<N> | undefined {
            const node = nativeGraph.getNode(nodeId);
            if (!node) return undefined;
            return { id: node.id, data: node.data };
        },

        forEachNode(callback: (node: GraphNode<N>) => void | boolean): void {
            nativeGraph.forEachNode((node: NNode<N>) => {
                return callback({ id: node.id, data: node.data });
            });
        },

        forEachEdge(callback: (edge: GraphEdge<E>) => void | boolean): void {
            nativeGraph.forEachLink((link: NLink<E>) => {
                return callback({
                    fromId: link.fromId,
                    toId: link.toId,
                    data: link.data,
                });
            });
        },

        clear(): void {
            nativeGraph.clear();
        },
    };

    return wrapper;
}

/**
 * Adds a node with position data to the graph.
 *
 * @param graph - The graph to add the node to
 * @param nodeId - Unique identifier for the node
 * @param position - 3D position of the node
 * @param options - Additional node options
 *
 * @example
 * ```typescript
 * const graph = createGraph();
 * addNode(graph, 'spawn', { x: 0, y: 0, z: 0 }, { walkable: true });
 * addNode(graph, 'goal', { x: 100, y: 0, z: 50 });
 * ```
 */
export function addNode(
    graph: StrataGraphInstance<NodeData, EdgeData>,
    nodeId: NodeId,
    position: Position3D,
    options: Omit<NodeData, 'position'> = {}
): void {
    graph.addNode(nodeId, {
        position,
        walkable: options.walkable ?? true,
        cost: options.cost ?? 1,
    });
}

/**
 * Adds an edge between two nodes with calculated or custom weight.
 *
 * @param graph - The graph to add the edge to
 * @param fromId - Source node ID
 * @param toId - Target node ID
 * @param options - Edge configuration options
 *
 * @example
 * ```typescript
 * const graph = createGraph();
 * addNode(graph, 'A', { x: 0, y: 0, z: 0 });
 * addNode(graph, 'B', { x: 10, y: 0, z: 0 });
 *
 * // Auto-calculate weight from distance
 * addEdge(graph, 'A', 'B');
 *
 * // Custom weight
 * addEdge(graph, 'B', 'A', { weight: 5 });
 *
 * // Bidirectional edge
 * addEdge(graph, 'A', 'B', { bidirectional: true });
 * ```
 */
export function addEdge(
    graph: StrataGraphInstance<NodeData, EdgeData>,
    fromId: NodeId,
    toId: NodeId,
    options: Partial<EdgeData> = {}
): void {
    let weight = options.weight;

    if (weight === undefined) {
        const fromNode = graph.getNode(fromId);
        const toNode = graph.getNode(toId);

        if (fromNode?.data?.position && toNode?.data?.position) {
            weight = calculateDistance(fromNode.data.position, toNode.data.position);
        } else {
            weight = 1;
        }
    }

    const edgeData: EdgeData = {
        weight,
        bidirectional: options.bidirectional ?? false,
    };

    graph.addEdge(fromId, toId, edgeData);

    if (options.bidirectional) {
        graph.addEdge(toId, fromId, edgeData);
    }
}

/**
 * Calculates Euclidean distance between two 3D positions.
 *
 * @param a - First position
 * @param b - Second position
 * @returns The distance between positions
 */
export function calculateDistance(a: Position3D, b: Position3D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Converts a Yuka NavMesh to an ngraph graph for pathfinding.
 *
 * @param navMesh - The Yuka NavMesh to convert
 * @param options - Conversion configuration
 * @returns A Strata graph representing the NavMesh
 *
 * @warning For large meshes with more than 100 regions, neighbor detection has O(n²) complexity
 * which may cause performance issues. Consider setting `connectNeighbors: false` and manually
 * connecting critical paths, or implementing spatial indexing for production use cases with
 * large navigation meshes.
 *
 * @example
 * ```typescript
 * import { fromNavMesh, createPathfinder, findPath } from '@jbcom/strata/core/pathfinding';
 * import { NavMesh } from 'yuka';
 *
 * const navMesh = new NavMesh();
 * // ... populate navMesh from geometry
 *
 * const graph = fromNavMesh(navMesh);
 * const pathfinder = createPathfinder(graph);
 * const result = findPath(pathfinder, graph, 'region_0', 'region_5');
 * ```
 */
export function fromNavMesh(
    navMesh: NavMesh,
    options: NavMeshConversionOptions = {}
): StrataGraphInstance<NodeData, EdgeData> {
    const { connectNeighbors = true, edgeWeight } = options;

    const graph = createGraph<NodeData, EdgeData>();
    const regions = navMesh.regions;

    for (let i = 0; i < regions.length; i++) {
        const region = regions[i] as Polygon;
        const centroid = region.centroid;

        addNode(graph, `region_${i}`, {
            x: centroid.x,
            y: centroid.y,
            z: centroid.z,
        });
    }

    if (connectNeighbors) {
        for (let i = 0; i < regions.length; i++) {
            for (let j = i + 1; j < regions.length; j++) {
                const regionA = regions[i] as Polygon;
                const regionB = regions[j] as Polygon;

                if (arePolygonsAdjacent(regionA, regionB)) {
                    const weight =
                        edgeWeight ??
                        calculateDistance(
                            { x: regionA.centroid.x, y: regionA.centroid.y, z: regionA.centroid.z },
                            { x: regionB.centroid.x, y: regionB.centroid.y, z: regionB.centroid.z }
                        );

                    addEdge(graph, `region_${i}`, `region_${j}`, {
                        weight,
                        bidirectional: true,
                    });
                }
            }
        }
    }

    return graph;
}

/**
 * Gets the vertices of a polygon using Yuka's getContour method.
 * Uses type assertion because @types/yuka may not expose all Polygon properties correctly.
 */
function getPolygonVertices(poly: Polygon): Position3D[] {
    const contour: Position3D[] = [];
    // Use Yuka's getContour method to get vertices
    // Cast to any to work around @types/yuka type coverage gaps
    const yukaPolygon = poly as unknown as {
        getContour(result: unknown[]): Array<{ x: number; y: number; z: number }>;
    };
    const result = yukaPolygon.getContour([]);
    for (const v of result) {
        contour.push({ x: v.x, y: v.y, z: v.z });
    }
    return contour;
}

/**
 * Checks if two polygons share an edge (are adjacent).
 * Two polygons are adjacent if they share at least 2 vertices.
 */
function arePolygonsAdjacent(polyA: Polygon, polyB: Polygon): boolean {
    const verticesA = getPolygonVertices(polyA);
    const verticesB = getPolygonVertices(polyB);

    let sharedCount = 0;
    const epsilon = 0.001;

    for (const vA of verticesA) {
        // Check if this vertex from A matches any vertex in B
        let foundMatch = false;
        for (const vB of verticesB) {
            const dx = Math.abs(vA.x - vB.x);
            const dy = Math.abs(vA.y - vB.y);
            const dz = Math.abs(vA.z - vB.z);

            if (dx < epsilon && dy < epsilon && dz < epsilon) {
                foundMatch = true;
                break; // Each vertex from A should only count once
            }
        }

        if (foundMatch) {
            sharedCount++;
            if (sharedCount >= 2) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Creates a grid-based graph for tile-based games.
 *
 * @param width - Grid width in cells
 * @param height - Grid height in cells
 * @param cellSize - Size of each cell
 * @param options - Grid configuration
 * @returns A graph representing the grid
 *
 * @example
 * ```typescript
 * const grid = createGridGraph(10, 10, 1);
 * // Creates 100 nodes connected in a grid pattern
 * ```
 */
export function createGridGraph(
    width: number,
    height: number,
    cellSize: number = 1,
    options: { allowDiagonals?: boolean; y?: number } = {}
): StrataGraphInstance<NodeData, EdgeData> {
    const { allowDiagonals = false, y = 0 } = options;
    const graph = createGraph<NodeData, EdgeData>();

    for (let x = 0; x < width; x++) {
        for (let z = 0; z < height; z++) {
            const nodeId = `${x}_${z}`;
            addNode(graph, nodeId, {
                x: x * cellSize,
                y,
                z: z * cellSize,
            });
        }
    }

    for (let x = 0; x < width; x++) {
        for (let z = 0; z < height; z++) {
            const nodeId = `${x}_${z}`;

            if (x < width - 1) addEdge(graph, nodeId, `${x + 1}_${z}`, { bidirectional: true });
            if (z < height - 1) addEdge(graph, nodeId, `${x}_${z + 1}`, { bidirectional: true });

            if (allowDiagonals) {
                // Diagonal edges have weight √2 * cellSize since they cover more distance
                const diagonalWeight = cellSize * Math.SQRT2;
                if (x < width - 1 && z < height - 1) {
                    addEdge(graph, nodeId, `${x + 1}_${z + 1}`, {
                        weight: diagonalWeight,
                        bidirectional: true,
                    });
                }
                if (x > 0 && z < height - 1) {
                    addEdge(graph, nodeId, `${x - 1}_${z + 1}`, {
                        weight: diagonalWeight,
                        bidirectional: true,
                    });
                }
            }
        }
    }

    return graph;
}

export type { NGraph, NNode, NLink };
