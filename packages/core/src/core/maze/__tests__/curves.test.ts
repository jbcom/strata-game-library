import { describe, expect, it } from 'vitest';
import { generateMaze, type MazeLayout } from '../core';
import {
  buildCurvedWalls,
  type CurvedWall,
  distanceToWall,
  maxDeviation,
  minDistanceToWalls,
  type Point2,
} from '../curves';
import { buildGeometry, DEFAULT_CONFIG, gridToWorld, type MazeConfig } from '../geometry';

const SEEDS = [
  'curve-a',
  'curve-b',
  'curve-c',
  'curve-d',
  'curve-e',
  'curve-f',
  'curve-g',
  'curve-h',
  'curve-i',
  'curve-j',
  'curve-k',
  'curve-l',
];

const WOBBLE = { amplitude: DEFAULT_CONFIG.cellSize * 0.35, wavelength: 9, seed: 'wobble' };

/** Midpoint of an open passage between two adjacent cells, in world space. */
function passageMidpoints(layout: MazeLayout, config: MazeConfig): Point2[] {
  const midpoints: Point2[] = [];
  for (let y = 0; y < layout.height; y++) {
    for (let x = 0; x < layout.width; x++) {
      const cell = layout.cells[y][x];
      const here = gridToWorld(x, y, config, layout.width, layout.height);

      if (!cell.walls.east && x < layout.width - 1) {
        const next = gridToWorld(x + 1, y, config, layout.width, layout.height);
        midpoints.push({ x: (here.x + next.x) / 2, z: (here.z + next.z) / 2 });
      }
      if (!cell.walls.south && y < layout.height - 1) {
        const next = gridToWorld(x, y + 1, config, layout.width, layout.height);
        midpoints.push({ x: (here.x + next.x) / 2, z: (here.z + next.z) / 2 });
      }
    }
  }
  return midpoints;
}

