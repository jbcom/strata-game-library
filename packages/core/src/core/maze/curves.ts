import seedrandom from 'seedrandom';
import type { MazeLayout } from './core.js';
import { DEFAULT_CONFIG, gridToWorld, type MazeConfig } from './geometry.js';

export interface Point2 {
  x: number;
  z: number;
}

export interface CurvedWall {
  points: Point2[];
  closed: boolean;
}

export interface WobbleOptions {
  /** Peak lateral displacement in world units, before clamping. */
  amplitude: number;
  /** World-space distance for one full sine period. */
  wavelength: number;
  seed: string;
}

export interface BuildCurvedWallsOptions {
  /**
   * Chaikin subdivision passes. 0 leaves the raw polyline; each pass roughly
   * doubles point count and rounds corners further. Defaults to 2.
   */
  smoothing?: number;
  wobble?: WobbleOptions;
}

/**
 * The passage width a game actually walks through, as a fraction of cellSize.
 * Deviation is clamped so a curved wall can never intrude past this corridor.
 */
const PASSAGE_WIDTH_RATIO = 0.5;

/**
 * Maximum lateral deviation a smoothed/wobbled wall vertex may take from its
 * original grid position.
 *
 * The constraint that matters: a wall must never move far enough to seal an
 * open passage or open a sealed one. A wall sits `cellSize / 2` from the
 * corridor centre, and the corridor is `passageWidth` across, so the free gap
 * on each side is `(cellSize - passageWidth) / 2`. We stay strictly inside it.
 */
export function maxDeviation(config: MazeConfig): number {
  const passageWidth = config.cellSize * PASSAGE_WIDTH_RATIO;
  return ((config.cellSize - passageWidth) / 2) * 0.9;
}

type Orientation = 'horizontal' | 'vertical';

interface WallEdge {
  orientation: Orientation;
  /** Grid-space endpoints of this unit edge, in corner coordinates. */
  a: { cx: number; cy: number };
  b: { cx: number; cy: number };
}

/**
 * Every wall in the grid as a unit edge between two grid corners.
 *
 * A cell (x, y) has corners (x, y) … (x+1, y+1) in corner space. Its north wall
 * is the edge from corner (x, y) to (x+1, y); its west wall runs (x, y) to
 * (x, y+1). Interior walls are shared between adjacent cells, so we emit north
 * and west for every cell and add the south/east boundary walls only on the
 * final row/column — exactly mirroring how `buildGeometry` avoids duplicates.
 */
function collectWallEdges(layout: MazeLayout): WallEdge[] {
  const edges: WallEdge[] = [];

  for (let y = 0; y < layout.height; y++) {
    for (let x = 0; x < layout.width; x++) {
      const cell = layout.cells[y][x];

      if (cell.walls.north) {
        edges.push({
          orientation: 'horizontal',
          a: { cx: x, cy: y },
          b: { cx: x + 1, cy: y },
        });
      }
      if (cell.walls.west) {
        edges.push({
          orientation: 'vertical',
          a: { cx: x, cy: y },
          b: { cx: x, cy: y + 1 },
        });
      }
      if (y === layout.height - 1 && cell.walls.south) {
        edges.push({
          orientation: 'horizontal',
          a: { cx: x, cy: y + 1 },
          b: { cx: x + 1, cy: y + 1 },
        });
      }
      if (x === layout.width - 1 && cell.walls.east) {
        edges.push({
          orientation: 'vertical',
          a: { cx: x + 1, cy: y },
          b: { cx: x + 1, cy: y + 1 },
        });
      }
    }
  }

  return edges;
}

function cornerKey(cx: number, cy: number): string {
  return `${cx},${cy}`;
}

/**
 * Chain unit wall edges into maximal runs (polylines), so each contiguous stretch
 * of wall becomes one curve rather than a pile of disconnected boxes.
 *
 * Corners where three or more wall edges meet are treated as run terminators —
 * a junction cannot belong to a single unambiguous polyline, and splitting there
 * keeps every run a simple path.
 */
