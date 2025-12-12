/**
 * Pathfinding algorithms for the Strata Pathfinding module.
 * Wraps ngraph.path with type-safe utilities for A* and Dijkstra algorithms.
 *
 * @module core/pathfinding/pathfinder
 * @public
 */

import type { PathFinder as NPathFinder } from 'ngraph.path';
import { nba as createNbaPathfinder } from 'ngraph.path';
import type { StrataGraphInstance } from './graph';
import { calculateDistance } from './graph';
import type {
    EdgeData,
    NodeData,
    NodeId,
    PathfinderConfig,
    PathResult,
    Position3D,
    SmoothingOptions,
} from './types';

/**
 * Strata pathfinder instance.
 */
export interface StrataPathfinderInstance {
    readonly nativeFinder: NPathFinder<NodeData>;
    find(fromId: NodeId, toId: NodeId): PathResult;
}

/**
 * Creates a pathfinder using A* algorithm (NBA* variant).
 *
 * @param graph - The graph to search through
 * @param config - Pathfinder configuration options
 * @returns A pathfinder instance
 *
 * @example
 * ```typescript
 * import { createGraph, addNode, addEdge, createPathfinder } from '@jbcom/strata/core/pathfinding';
 *
 * const graph = createGraph();
 * addNode(graph, 'A', { x: 0, y: 0, z: 0 });
 * addNode(graph, 'B', { x: 10, y: 0, z: 0 });
 * addEdge(graph, 'A', 'B', { bidirectional: true });
 *
 * const pathfinder = createPathfinder(graph);
 * const result = pathfinder.find('A', 'B');
 *
 * console.log(result.found); // true
 * console.log(result.path); // ['A', 'B']
 * ```
 */
export function createPathfinder(
    graph: StrataGraphInstance<NodeData, EdgeData>,
    config: PathfinderConfig = {}
): StrataPathfinderInstance {
    const nativeFinder = createNbaPathfinder<NodeData, EdgeData>(graph.nativeGraph, {
        oriented: config.oriented ?? false,
        heuristic: config.heuristic
            ? (fromNode, toNode) => config.heuristic!(fromNode.data, toNode.data)
            : defaultHeuristic,
        distance: config.distance
            ? (fromNode, toNode, link) => config.distance!(fromNode.data, toNode.data, link.data)
            : defaultDistance,
        blocked: config.blocked
            ? (node, fromNode) => {
                  // fromNode may be undefined when evaluating the start node
                  if (!fromNode || !fromNode.data) return false;
                  return config.blocked!(node.data, fromNode.data);
              }
            : undefined,
    });

    return {
        get nativeFinder() {
            return nativeFinder;
        },

        find(fromId: NodeId, toId: NodeId): PathResult {
            return findPathInternal(graph, nativeFinder, fromId, toId);
        },
    };
}

/**
 * Default heuristic using Euclidean distance.
 */
function defaultHeuristic(fromNode: { data: NodeData }, toNode: { data: NodeData }): number {
    const from = fromNode.data?.position;
    const to = toNode.data?.position;

    if (!from || !to) return 0;
    return calculateDistance(from, to);
}

/**
 * Default distance function using edge weight.
 */
function defaultDistance(
    _fromNode: { data: NodeData },
    _toNode: { data: NodeData },
    link: { data: EdgeData }
): number {
    return link.data?.weight ?? 1;
}

/**
 * Internal path finding implementation.
 */
function findPathInternal(
    graph: StrataGraphInstance<NodeData, EdgeData>,
    finder: NPathFinder<NodeData>,
    fromId: NodeId,
    toId: NodeId
): PathResult {
    const emptyResult: PathResult = {
        found: false,
        path: [],
        positions: [],
        cost: 0,
        nodeCount: 0,
    };

    if (!graph.hasNode(fromId) || !graph.hasNode(toId)) {
        return emptyResult;
    }

    const nodePath = finder.find(fromId, toId);

    if (!nodePath || nodePath.length === 0) {
        return emptyResult;
    }

    const path: NodeId[] = [];
    const positions: Position3D[] = [];
    let totalCost = 0;

    for (let i = 0; i < nodePath.length; i++) {
        const node = nodePath[i];
        path.push(node.id);

        if (node.data?.position) {
            positions.push({ ...node.data.position });
        }

        if (i > 0) {
            // Use edge weight if available for accurate cost calculation,
            // otherwise fall back to distance calculation
            const prevNode = nodePath[i - 1];
            const edge =
                graph.nativeGraph.getLink(prevNode.id, node.id) ??
                graph.nativeGraph.getLink(node.id, prevNode.id);
            if (edge?.data?.weight) {
                totalCost += edge.data.weight;
            } else if (prevNode.data?.position && node.data?.position) {
                totalCost += calculateDistance(prevNode.data.position, node.data.position);
            }
        }
    }

    path.reverse();
    positions.reverse();

    return {
        found: true,
        path,
        positions,
        cost: totalCost,
        nodeCount: path.length,
    };
}

/**
 * Finds a path between two nodes using A* algorithm.
 *
 * @example
 * ```typescript
 * const result = findPath(pathfinder, graph, 'spawn', 'exit');
 * if (result.found) console.log(result.positions);
 * ```
 */
