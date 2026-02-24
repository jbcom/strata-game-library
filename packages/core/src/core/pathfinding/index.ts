/**
 * Graph-Based Pathfinding System.
 *
 * Powered by ngraph, this module provides utilities for creating navigation graphs,
 * performing A* pathfinding, and generating smooth movement paths for AI agents.
 *
 * @packageDocumentation
 * @module core/pathfinding
 * @category Entities & Simulation
 *
 * ## Interactive Demos
 * - 🎮 [Live AI Demo](http://jonbogaty.com/nodejs-strata/demos/ai.html)
 * - 📦 [AI Navigation Example](https://github.com/jbcom/strata-game-library/tree/main/examples/ai-navigation)
 *
 * ## API Documentation
 * - [Full API Reference](http://jonbogaty.com/nodejs-strata/api)
 *
 * @example
 * ```typescript
 * const graph = createGraph();
 * addNode(graph, 'A', { x: 0, y: 0, z: 0 });
 * addNode(graph, 'B', { x: 10, y: 0, z: 0 });
 * addEdge(graph, 'A', 'B');
 *
 * const pathfinder = createPathfinder(graph);
 * const result = pathfinder.find('A', 'B');
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
