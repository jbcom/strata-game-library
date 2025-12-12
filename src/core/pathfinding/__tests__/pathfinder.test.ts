/**
 * Tests for the Strata Pathfinding module.
 *
 * @module core/pathfinding/__tests__/pathfinder.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    createGraph,
    addNode,
    addEdge,
    createPathfinder,
    findPath,
    findPathDijkstra,
    smoothPath,
    simplifyPath,
    findClosestNode,
    createGridGraph,
    calculateDistance,
} from '../index';
import type { StrataGraphInstance } from '../graph';
import type { NodeData, EdgeData, Position3D } from '../types';

describe('createGraph', () => {
    describe('ideal case', () => {
        it('creates an empty graph', () => {
            const graph = createGraph();
            expect(graph.getNodeCount()).toBe(0);
            expect(graph.getEdgeCount()).toBe(0);
        });

        it('adds nodes with position data', () => {
            const graph = createGraph();
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });
            addNode(graph, 'B', { x: 10, y: 0, z: 0 });

            expect(graph.getNodeCount()).toBe(2);
            expect(graph.hasNode('A')).toBe(true);
            expect(graph.hasNode('B')).toBe(true);
        });

        it('adds edges between nodes', () => {
            const graph = createGraph();
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });
            addNode(graph, 'B', { x: 10, y: 0, z: 0 });
            addEdge(graph, 'A', 'B');

            expect(graph.hasEdge('A', 'B')).toBe(true);
        });
    });

    describe('normal usage', () => {
        it('supports bidirectional edges', () => {
            const graph = createGraph();
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });
            addNode(graph, 'B', { x: 10, y: 0, z: 0 });
            addEdge(graph, 'A', 'B', { bidirectional: true });

            expect(graph.hasEdge('A', 'B')).toBe(true);
            expect(graph.hasEdge('B', 'A')).toBe(true);
        });

        it('calculates distance automatically for edges', () => {
            const graph = createGraph();
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });
            addNode(graph, 'B', { x: 10, y: 0, z: 0 });
            addEdge(graph, 'A', 'B');

            let edgeData: EdgeData | undefined;
            graph.forEachEdge((edge) => {
                if (edge.fromId === 'A' && edge.toId === 'B') {
                    edgeData = edge.data;
                }
            });

            expect(edgeData?.weight).toBe(10);
        });

        it('iterates over all nodes', () => {
            const graph = createGraph();
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });
            addNode(graph, 'B', { x: 10, y: 0, z: 0 });
            addNode(graph, 'C', { x: 5, y: 0, z: 5 });

            const nodeIds: (string | number)[] = [];
            graph.forEachNode((node) => {
                nodeIds.push(node.id);
            });

            expect(nodeIds).toHaveLength(3);
            expect(nodeIds).toContain('A');
            expect(nodeIds).toContain('B');
            expect(nodeIds).toContain('C');
        });

        it('removes nodes and edges', () => {
            const graph = createGraph();
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });
            addNode(graph, 'B', { x: 10, y: 0, z: 0 });
            addEdge(graph, 'A', 'B');

            graph.removeEdge('A', 'B');
            expect(graph.hasEdge('A', 'B')).toBe(false);

            graph.removeNode('A');
            expect(graph.hasNode('A')).toBe(false);
            expect(graph.getNodeCount()).toBe(1);
        });
    });

    describe('edge cases', () => {
        it('handles numeric node IDs', () => {
            const graph = createGraph();
            addNode(graph, 1, { x: 0, y: 0, z: 0 });
            addNode(graph, 2, { x: 10, y: 0, z: 0 });
            addEdge(graph, 1, 2);

            expect(graph.hasNode(1)).toBe(true);
            expect(graph.hasEdge(1, 2)).toBe(true);
        });

        it('clears all nodes and edges', () => {
            const graph = createGraph();
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });
            addNode(graph, 'B', { x: 10, y: 0, z: 0 });
            addEdge(graph, 'A', 'B');

            graph.clear();

            expect(graph.getNodeCount()).toBe(0);
            expect(graph.getEdgeCount()).toBe(0);
        });
    });

    describe('error cases', () => {
        it('returns undefined for non-existent node', () => {
            const graph = createGraph();
            expect(graph.getNode('nonexistent')).toBeUndefined();
        });

        it('hasNode returns false for missing node', () => {
            const graph = createGraph();
            expect(graph.hasNode('missing')).toBe(false);
        });
    });
});

describe('createPathfinder', () => {
    let graph: StrataGraphInstance<NodeData, EdgeData>;

    beforeEach(() => {
        graph = createGraph();
    });

    describe('ideal case', () => {
        it('finds path between connected nodes', () => {
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });
            addNode(graph, 'B', { x: 10, y: 0, z: 0 });
            addEdge(graph, 'A', 'B', { bidirectional: true });

            const pathfinder = createPathfinder(graph);
            const result = pathfinder.find('A', 'B');

            expect(result.found).toBe(true);
            expect(result.path).toEqual(['A', 'B']);
            expect(result.nodeCount).toBe(2);
            expect(result.positions).toHaveLength(2);
        });

        it('returns positions along the path', () => {
            addNode(graph, 'start', { x: 0, y: 0, z: 0 });
            addNode(graph, 'end', { x: 10, y: 5, z: 10 });
            addEdge(graph, 'start', 'end', { bidirectional: true });

            const pathfinder = createPathfinder(graph);
            const result = pathfinder.find('start', 'end');

            expect(result.positions[0]).toEqual({ x: 0, y: 0, z: 0 });
            expect(result.positions[1]).toEqual({ x: 10, y: 5, z: 10 });
        });
    });

    describe('normal usage', () => {
        it('finds optimal path through complex graph', () => {
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });
            addNode(graph, 'B', { x: 5, y: 0, z: 0 });
            addNode(graph, 'C', { x: 10, y: 0, z: 0 });
            addNode(graph, 'D', { x: 5, y: 0, z: 5 });

            addEdge(graph, 'A', 'B', { bidirectional: true });
            addEdge(graph, 'B', 'C', { bidirectional: true });
            addEdge(graph, 'A', 'D', { bidirectional: true });
            addEdge(graph, 'D', 'C', { bidirectional: true });

            const pathfinder = createPathfinder(graph);
            const result = pathfinder.find('A', 'C');

            expect(result.found).toBe(true);
            expect(result.path).toContain('A');
            expect(result.path).toContain('C');
            expect(result.path[0]).toBe('A');
            expect(result.path[result.path.length - 1]).toBe('C');
        });

        it('uses findPath helper function', () => {
            addNode(graph, 'start', { x: 0, y: 0, z: 0 });
            addNode(graph, 'end', { x: 10, y: 0, z: 0 });
            addEdge(graph, 'start', 'end', { bidirectional: true });

            const pathfinder = createPathfinder(graph);
            const result = findPath(pathfinder, graph, 'start', 'end');

            expect(result.found).toBe(true);
        });

        it('calculates path cost correctly', () => {
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });
            addNode(graph, 'B', { x: 3, y: 0, z: 4 });
            addEdge(graph, 'A', 'B', { bidirectional: true });

            const pathfinder = createPathfinder(graph);
            const result = pathfinder.find('A', 'B');

            expect(result.cost).toBeCloseTo(5, 5);
        });
    });

    describe('edge cases', () => {
        it('returns not found when no path exists', () => {
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });
            addNode(graph, 'B', { x: 10, y: 0, z: 0 });

            const pathfinder = createPathfinder(graph);
            const result = pathfinder.find('A', 'B');

            expect(result.found).toBe(false);
            expect(result.path).toEqual([]);
            expect(result.positions).toEqual([]);
        });

        it('handles single node path (same start and end)', () => {
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });

            const pathfinder = createPathfinder(graph);
            const result = pathfinder.find('A', 'A');

            // ngraph.path returns an empty path when start equals end (no edges to traverse)
            expect(result.nodeCount).toBe(0);
        });

        it('handles long paths', () => {
            for (let i = 0; i < 10; i++) {
                addNode(graph, `N${i}`, { x: i * 10, y: 0, z: 0 });
            }
            for (let i = 0; i < 9; i++) {
                addEdge(graph, `N${i}`, `N${i + 1}`, { bidirectional: true });
            }

            const pathfinder = createPathfinder(graph);
            const result = pathfinder.find('N0', 'N9');

            expect(result.found).toBe(true);
            expect(result.nodeCount).toBe(10);
        });
    });

    describe('error cases', () => {
        it('returns not found for invalid start node', () => {
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });

            const pathfinder = createPathfinder(graph);
            const result = pathfinder.find('invalid', 'A');

            expect(result.found).toBe(false);
        });

        it('returns not found for invalid end node', () => {
            addNode(graph, 'A', { x: 0, y: 0, z: 0 });

            const pathfinder = createPathfinder(graph);
            const result = pathfinder.find('A', 'invalid');

            expect(result.found).toBe(false);
        });
    });
});

describe('findPathDijkstra', () => {
    it('finds path using Dijkstra algorithm', () => {
        const graph = createGraph();
        addNode(graph, 'A', { x: 0, y: 0, z: 0 });
        addNode(graph, 'B', { x: 10, y: 0, z: 0 });
        addEdge(graph, 'A', 'B', { bidirectional: true });

        const result = findPathDijkstra(graph, 'A', 'B');

        expect(result.found).toBe(true);
        expect(result.path).toEqual(['A', 'B']);
    });

    it('returns not found for disconnected nodes', () => {
        const graph = createGraph();
        addNode(graph, 'A', { x: 0, y: 0, z: 0 });
        addNode(graph, 'B', { x: 10, y: 0, z: 0 });

        const result = findPathDijkstra(graph, 'A', 'B');

        expect(result.found).toBe(false);
    });
});

describe('smoothPath', () => {
    it('smooths a path with corner cutting', () => {
        const positions: Position3D[] = [
            { x: 0, y: 0, z: 0 },
            { x: 10, y: 0, z: 0 },
            { x: 10, y: 0, z: 10 },
        ];

        const smoothed = smoothPath(positions, { iterations: 1 });

        expect(smoothed.length).toBeGreaterThan(positions.length);
        expect(smoothed[0]).toEqual({ x: 0, y: 0, z: 0 });
        expect(smoothed[smoothed.length - 1]).toEqual({ x: 10, y: 0, z: 10 });
    });

    it('preserves endpoints by default', () => {
        const positions: Position3D[] = [
            { x: 0, y: 0, z: 0 },
            { x: 5, y: 5, z: 0 },
            { x: 10, y: 0, z: 0 },
        ];

        const smoothed = smoothPath(positions);

        expect(smoothed[0]).toEqual({ x: 0, y: 0, z: 0 });
        expect(smoothed[smoothed.length - 1]).toEqual({ x: 10, y: 0, z: 0 });
    });

    it('handles paths with fewer than 3 points', () => {
        const positions: Position3D[] = [
            { x: 0, y: 0, z: 0 },
            { x: 10, y: 0, z: 0 },
        ];

        const smoothed = smoothPath(positions);

        expect(smoothed).toEqual(positions);
    });
});

describe('simplifyPath', () => {
    it('removes unnecessary waypoints', () => {
        const positions: Position3D[] = [
            { x: 0, y: 0, z: 0 },
            { x: 5, y: 0, z: 0 },
            { x: 10, y: 0, z: 0 },
        ];

        const simplified = simplifyPath(positions, 0.1);

        expect(simplified.length).toBeLessThanOrEqual(positions.length);
        expect(simplified[0]).toEqual({ x: 0, y: 0, z: 0 });
        expect(simplified[simplified.length - 1]).toEqual({ x: 10, y: 0, z: 0 });
    });

    it('handles short paths', () => {
        const positions: Position3D[] = [{ x: 0, y: 0, z: 0 }];

        const simplified = simplifyPath(positions);

        expect(simplified).toEqual(positions);
    });
});

describe('findClosestNode', () => {
    it('finds the closest node to a position', () => {
        const graph = createGraph();
        addNode(graph, 'A', { x: 0, y: 0, z: 0 });
        addNode(graph, 'B', { x: 10, y: 0, z: 0 });
        addNode(graph, 'C', { x: 5, y: 0, z: 0 });

        const closest = findClosestNode(graph, { x: 4, y: 0, z: 0 });

        expect(closest).toBe('C');
    });

    it('returns undefined for empty graph', () => {
        const graph = createGraph();
        const closest = findClosestNode(graph, { x: 0, y: 0, z: 0 });

        expect(closest).toBeUndefined();
    });
});

describe('createGridGraph', () => {
    it('creates a grid-based graph', () => {
        const grid = createGridGraph(3, 3, 1);

        expect(grid.getNodeCount()).toBe(9);
        expect(grid.hasNode('0_0')).toBe(true);
        expect(grid.hasNode('2_2')).toBe(true);
    });

    it('connects adjacent cells', () => {
        const grid = createGridGraph(2, 2, 1);

        expect(grid.hasEdge('0_0', '1_0')).toBe(true);
        expect(grid.hasEdge('0_0', '0_1')).toBe(true);
    });

    it('supports diagonal connections', () => {
        const grid = createGridGraph(2, 2, 1, { allowDiagonals: true });

        expect(grid.hasEdge('0_0', '1_1')).toBe(true);
    });
});

describe('calculateDistance', () => {
    it('calculates Euclidean distance', () => {
        const a = { x: 0, y: 0, z: 0 };
        const b = { x: 3, y: 4, z: 0 };

        expect(calculateDistance(a, b)).toBe(5);
    });

    it('calculates 3D distance', () => {
        const a = { x: 0, y: 0, z: 0 };
        const b = { x: 1, y: 2, z: 2 };

        expect(calculateDistance(a, b)).toBe(3);
    });
});
