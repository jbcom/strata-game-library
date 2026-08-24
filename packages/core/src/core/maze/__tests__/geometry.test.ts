import { describe, expect, it } from 'vitest';
import { generateMaze } from '../core';
import { buildGeometry, DEFAULT_CONFIG, gridToWorld, worldToGrid } from '../geometry';

describe('buildGeometry', () => {
  it('creates one traversable ceiling tile per rail node', () => {
    const geometry = buildGeometry(generateMaze(7, 7, 'ceiling-grid'));
    expect(geometry.ceilings).toHaveLength(geometry.railNodes.size);
    expect(geometry.ceilings.every((tile) => tile.y >= 3 && tile.y <= 4)).toBe(true);
    expect(new Set(geometry.ceilings.map((tile) => tile.nodeId)).size).toBe(
      geometry.railNodes.size
    );
  });
  it('creates rail nodes for all cells', () => {
    const layout = generateMaze(7, 7, 'geometry-test');
    const geometry = buildGeometry(layout);

    expect(geometry.railNodes.size).toBe(7 * 7);
  });

  it('rail nodes have correct world coordinates', () => {
    const layout = generateMaze(5, 5, 'coords-test');
    const geometry = buildGeometry(layout);

    const centerNode = geometry.railNodes.get(geometry.centerNodeId);
    expect(centerNode).toBeDefined();

    const expectedWorld = gridToWorld(2, 2, DEFAULT_CONFIG, 5, 5);
    expect(centerNode?.worldX).toBe(expectedWorld.x);
    expect(centerNode?.worldZ).toBe(expectedWorld.z);
  });

  it('rail node connections match open walls', () => {
    const layout = generateMaze(7, 7, 'connections-test');
    const geometry = buildGeometry(layout);

    for (const node of geometry.railNodes.values()) {
      const cell = layout.cells[node.gridY][node.gridX];

      if (!cell.walls.north && node.gridY > 0) {
        const northId = `${node.gridX},${node.gridY - 1}`;
        expect(node.connections).toContain(northId);
      }
      if (!cell.walls.south && node.gridY < layout.height - 1) {
        const southId = `${node.gridX},${node.gridY + 1}`;
        expect(node.connections).toContain(southId);
      }
      if (!cell.walls.east && node.gridX < layout.width - 1) {
        const eastId = `${node.gridX + 1},${node.gridY}`;
        expect(node.connections).toContain(eastId);
      }
      if (!cell.walls.west && node.gridX > 0) {
        const westId = `${node.gridX - 1},${node.gridY}`;
        expect(node.connections).toContain(westId);
      }
    }
  });

  it('connections are bidirectional', () => {
    const layout = generateMaze(9, 9, 'bidirectional-test');
    const geometry = buildGeometry(layout);

    for (const node of geometry.railNodes.values()) {
      for (const connId of node.connections) {
        const connectedNode = geometry.railNodes.get(connId);
        expect(connectedNode).toBeDefined();
        expect(connectedNode?.connections).toContain(node.id);
      }
    }
  });

  it('creates wall segments for maze boundaries', () => {
    const layout = generateMaze(5, 5, 'walls-test');
    const geometry = buildGeometry(layout);

    expect(geometry.walls.length).toBeGreaterThan(0);

    geometry.walls.forEach((wall) => {
      expect(wall.height).toBe(DEFAULT_CONFIG.wallHeight);
    });
  });

  it('creates floor segment covering entire maze', () => {
    const layout = generateMaze(7, 7, 'floor-test');
    const geometry = buildGeometry(layout);

    expect(geometry.floor).toBeDefined();
    expect(geometry.floor.width).toBeGreaterThan(0);
    expect(geometry.floor.depth).toBeGreaterThan(0);
  });

  it('exit nodes are on perimeter', () => {
    const layout = generateMaze(9, 9, 'exits-test');
    const geometry = buildGeometry(layout);

    expect(geometry.exitNodeIds.length).toBeGreaterThan(0);

    geometry.exitNodeIds.forEach((exitId) => {
      const node = geometry.railNodes.get(exitId);
      expect(node).toBeDefined();
      expect(node?.isExit).toBe(true);

      const isOnPerimeter =
        node?.gridX === 0 ||
        node?.gridX === layout.width - 1 ||
        node?.gridY === 0 ||
        node?.gridY === layout.height - 1;
      expect(isOnPerimeter).toBe(true);
    });
  });

  it('center node is correctly identified', () => {
    const layout = generateMaze(7, 7, 'center-test');
    const geometry = buildGeometry(layout);

    const centerNode = geometry.railNodes.get(geometry.centerNodeId);
    expect(centerNode).toBeDefined();
    expect(centerNode?.isCenter).toBe(true);
    expect(centerNode?.gridX).toBe(3);
    expect(centerNode?.gridY).toBe(3);
  });

  it('no duplicate wall segments', () => {
    const layout = generateMaze(7, 7, 'no-dupes-test');
    const geometry = buildGeometry(layout);

    const wallKeys = geometry.walls.map((w) => `${w.x},${w.z},${w.rotation}`);
    const uniqueKeys = new Set(wallKeys);
    expect(uniqueKeys.size).toBe(wallKeys.length);
  });

  it('all nodes are reachable from center via connections', () => {
    const layout = generateMaze(9, 9, 'reachability-test');
    const geometry = buildGeometry(layout);

    const visited = new Set<string>();
    const queue = [geometry.centerNodeId];

    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (!nodeId) continue;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = geometry.railNodes.get(nodeId);
      if (node) {
        queue.push(...node.connections.filter((c) => !visited.has(c)));
      }
    }

    expect(visited.size).toBe(geometry.railNodes.size);
  });
});

