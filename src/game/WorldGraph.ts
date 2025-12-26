import * as THREE from 'three';
import type { Connection, Region, WorldGraph, WorldGraphDefinition } from './types';

export function createWorldGraph(definition: WorldGraphDefinition): WorldGraph {
    const regions = new Map<string, Region>();
    const connections: Connection[] = [];
    const handlers = new Map<string, Set<(...args: any[]) => void>>();

    // Initialize regions
    for (const [id, regDef] of Object.entries(definition.regions)) {
        regions.set(id, {
            id,
            name: regDef.name,
            type: regDef.type || 'biome',
            center: new THREE.Vector3(...regDef.center),
            bounds: regDef.radius
                ? { type: 'sphere', radius: regDef.radius }
                : { type: 'box', size: new THREE.Vector3(...(regDef.size || [1, 1, 1])) },
            biome: regDef.biome,
            difficulty: regDef.difficulty || 1,
            discovered: false,
            visitCount: 0,
        });
    }

    // Initialize connections
    for (const connDef of definition.connections) {
        connections.push({
            id: connDef.id || `${connDef.from}-${connDef.to}`,
            from: connDef.from,
            to: connDef.to,
            type: connDef.type,
            fromPosition: new THREE.Vector3(...(connDef.fromPosition || [0, 0, 0])),
            toPosition: new THREE.Vector3(...(connDef.toPosition || [0, 0, 0])),
            unlocked: !connDef.unlockCondition,
        });
    }

    const getRegionAt = (position: THREE.Vector3): Region | undefined => {
        for (const region of regions.values()) {
            const dist = position.distanceTo(region.center);
            if (region.bounds.type === 'sphere' && dist < region.bounds.radius) {
                return region;
            }
            // Simplified box check
            if (region.bounds.type === 'box') {
                const halfSize = region.bounds.size.clone().multiplyScalar(0.5);
                if (
                    Math.abs(position.x - region.center.x) < halfSize.x &&
                    Math.abs(position.y - region.center.y) < halfSize.y &&
                    Math.abs(position.z - region.center.z) < halfSize.z
                ) {
                    return region;
                }
            }
        }
        return undefined;
    };

    return {
        regions,
        connections,
        getRegion: (id: string) => regions.get(id),
        getRegionAt,
        getConnections: (regionId: string) => connections.filter((c) => c.from === regionId),
        discoverRegion: (id: string) => {
            const region = regions.get(id);
            if (region && !region.discovered) {
                region.discovered = true;
                // emit event
            }
        },
        unlockConnection: (id: string) => {
            const conn = connections.find((c) => c.id === id);
            if (conn) conn.unlocked = true;
        },
        on: (event: string, handler: (...args: any[]) => void) => {
            if (!handlers.has(event)) handlers.set(event, new Set());
            handlers.get(event)?.add(handler);
        },
        emit: (event: string, ...args: any[]) => {
            const eventHandlers = handlers.get(event);
            if (eventHandlers) {
                for (const h of eventHandlers) {
                    h(...args);
                }
            }
        },
    };
}

export function isWorldGraph(obj: any): obj is WorldGraph {
    return obj && typeof obj.getRegion === 'function';
}
