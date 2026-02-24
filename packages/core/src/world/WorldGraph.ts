import * as THREE from 'three';
import type {
  BoundingShape,
  Connection,
  Region,
  RegionDefinition,
  WorldGraphDefinition,
} from './types';

export class WorldGraph {
  public regions: Map<string, Region> = new Map();
  public connections: Connection[] = [];

  private eventHandlers: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  constructor(definition?: WorldGraphDefinition) {
    if (definition) {
      this.loadDefinition(definition);
    }
  }

  private loadDefinition(definition: WorldGraphDefinition): void {
    // Load regions
    for (const [id, regDef] of Object.entries(definition.regions)) {
      const region: Region = {
        id,
        name: regDef.name,
        type: regDef.type || 'biome',
        center: new THREE.Vector3(...regDef.center),
        bounds: this.createBoundsFromDefinition(regDef),
        biome: regDef.biome,
        difficulty: regDef.difficulty || 1,
        level: regDef.level,
        spawnTable: regDef.spawnTable,
        ambientAudio: regDef.ambientAudio,
        music: regDef.music,
        discovered: false,
        visitCount: 0,
      };
      this.regions.set(id, region);
    }

    // Load connections
    for (const connDef of definition.connections) {
      const fromRegion = this.regions.get(connDef.from);
      const toRegion = this.regions.get(connDef.to);

      if (!fromRegion || !toRegion) {
        console.warn(
          `Skipping connection from ${connDef.from} to ${connDef.to}: one or both regions not found.`
        );
        continue;
      }

      const connection: Connection = {
        id: connDef.id || `${connDef.from}-${connDef.to}`,
        from: connDef.from,
        to: connDef.to,
        type: connDef.type,
        fromPosition: connDef.fromPosition
          ? new THREE.Vector3(...connDef.fromPosition)
          : fromRegion.center.clone(),
        toPosition: connDef.toPosition
          ? new THREE.Vector3(...connDef.toPosition)
          : toRegion.center.clone(),
        bidirectional: connDef.bidirectional || false,
        traversalMode: connDef.traversalMode,
        unlocked: !connDef.unlockCondition,
        unlockCondition: connDef.unlockCondition,
      };
      this.connections.push(connection);

      if (connection.bidirectional) {
        const reverseConnection: Connection = {
          ...connection,
          id: `${connection.id}-rev`,
          from: connDef.to,
          to: connDef.from,
          fromPosition: connection.toPosition.clone(),
          toPosition: connection.fromPosition.clone(),
        };
        this.connections.push(reverseConnection);
      }
    }
  }

  private createBoundsFromDefinition(regDef: RegionDefinition): BoundingShape {
    if (regDef.radius !== undefined) {
      return { type: 'sphere', radius: regDef.radius };
    }
    if (regDef.size !== undefined) {
      return { type: 'box', size: new THREE.Vector3(...regDef.size) };
    }
    // Default fallback
    return { type: 'sphere', radius: 50 };
  }

  public getRegion(id: string): Region | undefined {
    return this.regions.get(id);
  }

  public getRegionAt(position: THREE.Vector3): Region | undefined {
    for (const region of this.regions.values()) {
      if (this.isPositionInRegion(position, region)) {
        return region;
      }
    }
    return undefined;
  }

  private isPositionInRegion(position: THREE.Vector3, region: Region): boolean {
    const { center, bounds } = region;

    switch (bounds.type) {
      case 'sphere':
        return position.distanceTo(center) <= bounds.radius;
      case 'box': {
        const halfSize = bounds.size.clone().multiplyScalar(0.5);
        return (
          position.x >= center.x - halfSize.x &&
          position.x <= center.x + halfSize.x &&
          position.y >= center.y - halfSize.y &&
          position.y <= center.y + halfSize.y &&
          position.z >= center.z - halfSize.z &&
          position.z <= center.z + halfSize.z
        );
      }
      // Other shapes can be implemented as needed
      default:
        return position.distanceTo(center) <= 50; // Default radius
    }
  }

  public getAdjacentRegions(regionId: string): Region[] {
    const adjacentIds = new Set<string>();
    for (const conn of this.connections) {
      if (conn.from === regionId) {
        adjacentIds.add(conn.to);
      }
    }

    return Array.from(adjacentIds)
      .map((id) => this.regions.get(id))
      .filter((r): r is Region => r !== undefined);
  }

  public getConnections(regionId: string): Connection[] {
    return this.connections.filter((c) => c.from === regionId);
  }

  public getConnection(fromId: string, toId: string): Connection | undefined {
    return this.connections.find((c) => c.from === fromId && c.to === toId);
  }

  public getUnlockedConnections(regionId: string): Connection[] {
    return this.connections.filter((c) => c.from === regionId && c.unlocked);
  }

  public findPath(fromId: string, toId: string): string[] | null {
    if (fromId === toId) return [fromId];

    const queue: [string, string[]][] = [[fromId, [fromId]]];
    const visited = new Set<string>([fromId]);

    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) continue;
      const [currentId, path] = entry;

      for (const conn of this.getUnlockedConnections(currentId)) {
        if (conn.to === toId) {
          return [...path, toId];
        }

        if (!visited.has(conn.to)) {
          visited.add(conn.to);
          queue.push([conn.to, [...path, conn.to]]);
        }
      }
    }

    return null;
  }

  public getDistance(fromId: string, toId: string): number {
    const regionA = this.getRegion(fromId);
    const regionB = this.getRegion(toId);
    if (!regionA || !regionB) return Infinity;
    return regionA.center.distanceTo(regionB.center);
  }

  public isReachable(fromId: string, toId: string): boolean {
    return this.findPath(fromId, toId) !== null;
  }

  public discoverRegion(id: string): void {
    const region = this.regions.get(id);
    if (region && !region.discovered) {
      region.discovered = true;
      region.visitCount = 1;
      this.emit('regionDiscovered', region);
    } else if (region) {
      region.visitCount++;
    }
  }

  public unlockConnection(id: string): void {
    const connection = this.connections.find((c) => c.id === id);
    if (connection && !connection.unlocked) {
      connection.unlocked = true;
      this.emit('connectionUnlocked', connection);
    }
  }

  public on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(handler);
  }

  public off(event: string, handler: (...args: unknown[]) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  public emit(event: string, ...args: unknown[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(...args);
      }
    }
  }
}

export function createWorldGraph(definition: WorldGraphDefinition): WorldGraph {
  return new WorldGraph(definition);
}

export function isWorldGraph(obj: unknown): obj is WorldGraph {
  if (!obj || typeof obj !== 'object') return false;
  return 'getRegion' in obj && typeof (obj as WorldGraph).getRegion === 'function';
}
