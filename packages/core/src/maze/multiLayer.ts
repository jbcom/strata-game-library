import seedrandom from 'seedrandom';
import { generateMaze, type MazeLayout } from './core.js';

/**
 * How a connector is traversed between two adjacent layers.
 *
 * - `stair` — bidirectional, no cost. The reliable route.
 * - `drop`  — one-way downward only (layer i → layer i+1). Cannot be climbed back.
 * - `jump`  — bidirectional, but requires a gap-jump. Flagged so games can gate it
 *             behind an ability/skill check; graph-wise it is still bidirectional.
 */
export type LayerConnectorKind = 'stair' | 'drop' | 'jump';

export interface LayerCellRef {
  layer: number;
  x: number;
  y: number;
}

export interface LayerConnector {
  kind: LayerConnectorKind;
  /** Cell on the upper layer (index `from.layer`). */
  from: LayerCellRef;
  /** Cell on the lower layer (index `to.layer` === `from.layer + 1`). */
  to: LayerCellRef;
}

export interface LayeredMaze {
  layers: MazeLayout[];
  connectors: LayerConnector[];
  /** Where the run begins — the centre cell of layer 0. */
  entry: LayerCellRef;
  /** Designated goal on the final layer. */
  goal: LayerCellRef;
}

export interface GenerateLayeredMazeOptions {
  layers: number;
  width: number;
  height: number;
  seed: string;
  /** Connectors placed between each adjacent layer pair. Defaults to 3. */
  connectorsPerLayer?: number;
}

export interface SolvabilityReport {
  solvable: boolean;
  /** BFS distance in graph edges from `entry` to `goal`, or `null` when unreachable. */
  pathLength: number | null;
  /** Count of cells reachable from `entry` on each layer, indexed by layer. */
  reachablePerLayer: number[];
  /** Total cells on each layer, indexed by layer. */
  totalPerLayer: number[];
  /** Layers with zero reachable cells — an unreachable layer is a generation bug. */
  unreachableLayers: number[];
}

export interface DeadEnd {
  cell: { x: number; y: number };
  /** Distance in cells from the nearest cell on the main solution path. */
  depth: number;
}

/** Per-layer seed derivation — deterministic and collision-free across layers. */
function layerSeed(seed: string, layer: number): string {
  return `${seed}:layer:${layer}`;
}

/** Per-connector-band seed derivation, distinct from the layer-generation seeds. */
function connectorSeed(seed: string, upperLayer: number): string {
  return `${seed}:connectors:${upperLayer}`;
}

function cellKey(layer: number, x: number, y: number): string {
  return `${layer}:${x},${y}`;
}

/** Number of open sides a cell has. Lower degree === more dead-end-like. */
function cellDegree(layout: MazeLayout, x: number, y: number): number {
  const cell = layout.cells[y][x];
  let degree = 0;
  if (!cell.walls.north && y > 0) degree++;
  if (!cell.walls.south && y < layout.height - 1) degree++;
  if (!cell.walls.west && x > 0) degree++;
  if (!cell.walls.east && x < layout.width - 1) degree++;
  return degree;
}

/**
 * Cells ordered by how dead-end-like they are (degree 1 first), then by a
 * deterministic shuffle so placement varies with the seed without ever
 * depending on iteration order alone.
 */
function candidateCells(
  layout: MazeLayout,
  rng: () => number
): { x: number; y: number; degree: number }[] {
  const cells: { x: number; y: number; degree: number; sort: number }[] = [];
  for (let y = 0; y < layout.height; y++) {
    for (let x = 0; x < layout.width; x++) {
      cells.push({ x, y, degree: cellDegree(layout, x, y), sort: rng() });
    }
  }
  cells.sort((a, b) => a.degree - b.degree || a.sort - b.sort);
  return cells.map(({ x, y, degree }) => ({ x, y, degree }));
}

/**
 * Build a multi-layer maze: `layers` independent grid mazes stacked and stitched
 * together with vertical connectors.
 *
 * Placement rules, all derived deterministically from `seed`:
 * - Connectors prefer dead-end / low-degree cells so the maze keeps its feel
 *   (a connector in an open crossroads reads as a shortcut, not a discovery).
 * - The first connector between every adjacent layer pair is always a `stair`,
 *   guaranteeing at least one bidirectional route between neighbours.
 * - Remaining connectors alternate `drop` / `jump` deterministically.
 */
