/**
 * Strata Pathfinding module - Graph-based pathfinding powered by ngraph.
 *
 * @module core/pathfinding
 * @public
 *
 * @example
 * ```typescript
 * import {
 *   createGraph,
 *   addNode,
 *   addEdge,
 *   createPathfinder,
 *   findPath,
 *   smoothPath,
 *   fromNavMesh
 * } from '@jbcom/strata/core/pathfinding';
 *
 * // Create a graph and add nodes using helper functions
 * const graph = createGraph();
 * addNode(graph, 'A', { x: 0, y: 0, z: 0 });
 * addNode(graph, 'B', { x: 10, y: 0, z: 0 });
 * addNode(graph, 'C', { x: 10, y: 0, z: 10 });
 * addEdge(graph, 'A', 'B');
 * addEdge(graph, 'B', 'C');
 *
 * // Create pathfinder and find path
 * const pathfinder = createPathfinder(graph);
 * const result = pathfinder.find('A', 'C');
 *
 * if (result.found) {
 *   console.log('Path:', result.path); // ['A', 'B', 'C']
 *   console.log('Cost:', result.cost);
 *
 *   // Smooth the path for natural movement
 *   const smoothed = smoothPath(result.positions, { iterations: 2 });
 * }
 *
 * // Convert Yuka NavMesh to graph
 * const navGraph = fromNavMesh(yukaNavMesh);
 * ```
 */

import createNGraph from 'ngraph.graph';
import { nba, aStar, aGreedy } from 'ngraph.path';

export { createNGraph, nba, aStar, aGreedy };

export type {
    Position3D,
    NodeData,
    EdgeData,
    NodeId,
    PathfinderConfig,
    PathResult,
    SmoothingOptions,
    NavMeshConversionOptions,
    GraphNode,
    GraphEdge,
    StrataGraph,
    NavMesh,
    YukaVector3,
} from './types';

export type { StrataGraphInstance, NGraph, NNode, NLink } from './graph';

export {
    createGraph,
    addNode,
    addEdge,
    calculateDistance,
    fromNavMesh,
    createGridGraph,
} from './graph';

export type { StrataPathfinderInstance, NPathFinder } from './pathfinder';

export {
    createPathfinder,
    findPath,
    findPathDijkstra,
    smoothPath,
    simplifyPath,
    findClosestNode,
} from './pathfinder';
