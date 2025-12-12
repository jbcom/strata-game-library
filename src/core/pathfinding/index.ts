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
import { aGreedy, aStar, nba } from 'ngraph.path';

export { createNGraph, nba, aStar, aGreedy };

export type { NGraph, NLink, NNode, StrataGraphInstance } from './graph';
export {
    addEdge,
    addNode,
    calculateDistance,
    createGraph,
    createGridGraph,
    fromNavMesh,
} from './graph';
export type { NPathFinder, StrataPathfinderInstance } from './pathfinder';
export {
    createPathfinder,
    findClosestNode,
    findPath,
    findPathDijkstra,
    simplifyPath,
    smoothPath,
} from './pathfinder';
export type {
    EdgeData,
    GraphEdge,
    GraphNode,
    NavMesh,
    NavMeshConversionOptions,
    NodeData,
    NodeId,
    PathfinderConfig,
    PathResult,
    Position3D,
    SmoothingOptions,
    StrataGraph,
    YukaVector3,
} from './types';
