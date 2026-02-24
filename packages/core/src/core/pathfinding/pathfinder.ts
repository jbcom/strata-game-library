/**
 * Pathfinding algorithms for intelligent navigation.
 *
 * This module wraps ngraph.path with type-safe utilities for A* and Dijkstra pathfinding,
 * plus advanced features like path smoothing and simplification. Use these functions to
 * find optimal routes through your navigation graphs.
 *
 * @module core/pathfinding/pathfinder
 * @category Entities & Simulation
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
 * Strata pathfinder instance with A* algorithm support.
 *
 * Provides methods to find optimal paths through a navigation graph using the NBA*
 * (Non-recursive Best-first A*) algorithm variant for better performance.
 *
 * @category Entities & Simulation
 */
export interface StrataPathfinderInstance {
  readonly nativeFinder: NPathFinder<NodeData>;
  find(fromId: NodeId, toId: NodeId): PathResult;
}

/**
 * Creates a pathfinder using the A* algorithm (NBA* variant).
 *
 * A* combines the benefits of Dijkstra's algorithm with a heuristic to guide the search
 * toward the goal, making it faster for most game scenarios. The pathfinder instance can
 * be reused for multiple path queries on the same graph.
 *
 * @param graph - The navigation graph to search through
 * @param config - Pathfinder configuration options
 * @returns A pathfinder instance ready to find paths
 *
 * @category Entities & Simulation
 *
 * @example Basic Pathfinding
 * ```typescript
 * import { createGraph, addNode, addEdge, createPathfinder } from '@jbcom/strata/core/pathfinding';
 *
 * const graph = createGraph();
 * addNode(graph, 'A', { x: 0, y: 0, z: 0 });
 * addNode(graph, 'B', { x: 10, y: 0, z: 0 });
 * addNode(graph, 'C', { x: 10, y: 0, z: 10 });
 * addEdge(graph, 'A', 'B', { bidirectional: true });
 * addEdge(graph, 'B', 'C', { bidirectional: true });
 *
 * const pathfinder = createPathfinder(graph);
 * const result = pathfinder.find('A', 'C');
 *
 * if (result.found) {
 *   console.log('Path found!');
 *   console.log('Nodes:', result.path);         // ['A', 'B', 'C']
 *   console.log('Positions:', result.positions); // [{ x, y, z }, ...]
 *   console.log('Total cost:', result.cost);     // ~14.14 (distance)
 *   console.log('Waypoints:', result.nodeCount); // 3
 * }
 * ```
 *
 * @example Custom Heuristic for Different Movement Types
 * ```typescript
 * import { createPathfinder } from '@jbcom/strata/core/pathfinding';
 *
 * // Default uses Euclidean distance (good for most cases)
 * const standardPathfinder = createPathfinder(graph);
 *
 * // Manhattan distance for grid-based movement (no diagonals)
 * const gridPathfinder = createPathfinder(graph, {
 *   heuristic: (from, to) => {
 *     return Math.abs(to.position.x - from.position.x) +
 *            Math.abs(to.position.y - from.position.y) +
 *            Math.abs(to.position.z - from.position.z);
 *   }
 * });
 *
 * // Flying units: Ignore Y-axis in heuristic
 * const flyingPathfinder = createPathfinder(graph, {
 *   heuristic: (from, to) => {
 *     const dx = to.position.x - from.position.x;
 *     const dz = to.position.z - from.position.z;
 *     return Math.sqrt(dx * dx + dz * dz);
 *   }
 * });
 * ```
 *
 * @example Dynamic Obstacles and Blocked Nodes
 * ```typescript
 * import { createPathfinder } from '@jbcom/strata/core/pathfinding';
 *
 * // Track which nodes are currently occupied by units
 * const occupiedNodes = new Set(['node_5', 'node_12', 'node_23']);
 *
 * const pathfinder = createPathfinder(graph, {
 *   blocked: (nodeData, fromData) => {
 *     // Don't allow paths through occupied nodes
 *     // (except we can path TO an occupied node to attack it)
 *     return occupiedNodes.has(nodeData.position.toString());
 *   }
 * });
 *
 * // Update occupiedNodes as units move, pathfinder adapts automatically
 * ```
 *
 * @example Terrain-Based Movement Costs
 * ```typescript
 * import { createPathfinder } from '@jbcom/strata/core/pathfinding';
 *
 * // Each node has a terrain cost multiplier
 * const pathfinder = createPathfinder(graph, {
 *   distance: (from, to, edgeData) => {
 *     const baseDistance = edgeData.weight ?? 1;
 *     const terrainCost = to.cost ?? 1;
 *
 *     // Total cost = distance × terrain difficulty
 *     return baseDistance * terrainCost;
 *   }
 * });
 *
 * // Paths will prefer roads (cost: 0.5) over grass (cost: 1.0)
 * // and avoid mud (cost: 3.0) unless it significantly shortens the path
 * ```
 *
 * @example Multi-Level Pathfinding
 * ```typescript
 * // For buildings with multiple floors
 * const pathfinder = createPathfinder(graph, {
 *   distance: (from, to, edgeData) => {
 *     const baseDistance = edgeData.weight ?? 1;
 *
 *     // Penalize vertical movement (stairs/elevators)
 *     const verticalChange = Math.abs(to.position.y - from.position.y);
 *     const verticalPenalty = verticalChange * 2; // Stairs take 2x longer
 *
 *     return baseDistance + verticalPenalty;
 *   }
 * });
 *
 * // Agent will prefer staying on same floor unless necessary
 * ```
 *
 * @example Finding Multiple Paths
 * ```typescript
 * const pathfinder = createPathfinder(graph);
 *
 * // Efficiently reuse pathfinder for multiple queries
 * const agents = [
 *   { id: 'guard1', from: 'node_0', to: 'node_50' },
 *   { id: 'guard2', from: 'node_10', to: 'node_45' },
 *   { id: 'enemy1', from: 'node_30', to: 'node_5' }
 * ];
 *
 * const paths = agents.map(agent => ({
 *   agentId: agent.id,
 *   result: pathfinder.find(agent.from, agent.to)
 * }));
 *
 * paths.forEach(({ agentId, result }) => {
 *   if (result.found) {
 *     console.log(`${agentId}: ${result.nodeCount} waypoints`);
 *   }
 * });
 * ```
 */
