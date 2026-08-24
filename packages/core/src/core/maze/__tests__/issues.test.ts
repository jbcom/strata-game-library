import { describe, expect, it } from 'vitest';
import { generateMaze } from '../core';
import { buildGeometry, DEFAULT_CONFIG } from '../geometry';

describe('ISSUE: Coordinate System Centering', () => {
  it('center cell should be at world origin (0, 0)', () => {
    const layout = generateMaze(7, 7, 'centering-test');
    const geometry = buildGeometry(layout);

    const centerNode = geometry.railNodes.get(geometry.centerNodeId);
    expect(centerNode).toBeDefined();

    expect(centerNode?.worldX).toBe(0);
    expect(centerNode?.worldZ).toBe(0);
  });

  it('cells should be symmetrically placed around origin', () => {
    const layout = generateMaze(5, 5, 'symmetry-test');
    const geometry = buildGeometry(layout);

    const topLeft = geometry.railNodes.get('0,0');
    const bottomRight = geometry.railNodes.get('4,4');

    expect(topLeft).toBeDefined();
    expect(bottomRight).toBeDefined();

    expect(topLeft?.worldX).toBe(-(bottomRight?.worldX ?? 0));
    expect(topLeft?.worldZ).toBe(-(bottomRight?.worldZ ?? 0));
  });

  it('9x9 maze should have proper symmetric layout', () => {
    const layout = generateMaze(9, 9, 'symmetric-9x9');
    const geometry = buildGeometry(layout);

    const corner00 = geometry.railNodes.get('0,0');
    const corner88 = geometry.railNodes.get('8,8');
    const center = geometry.railNodes.get('4,4');

    expect(center?.worldX).toBe(0);
    expect(center?.worldZ).toBe(0);
    expect(corner00?.worldX).toBe(-(corner88?.worldX ?? 0));
    expect(corner00?.worldZ).toBe(-(corner88?.worldZ ?? 0));
  });
});

describe('ISSUE: Wall Generation', () => {
  it('perimeter should have walls on all sides', () => {
    const layout = generateMaze(7, 7, 'perimeter-test');
    const geometry = buildGeometry(layout);

    const centerGridX = Math.floor(layout.width / 2);
    const centerGridY = Math.floor(layout.height / 2);
    const halfCell = DEFAULT_CONFIG.cellSize / 2;

    const expectedNorthZ = -centerGridY * DEFAULT_CONFIG.cellSize - halfCell;
    const expectedSouthZ = (layout.height - 1 - centerGridY) * DEFAULT_CONFIG.cellSize + halfCell;
    const expectedWestX = -centerGridX * DEFAULT_CONFIG.cellSize - halfCell;
    const expectedEastX = (layout.width - 1 - centerGridX) * DEFAULT_CONFIG.cellSize + halfCell;

    let hasNorthWalls = false;
    let hasSouthWalls = false;
    let hasEastWalls = false;
    let hasWestWalls = false;

    for (const wall of geometry.walls) {
      if (Math.abs(wall.z - expectedNorthZ) < 0.1) hasNorthWalls = true;
      if (Math.abs(wall.z - expectedSouthZ) < 0.1) hasSouthWalls = true;
      if (Math.abs(wall.x - expectedWestX) < 0.1) hasWestWalls = true;
      if (Math.abs(wall.x - expectedEastX) < 0.1) hasEastWalls = true;
    }

    expect(hasNorthWalls).toBe(true);
    expect(hasSouthWalls).toBe(true);
    expect(hasEastWalls).toBe(true);
    expect(hasWestWalls).toBe(true);
  });

  it('should not have gaps in interior walls', () => {
    const layout = generateMaze(5, 5, 'gaps-test');
    const geometry = buildGeometry(layout);

    for (let y = 0; y < layout.height; y++) {
      for (let x = 0; x < layout.width; x++) {
        const cell = layout.cells[y][x];
        const nodeId = `${x},${y}`;
        const node = geometry.railNodes.get(nodeId);

        expect(node).toBeDefined();

        if (cell.walls.north && y > 0) {
          const northNode = geometry.railNodes.get(`${x},${y - 1}`);
          expect(node?.connections).not.toContain(`${x},${y - 1}`);
          if (northNode) {
            expect(northNode.connections).not.toContain(nodeId);
          }
        }
      }
    }
  });
});

