import { describe, expect, it } from 'vitest';
import { generateMaze } from '../core';
import { assertSolvable, findDeadEnds, generateLayeredMaze, type LayeredMaze } from '../multiLayer';

const SEEDS = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta'];

describe('generateLayeredMaze', () => {
  it('produces the requested number of layers at the requested size', () => {
    const layered = generateLayeredMaze({ layers: 4, width: 9, height: 9, seed: 'size' });

    expect(layered.layers).toHaveLength(4);
    layered.layers.forEach((layout) => {
      expect(layout.width).toBe(9);
      expect(layout.height).toBe(9);
    });
  });

  it('enforces odd dimensions per layer, matching generateMaze', () => {
    const layered = generateLayeredMaze({ layers: 2, width: 8, height: 6, seed: 'odd' });

    layered.layers.forEach((layout) => {
      expect(layout.width).toBe(9);
      expect(layout.height).toBe(7);
    });
  });

  it('is deterministic — same seed produces an identical layered maze', () => {
    const opts = { layers: 3, width: 11, height: 11, seed: 'deterministic' } as const;
    const a = generateLayeredMaze(opts);
    const b = generateLayeredMaze(opts);

    expect(JSON.stringify(a.connectors)).toBe(JSON.stringify(b.connectors));
    a.layers.forEach((layout, i) => {
      expect(layout.cells).toEqual(b.layers[i].cells);
    });
  });

  it('different seeds produce different topology', () => {
    const a = generateLayeredMaze({ layers: 3, width: 11, height: 11, seed: 'seed-a' });
    const b = generateLayeredMaze({ layers: 3, width: 11, height: 11, seed: 'seed-b' });

    const sameLayers = JSON.stringify(a.layers) === JSON.stringify(b.layers);
    const sameConnectors = JSON.stringify(a.connectors) === JSON.stringify(b.connectors);
    expect(sameLayers && sameConnectors).toBe(false);
  });

  it('derives per-layer seeds so each layer differs from its neighbours', () => {
    const layered = generateLayeredMaze({ layers: 3, width: 11, height: 11, seed: 'per-layer' });

    expect(layered.layers[0].cells).not.toEqual(layered.layers[1].cells);
    expect(layered.layers[1].cells).not.toEqual(layered.layers[2].cells);
  });

  it('layer i matches generateMaze with the documented derived seed', () => {
    const seed = 'derivation';
    const layered = generateLayeredMaze({ layers: 2, width: 9, height: 9, seed });

    const expectedLayer0 = generateMaze(9, 9, `${seed}:layer:0`);
    expect(layered.layers[0].cells).toEqual(expectedLayer0.cells);
  });

  it('places connectors only between adjacent layers, always downward', () => {
    const layered = generateLayeredMaze({ layers: 4, width: 9, height: 9, seed: 'adjacency' });

    expect(layered.connectors.length).toBeGreaterThan(0);
    layered.connectors.forEach((connector) => {
      expect(connector.to.layer).toBe(connector.from.layer + 1);
      expect(connector.from.layer).toBeGreaterThanOrEqual(0);
      expect(connector.to.layer).toBeLessThan(layered.layers.length);
    });
  });

  it('connector endpoints are in-bounds cells of their layer', () => {
    const layered = generateLayeredMaze({ layers: 3, width: 11, height: 11, seed: 'bounds' });

    layered.connectors.forEach(({ from, to }) => {
      for (const ref of [from, to]) {
        const layout = layered.layers[ref.layer];
        expect(ref.x).toBeGreaterThanOrEqual(0);
        expect(ref.y).toBeGreaterThanOrEqual(0);
        expect(ref.x).toBeLessThan(layout.width);
        expect(ref.y).toBeLessThan(layout.height);
      }
    });
  });

  it('uses only the three documented connector kinds', () => {
    const layered = generateLayeredMaze({
      layers: 4,
      width: 11,
      height: 11,
      seed: 'kinds',
      connectorsPerLayer: 5,
    });

    layered.connectors.forEach((connector) => {
      expect(['stair', 'drop', 'jump']).toContain(connector.kind);
    });
  });

  it('guarantees at least one bidirectional stair between every adjacent layer pair', () => {
    for (const seed of SEEDS) {
      const layered = generateLayeredMaze({ layers: 4, width: 11, height: 11, seed });

      for (let i = 0; i < layered.layers.length - 1; i++) {
        const stairs = layered.connectors.filter((c) => c.from.layer === i && c.kind === 'stair');
        expect(stairs.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('respects connectorsPerLayer', () => {
    const layered = generateLayeredMaze({
      layers: 3,
      width: 11,
      height: 11,
      seed: 'count',
      connectorsPerLayer: 4,
    });

    for (let i = 0; i < layered.layers.length - 1; i++) {
      const band = layered.connectors.filter((c) => c.from.layer === i);
      expect(band).toHaveLength(4);
    }
  });

  it('defaults to 3 connectors per adjacent layer pair', () => {
    const layered = generateLayeredMaze({ layers: 3, width: 11, height: 11, seed: 'default' });

    for (let i = 0; i < layered.layers.length - 1; i++) {
      expect(layered.connectors.filter((c) => c.from.layer === i)).toHaveLength(3);
    }
  });

  it('prefers dead-end / low-degree cells to preserve the maze feel', () => {
    const layered = generateLayeredMaze({
      layers: 3,
      width: 15,
      height: 15,
      seed: 'low-degree',
      connectorsPerLayer: 3,
    });

    const degreeOf = (layerIndex: number, x: number, y: number) => {
      const layout = layered.layers[layerIndex];
      const cell = layout.cells[y][x];
      let degree = 0;
      if (!cell.walls.north && y > 0) degree++;
      if (!cell.walls.south && y < layout.height - 1) degree++;
      if (!cell.walls.west && x > 0) degree++;
      if (!cell.walls.east && x < layout.width - 1) degree++;
      return degree;
    };

    // Every connector endpoint should sit in a corridor or dead end (degree <= 2),
    // never in a wide-open crossroads.
    layered.connectors.forEach(({ from, to }) => {
      expect(degreeOf(from.layer, from.x, from.y)).toBeLessThanOrEqual(2);
      expect(degreeOf(to.layer, to.x, to.y)).toBeLessThanOrEqual(2);
    });
  });

  it('does not reuse the same cell for two connectors within a band', () => {
    const layered = generateLayeredMaze({
      layers: 3,
      width: 13,
      height: 13,
      seed: 'no-reuse',
      connectorsPerLayer: 4,
    });

    const fromKeys = layered.connectors.map((c) => `${c.from.layer}:${c.from.x},${c.from.y}`);
    const toKeys = layered.connectors.map((c) => `${c.to.layer}:${c.to.x},${c.to.y}`);
    expect(new Set(fromKeys).size).toBe(fromKeys.length);
    expect(new Set(toKeys).size).toBe(toKeys.length);
  });

  it('single-layer mazes have no connectors and entry/goal on layer 0', () => {
    const layered = generateLayeredMaze({ layers: 1, width: 9, height: 9, seed: 'single' });

    expect(layered.connectors).toHaveLength(0);
    expect(layered.entry.layer).toBe(0);
    expect(layered.goal.layer).toBe(0);
  });

  it('entry is the centre of layer 0 and goal is on the final layer', () => {
    const layered = generateLayeredMaze({ layers: 3, width: 9, height: 9, seed: 'endpoints' });

    expect(layered.entry).toEqual({
      layer: 0,
      x: layered.layers[0].center.x,
      y: layered.layers[0].center.y,
    });
    expect(layered.goal.layer).toBe(2);
  });

  it('rejects invalid options rather than producing a degenerate maze', () => {
    expect(() => generateLayeredMaze({ layers: 0, width: 9, height: 9, seed: 'x' })).toThrow();
    expect(() =>
      generateLayeredMaze({ layers: 2, width: 9, height: 9, seed: 'x', connectorsPerLayer: 0 })
    ).toThrow();
  });
});

describe('one-way drop semantics', () => {
  /** Reachability over the union graph, honouring drop directionality. */
  function reachableFrom(layered: LayeredMaze, start: { layer: number; x: number; y: number }) {
    const key = (l: number, x: number, y: number) => `${l}:${x},${y}`;
    const seen = new Set<string>([key(start.layer, start.x, start.y)]);
    const queue = [start];
    let head = 0;

    while (head < queue.length) {
      const current = queue[head++];
      const layout = layered.layers[current.layer];
      const cell = layout.cells[current.y][current.x];
      const neighbours: { layer: number; x: number; y: number }[] = [];

      if (!cell.walls.north && current.y > 0)
        neighbours.push({ layer: current.layer, x: current.x, y: current.y - 1 });
      if (!cell.walls.south && current.y < layout.height - 1)
        neighbours.push({ layer: current.layer, x: current.x, y: current.y + 1 });
      if (!cell.walls.west && current.x > 0)
        neighbours.push({ layer: current.layer, x: current.x - 1, y: current.y });
      if (!cell.walls.east && current.x < layout.width - 1)
        neighbours.push({ layer: current.layer, x: current.x + 1, y: current.y });

      for (const connector of layered.connectors) {
        const { from, to } = connector;
        if (from.layer === current.layer && from.x === current.x && from.y === current.y) {
          neighbours.push(to);
        }
        // Upward traversal only for non-drop kinds.
        if (
          connector.kind !== 'drop' &&
          to.layer === current.layer &&
          to.x === current.x &&
          to.y === current.y
        ) {
          neighbours.push(from);
        }
      }

      for (const next of neighbours) {
        const nextKey = key(next.layer, next.x, next.y);
        if (seen.has(nextKey)) continue;
        seen.add(nextKey);
        queue.push(next);
      }
    }

    return seen;
  }

  it('a drop is traversable downward', () => {
    const layered = generateLayeredMaze({
      layers: 2,
      width: 11,
      height: 11,
      seed: 'drop-down',
      connectorsPerLayer: 3,
    });
    const drop = layered.connectors.find((c) => c.kind === 'drop');
    expect(drop).toBeDefined();
    if (!drop) return;

    const reachable = reachableFrom(layered, drop.from);
    expect(reachable.has(`${drop.to.layer}:${drop.to.x},${drop.to.y}`)).toBe(true);
  });

  it('stair and jump connectors are bidirectional in the graph', () => {
    const layered = generateLayeredMaze({
      layers: 2,
      width: 11,
      height: 11,
      seed: 'bidi',
      connectorsPerLayer: 3,
    });

    const bidirectional = layered.connectors.filter((c) => c.kind !== 'drop');
    expect(bidirectional.length).toBeGreaterThan(0);

    bidirectional.forEach((connector) => {
      // Starting at the lower cell, the upper cell must be reachable.
      const reachable = reachableFrom(layered, connector.to);
      expect(reachable.has(`${connector.from.layer}:${connector.from.x},${connector.from.y}`)).toBe(
        true
      );
    });
  });

  it('jump is flagged distinctly from stair even though both are bidirectional', () => {
    const layered = generateLayeredMaze({
      layers: 3,
      width: 13,
      height: 13,
      seed: 'jump-flag',
      connectorsPerLayer: 4,
    });

    const jumps = layered.connectors.filter((c) => c.kind === 'jump');
    expect(jumps.length).toBeGreaterThan(0);
    jumps.forEach((jump) => {
      expect(jump.kind).toBe('jump');
      expect(jump.kind).not.toBe('stair');
    });
  });
});

describe('assertSolvable', () => {
  it('reports a solvable layered maze across many seeds', () => {
    for (const seed of SEEDS) {
      const layered = generateLayeredMaze({ layers: 4, width: 11, height: 11, seed });
      const report = assertSolvable(layered);

      expect(report.solvable).toBe(true);
      expect(report.pathLength).not.toBeNull();
      expect(report.unreachableLayers).toEqual([]);
    }
  });

  it('reaches every layer from the entry', () => {
    for (const seed of SEEDS) {
      const layered = generateLayeredMaze({ layers: 5, width: 9, height: 9, seed });
      const report = assertSolvable(layered);

      report.reachablePerLayer.forEach((count) => {
        expect(count).toBeGreaterThan(0);
      });
    }
  });

  it('reaches every cell of every layer (mazes are perfect and stairs are bidirectional)', () => {
    const layered = generateLayeredMaze({ layers: 3, width: 11, height: 11, seed: 'full-cover' });
    const report = assertSolvable(layered);

    report.reachablePerLayer.forEach((count, layer) => {
      expect(count).toBe(report.totalPerLayer[layer]);
    });
  });

  it('reports a positive path length from entry to goal', () => {
    const layered = generateLayeredMaze({ layers: 3, width: 11, height: 11, seed: 'path-len' });
    const report = assertSolvable(layered);

    expect(report.pathLength).toBeGreaterThan(0);
    // Crossing 2 layer boundaries costs at least 2 connector traversals.
    expect(report.pathLength).toBeGreaterThanOrEqual(2);
  });

  it('totalPerLayer matches actual layer dimensions', () => {
    const layered = generateLayeredMaze({ layers: 3, width: 9, height: 9, seed: 'totals' });
    const report = assertSolvable(layered);

    expect(report.totalPerLayer).toEqual([81, 81, 81]);
  });

  it('is deterministic for a given layered maze', () => {
    const layered = generateLayeredMaze({ layers: 3, width: 11, height: 11, seed: 'stable' });
    expect(assertSolvable(layered)).toEqual(assertSolvable(layered));
  });

  it('detects an unsolvable maze when connectors are stripped', () => {
    const layered = generateLayeredMaze({ layers: 3, width: 9, height: 9, seed: 'stripped' });
    const broken: LayeredMaze = { ...layered, connectors: [] };
    const report = assertSolvable(broken);

    expect(report.solvable).toBe(false);
    expect(report.pathLength).toBeNull();
    expect(report.unreachableLayers).toEqual([1, 2]);
  });

  it('detects unsolvability when only one-way drops lead downward and goal needs a climb', () => {
    // Two layers, drops only: layer 1 is reachable, but returning to layer 0 is not.
    const layered = generateLayeredMaze({ layers: 2, width: 9, height: 9, seed: 'oneway' });
    const dropsOnly: LayeredMaze = {
      ...layered,
      connectors: layered.connectors.map((c) => ({ ...c, kind: 'drop' as const })),
      // Goal placed back on layer 0 would be reachable (it is the entry layer);
      // instead assert the climb itself is impossible from the lower layer.
    };

    const fromLower = assertSolvable({
      ...dropsOnly,
      entry: dropsOnly.connectors[0].to,
      goal: { layer: 0, x: layered.layers[0].center.x, y: layered.layers[0].center.y },
    });

    expect(fromLower.solvable).toBe(false);
    expect(fromLower.pathLength).toBeNull();
  });
});

describe('findDeadEnds', () => {
  it('returns dead-end cells with a positive depth off the solution path', () => {
    const layout = generateMaze(15, 15, 'dead-ends');
    const deadEnds = findDeadEnds(layout);

    expect(deadEnds.length).toBeGreaterThan(0);
    deadEnds.forEach(({ depth }) => {
      expect(depth).toBeGreaterThan(0);
    });
  });

  it('every reported cell genuinely has exactly one open side', () => {
    const layout = generateMaze(15, 15, 'degree-check');
    const deadEnds = findDeadEnds(layout);

    deadEnds.forEach(({ cell }) => {
      const c = layout.cells[cell.y][cell.x];
      let degree = 0;
      if (!c.walls.north && cell.y > 0) degree++;
      if (!c.walls.south && cell.y < layout.height - 1) degree++;
      if (!c.walls.west && cell.x > 0) degree++;
      if (!c.walls.east && cell.x < layout.width - 1) degree++;
      expect(degree).toBe(1);
    });
  });

  it('is deterministic for a given layout', () => {
    const layout = generateMaze(13, 13, 'stable-dead-ends');
    expect(findDeadEnds(layout)).toEqual(findDeadEnds(layout));
  });

  it('sorts deepest false starts first', () => {
    const layout = generateMaze(15, 15, 'sorted');
    const deadEnds = findDeadEnds(layout);

    for (let i = 1; i < deadEnds.length; i++) {
      expect(deadEnds[i - 1].depth).toBeGreaterThanOrEqual(deadEnds[i].depth);
    }
  });

  it('excludes cells that sit on the solution path itself (depth 0)', () => {
    const layout = generateMaze(15, 15, 'no-zero-depth');
    findDeadEnds(layout).forEach(({ depth }) => {
      expect(depth).not.toBe(0);
    });
  });

  it('reports in-bounds cells only', () => {
    const layout = generateMaze(13, 13, 'in-bounds');
    findDeadEnds(layout).forEach(({ cell }) => {
      expect(cell.x).toBeGreaterThanOrEqual(0);
      expect(cell.y).toBeGreaterThanOrEqual(0);
      expect(cell.x).toBeLessThan(layout.width);
      expect(cell.y).toBeLessThan(layout.height);
    });
  });

  it('finds dead ends across many seeds without throwing', () => {
    for (const seed of SEEDS) {
      const layout = generateMaze(13, 13, seed);
      expect(() => findDeadEnds(layout)).not.toThrow();
    }
  });
});