describe('buildCurvedWalls', () => {
  it('emits polylines with at least two points each', () => {
    const layout = generateMaze(9, 9, 'basic');
    const walls = buildCurvedWalls(layout, DEFAULT_CONFIG);

    expect(walls.length).toBeGreaterThan(0);
    walls.forEach((wall) => {
      expect(wall.points.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('emits pure data — finite numeric coordinates, no engine objects', () => {
    const layout = generateMaze(9, 9, 'pure-data');
    const walls = buildCurvedWalls(layout, DEFAULT_CONFIG, { wobble: WOBBLE });

    walls.forEach((wall) => {
      expect(typeof wall.closed).toBe('boolean');
      wall.points.forEach((point) => {
        expect(Number.isFinite(point.x)).toBe(true);
        expect(Number.isFinite(point.z)).toBe(true);
        expect(Object.keys(point).sort()).toEqual(['x', 'z']);
      });
    });
  });

  it('chains contiguous wall runs rather than emitting one box per cell', () => {
    const layout = generateMaze(11, 11, 'chaining');
    const geometry = buildGeometry(layout, DEFAULT_CONFIG);
    const walls = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 0 });

    // Runs must be strictly fewer than the per-cell wall-segment count, proving
    // adjacent wall pieces were merged into shared polylines.
    expect(walls.length).toBeLessThan(geometry.walls.length);
  });

  it('smoothing increases point density without adding runs', () => {
    const layout = generateMaze(9, 9, 'smoothing');
    const raw = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 0 });
    const smooth = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 3 });

    expect(smooth).toHaveLength(raw.length);
    const rawPoints = raw.reduce((n, w) => n + w.points.length, 0);
    const smoothPoints = smooth.reduce((n, w) => n + w.points.length, 0);
    expect(smoothPoints).toBeGreaterThan(rawPoints);
  });

  it('actually curves the walls — smoothed output is not axis-aligned everywhere', () => {
    const layout = generateMaze(11, 11, 'curvature');
    const walls = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 3, wobble: WOBBLE });

    // Count vertices that are off both the x and z grid lines: proof the output
    // reads as curves rather than boxes.
    let offGrid = 0;
    for (const wall of walls) {
      for (const point of wall.points) {
        const nearX = Math.abs(point.x % DEFAULT_CONFIG.cellSize) > 1e-6;
        const nearZ = Math.abs(point.z % DEFAULT_CONFIG.cellSize) > 1e-6;
        if (nearX && nearZ) offGrid++;
      }
    }
    expect(offGrid).toBeGreaterThan(0);
  });

  it('is deterministic for a given layout, config and wobble seed', () => {
    const layout = generateMaze(11, 11, 'determinism');
    const a = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 2, wobble: WOBBLE });
    const b = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 2, wobble: WOBBLE });

    expect(a).toEqual(b);
  });

  it('different wobble seeds produce different curves', () => {
    const layout = generateMaze(11, 11, 'wobble-seeds');
    const a = buildCurvedWalls(layout, DEFAULT_CONFIG, {
      wobble: { ...WOBBLE, seed: 'wobble-a' },
    });
    const b = buildCurvedWalls(layout, DEFAULT_CONFIG, {
      wobble: { ...WOBBLE, seed: 'wobble-b' },
    });

    expect(a).not.toEqual(b);
  });

  it('respects a custom MazeConfig', () => {
    const layout = generateMaze(9, 9, 'custom-config');
    const config: MazeConfig = { cellSize: 12, wallHeight: 4, wallThickness: 0.3 };
    const walls = buildCurvedWalls(layout, config);

    const allPoints = walls.flatMap((w) => w.points);
    const maxAbsX = Math.max(...allPoints.map((p) => Math.abs(p.x)));
    // With a larger cell size the maze spans proportionally further from origin.
    expect(maxAbsX).toBeGreaterThan(4 * config.cellSize * 0.8);
  });

  it('marks a run closed exactly when its wall edges form a cycle', () => {
    // A perfect maze's wall graph is densely branched — junctions terminate runs,
    // so closed loops are possible but not guaranteed for any given seed. The
    // invariant that must always hold is that `closed` is accurate: a closed run
    // returns to its start via wall edges, an open run does not.
    for (const seed of SEEDS) {
      const layout = generateMaze(11, 11, seed);
      const walls = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 0 });

      walls.forEach((wall) => {
        const first = wall.points[0];
        const last = wall.points[wall.points.length - 1];
        const gap = Math.hypot(first.x - last.x, first.z - last.z);
        if (wall.closed) {
          // Closed runs drop the duplicate final point, so the gap back to the
          // start is exactly one cell edge.
          expect(gap).toBeCloseTo(DEFAULT_CONFIG.cellSize, 6);
        } else {
          // Open runs must genuinely not return to their starting corner.
          expect(gap).toBeGreaterThan(0);
        }
      });
    }
  });

  it('produces a closed loop for a layout whose walls form a clean cycle', () => {
    // Carve every interior wall away so only the outer boundary remains. That
    // boundary is a pure cycle — every corner on it has degree exactly 2 — and
    // must be reported as one closed run.
    const layout = generateMaze(9, 9, 'ring');
    for (let y = 0; y < layout.height; y++) {
      for (let x = 0; x < layout.width; x++) {
        layout.cells[y][x].walls = {
          north: y === 0,
          south: y === layout.height - 1,
          west: x === 0,
          east: x === layout.width - 1,
        };
      }
    }

    const walls = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 0 });

    expect(walls).toHaveLength(1);
    expect(walls[0].closed).toBe(true);
    // 9x9 cells → a 36-corner perimeter loop.
    expect(walls[0].points).toHaveLength(36);
  });

  it('closed runs do not duplicate their first point as their last', () => {
    const layout = generateMaze(11, 11, 'closed-no-dupe');
    const walls = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 0 });

    walls
      .filter((w) => w.closed)
      .forEach((wall) => {
        const first = wall.points[0];
        const last = wall.points[wall.points.length - 1];
        expect(first.x === last.x && first.z === last.z).toBe(false);
      });
  });

  it('open runs keep their endpoints pinned to the exact grid corners', () => {
    const layout = generateMaze(9, 9, 'pinned-endpoints');
    const raw = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 0 });
    const curved = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 3, wobble: WOBBLE });

    raw.forEach((rawWall, i) => {
      if (rawWall.closed) return;
      const curvedWall = curved[i];
      expect(curvedWall.points[0]).toEqual(rawWall.points[0]);
      expect(curvedWall.points[curvedWall.points.length - 1]).toEqual(
        rawWall.points[rawWall.points.length - 1]
      );
    });
  });

  it('covers every wall segment buildGeometry would emit', () => {
    const layout = generateMaze(9, 9, 'coverage');
    const geometry = buildGeometry(layout, DEFAULT_CONFIG);
    const walls = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 0 });

    // Every box wall centre must lie on (or extremely near) some polyline.
    geometry.walls.forEach((segment) => {
      const distance = minDistanceToWalls({ x: segment.x, z: segment.z }, walls);
      expect(distance).toBeLessThan(1e-6);
    });
  });
});