function chainEdges(
  edges: WallEdge[]
): { corners: { cx: number; cy: number }[]; closed: boolean }[] {
  const incident = new Map<string, number[]>();
  edges.forEach((edge, index) => {
    for (const corner of [edge.a, edge.b]) {
      const key = cornerKey(corner.cx, corner.cy);
      const list = incident.get(key);
      if (list) list.push(index);
      else incident.set(key, [index]);
    }
  });

  const used = new Array<boolean>(edges.length).fill(false);
  const runs: { corners: { cx: number; cy: number }[]; closed: boolean }[] = [];

  const degreeOf = (cx: number, cy: number) => incident.get(cornerKey(cx, cy))?.length ?? 0;

  /** Walk from `corner` along unused edges until the chain terminates. */
  const walk = (start: { cx: number; cy: number }): { cx: number; cy: number }[] => {
    const chain = [start];
    let current = start;

    for (;;) {
      // A junction ends the run — except at the very first step, where we are
      // deliberately starting a new run out of that junction.
      if (chain.length > 1 && degreeOf(current.cx, current.cy) > 2) break;

      const candidates = (incident.get(cornerKey(current.cx, current.cy)) ?? []).filter(
        (index) => !used[index]
      );
      if (candidates.length === 0) break;

      const edgeIndex = candidates[0];
      used[edgeIndex] = true;
      const edge = edges[edgeIndex];
      const next = edge.a.cx === current.cx && edge.a.cy === current.cy ? edge.b : edge.a;
      chain.push(next);
      current = next;
    }

    return chain;
  };

  // Pass 1: start runs at endpoints and junctions, so open runs get full coverage.
  const startKeys = Array.from(incident.keys()).filter((key) => {
    const degree = incident.get(key)?.length ?? 0;
    return degree === 1 || degree > 2;
  });
  startKeys.sort();

  for (const key of startKeys) {
    const [cx, cy] = key.split(',').map(Number);
    for (;;) {
      const remaining = (incident.get(key) ?? []).filter((index) => !used[index]);
      if (remaining.length === 0) break;
      const chain = walk({ cx, cy });
      if (chain.length > 1) runs.push({ corners: chain, closed: false });
      else break;
    }
  }

  // Pass 2: whatever is left is a closed loop (every corner degree exactly 2).
  for (let index = 0; index < edges.length; index++) {
    if (used[index]) continue;
    used[index] = true;
    const edge = edges[index];
    const chain = [edge.a, edge.b];
    let current = edge.b;

    for (;;) {
      const candidates = (incident.get(cornerKey(current.cx, current.cy)) ?? []).filter(
        (i) => !used[i]
      );
      if (candidates.length === 0) break;
      const nextIndex = candidates[0];
      used[nextIndex] = true;
      const nextEdge = edges[nextIndex];
      const next =
        nextEdge.a.cx === current.cx && nextEdge.a.cy === current.cy ? nextEdge.b : nextEdge.a;
      chain.push(next);
      current = next;
    }

    const first = chain[0];
    const last = chain[chain.length - 1];
    const isClosed = first.cx === last.cx && first.cy === last.cy;
    if (isClosed) chain.pop();
    runs.push({ corners: chain, closed: isClosed });
  }

  return runs;
}

/**
 * Corner-space position → world space.
 *
 * `gridToWorld` returns a cell *centre*; a corner (cx, cy) is the top-left of
 * cell (cx, cy), i.e. half a cell up and left of that centre.
 */
function cornerToWorld(
  cx: number,
  cy: number,
  config: MazeConfig,
  mazeWidth: number,
  mazeHeight: number
): Point2 {
  const centre = gridToWorld(cx, cy, config, mazeWidth, mazeHeight);
  const half = config.cellSize / 2;
  return { x: centre.x - half, z: centre.z - half };
}

/** One Chaikin corner-cutting pass. Open runs keep their endpoints pinned. */
function chaikin(points: Point2[], closed: boolean): Point2[] {
  if (points.length < 3) return points;

  const out: Point2[] = [];
  const limit = closed ? points.length : points.length - 1;

  if (!closed) out.push(points[0]);

  for (let i = 0; i < limit; i++) {
    const p = points[i];
    const q = points[(i + 1) % points.length];
    out.push({ x: 0.75 * p.x + 0.25 * q.x, z: 0.75 * p.z + 0.25 * q.z });
    out.push({ x: 0.25 * p.x + 0.75 * q.x, z: 0.25 * p.z + 0.75 * q.z });
  }

  if (!closed) out.push(points[points.length - 1]);

  return out;
}

function clampDeviation(point: Point2, anchor: Point2, limit: number): Point2 {
  const dx = point.x - anchor.x;
  const dz = point.z - anchor.z;
  const distance = Math.hypot(dx, dz);
  if (distance <= limit) return point;
  const scale = limit / distance;
  return { x: anchor.x + dx * scale, z: anchor.z + dz * scale };
}

/** Nearest point on the original polyline — the anchor a smoothed point may not stray far from. */
function nearestOnPolyline(point: Point2, polyline: Point2[], closed: boolean): Point2 {
  let best = polyline[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  const segments = closed ? polyline.length : polyline.length - 1;

  for (let i = 0; i < segments; i++) {
    const a = polyline[i];
    const b = polyline[(i + 1) % polyline.length];
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    const lengthSquared = abx * abx + abz * abz;
    let t = 0;
    if (lengthSquared > 0) {
      t = ((point.x - a.x) * abx + (point.z - a.z) * abz) / lengthSquared;
      t = Math.max(0, Math.min(1, t));
    }
    const projected = { x: a.x + abx * t, z: a.z + abz * t };
    const distance = Math.hypot(point.x - projected.x, point.z - projected.z);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = projected;
    }
  }

  return best;
}