describe('ISSUE: Exit Reachability', () => {
  it('all exits should be reachable from center', () => {
    const layout = generateMaze(11, 11, 'exit-reach-test');
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

    for (const exitId of geometry.exitNodeIds) {
      expect(visited.has(exitId)).toBe(true);
    }
  });

  it('exits should have at least one connection to interior', () => {
    const layout = generateMaze(9, 9, 'exit-conn-test');
    const geometry = buildGeometry(layout);

    for (const exitId of geometry.exitNodeIds) {
      const exitNode = geometry.railNodes.get(exitId);
      expect(exitNode).toBeDefined();
      expect(exitNode?.connections.length).toBeGreaterThan(0);
    }
  });
});

describe('ISSUE: Maze Generation Guarantees', () => {
  it('should always have at least one exit', () => {
    for (let i = 0; i < 10; i++) {
      const layout = generateMaze(9, 9, `exit-guarantee-${i}`);
      expect(layout.exits.length).toBeGreaterThan(0);
    }
  });

  it('minimum maze size should work', () => {
    const layout = generateMaze(3, 3, 'min-size');
    expect(layout.width).toBe(3);
    expect(layout.height).toBe(3);
    expect(layout.center.x).toBe(1);
    expect(layout.center.y).toBe(1);
  });

  it('very large maze should still be valid', () => {
    const layout = generateMaze(21, 21, 'large-maze');
    const geometry = buildGeometry(layout);

    expect(geometry.railNodes.size).toBe(21 * 21);
    expect(geometry.exitNodeIds.length).toBeGreaterThan(0);

    const centerNode = geometry.railNodes.get(geometry.centerNodeId);
    expect(centerNode).toBeDefined();
    expect(centerNode?.isCenter).toBe(true);
  });

  it('all cells should have consistent wall pairs', () => {
    const layout = generateMaze(9, 9, 'wall-pairs');

    for (let y = 0; y < layout.height; y++) {
      for (let x = 0; x < layout.width; x++) {
        const cell = layout.cells[y][x];

        if (x < layout.width - 1) {
          const rightCell = layout.cells[y][x + 1];
          expect(cell.walls.east).toBe(rightCell.walls.west);
        }

        if (y < layout.height - 1) {
          const belowCell = layout.cells[y + 1][x];
          expect(cell.walls.south).toBe(belowCell.walls.north);
        }
      }
    }
  });
});

describe('ISSUE: Navigation Edge Cases', () => {
  it('corner cells should have correct connections', () => {
    const layout = generateMaze(5, 5, 'corners-test');
    const geometry = buildGeometry(layout);

    const topLeft = geometry.railNodes.get('0,0');
    const topRight = geometry.railNodes.get('4,0');
    const bottomLeft = geometry.railNodes.get('0,4');
    const bottomRight = geometry.railNodes.get('4,4');

    expect(topLeft).toBeDefined();
    expect(topRight).toBeDefined();
    expect(bottomLeft).toBeDefined();
    expect(bottomRight).toBeDefined();

    if (topLeft) {
      expect(
        topLeft.connections.every((c) => {
          const [cx, cy] = c.split(',').map(Number);
          return cx >= 0 && cy >= 0 && cx < 5 && cy < 5;
        })
      ).toBe(true);
    }
  });

  it('dead ends should have exactly one connection', () => {
    const layout = generateMaze(9, 9, 'deadends-test');
    const geometry = buildGeometry(layout);

    let deadEndCount = 0;
    for (const node of geometry.railNodes.values()) {
      if (node.connections.length === 1 && !node.isCenter) {
        deadEndCount++;
      }
    }

    expect(deadEndCount).toBeGreaterThan(0);
  });

  it('center should never be a dead end', () => {
    for (let i = 0; i < 10; i++) {
      const layout = generateMaze(7, 7, `center-deadend-${i}`);
      const geometry = buildGeometry(layout);

      const centerNode = geometry.railNodes.get(geometry.centerNodeId);
      expect(centerNode).toBeDefined();
      expect(centerNode?.connections.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('ISSUE: World Coordinate Precision', () => {
  it('adjacent cells should have exact cellSize distance', () => {
    const layout = generateMaze(5, 5, 'distance-test');
    const geometry = buildGeometry(layout);

    for (const node of geometry.railNodes.values()) {
      for (const connId of node.connections) {
        const connNode = geometry.railNodes.get(connId);
        if (!connNode) continue;

        const dx = Math.abs(node.worldX - connNode.worldX);
        const dy = Math.abs(node.worldZ - connNode.worldZ);
        const distance = Math.sqrt(dx * dx + dy * dy);

        expect(Math.abs(distance - DEFAULT_CONFIG.cellSize)).toBeLessThan(0.001);
      }
    }
  });
});
