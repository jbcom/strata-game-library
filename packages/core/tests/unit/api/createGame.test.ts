import { describe, expect, it, vi } from 'vitest';
import { createGame } from '../../../src/api/createGame';
import type { GameDefinition } from '../../../src/game/types';

/**
 * Helper to build a minimal valid GameDefinition.
 * Every required field is present so createGame() won't throw.
 */
function makeMinimalDefinition(overrides: Partial<GameDefinition> = {}): GameDefinition {
  return {
    name: 'Test Game',
    version: '1.0.0',
    content: {
      materials: [],
      creatures: [],
      props: [],
      items: [],
    },
    world: {
      regions: {
        spawn: {
          name: 'Spawn',
          center: [0, 0, 0],
          radius: 50,
        },
      },
      connections: [],
    },
    scenes: {
      title: {
        id: 'title',
        render: () => null,
      },
    },
    initialScene: 'title',
    modes: {
      explore: {
        id: 'explore',
        systems: [],
        inputMap: {},
      },
    },
    defaultMode: 'explore',
    statePreset: 'rpg',
    controls: {},
    ...overrides,
  } as GameDefinition;
}

describe('createGame', () => {
  it('should create a game from a minimal definition', () => {
    const def = makeMinimalDefinition();
    const game = createGame(def);

    expect(game).toBeDefined();
    expect(game.definition).toBe(def);
  });

  it('should expose the original definition', () => {
    const def = makeMinimalDefinition({ name: 'My RPG', version: '2.0.0' });
    const game = createGame(def);

    expect(game.definition.name).toBe('My RPG');
    expect(game.definition.version).toBe('2.0.0');
  });

  // --- Registries ---

  describe('registries', () => {
    it('should create empty registries when no content items provided', () => {
      const game = createGame(makeMinimalDefinition());

      expect(game.registries.materials.all()).toEqual([]);
      expect(game.registries.creatures.all()).toEqual([]);
      expect(game.registries.props.all()).toEqual([]);
      expect(game.registries.items.all()).toEqual([]);
    });

    it('should populate registries from content definitions', () => {
      const def = makeMinimalDefinition({
        content: {
          materials: [{ id: 'wood', type: 'wood', props: { color: '#8B4513' } }],
          creatures: [
            {
              id: 'wolf',
              skeleton: 'quadruped',
              covering: {},
              ai: 'predator',
              stats: { health: 80 },
            },
          ],
          props: [{ id: 'crate', components: [] }],
          items: [{ id: 'sword', name: 'Iron Sword', type: 'weapon', props: { damage: 10 } }],
        },
      });

      const game = createGame(def);

      expect(game.registries.materials.get('wood')).toBeDefined();
      expect(game.registries.materials.get('wood')?.type).toBe('wood');

      expect(game.registries.creatures.get('wolf')).toBeDefined();
      expect(game.registries.creatures.get('wolf')?.ai).toBe('predator');

      expect(game.registries.props.get('crate')).toBeDefined();

      expect(game.registries.items.get('sword')).toBeDefined();
      expect(game.registries.items.get('sword')?.name).toBe('Iron Sword');
    });

    it('should return all registered items', () => {
      const def = makeMinimalDefinition({
        content: {
          materials: [
            { id: 'wood', type: 'wood', props: {} },
            { id: 'metal', type: 'metal', props: {} },
          ],
          creatures: [],
          props: [],
          items: [],
        },
      });

      const game = createGame(def);
      expect(game.registries.materials.all()).toHaveLength(2);
    });
  });

  // --- World Graph ---

  describe('worldGraph', () => {
    it('should create a world graph from definition', () => {
      const game = createGame(makeMinimalDefinition());

      expect(game.worldGraph).toBeDefined();
      expect(game.worldGraph.getRegion('spawn')).toBeDefined();
      expect(game.worldGraph.getRegion('spawn')?.name).toBe('Spawn');
    });

    it('should accept a pre-built WorldGraph instance', () => {
      // isWorldGraph checks for a getRegion method
      const fakeWorldGraph = {
        regions: new Map(),
        connections: [],
        getRegion: vi.fn(),
        getRegionAt: vi.fn(),
        getConnections: vi.fn(),
        discoverRegion: vi.fn(),
        unlockConnection: vi.fn(),
        on: vi.fn(),
        emit: vi.fn(),
      };

      const def = makeMinimalDefinition({ world: fakeWorldGraph as any });
      const game = createGame(def);

      // Should reuse the provided world graph, not create a new one
      expect(game.worldGraph).toBe(fakeWorldGraph);
    });

    it('should handle world with connections between regions', () => {
      const def = makeMinimalDefinition({
        world: {
          regions: {
            town: { name: 'Town', center: [0, 0, 0], radius: 100 },
            forest: { name: 'Forest', center: [200, 0, 0], radius: 150 },
          },
          connections: [{ from: 'town', to: 'forest', type: 'path' }],
        },
      });

      const game = createGame(def);

      expect(game.worldGraph.getRegion('town')).toBeDefined();
      expect(game.worldGraph.getRegion('forest')).toBeDefined();
      expect(game.worldGraph.getConnections('town').length).toBe(1);
    });
  });

  // --- ECS World ---

  describe('world (ECS)', () => {
    it('should create an ECS world', () => {
      const game = createGame(makeMinimalDefinition());

      expect(game.world).toBeDefined();
      expect(game.world.spawn).toBeTypeOf('function');
      expect(game.world.despawn).toBeTypeOf('function');
      expect(game.world.clear).toBeTypeOf('function');
    });
  });

  // --- Store ---

  describe('store', () => {
    it('should create a game store', () => {
      const game = createGame(makeMinimalDefinition());
      expect(game.store).toBeDefined();
    });

    it('should initialize with custom initial state', () => {
      const def = makeMinimalDefinition({
        initialState: { score: 0, level: 1 },
      });
      const game = createGame(def);

      expect(game.store).toBeDefined();
      // Store should exist and be callable
      expect(game.store.getState).toBeTypeOf('function');
    });
  });

  // --- Scene Manager ---

  describe('sceneManager', () => {
    it('should create a scene manager with initial scene config', () => {
      const game = createGame(makeMinimalDefinition());

      expect(game.sceneManager).toBeDefined();
      expect(game.sceneManager.load).toBeTypeOf('function');
      expect(game.sceneManager.push).toBeTypeOf('function');
      expect(game.sceneManager.pop).toBeTypeOf('function');
    });

    it('should register all scenes from the definition', async () => {
      const def = makeMinimalDefinition({
        scenes: {
          title: { id: 'title', render: () => null },
          gameplay: { id: 'gameplay', render: () => null },
          gameover: { id: 'gameover', render: () => null },
        },
        initialScene: 'title',
      });

      const game = createGame(def);

      // All scenes should be registered — loading should not throw
      await expect(game.sceneManager.load('title')).resolves.toBeUndefined();
      await expect(game.sceneManager.load('gameplay')).resolves.toBeUndefined();
      await expect(game.sceneManager.load('gameover')).resolves.toBeUndefined();
    });

    it('should add default setup/teardown to scenes that lack them', async () => {
      const def = makeMinimalDefinition({
        scenes: {
          bare: { id: 'bare', render: () => null },
        },
        initialScene: 'bare',
      });

      const game = createGame(def);

      // Should not throw even though scene had no setup/teardown
      await expect(game.sceneManager.load('bare')).resolves.toBeUndefined();
    });

    it('should preserve custom setup/teardown from scene definitions', async () => {
      const setup = vi.fn().mockResolvedValue(undefined);
      const teardown = vi.fn().mockResolvedValue(undefined);

      const def = makeMinimalDefinition({
        scenes: {
          custom: {
            id: 'custom',
            setup,
            teardown,
            render: () => null,
          },
        },
        initialScene: 'custom',
      });

      const game = createGame(def);
      await game.sceneManager.load('custom');

      expect(setup).toHaveBeenCalled();
    });
  });

  // --- Mode Manager ---

  describe('modeManager', () => {
    it('should create a mode manager', () => {
      const game = createGame(makeMinimalDefinition());

      expect(game.modeManager).toBeDefined();
      expect(game.modeManager.push).toBeTypeOf('function');
      expect(game.modeManager.pop).toBeTypeOf('function');
      expect(game.modeManager.replace).toBeTypeOf('function');
    });

    it('should register all modes from the definition', () => {
      const def = makeMinimalDefinition({
        modes: {
          explore: { id: 'explore', systems: [], inputMap: {} },
          combat: { id: 'combat', systems: [], inputMap: {} },
          menu: { id: 'menu', systems: [], inputMap: {} },
        },
        defaultMode: 'explore',
      });

      const game = createGame(def);

      expect(game.modeManager.hasMode('explore')).toBe(true);
      expect(game.modeManager.hasMode('combat')).toBe(true);
      expect(game.modeManager.hasMode('menu')).toBe(true);
    });
  });

  // --- Input Manager ---

  describe('inputManager', () => {
    it('should create an input manager', () => {
      const game = createGame(makeMinimalDefinition());

      expect(game.inputManager).toBeDefined();
    });
  });

  // --- Audio Manager ---

  describe('audioManager', () => {
    it('should create an audio manager', () => {
      const game = createGame(makeMinimalDefinition());

      expect(game.audioManager).toBeDefined();
    });
  });

  // --- Lifecycle Methods ---

  describe('lifecycle', () => {
    it('should have start, pause, resume, and stop methods', () => {
      const game = createGame(makeMinimalDefinition());

      expect(game.start).toBeTypeOf('function');
      expect(game.pause).toBeTypeOf('function');
      expect(game.resume).toBeTypeOf('function');
      expect(game.stop).toBeTypeOf('function');
    });

    describe('start()', () => {
      it('should call onStart hook', async () => {
        const onStart = vi.fn();
        const def = makeMinimalDefinition({
          hooks: { onStart },
        });

        const game = createGame(def);
        await game.start();

        expect(onStart).toHaveBeenCalledOnce();
      });

      it('should load the initial scene', async () => {
        const setup = vi.fn().mockResolvedValue(undefined);

        const def = makeMinimalDefinition({
          scenes: {
            title: { id: 'title', setup, teardown: async () => {}, render: () => null },
          },
          initialScene: 'title',
        });

        const game = createGame(def);
        await game.start();

        expect(setup).toHaveBeenCalled();
        expect(game.sceneManager.current?.id).toBe('title');
      });

      it('should push the default mode', async () => {
        const onEnter = vi.fn();
        const def = makeMinimalDefinition({
          modes: {
            explore: { id: 'explore', systems: [], inputMap: {}, onEnter },
          },
          defaultMode: 'explore',
        });

        const game = createGame(def);
        await game.start();

        expect(onEnter).toHaveBeenCalled();
        expect(game.modeManager.current?.config.id).toBe('explore');
      });
    });

    describe('pause()', () => {
      it('should call onPause hook', async () => {
        const onPause = vi.fn();
        const def = makeMinimalDefinition({
          hooks: { onPause },
        });

        const game = createGame(def);
        game.pause();

        expect(onPause).toHaveBeenCalledOnce();
      });

      it('should call current mode onPause if mode has one', async () => {
        const modePause = vi.fn();
        const def = makeMinimalDefinition({
          modes: {
            explore: { id: 'explore', systems: [], inputMap: {}, onPause: modePause },
          },
          defaultMode: 'explore',
        });

        const game = createGame(def);
        await game.start();

        game.pause();
        expect(modePause).toHaveBeenCalled();
      });

      it('should not throw if no mode is active', () => {
        const game = createGame(makeMinimalDefinition());

        // Before start(), no mode is active yet
        expect(() => game.pause()).not.toThrow();
      });
    });

    describe('resume()', () => {
      it('should call onResume hook', () => {
        const onResume = vi.fn();
        const def = makeMinimalDefinition({
          hooks: { onResume },
        });

        const game = createGame(def);
        game.resume();

        expect(onResume).toHaveBeenCalledOnce();
      });

      it('should call current mode onResume if mode has one', async () => {
        const modeResume = vi.fn();
        const def = makeMinimalDefinition({
          modes: {
            explore: { id: 'explore', systems: [], inputMap: {}, onResume: modeResume },
          },
          defaultMode: 'explore',
        });

        const game = createGame(def);
        await game.start();

        game.resume();
        expect(modeResume).toHaveBeenCalled();
      });
    });

    describe('stop()', () => {
      it('should clear the ECS world', async () => {
        const def = makeMinimalDefinition();
        const game = createGame(def);

        // Spawn some entities first
        game.world.spawn({ id: 'e1' });
        game.world.spawn({ id: 'e2' });
        expect(game.world.size).toBe(2);

        game.stop();

        expect(game.world.size).toBe(0);
      });
    });
  });

  // --- Full Config ---

  describe('full configuration', () => {
    it('should create a game with all optional fields populated', () => {
      const def = makeMinimalDefinition({
        description: 'An epic RPG adventure',
        content: {
          materials: [{ id: 'stone', type: 'mineral', props: { hardness: 9 } }],
          creatures: [
            {
              id: 'dragon',
              skeleton: 'quadruped',
              covering: { scales: true },
              ai: 'boss',
              stats: { health: 5000 },
            },
          ],
          props: [{ id: 'chest', components: [{ shape: 'box' }] }],
          items: [{ id: 'potion', name: 'Health Potion', type: 'consumable', props: { heal: 50 } }],
        },
        ui: {
          hud: undefined,
          menus: {},
        },
        audio: {
          music: [],
          ambient: [],
          sfx: [],
        },
        graphics: {
          quality: 'high',
        },
        hooks: {
          onStart: vi.fn(),
          onPause: vi.fn(),
          onResume: vi.fn(),
        },
      });

      const game = createGame(def);

      expect(game).toBeDefined();
      expect(game.definition.description).toBe('An epic RPG adventure');
      expect(game.definition.graphics?.quality).toBe('high');
      expect(game.registries.materials.get('stone')?.props.hardness).toBe(9);
      expect(game.registries.creatures.get('dragon')?.stats.health).toBe(5000);
    });
  });
});
