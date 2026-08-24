import type { MazeLayout } from './core.js';

export interface MazeConfig {
  cellSize: number;
  wallHeight: number;
  wallThickness: number;
}

export const DEFAULT_CONFIG: MazeConfig = {
  cellSize: 6.5,
  wallHeight: 5.5,
  wallThickness: 0.2,
};

export interface WallSegment {
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotation: number;
}

export interface FloorTile {
  x: number;
  z: number;
  width: number;
  depth: number;
}

export interface CeilingTile {
  nodeId: string;
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
}

export interface RailNode {
  id: string;
  gridX: number;
  gridY: number;
  worldX: number;
  worldZ: number;
  connections: string[];
  isCenter: boolean;
  isExit: boolean;
}

export interface MazeGeometry {
  walls: WallSegment[];
  floor: FloorTile;
  ceilings: CeilingTile[];
  railNodes: Map<string, RailNode>;
  centerNodeId: string;
  exitNodeIds: string[];
}

export function gridToWorld(
  gridX: number,
  gridY: number,
  config: MazeConfig,
  mazeWidth: number,
  mazeHeight: number
): { x: number; z: number } {
  const centerX = Math.floor(mazeWidth / 2);
  const centerY = Math.floor(mazeHeight / 2);
  return {
    x: (gridX - centerX) * config.cellSize,
    z: (gridY - centerY) * config.cellSize,
  };
}

export function worldToGrid(
  worldX: number,
  worldZ: number,
  config: MazeConfig,
  mazeWidth: number,
  mazeHeight: number
): { x: number; y: number } {
  const centerX = Math.floor(mazeWidth / 2);
  const centerY = Math.floor(mazeHeight / 2);
  return {
    x: Math.round(worldX / config.cellSize) + centerX,
    y: Math.round(worldZ / config.cellSize) + centerY,
  };
}

export function buildGeometry(
  layout: MazeLayout,
  config: MazeConfig = DEFAULT_CONFIG
): MazeGeometry {
  const walls: WallSegment[] = [];
  const ceilings: CeilingTile[] = [];
  const railNodes = new Map<string, RailNode>();

  const { cellSize, wallHeight, wallThickness } = config;
  const halfCell = cellSize / 2;

  for (let y = 0; y < layout.height; y++) {
    for (let x = 0; x < layout.width; x++) {
      const cell = layout.cells[y][x];
      const { x: worldX, z: worldZ } = gridToWorld(x, y, config, layout.width, layout.height);

      if (cell.walls.north) {
        walls.push({
          x: worldX,
          z: worldZ - halfCell,
          width: cellSize + wallThickness,
          height: wallHeight,
          depth: wallThickness,
          rotation: 0,
        });
      }

      if (cell.walls.west) {
        walls.push({
          x: worldX - halfCell,
          z: worldZ,
          width: wallThickness,
          height: wallHeight,
          depth: cellSize + wallThickness,
          rotation: 0,
        });
      }

      if (y === layout.height - 1 && cell.walls.south) {
        walls.push({
          x: worldX,
          z: worldZ + halfCell,
          width: cellSize + wallThickness,
          height: wallHeight,
          depth: wallThickness,
          rotation: 0,
        });
      }

      if (x === layout.width - 1 && cell.walls.east) {
        walls.push({
          x: worldX + halfCell,
          z: worldZ,
          width: wallThickness,
          height: wallHeight,
          depth: cellSize + wallThickness,
          rotation: 0,
        });
      }

      const nodeId = `${x},${y}`;
      const connections: string[] = [];

      if (!cell.walls.north && y > 0) connections.push(`${x},${y - 1}`);
      if (!cell.walls.south && y < layout.height - 1) connections.push(`${x},${y + 1}`);
      if (!cell.walls.west && x > 0) connections.push(`${x - 1},${y}`);
      if (!cell.walls.east && x < layout.width - 1) connections.push(`${x + 1},${y}`);

      railNodes.set(nodeId, {
        id: nodeId,
        gridX: x,
        gridY: y,
        worldX,
        worldZ,
        connections,
        isCenter: cell.isCenter,
        isExit: cell.isExit,
      });
      ceilings.push({
        nodeId,
        x: worldX,
        y: 4,
        z: worldZ,
        width: cellSize,
        depth: cellSize,
      });
    }
  }

  const floorWidth = layout.width * cellSize;
  const floorDepth = layout.height * cellSize;
  const floor: FloorTile = {
    x: 0,
    z: 0,
    width: floorWidth + cellSize,
    depth: floorDepth + cellSize,
  };

  const centerNodeId = `${layout.center.x},${layout.center.y}`;
  const exitNodeIds = layout.exits.map((e) => `${e.x},${e.y}`);

  return {
    walls,
    floor,
    ceilings,
    railNodes,
    centerNodeId,
    exitNodeIds,
  };
}

export function getNodeConnections(geometry: MazeGeometry, nodeId: string): RailNode[] {
  const node = geometry.railNodes.get(nodeId);
  if (!node) return [];

  return node.connections
    .map((id) => geometry.railNodes.get(id))
    .filter((n): n is RailNode => n !== undefined);
}