describe('topology preservation (the critical constraint)', () => {
  it('never deviates further than the documented clamp, across many seeds', () => {
    const limit = maxDeviation(DEFAULT_CONFIG);

    for (const seed of SEEDS) {
      const layout = generateMaze(11, 11, seed);
      const raw = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 0 });
      const curved = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 3, wobble: WOBBLE });

      curved.forEach((wall, i) => {
        wall.points.forEach((point) => {
          // Distance to the *original* run for this wall must stay within the clamp.
          expect(distanceToWall(point, raw[i])).toBeLessThanOrEqual(limit + 1e-9);
        });
      });
    }
  });

  it('corridor centres (rail nodes) keep minimum clearance to every curved wall', () => {
    const limit = maxDeviation(DEFAULT_CONFIG);
    // A wall starts cellSize/2 from a corridor centre and may move at most `limit`
    // toward it, so this is the tightest clearance topology can ever allow.
    const minClearance = DEFAULT_CONFIG.cellSize / 2 - limit;
    expect(minClearance).toBeGreaterThan(0);

    for (const seed of SEEDS) {
      const layout = generateMaze(11, 11, seed);
      const geometry = buildGeometry(layout, DEFAULT_CONFIG);
      const walls = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 3, wobble: WOBBLE });

      for (const node of geometry.railNodes.values()) {
        const distance = minDistanceToWalls({ x: node.worldX, z: node.worldZ }, walls);
        expect(distance).toBeGreaterThanOrEqual(minClearance - 1e-9);
      }
    }
  });

  it('open passage midpoints keep minimum clearance — no passage is ever sealed', () => {
    const limit = maxDeviation(DEFAULT_CONFIG);
    const minClearance = DEFAULT_CONFIG.cellSize / 2 - limit;

    for (const seed of SEEDS) {
      const layout = generateMaze(11, 11, seed);
      const walls = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 3, wobble: WOBBLE });

      passageMidpoints(layout, DEFAULT_CONFIG).forEach((midpoint) => {
        const distance = minDistanceToWalls(midpoint, walls);
        expect(distance).toBeGreaterThanOrEqual(minClearance - 1e-9);
      });
    }
  });

  it('walled cell boundaries keep a maximum gap — no wall is ever opened', () => {
    const limit = maxDeviation(DEFAULT_CONFIG);

    for (const seed of SEEDS) {
      const layout = generateMaze(11, 11, seed);
      const geometry = buildGeometry(layout, DEFAULT_CONFIG);
      const walls = buildCurvedWalls(layout, DEFAULT_CONFIG, { smoothing: 3, wobble: WOBBLE });

      // Every walled boundary midpoint must still have wall material within the
      // clamp distance: the curve may bow away, but never far enough to open.
      geometry.walls.forEach((segment) => {
        const distance = minDistanceToWalls({ x: segment.x, z: segment.z }, walls);
        expect(distance).toBeLessThanOrEqual(limit + 1e-9);
      });
    }
  });

  it('holds even with an absurdly large wobble amplitude (clamp is authoritative)', () => {
    const limit = maxDeviation(DEFAULT_CONFIG);
    const minClearance = DEFAULT_CONFIG.cellSize / 2 - limit;
    const layout = generateMaze(11, 11, 'absurd-wobble');

    const walls = buildCurvedWalls(layout, DEFAULT_CONFIG, {
      smoothing: 4,
      wobble: { amplitude: DEFAULT_CONFIG.cellSize * 50, wavelength: 2, seed: 'absurd' },
    });
    const geometry = buildGeometry(layout, DEFAULT_CONFIG);

    for (const node of geometry.railNodes.values()) {
      expect(minDistanceToWalls({ x: node.worldX, z: node.worldZ }, walls)).toBeGreaterThanOrEqual(
        minClearance - 1e-9
      );
    }
  });

  it('maxDeviation stays strictly under half the free gap beside a corridor', () => {
    const configs: MazeConfig[] = [
      DEFAULT_CONFIG,
      { cellSize: 4, wallHeight: 3, wallThickness: 0.1 },
      { cellSize: 12, wallHeight: 6, wallThickness: 0.4 },
    ];

    configs.forEach((config) => {
      const passageWidth = config.cellSize * 0.5;
      const freeGap = (config.cellSize - passageWidth) / 2;
      expect(maxDeviation(config)).toBeLessThan(freeGap);
      expect(maxDeviation(config)).toBeGreaterThan(0);
    });
  });
});

describe('distance helpers', () => {
  it('distanceToWall returns zero for a point on the polyline', () => {
    const wall: CurvedWall = {
      points: [
        { x: 0, z: 0 },
        { x: 10, z: 0 },
      ],
      closed: false,
    };
    expect(distanceToWall({ x: 5, z: 0 }, wall)).toBeCloseTo(0);
  });

  it('distanceToWall measures perpendicular distance to a segment', () => {
    const wall: CurvedWall = {
      points: [
        { x: 0, z: 0 },
        { x: 10, z: 0 },
      ],
      closed: false,
    };
    expect(distanceToWall({ x: 5, z: 3 }, wall)).toBeCloseTo(3);
  });

  it('distanceToWall clamps to segment endpoints', () => {
    const wall: CurvedWall = {
      points: [
        { x: 0, z: 0 },
        { x: 10, z: 0 },
      ],
      closed: false,
    };
    expect(distanceToWall({ x: -4, z: 0 }, wall)).toBeCloseTo(4);
  });

  it('closed walls include the wrap-around segment', () => {
    const square: CurvedWall = {
      points: [
        { x: 0, z: 0 },
        { x: 10, z: 0 },
        { x: 10, z: 10 },
        { x: 0, z: 10 },
      ],
      closed: true,
    };
    // Midpoint of the closing edge (from last point back to first).
    expect(distanceToWall({ x: 0, z: 5 }, square)).toBeCloseTo(0);
  });

  it('minDistanceToWalls picks the nearest wall', () => {
    const walls: CurvedWall[] = [
      {
        points: [
          { x: 0, z: 0 },
          { x: 0, z: 10 },
        ],
        closed: false,
      },
      {
        points: [
          { x: 100, z: 0 },
          { x: 100, z: 10 },
        ],
        closed: false,
      },
    ];
    expect(minDistanceToWalls({ x: 3, z: 5 }, walls)).toBeCloseTo(3);
  });
});
