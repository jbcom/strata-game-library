/**
 * Type definitions for the Strata Pathfinding module.
 *
 * @module core/pathfinding/types
 * @public
 */

import type { NavMesh, Vector3 as YukaVector3 } from 'yuka';

/**
 * Position data for graph nodes.
 *
 * @property x - X coordinate
 * @property y - Y coordinate
 * @property z - Z coordinate
 */
export interface Position3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Data attached to a graph node.
 *
 * @property position - 3D position of the node
 * @property walkable - Whether the node is traversable
 * @property cost - Movement cost multiplier for this node
 */
export interface NodeData {
    position: Position3D;
    walkable?: boolean;
    cost?: number;
}

/**
 * Data attached to a graph edge.
 *
 * @property weight - Edge weight for pathfinding algorithms
 * @property bidirectional - Whether edge allows two-way travel
 */
export interface EdgeData {
    weight: number;
    bidirectional?: boolean;
}

/**
 * Unique identifier for a graph node.
 */
export type NodeId = string | number;

/**
 * Configuration options for pathfinder creation.
 *
 * @property oriented - Whether graph edges are directed
 * @property heuristic - Custom heuristic function for A*
 * @property distance - Custom distance function between nodes
 * @property blocked - Function to check if node is blocked
 */
export interface PathfinderConfig {
    oriented?: boolean;
    heuristic?: (fromNode: NodeData, toNode: NodeData) => number;
    distance?: (fromNode: NodeData, toNode: NodeData, link: EdgeData) => number;
    blocked?: (nodeData: NodeData, fromData: NodeData) => boolean;
}

/**
 * Result of a pathfinding operation.
 *
 * @property found - Whether a path was found
 * @property path - Array of node IDs forming the path
 * @property positions - Array of 3D positions along the path
 * @property cost - Total path cost
 * @property nodeCount - Number of nodes in the path
 */
export interface PathResult {
    found: boolean;
    path: NodeId[];
    positions: Position3D[];
    cost: number;
    nodeCount: number;
}

/**
 * Options for path smoothing.
 *
 * @property iterations - Number of smoothing iterations
 * @property strength - Smoothing strength (0-1)
 * @property preserveEndpoints - Keep start/end positions unchanged
 */
export interface SmoothingOptions {
    iterations?: number;
    strength?: number;
    preserveEndpoints?: boolean;
}

/**
 * Configuration for NavMesh to graph conversion.
 *
 * @property connectNeighbors - Connect adjacent polygons
 * @property edgeWeight - Default edge weight
 */
export interface NavMeshConversionOptions {
    connectNeighbors?: boolean;
    edgeWeight?: number;
}

/**
 * Graph node representation for external use.
 *
 * @property id - Unique node identifier
 * @property data - Node data including position
 */
export interface GraphNode<T = NodeData> {
    id: NodeId;
    data: T;
}

/**
 * Graph edge representation for external use.
 *
 * @property fromId - Source node ID
 * @property toId - Target node ID
 * @property data - Edge data including weight
 */
export interface GraphEdge<T = EdgeData> {
    fromId: NodeId;
    toId: NodeId;
    data: T;
}

/**
 * Abstract graph interface for pathfinding operations.
 *
 * @property getNodeCount - Get total number of nodes
 * @property getEdgeCount - Get total number of edges
 * @property hasNode - Check if node exists
 * @property hasEdge - Check if edge exists
 */
export interface StrataGraph<N = NodeData, E = EdgeData> {
    getNodeCount(): number;
    getEdgeCount(): number;
    hasNode(nodeId: NodeId): boolean;
    hasEdge(fromId: NodeId, toId: NodeId): boolean;
    addNode(nodeId: NodeId, data?: N): void;
    addEdge(fromId: NodeId, toId: NodeId, data?: E): void;
    removeNode(nodeId: NodeId): void;
    removeEdge(fromId: NodeId, toId: NodeId): void;
    getNode(nodeId: NodeId): GraphNode<N> | undefined;
    forEachNode(callback: (node: GraphNode<N>) => void | boolean): void;
    forEachEdge(callback: (edge: GraphEdge<E>) => void | boolean): void;
}

export type { NavMesh, YukaVector3 };