export function createPathfinder(
  graph: StrataGraphInstance<NodeData, EdgeData>,
  config: PathfinderConfig = {}
): StrataPathfinderInstance {
  const nativeFinder = createNbaPathfinder<NodeData, EdgeData>(graph.nativeGraph, {
    oriented: config.oriented ?? false,
    heuristic: config.heuristic
      ? (fromNode, toNode) => config.heuristic?.(fromNode.data, toNode.data) ?? 0
      : defaultHeuristic,
    distance: config.distance
      ? (fromNode, toNode, link) => config.distance?.(fromNode.data, toNode.data, link.data) ?? 1
      : defaultDistance,
    blocked: config.blocked
      ? (node, fromNode) => {
          // fromNode may be undefined when evaluating the start node
          if (!fromNode || !fromNode.data) return false;
          return config.blocked?.(node.data, fromNode.data) ?? false;
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
 * Reduces sharp corners and creates more natural-looking movement paths by iteratively
 * replacing each line segment with two shorter segments. Perfect for making AI movement
 * feel organic rather than robotic.
 *
 * @param positions - Array of 3D positions forming the path
 * @param options - Smoothing configuration options
 * @returns Smoothed path with rounded corners
 *
 * @category Entities & Simulation
 *
 * @example Basic Path Smoothing
 * ```typescript
 * import { smoothPath } from '@jbcom/strata/core/pathfinding';
 *
 * const rawPath = [
 *   { x: 0, y: 0, z: 0 },
 *   { x: 10, y: 0, z: 0 },    // Sharp 90° turn
 *   { x: 10, y: 0, z: 10 }
 * ];
 *
 * const smoothed = smoothPath(rawPath, {
 *   iterations: 2,           // More iterations = smoother
 *   strength: 0.25,          // 0-1, how much to round corners
 *   preserveEndpoints: true  // Keep start and end points exact
 * });
 *
 * // smoothed now has more points with gentle curves
 * console.log('Points increased from', rawPath.length, 'to', smoothed.length);
 * ```
 *
 * @example Different Smoothing Strengths
 * ```typescript
 * // Light smoothing - subtle rounding
 * const gentle = smoothPath(path, { iterations: 1, strength: 0.1 });
 *
 * // Medium smoothing - natural curves (default)
 * const normal = smoothPath(path, { iterations: 2, strength: 0.25 });
 *
 * // Heavy smoothing - very round, flowing paths
 * const smooth = smoothPath(path, { iterations: 3, strength: 0.4 });
 * ```
 *
 * @example Smoothing for Different Agent Types
 * ```typescript
 * // Fast, nimble agent - aggressive smoothing
 * const rabbitPath = smoothPath(path, {
 *   iterations: 3,
 *   strength: 0.35,
 *   preserveEndpoints: true
 * });
 *
 * // Heavy, lumbering agent - minimal smoothing
 * const tankPath = smoothPath(path, {
 *   iterations: 1,
 *   strength: 0.15,
 *   preserveEndpoints: true
 * });
 *
 * // Flying agent - maximum smoothing for graceful flight
 * const birdPath = smoothPath(path, {
 *   iterations: 4,
 *   strength: 0.4,
 *   preserveEndpoints: false  // Can deviate from exact endpoints
 * });
 * ```
 *
 * @example Combining with Simplification
 * ```typescript
 * import { smoothPath, simplifyPath } from '@jbcom/strata/core/pathfinding';
 *
 * // First simplify to remove unnecessary points
 * const simplified = simplifyPath(rawPath, 0.5);
 *
 * // Then smooth for natural movement
 * const final = smoothPath(simplified, {
 *   iterations: 2,
 *   strength: 0.25
 * });
 *
 * // Result: Efficient path with natural curves
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
 * Simplifies a path using the Ramer-Douglas-Peucker algorithm.
 *
 * Removes unnecessary intermediate waypoints while preserving the path's overall shape.
 * Essential for reducing memory usage and improving performance when paths have many
 * redundant points, such as grid-based paths or high-resolution navigation meshes.
 *
 * @param positions - Array of positions to simplify
 * @param epsilon - Maximum distance threshold for point removal (higher = more aggressive, must be >= 0)
 * @returns Simplified path with fewer waypoints
 *
 * @category Entities & Simulation
 *
 * @example Basic Path Simplification
 * ```typescript
 * import { simplifyPath } from '@jbcom/strata/core/pathfinding';
 *
 * // Path with many redundant points
 * const detailedPath = [
 *   { x: 0, y: 0, z: 0 },
 *   { x: 1, y: 0, z: 0 },
 *   { x: 2, y: 0, z: 0 },
 *   { x: 3, y: 0, z: 0 },    // All in a straight line
 *   { x: 4, y: 0, z: 0 },
 *   { x: 5, y: 0, z: 0 },
 *   { x: 6, y: 0, z: 1 },    // Slight deviation
 *   { x: 7, y: 0, z: 2 },
 * ];
 *
 * const simplified = simplifyPath(detailedPath, 0.5);
 * // Removes intermediate points that lie on or near the line
 * console.log('Reduced from', detailedPath.length, 'to', simplified.length);
 * ```
 *
 * @example Epsilon Values for Different Use Cases
 * ```typescript
 * // Precise simplification - removes only truly redundant points
 * const precise = simplifyPath(path, 0.1);
 *
 * // Normal simplification - good balance
 * const normal = simplifyPath(path, 0.5);
 *
 * // Aggressive simplification - major shortcuts, fewer waypoints
 * const aggressive = simplifyPath(path, 2.0);
 *
 * // Maximum simplification - only key turning points
 * const minimal = simplifyPath(path, 5.0);
 * ```
 *
 * @example Grid Path Optimization
 * ```typescript
 * import { createGridGraph, createPathfinder, simplifyPath } from '@jbcom/strata/core/pathfinding';
 *
 * const grid = createGridGraph(50, 50, 1.0);
 * const pathfinder = createPathfinder(grid);
 * const result = pathfinder.find('0_0', '49_49');
 *
 * console.log('Original waypoints:', result.nodeCount); // ~99 waypoints
 *
 * // Simplify the grid path
 * const simplified = simplifyPath(result.positions, 0.5);
 * console.log('Simplified waypoints:', simplified.length); // ~10 waypoints
 *
 * // Agent can move in straight lines between simplified points
 * ```
 *
 * @example Performance Optimization Pipeline
 * ```typescript
 * import { simplifyPath, smoothPath } from '@jbcom/strata/core/pathfinding';
 *
 * function optimizePath(rawPath) {
 *   // Step 1: Aggressively simplify to reduce waypoints
 *   let path = simplifyPath(rawPath, 1.0);
 *
 *   // Step 2: Smooth for natural movement
 *   path = smoothPath(path, {
 *     iterations: 2,
 *     strength: 0.25
 *   });
 *
 *   // Step 3: Final simplification to remove points added by smoothing
 *   path = simplifyPath(path, 0.3);
 *
 *   return path;
 * }
 *
 * const optimized = optimizePath(navMeshPath);
 * // Result: Smooth, efficient path with minimal waypoints
 * ```
 *
 * @example Adaptive Simplification by Distance
 * ```typescript
 * // Use different epsilon values based on path length
 * function adaptiveSimplify(path) {
 *   const pathLength = calculatePathLength(path);
 *
 *   let epsilon;
 *   if (pathLength < 10) {
 *     epsilon = 0.1;  // Short paths need precision
 *   } else if (pathLength < 50) {
 *     epsilon = 0.5;  // Medium paths
 *   } else {
 *     epsilon = 2.0;  // Long paths can be heavily simplified
 *   }
 *
 *   return simplifyPath(path, epsilon);
 * }
 * ```
 *
 * @example Visual Debug Comparison
 * ```typescript
 * // Show original vs simplified paths
 * function debugSimplification(originalPath) {
 *   const simplified = simplifyPath(originalPath, 1.0);
 *
 *   console.log('Simplification Results:');
 *   console.log('  Original points:', originalPath.length);
 *   console.log('  Simplified points:', simplified.length);
 *   console.log('  Reduction:', ((1 - simplified.length / originalPath.length) * 100).toFixed(1) + '%');
 *
 *   // Render both paths with different colors for comparison
 *   renderPath(originalPath, 'red');
 *   renderPath(simplified, 'green');
 * }
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
 * Finds the closest node in the graph to a given 3D position.
 *
 * Searches all nodes in the graph and returns the ID of the one nearest to the specified
 * position. Essential for converting world positions (like player clicks or spawn points)
 * into graph nodes for pathfinding.
 *
 * @param graph - The graph to search
 * @param position - The 3D position to find the nearest node to
 * @returns Node ID of the closest node, or undefined if graph is empty
 *
 * @category Entities & Simulation
 *
 * @example Click-to-Move Navigation
 * ```typescript
 * import { findClosestNode } from '@jbcom/strata/core/pathfinding';
 *
 * function handleGroundClick(clickEvent) {
 *   const clickPosition = clickEvent.point; // { x, y, z } from raycaster
 *
 *   // Find nearest navigation node to the click
 *   const targetNode = findClosestNode(graph, clickPosition);
 *
 *   if (targetNode) {
 *     const agentNode = findClosestNode(graph, agentPosition);
 *     const path = pathfinder.find(agentNode, targetNode);
 *
 *     if (path.found) {
 *       followPath(path.positions);
 *     }
 *   }
 * }
 * ```
 *
 * @example Spawning Entities on Navigation Graph
 * ```typescript
 * import { findClosestNode } from '@jbcom/strata/core/pathfinding';
 *
 * function spawnEnemy(spawnPosition) {
 *   // Snap spawn position to nearest walkable node
 *   const spawnNode = findClosestNode(graph, spawnPosition);
 *
 *   if (spawnNode) {
 *     const nodeData = graph.getNode(spawnNode);
 *     if (nodeData && nodeData.data.walkable) {
 *       // Spawn enemy at exact node position
 *       createEnemy(nodeData.data.position);
 *     }
 *   }
 * }
 * ```
 *
 * @example Building Placement Validation
 * ```typescript
 * function canPlaceBuilding(buildingPos, minDistance = 5) {
 *   const nearestNode = findClosestNode(graph, buildingPos);
 *
 *   if (!nearestNode) return false;
 *
 *   const node = graph.getNode(nearestNode);
 *   const distance = calculateDistance(buildingPos, node.data.position);
 *
 *   // Don't allow placement too far from navigation network
 *   return distance < minDistance;
 * }
 * ```
 *
 * @example Multi-Agent Pathfinding Setup
 * ```typescript
 * const agents = [
 *   { pos: { x: 5, y: 0, z: 5 } },
 *   { pos: { x: 15, y: 0, z: 10 } },
 *   { pos: { x: 8, y: 0, z: 20 } }
 * ];
 *
 * const targetPos = { x: 25, y: 0, z: 25 };
 * const targetNode = findClosestNode(graph, targetPos);
 *
 * agents.forEach(agent => {
 *   const startNode = findClosestNode(graph, agent.pos);
 *   const path = pathfinder.find(startNode, targetNode);
 *
 *   if (path.found) {
 *     assignPath(agent, path);
 *   }
 * });
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