export function findPath(
    pathfinder: StrataPathfinderInstance,
    _graph: StrataGraphInstance<NodeData, EdgeData>,
    fromId: NodeId,
    toId: NodeId
): PathResult {
    return pathfinder.find(fromId, toId);
}

/**
 * Finds a path using Dijkstra's algorithm (no heuristic).
 *
 * @example
 * ```typescript
 * const result = findPathDijkstra(graph, 'start', 'end');
 * ```
 */
export function findPathDijkstra(
    graph: StrataGraphInstance<NodeData, EdgeData>,
    fromId: NodeId,
    toId: NodeId
): PathResult {
    const finder = createNbaPathfinder<NodeData, EdgeData>(graph.nativeGraph, {
        oriented: false,
        heuristic: () => 0,
        distance: defaultDistance,
    });

    return findPathInternal(graph, finder, fromId, toId);
}

/**
 * Smooths a path using Chaikin's corner cutting algorithm.
 *
 * @example
 * ```typescript
 * const smoothed = smoothPath(result.positions, { iterations: 2 });
 * ```
 */
export function smoothPath(positions: Position3D[], options: SmoothingOptions = {}): Position3D[] {
    const { iterations = 1, strength = 0.25, preserveEndpoints = true } = options;

    if (positions.length < 3) {
        return [...positions];
    }

    let result = positions.map((p) => ({ ...p }));

    for (let iter = 0; iter < iterations; iter++) {
        const smoothed: Position3D[] = [];

        if (preserveEndpoints) {
            smoothed.push({ ...result[0] });
        }

        for (let i = 0; i < result.length - 1; i++) {
            const p0 = result[i];
            const p1 = result[i + 1];

            const q: Position3D = {
                x: p0.x + strength * (p1.x - p0.x),
                y: p0.y + strength * (p1.y - p0.y),
                z: p0.z + strength * (p1.z - p0.z),
            };

            const r: Position3D = {
                x: p0.x + (1 - strength) * (p1.x - p0.x),
                y: p0.y + (1 - strength) * (p1.y - p0.y),
                z: p0.z + (1 - strength) * (p1.z - p0.z),
            };

            if (i > 0 || !preserveEndpoints) {
                smoothed.push(q);
            }
            if (i < result.length - 2 || !preserveEndpoints) {
                smoothed.push(r);
            }
        }

        if (preserveEndpoints) {
            smoothed.push({ ...result[result.length - 1] });
        }

        result = smoothed;
    }

    return result;
}

/**
 * Simplifies a path using Ramer-Douglas-Peucker algorithm.
 *
 * @param positions - Array of positions to simplify
 * @param epsilon - Maximum distance threshold for point removal (must be >= 0)
 *
 * @example
 * ```typescript
 * const simplified = simplifyPath(result.positions, 0.5);
 * ```
 */
export function simplifyPath(positions: Position3D[], epsilon: number = 0.1): Position3D[] {
    if (positions.length < 3) {
        return [...positions];
    }

    // Ensure epsilon is non-negative to prevent infinite recursion
    const safeEpsilon = Math.max(0, epsilon);
    return rdpSimplify(positions, safeEpsilon);
}

/**
 * Ramer-Douglas-Peucker simplification algorithm.
 */
function rdpSimplify(points: Position3D[], epsilon: number): Position3D[] {
    // Base case: arrays with 2 or fewer points cannot be simplified
    if (points.length <= 2) {
        return [...points];
    }

    let maxDist = 0;
    let maxIndex = 0;

    const first = points[0];
    const last = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
        const dist = perpendicularDistance(points[i], first, last);
        if (dist > maxDist) {
            maxDist = dist;
            maxIndex = i;
        }
    }

    if (maxDist > epsilon) {
        const left = rdpSimplify(points.slice(0, maxIndex + 1), epsilon);
        const right = rdpSimplify(points.slice(maxIndex), epsilon);
        return [...left.slice(0, -1), ...right];
    }

    return [first, last];
}

/**
 * Calculates perpendicular distance from point to line.
 */
function perpendicularDistance(
    point: Position3D,
    lineStart: Position3D,
    lineEnd: Position3D
): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const dz = lineEnd.z - lineStart.z;

    const lineLen = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (lineLen === 0) {
        return calculateDistance(point, lineStart);
    }

    const px = point.x - lineStart.x;
    const py = point.y - lineStart.y;
    const pz = point.z - lineStart.z;

    const crossX = py * dz - pz * dy;
    const crossY = pz * dx - px * dz;
    const crossZ = px * dy - py * dx;

    const crossLen = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);

    return crossLen / lineLen;
}

/**
 * Finds the closest node to a given position.
 *
 * @example
 * ```typescript
 * const nearest = findClosestNode(graph, { x: 5.5, y: 0, z: 3.2 });
 * ```
 */
export function findClosestNode(
    graph: StrataGraphInstance<NodeData, EdgeData>,
    position: Position3D
): NodeId | undefined {
    let closestId: NodeId | undefined;
    let closestDist = Infinity;

    graph.forEachNode((node) => {
        if (node.data?.position) {
            const dist = calculateDistance(position, node.data.position);
            if (dist < closestDist) {
                closestDist = dist;
                closestId = node.id;
            }
        }
    });

    return closestId;
}

export type { NPathFinder };
