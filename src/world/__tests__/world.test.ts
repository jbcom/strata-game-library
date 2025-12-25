import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { createWorld } from '../../core/ecs/world';
import { createConnectionSystem } from '../ConnectionSystem';
import { createRegionSystem } from '../RegionSystem';
import { createSpawnSystem } from '../SpawnSystem';
import { createWorldGraph } from '../WorldGraph';

describe('World Topology System', () => {
    const definition = {
        regions: {
            marsh: {
                name: 'The Marsh',
                center: [0, 0, 0] as [number, number, number],
                radius: 50,
                biome: 'marsh' as any,
            },
            forest: {
                name: 'The Forest',
                center: [100, 0, 0] as [number, number, number],
                radius: 50,
                biome: 'forest' as any,
            },
        },
        connections: [
            {
                from: 'marsh',
                to: 'forest',
                type: 'path' as any,
                fromPosition: [40, 0, 0] as [number, number, number],
                toPosition: [60, 0, 0] as [number, number, number],
                bidirectional: true,
            },
        ],
    };

    describe('WorldGraph', () => {
        it('should load regions and connections from definition', () => {
            const graph = createWorldGraph(definition);
            expect(graph.regions.size).toBe(2);
            expect(graph.getRegion('marsh')).toBeDefined();
            expect(graph.getRegion('forest')).toBeDefined();
            // 1 path + 1 bidirectional reverse = 2
            expect(graph.connections.length).toBe(2);
        });

        it('should find region at position', () => {
            const graph = createWorldGraph(definition);
            const region = graph.getRegionAt(new THREE.Vector3(10, 0, 0));
            expect(region?.id).toBe('marsh');

            const forestRegion = graph.getRegionAt(new THREE.Vector3(110, 0, 0));
            expect(forestRegion?.id).toBe('forest');

            const nowhere = graph.getRegionAt(new THREE.Vector3(1000, 0, 0));
            expect(nowhere).toBeUndefined();
        });

        it('should find path between regions', () => {
            const graph = createWorldGraph(definition);
            const path = graph.findPath('marsh', 'forest');
            expect(path).toEqual(['marsh', 'forest']);
        });
    });

    describe('RegionSystem', () => {
        it('should update current region in store', () => {
            const graph = createWorldGraph(definition);
            const mockStore = {
                getState: vi.fn(() => ({
                    data: {},
                    patch: vi.fn(),
                })),
            };
            // For some reason vi.fn() on patch inside the return of getState doesn't work well with patch usage
            const patch = vi.fn();
            mockStore.getState = vi.fn(
                () =>
                    ({
                        data: {},
                        patch,
                    }) as any
            );

            const system = createRegionSystem(graph, mockStore as any);
            const world = createWorld<any>();

            world.spawn({
                isPlayer: true,
                transform: { position: new THREE.Vector3(10, 0, 0) },
            });

            system(world, 1);

            expect(patch).toHaveBeenCalledWith({
                currentRegion: 'marsh',
                currentBiome: 'marsh',
            });
            expect(graph.getRegion('marsh')?.discovered).toBe(true);
        });
    });

    describe('ConnectionSystem', () => {
        it('should teleport player on portal type connection', () => {
            const portalDef = {
                regions: {
                    roomA: {
                        name: 'Room A',
                        center: [0, 0, 0] as [number, number, number],
                        radius: 10,
                    },
                    roomB: {
                        name: 'Room B',
                        center: [100, 100, 100] as [number, number, number],
                        radius: 10,
                    },
                },
                connections: [
                    {
                        from: 'roomA',
                        to: 'roomB',
                        type: 'portal' as any,
                        fromPosition: [5, 0, 0] as [number, number, number],
                        toPosition: [105, 100, 100] as [number, number, number],
                    },
                ],
            };
            const graph = createWorldGraph(portalDef);
            const mockStore = {
                getState: vi.fn(() => ({
                    data: { currentRegion: 'roomA' },
                })),
            };

            const system = createConnectionSystem(graph, mockStore as any);
            const world = createWorld<any>();

            const player = world.spawn({
                isPlayer: true,
                transform: { position: new THREE.Vector3(4.5, 0, 0) }, // Near portal
            });

            system(world, 1);

            expect(player.transform.position.x).toBe(105);
            expect(player.transform.position.y).toBe(100);
            expect(player.transform.position.z).toBe(100);
        });
    });

    describe('SpawnSystem', () => {
        it('should spawn entities in regions with spawn tables', () => {
            const spawnDef = {
                regions: {
                    marsh: {
                        name: 'The Marsh',
                        center: [0, 0, 0] as [number, number, number],
                        radius: 50,
                        spawnTable: {
                            creatures: [{ id: 'frog', weight: 1.0 }],
                        },
                    },
                },
                connections: [],
            };
            const graph = createWorldGraph(spawnDef);
            const system = createSpawnSystem(graph, { spawnInterval: 0 }); // Immediate spawn
            const world = createWorld<any>();

            system(world, 1);

            const spawned = world.entities.filter((e) => e.isSpawned);
            expect(spawned.length).toBeGreaterThan(0);
            expect(spawned[0].regionId).toBe('marsh');
            expect(spawned[0].type).toBe('frog');
        });
    });
});