export function generateLayeredMaze(opts: GenerateLayeredMazeOptions): LayeredMaze {
  const { layers, width, height, seed } = opts;
  const connectorsPerLayer = opts.connectorsPerLayer ?? 3;

  if (layers < 1) throw new Error('generateLayeredMaze: `layers` must be at least 1');
  if (connectorsPerLayer < 1) {
    throw new Error('generateLayeredMaze: `connectorsPerLayer` must be at least 1');
  }

  const builtLayers: MazeLayout[] = [];
  for (let i = 0; i < layers; i++) {
    builtLayers.push(generateMaze(width, height, layerSeed(seed, i)));
  }

  const connectors: LayerConnector[] = [];
  for (let i = 0; i < layers - 1; i++) {
    const upper = builtLayers[i];
    const lower = builtLayers[i + 1];
    const rng = seedrandom(connectorSeed(seed, i));

    const upperCandidates = candidateCells(upper, rng);
    const lowerCandidates = candidateCells(lower, rng);

    const usedUpper = new Set<string>();
    const usedLower = new Set<string>();
    const wanted = Math.min(connectorsPerLayer, upperCandidates.length, lowerCandidates.length);

    let placed = 0;
    let upperIdx = 0;
    let lowerIdx = 0;

    while (placed < wanted && upperIdx < upperCandidates.length) {
      const from = upperCandidates[upperIdx++];
      const fromKey = `${from.x},${from.y}`;
      if (usedUpper.has(fromKey)) continue;

      // Find an unused landing cell on the lower layer.
      let to: { x: number; y: number } | null = null;
      while (lowerIdx < lowerCandidates.length) {
        const candidate = lowerCandidates[lowerIdx++];
        const toKey = `${candidate.x},${candidate.y}`;
        if (usedLower.has(toKey)) continue;
        usedLower.add(toKey);
        to = candidate;
        break;
      }
      if (!to) break;

      usedUpper.add(fromKey);

      // First connector of every band is always a stair: this is what
      // guarantees a bidirectional route between adjacent layers.
      let kind: LayerConnectorKind;
      if (placed === 0) {
        kind = 'stair';
      } else {
        kind = placed % 2 === 1 ? 'drop' : 'jump';
      }

      connectors.push({
        kind,
        from: { layer: i, x: from.x, y: from.y },
        to: { layer: i + 1, x: to.x, y: to.y },
      });
      placed++;
    }
  }

  const finalLayer = builtLayers[layers - 1];
  return {
    layers: builtLayers,
    connectors,
    entry: { layer: 0, x: builtLayers[0].center.x, y: builtLayers[0].center.y },
    goal: { layer: layers - 1, x: finalLayer.center.x, y: finalLayer.center.y },
  };
}

/** Directed adjacency over the union graph: intra-layer passages + connectors. */
function buildUnionAdjacency(layered: LayeredMaze): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();

  const addEdge = (a: string, b: string) => {
    const existing = adjacency.get(a);
    if (existing) existing.push(b);
    else adjacency.set(a, [b]);
  };

  layered.layers.forEach((layout, layer) => {
    for (let y = 0; y < layout.height; y++) {
      for (let x = 0; x < layout.width; x++) {
        const key = cellKey(layer, x, y);
        if (!adjacency.has(key)) adjacency.set(key, []);
        const cell = layout.cells[y][x];
        if (!cell.walls.north && y > 0) addEdge(key, cellKey(layer, x, y - 1));
        if (!cell.walls.south && y < layout.height - 1) addEdge(key, cellKey(layer, x, y + 1));
        if (!cell.walls.west && x > 0) addEdge(key, cellKey(layer, x - 1, y));
        if (!cell.walls.east && x < layout.width - 1) addEdge(key, cellKey(layer, x + 1, y));
      }
    }
  });

  for (const connector of layered.connectors) {
    const from = cellKey(connector.from.layer, connector.from.x, connector.from.y);
    const to = cellKey(connector.to.layer, connector.to.x, connector.to.y);
    // Downward is always traversable.
    addEdge(from, to);
    // Upward only for bidirectional kinds — a `drop` is one-way.
    if (connector.kind !== 'drop') addEdge(to, from);
  }

  return adjacency;
}

/**
 * Prove cross-layer solvability by BFS over the union graph, respecting one-way
 * drops. Games and tests share this single proof rather than reimplementing it.
 */
