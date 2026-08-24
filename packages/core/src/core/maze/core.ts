import seedrandom from 'seedrandom';

// Seed with a string to avoid seedrandom's default entropy path, which tries
// to `require('crypto')` in the browser and triggers a Vite externalization
// warning. The actual seed gets set by `random.use(seed)` before any real use.
let rng = seedrandom('default');
const random = {
  use: (seed: string) => {
    rng = seedrandom(seed);
  },
  float: () => rng(),
};

export interface MazeCell {
  x: number;
  y: number;
  walls: {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  };
  visited: boolean;
  isCenter: boolean;
  isExit: boolean;
}

export interface Passage {
  from: { x: number; y: number };
  to: { x: number; y: number };
  direction: 'north' | 'south' | 'east' | 'west';
}

export interface MazeLayout {
  width: number;
  height: number;
  cells: MazeCell[][];
  passages: Passage[];
  center: { x: number; y: number };
  exits: { x: number; y: number }[];
}

export function generateMaze(width: number, height: number, seed: string): MazeLayout {
  // Ensure size is odd for shared center
  if (width % 2 === 0) width++;
  if (height % 2 === 0) height++;

  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  random.use(seed);

  const cells: MazeCell[][] = [];
  for (let y = 0; y < height; y++) {
    cells[y] = [];
    for (let x = 0; x < width; x++) {
      cells[y][x] = {
        x,
        y,
        walls: { north: true, south: true, east: true, west: true },
        visited: false,
        isCenter: x === centerX && y === centerY,
        isExit: false,
      };
    }
  }

  const passages: Passage[] = [];
  const activeCells: MazeCell[] = [];

  const startCell = cells[centerY][centerX];
  startCell.visited = true;
  activeCells.push(startCell);

  while (activeCells.length > 0) {
    // Growing Tree: Pick a cell from active list.
    // 0.7 probability of picking newest (Backtracking style), 0.3 for random (Prim's style)
    const pickIdx =
      random.float() < 0.7
        ? activeCells.length - 1
        : Math.floor(random.float() * activeCells.length);
    const current = activeCells[pickIdx];

    const neighbors = getUnvisitedNeighbors(current, cells, width, height, 1);

    if (neighbors.length > 0) {
      const idx = Math.floor(random.float() * neighbors.length);
      const { cell: next, direction } = neighbors[idx];

      removeWall(current, next, direction);

      passages.push({
        from: { x: current.x, y: current.y },
        to: { x: next.x, y: next.y },
        direction,
      });

      next.visited = true;
      activeCells.push(next);
    } else {
      activeCells.splice(pickIdx, 1);
    }
  }

  const exits = createExits(cells, width, height);

  return {
    width,
    height,
    cells,
    passages,
    center: { x: centerX, y: centerY },
    exits,
  };
}

function getUnvisitedNeighbors(
  cell: MazeCell,
  cells: MazeCell[][],
  width: number,
  height: number,
  step: number = 1
): { cell: MazeCell; direction: 'north' | 'south' | 'east' | 'west' }[] {
  const neighbors: { cell: MazeCell; direction: 'north' | 'south' | 'east' | 'west' }[] = [];

  const dirs = [
    { dx: 0, dy: -step, direction: 'north' as const },
    { dx: 0, dy: step, direction: 'south' as const },
    { dx: step, dy: 0, direction: 'east' as const },
    { dx: -step, dy: 0, direction: 'west' as const },
  ];

  for (const { dx, dy, direction } of dirs) {
    const nx = cell.x + dx;
    const ny = cell.y + dy;

    if (nx >= 0 && nx < width && ny >= 0 && ny < height && !cells[ny][nx].visited) {
      neighbors.push({
        cell: cells[ny][nx],
        direction,
      });
    }
  }

  return neighbors;
}

function removeWall(from: MazeCell, to: MazeCell, direction: 'north' | 'south' | 'east' | 'west') {
  const opposite = { north: 'south', south: 'north', east: 'west', west: 'east' } as const;
  from.walls[direction] = false;
  to.walls[opposite[direction]] = false;
}

function createExits(
  cells: MazeCell[][],
  width: number,
  height: number
): { x: number; y: number }[] {
  const exits: { x: number; y: number }[] = [];

  const sides = ['north', 'south', 'east', 'west'] as const;
  for (const side of sides) {
    let candidates: MazeCell[] = [];

    if (side === 'north') {
      candidates = cells[0].slice(1, -1);
    } else if (side === 'south') {
      candidates = cells[height - 1].slice(1, -1);
    } else if (side === 'west') {
      candidates = cells.slice(1, -1).map((row) => row[0]);
    } else {
      candidates = cells.slice(1, -1).map((row) => row[width - 1]);
    }

    if (candidates.length > 0) {
      const exit = candidates[Math.floor(random.float() * candidates.length)];
      exit.isExit = true;
      exit.walls[side] = false;
      exits.push({ x: exit.x, y: exit.y });
    }
  }

  return exits;
}

export function getConnections(
  layout: MazeLayout,
  x: number,
  y: number
): { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' }[] {
  const cell = layout.cells[y]?.[x];
  if (!cell) return [];

  const connections: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' }[] =
    [];

  if (!cell.walls.north && y > 0) {
    connections.push({ x, y: y - 1, direction: 'north' });
  }
  if (!cell.walls.south && y < layout.height - 1) {
    connections.push({ x, y: y + 1, direction: 'south' });
  }
  if (!cell.walls.west && x > 0) {
    connections.push({ x: x - 1, y, direction: 'west' });
  }
  if (!cell.walls.east && x < layout.width - 1) {
    connections.push({ x: x + 1, y, direction: 'east' });
  }

  if (cell.isExit) {
    if (x === 0) connections.push({ x: -1, y, direction: 'west' });
    if (x === layout.width - 1) connections.push({ x: layout.width, y, direction: 'east' });
    if (y === 0) connections.push({ x, y: -1, direction: 'north' });
    if (y === layout.height - 1) connections.push({ x, y: layout.height, direction: 'south' });
  }

  return connections;
}