/**
 * Build engine-agnostic curved wall outlines from a maze layout.
 *
 * Each contiguous run of wall becomes one polyline in world space, Chaikin-smoothed
 * and optionally displaced by a deterministic sinusoidal wobble, so walls wind and
 * curve instead of reading as axis-aligned boxes.
 *
 * Every emitted vertex is clamped to within `maxDeviation(config)` of the original
 * grid-aligned wall line. That clamp is what guarantees smoothing and wobble can
 * never open a walled boundary or seal an open passage — the curve stays inside the
 * dead space between the wall line and the corridor it borders.
 *
 * Pure data out: polylines only, no rendering-library types.
 */
export function buildCurvedWalls(
  layout: MazeLayout,
  config: MazeConfig = DEFAULT_CONFIG,
  opts: BuildCurvedWallsOptions = {}
): CurvedWall[] {
  const smoothing = opts.smoothing ?? 2;
  const limit = maxDeviation(config);

  const edges = collectWallEdges(layout);
  const runs = chainEdges(edges);

  const walls: CurvedWall[] = [];

  for (const run of runs) {
    const base = run.corners.map((corner) =>
      cornerToWorld(corner.cx, corner.cy, config, layout.width, layout.height)
    );
    if (base.length < 2) continue;

    // Track, for every working vertex, the position on the ORIGINAL run it came
    // from. Chaikin blends neighbours, so we blend their anchors identically —
    // this keeps each vertex clamped against its own source position rather than
    // whatever part of the run happens to be nearest, which is what makes the
    // guarantee hold even under extreme wobble.
    let points = base;
    let anchors = base;

    if (opts.wobble) {
      const { amplitude, wavelength, seed } = opts.wobble;
      // Deterministic per-run phase: the run's first corner keys the RNG, so the
      // same maze + seed always produces the same wobble, independent of run order.
      const first = run.corners[0];
      const rng = seedrandom(`${seed}:${first.cx},${first.cy}`);
      const phase = rng() * Math.PI * 2;
      const safeWavelength = wavelength > 0 ? wavelength : config.cellSize;

      let travelled = 0;
      points = points.map((point, index) => {
        if (index > 0) {
          travelled += Math.hypot(point.x - points[index - 1].x, point.z - points[index - 1].z);
        }
        // Pin the endpoints of open runs so neighbouring walls stay joined.
        if (!run.closed && (index === 0 || index === points.length - 1)) return point;

        // Displace perpendicular to the local run direction.
        const previous = points[Math.max(0, index - 1)];
        const next = points[Math.min(points.length - 1, index + 1)];
        const tx = next.x - previous.x;
        const tz = next.z - previous.z;
        const tangentLength = Math.hypot(tx, tz);
        if (tangentLength === 0) return point;
        const nx = -tz / tangentLength;
        const nz = tx / tangentLength;

        const offset = Math.sin((travelled / safeWavelength) * Math.PI * 2 + phase) * amplitude;
        return { x: point.x + nx * offset, z: point.z + nz * offset };
      });
    }

    for (let pass = 0; pass < smoothing; pass++) {
      points = chaikin(points, run.closed);
      anchors = chaikin(anchors, run.closed);
    }

    // Final safety clamp, in two stages so the guarantee is absolute against the
    // ORIGINAL wall line:
    //   1. Chaikin rounds corners, so a blended anchor can itself sit slightly off
    //      `base`. Project it back onto `base` first.
    //   2. Clamp the vertex to within `limit` of that corrected on-line anchor.
    // Clamping to the drifted anchor alone would allow `limit + cornerDrift` of
    // total deviation, which is exactly how a wobble could breach a corridor.
    points = points.map((point, index) => {
      const rawAnchor = anchors[index] ?? point;
      const anchor = nearestOnPolyline(rawAnchor, base, run.closed);
      return clampDeviation(point, anchor, limit);
    });

    walls.push({ points, closed: run.closed });
  }

  return walls;
}

/** Shortest distance from a point to a polyline (treating `closed` runs as loops). */
export function distanceToWall(point: Point2, wall: CurvedWall): number {
  const nearest = nearestOnPolyline(point, wall.points, wall.closed);
  return Math.hypot(point.x - nearest.x, point.z - nearest.z);
}

/** Shortest distance from a point to the nearest of many curved walls. */
export function minDistanceToWalls(point: Point2, walls: CurvedWall[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (const wall of walls) {
    const distance = distanceToWall(point, wall);
    if (distance < best) best = distance;
  }
  return best;
}