export function assertSolvable(layered: LayeredMaze): SolvabilityReport {
  const adjacency = buildUnionAdjacency(layered);
  const entryKey = cellKey(layered.entry.layer, layered.entry.x, layered.entry.y);
  const goalKey = cellKey(layered.goal.layer, layered.goal.x, layered.goal.y);

  const distances = new Map<string, number>([[entryKey, 0]]);
  const queue: string[] = [entryKey];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++];
    const distance = distances.get(current) ?? 0;
    for (const next of adjacency.get(current) ?? []) {
      if (distances.has(next)) continue;
      distances.set(next, distance + 1);
      queue.push(next);
    }
  }

  const reachablePerLayer = layered.layers.map(() => 0);
  for (const key of distances.keys()) {
    const layer = Number(key.slice(0, key.indexOf(':')));
    reachablePerLayer[layer]++;
  }

  const totalPerLayer = layered.layers.map((layout) => layout.width * layout.height);
  const unreachableLayers = reachablePerLayer
    .map((count, layer) => ({ count, layer }))
    .filter(({ count }) => count === 0)
    .map(({ layer }) => layer);

  const pathLength = distances.get(goalKey) ?? null;

  return {
    solvable: pathLength !== null && unreachableLayers.length === 0,
    pathLength,
    reachablePerLayer,
    totalPerLayer,
    unreachableLayers,
  };
}

/** Open neighbours of a cell within a single layer. */
function openNeighbours(layout: MazeLayout, x: number, y: number): { x: number; y: number }[] {
  const cell = layout.cells[y][x];
  const out: { x: number; y: number }[] = [];
  if (!cell.walls.north && y > 0) out.push({ x, y: y - 1 });
  if (!cell.walls.south && y < layout.height - 1) out.push({ x, y: y + 1 });
  if (!cell.walls.west && x > 0) out.push({ x: x - 1, y });
  if (!cell.walls.east && x < layout.width - 1) out.push({ x: x + 1, y });
  return out;
}

/** BFS predecessor map from a source cell, over one layer. */
function bfsFrom(
  layout: MazeLayout,
  source: { x: number; y: number }
): { distances: Map<string, number>; previous: Map<string, string> } {
  const distances = new Map<string, number>([[`${source.x},${source.y}`, 0]]);
  const previous = new Map<string, string>();
  const queue: { x: number; y: number }[] = [source];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++];
    const currentKey = `${current.x},${current.y}`;
    const distance = distances.get(currentKey) ?? 0;
    for (const next of openNeighbours(layout, current.x, current.y)) {
      const nextKey = `${next.x},${next.y}`;
      if (distances.has(nextKey)) continue;
      distances.set(nextKey, distance + 1);
      previous.set(nextKey, currentKey);
      queue.push(next);
    }
  }

  return { distances, previous };
}

/**
 * Dead ends and how deep off the main solution path they sit — these are the
 * "false starts" a game can stock with rewards or scares.
 *
 * The main solution path is centre → nearest exit. `depth` is the BFS distance
 * from the dead-end cell to the closest cell on that path, so depth 1 is a
 * one-cell alcove off the critical route and larger depths are real detours.
 */
export function findDeadEnds(layout: MazeLayout): DeadEnd[] {
  const { distances, previous } = bfsFrom(layout, layout.center);

  // Solution path: centre to the closest reachable exit.
  let bestExit: { x: number; y: number } | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const exit of layout.exits) {
    const distance = distances.get(`${exit.x},${exit.y}`);
    if (distance !== undefined && distance < bestDistance) {
      bestDistance = distance;
      bestExit = exit;
    }
  }

  const pathCells = new Set<string>();
  if (bestExit) {
    let cursor: string | undefined = `${bestExit.x},${bestExit.y}`;
    while (cursor !== undefined) {
      pathCells.add(cursor);
      cursor = previous.get(cursor);
    }
  } else {
    pathCells.add(`${layout.center.x},${layout.center.y}`);
  }

  // Multi-source BFS outward from the solution path gives every cell its
  // distance-from-path in one sweep.
  const depthFromPath = new Map<string, number>();
  const queue: { x: number; y: number }[] = [];
  let head = 0;
  for (const key of pathCells) {
    depthFromPath.set(key, 0);
    const [x, y] = key.split(',').map(Number);
    queue.push({ x, y });
  }
  while (head < queue.length) {
    const current = queue[head++];
    const currentKey = `${current.x},${current.y}`;
    const depth = depthFromPath.get(currentKey) ?? 0;
    for (const next of openNeighbours(layout, current.x, current.y)) {
      const nextKey = `${next.x},${next.y}`;
      if (depthFromPath.has(nextKey)) continue;
      depthFromPath.set(nextKey, depth + 1);
      queue.push(next);
    }
  }

  const deadEnds: DeadEnd[] = [];
  for (let y = 0; y < layout.height; y++) {
    for (let x = 0; x < layout.width; x++) {
      if (cellDegree(layout, x, y) !== 1) continue;
      const depth = depthFromPath.get(`${x},${y}`);
      if (depth === undefined || depth === 0) continue;
      deadEnds.push({ cell: { x, y }, depth });
    }
  }

  deadEnds.sort((a, b) => b.depth - a.depth || a.cell.y - b.cell.y || a.cell.x - b.cell.x);
  return deadEnds;
}