describe('gridToWorld', () => {
  it('places center cell at origin', () => {
    const pos = gridToWorld(2, 2, DEFAULT_CONFIG, 5, 5);
    expect(pos.x).toBe(0);
    expect(pos.z).toBe(0);
  });

  it('correctly offsets from center', () => {
    const pos = gridToWorld(3, 2, DEFAULT_CONFIG, 5, 5);
    expect(pos.x).toBe(DEFAULT_CONFIG.cellSize);
    expect(pos.z).toBe(0);
  });

  it('places corner cells symmetrically', () => {
    const topLeft = gridToWorld(0, 0, DEFAULT_CONFIG, 5, 5);
    const bottomRight = gridToWorld(4, 4, DEFAULT_CONFIG, 5, 5);
    expect(topLeft.x).toBe(-bottomRight.x);
    expect(topLeft.z).toBe(-bottomRight.z);
  });

  it('respects custom config', () => {
    const customConfig = { cellSize: 10, wallHeight: 5, wallThickness: 0.2 };
    const pos = gridToWorld(3, 3, customConfig, 5, 5);
    expect(pos.x).toBe(10);
    expect(pos.z).toBe(10);
  });
});

describe('worldToGrid', () => {
  it('converts origin to center grid cell', () => {
    const pos = worldToGrid(0, 0, DEFAULT_CONFIG, 5, 5);
    expect(pos.x).toBe(2);
    expect(pos.y).toBe(2);
  });

  it('correctly converts offset world position', () => {
    const pos = worldToGrid(
      DEFAULT_CONFIG.cellSize,
      2 * DEFAULT_CONFIG.cellSize,
      DEFAULT_CONFIG,
      7,
      7
    );
    expect(pos.x).toBe(4);
    expect(pos.y).toBe(5);
  });

  it('rounds to nearest grid cell', () => {
    const halfCell = DEFAULT_CONFIG.cellSize / 2;
    const pos = worldToGrid(halfCell + 0.1, halfCell - 0.1, DEFAULT_CONFIG, 5, 5);
    expect(pos.x).toBe(3);
    expect(pos.y).toBe(2);
  });

  it('is inverse of gridToWorld', () => {
    const gridX = 3,
      gridY = 5;
    const mazeW = 9,
      mazeH = 9;
    const world = gridToWorld(gridX, gridY, DEFAULT_CONFIG, mazeW, mazeH);
    const grid = worldToGrid(world.x, world.z, DEFAULT_CONFIG, mazeW, mazeH);
    expect(grid.x).toBe(gridX);
    expect(grid.y).toBe(gridY);
  });
});

describe('DEFAULT_CONFIG', () => {
  it('has reasonable cell size', () => {
    expect(DEFAULT_CONFIG.cellSize).toBeGreaterThan(1);
    expect(DEFAULT_CONFIG.cellSize).toBeLessThan(20);
  });

  it('has reasonable wall dimensions', () => {
    expect(DEFAULT_CONFIG.wallHeight).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.wallThickness).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.wallHeight).toBeGreaterThan(DEFAULT_CONFIG.wallThickness);
  });

  it('wall height is taller than player view', () => {
    expect(DEFAULT_CONFIG.wallHeight).toBeGreaterThan(1.6);
  });
});

describe('RailNode structure', () => {
  it('each node has unique id', () => {
    const layout = generateMaze(11, 11, 'unique-ids-test');
    const geometry = buildGeometry(layout);

    const ids = Array.from(geometry.railNodes.keys());
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('node id format is gridX,gridY', () => {
    const layout = generateMaze(5, 5, 'id-format-test');
    const geometry = buildGeometry(layout);

    for (const node of geometry.railNodes.values()) {
      expect(node.id).toBe(`${node.gridX},${node.gridY}`);
    }
  });

  it('center node has no false isCenter siblings', () => {
    const layout = generateMaze(7, 7, 'single-center-test');
    const geometry = buildGeometry(layout);

    let centerCount = 0;
    for (const node of geometry.railNodes.values()) {
      if (node.isCenter) centerCount++;
    }
    expect(centerCount).toBe(1);
  });
});
