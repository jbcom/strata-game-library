import { describe, expect, it, vi } from 'vitest';
import { createActionState, createGame, createRPGState } from '../../../src/api/createGame';
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

  describe('validation', () => {
    it('should throw when the initial scene is missing', () => {
      expect(() =>
        createGame(
          makeMinimalDefinition({
            initialScene: 'missing',
          })
        )
      ).toThrow('Unknown scene "missing"');
    });

    it('should throw when the default mode is missing', () => {
      expect(() =>
        createGame(
          makeMinimalDefinition({
            defaultMode: 'missing',
          })
        )
      ).toThrow('Unknown mode "missing"');
    });

    it('should throw when the game has no scenes', () => {
      expect(() =>
        createGame(
          makeMinimalDefinition({
            initialScene: 'title',
            scenes: {},
          })
        )
      ).toThrow('requires at least one scene');
    });

    it('should throw when the game has no modes', () => {
      expect(() =>
        createGame(
          makeMinimalDefinition({
            defaultMode: 'explore',
            modes: {},
          })
        )
      ).toThrow('requires at least one mode');
    });

    it('should throw when content registries contain duplicate ids', () => {
      expect(() =>
        createGame(
          makeMinimalDefinition({
            content: {
              materials: [
                { id: 'wood', type: 'wood', props: {} },
                { id: 'wood', type: 'wood', props: {} },
              ],
              creatures: [],
              props: [],
              items: [],
            },
          })
        )
      ).toThrow('Duplicate material id "wood"');
    });
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

    it('should expose game-level persistence helpers that delegate to the store', async () => {
      const game = createGame(makeMinimalDefinition());
      const state = game.store.getState();
      const save = vi.fn().mockResolvedValue(true);
      const load = vi.fn().mockResolvedValue(true);
      const deleteSave = vi.fn().mockResolvedValue(true);
      const listSaves = vi.fn().mockResolvedValue(['camp', 'autosave']);
      const getSaveInfo = vi.fn().mockResolvedValue({ timestamp: 1234, version: 2 });

      state.save = save;
      state.load = load;
      state.deleteSave = deleteSave;
      state.listSaves = listSaves;
      state.getSaveInfo = getSaveInfo;

      await expect(game.save('camp')).resolves.toBe(true);
      await expect(game.load('camp')).resolves.toBe(true);
      await expect(game.deleteSave('camp')).resolves.toBe(true);
      await expect(game.listSaves()).resolves.toEqual(['camp', 'autosave']);
      await expect(game.getSaveInfo('camp')).resolves.toEqual({ timestamp: 1234, version: 2 });

      expect(save).toHaveBeenCalledWith('camp');
      expect(load).toHaveBeenCalledWith('camp');
      expect(deleteSave).toHaveBeenCalledWith('camp');
      expect(listSaves).toHaveBeenCalledOnce();
      expect(getSaveInfo).toHaveBeenCalledWith('camp');
    });

    it('should initialize with the default state for a built-in preset', () => {
      const game = createGame(makeMinimalDefinition());

      expect(game.store.getState().data.player.level).toBe(1);
      expect(game.store.getState().data.currentRegion).toBe('start');
      expect(game.store.getState().data.discoveredRegions).toEqual(['start']);
    });

    it('should deep-merge initial state overrides into built-in preset state', () => {
      const def = makeMinimalDefinition({
        initialState: {
          currentRegion: 'marsh',
          player: {
            health: 72,
            name: 'River Otter',
          },
        },
      });
      const game = createGame(def);

      expect(game.store.getState().data.currentRegion).toBe('marsh');
      expect(game.store.getState().data.player.name).toBe('River Otter');
      expect(game.store.getState().data.player.health).toBe(72);
      expect(game.store.getState().data.player.maxHealth).toBe(100);
      expect(game.store.getState().data.player.stats.strength).toBe(10);
    });

    it('should initialize with custom initial state', () => {
      const def = makeMinimalDefinition({
        statePreset: 'action',
        initialState: { player: { score: 9001 }, level: 4 },
      });
      const game = createGame(def);

      expect(game.store.getState().data).toEqual(
        createActionState({
          player: { score: 9001 },
          level: 4,
        })
      );
    });

    it('should preserve explicitly created preset state objects', () => {
      const def = makeMinimalDefinition({
        initialState: createRPGState({
          currentRegion: 'forest',
          player: {
            level: 3,
          },
        }),
      });
      const game = createGame(def);

      expect(game.store.getState().data.currentRegion).toBe('forest');
      expect(game.store.getState().data.player.level).toBe(3);
    });

    it('should use an empty object for custom preset games without initial state', () => {
      const game = createGame(
        makeMinimalDefinition({
          initialState: undefined,
          statePreset: 'custom',
        })
      );

      expect(game.store.getState().data).toEqual({});
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

    it('should provide scene lifecycle context from createGame wrappers', async () => {
      const setup = vi.fn().mockResolvedValue(undefined);
      const teardown = vi.fn().mockResolvedValue(undefined);
      const def = makeMinimalDefinition({
        scenes: {
          gameplay: {
            id: 'gameplay',
            setup,
            teardown,
            render: () => null,
          },
        },
        initialScene: 'gameplay',
      });

      const game = createGame(def);
      await game.sceneManager.load('gameplay');
      await game.sceneManager.load('gameplay');

      expect(setup).toHaveBeenCalledWith(
        expect.objectContaining({
          audioManager: game.audioManager,
          game,
          inputManager: game.inputManager,
          modeManager: game.modeManager,
          scene: expect.objectContaining({ id: 'gameplay' }),
          sceneManager: game.sceneManager,
          store: game.store,
          world: game.world,
          worldGraph: game.worldGraph,
        })
      );
      expect(teardown).toHaveBeenCalledWith(
        expect.objectContaining({
          game,
          scene: expect.objectContaining({ id: 'gameplay' }),
        })
      );
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

    it('should provide mode lifecycle context from createGame wrappers', async () => {
      const onEnter = vi.fn();
      const onPause = vi.fn();
      const onResume = vi.fn();
      const setup = vi.fn().mockResolvedValue(undefined);
      const teardown = vi.fn().mockResolvedValue(undefined);

      const def = makeMinimalDefinition({
        modes: {
          explore: {
            id: 'explore',
            systems: [],
            inputMap: {},
            onEnter,
            onPause,
            onResume,
            setup,
            teardown,
          },
          menu: {
            id: 'menu',
            systems: [],
            inputMap: {},
          },
        },
        defaultMode: 'explore',
      });

      const game = createGame(def);
      await game.modeManager.push('explore', { source: 'test' });
      game.pause();
      game.resume();
      await game.modeManager.push('menu');
      await game.modeManager.pop();
      await game.modeManager.replace('menu');

      expect(setup).toHaveBeenCalledWith(
        expect.objectContaining({
          audioManager: game.audioManager,
          game,
          inputManager: game.inputManager,
          modeManager: game.modeManager,
          props: { source: 'test' },
          sceneManager: game.sceneManager,
          source: 'test',
          store: game.store,
          world: game.world,
          worldGraph: game.worldGraph,
        })
      );
      expect(onEnter).toHaveBeenCalledWith(
        expect.objectContaining({
          game,
          props: { source: 'test' },
          source: 'test',
        })
      );
      expect(onPause).toHaveBeenCalledWith(
        expect.objectContaining({
          game,
          props: { source: 'test' },
        })
      );
      expect(onResume).toHaveBeenCalledWith(
        expect.objectContaining({
          game,
          props: { source: 'test' },
        })
      );
      expect(teardown).toHaveBeenCalledWith(
        expect.objectContaining({
          game,
          props: { source: 'test' },
        })
      );
    });

    it('should remap active input actions when the mode changes', async () => {
      const def = makeMinimalDefinition({
        modes: {
          explore: {
            id: 'explore',
            systems: [],
            inputMap: {
              moveForward: {
                keyboard: ['w'],
              },
            },
          },
          menu: {
            id: 'menu',
            systems: [],
            inputMap: {
              confirm: {
                keyboard: ['w'],
              },
            },
          },
        },
        defaultMode: 'explore',
      });

      const game = createGame(def);
      const element = document.createElement('div');

      game.inputManager.attach(element);
      await game.modeManager.push('explore');

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w' }));
      expect(game.inputManager.isActionPressed('moveForward')).toBe(true);
      expect(game.inputManager.isActionPressed('confirm')).toBe(false);

      await game.modeManager.replace('menu');
      expect(game.inputManager.isActionPressed('moveForward')).toBe(false);
      expect(game.inputManager.isActionPressed('confirm')).toBe(true);

      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w' }));
      expect(game.inputManager.isActionPressed('confirm')).toBe(false);

      game.inputManager.detach();
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
    it('should expose lifecycle and transition-aware orchestration helpers', () => {
      const game = createGame(makeMinimalDefinition());

      expect(game.start).toBeTypeOf('function');
      expect(game.loadScene).toBeTypeOf('function');
      expect(game.pushScene).toBeTypeOf('function');
      expect(game.popScene).toBeTypeOf('function');
      expect(game.pushMode).toBeTypeOf('function');
      expect(game.replaceMode).toBeTypeOf('function');
      expect(game.popMode).toBeTypeOf('function');
      expect(game.save).toBeTypeOf('function');
      expect(game.load).toBeTypeOf('function');
      expect(game.deleteSave).toBeTypeOf('function');
      expect(game.listSaves).toBeTypeOf('function');
      expect(game.getSaveInfo).toBeTypeOf('function');
      expect(game.pause).toBeTypeOf('function');
      expect(game.resume).toBeTypeOf('function');
      expect(game.stop).toBeTypeOf('function');
      expect(game.transitionManager).toBeDefined();
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

      it('should route scene changes through the transition manager when requested', async () => {
        const transition = { type: 'fade', duration: 0.25, color: '#000' } as const;
        const def = makeMinimalDefinition({
          scenes: {
            title: { id: 'title', render: () => null },
            gameplay: { id: 'gameplay', render: () => null },
          },
          initialScene: 'title',
        });

        const game = createGame(def);
        const startSpy = vi.spyOn(game.transitionManager, 'start').mockResolvedValue(undefined);

        await game.start();
        await game.loadScene('gameplay', { transition });

        expect(startSpy).toHaveBeenNthCalledWith(1, transition);
        expect(startSpy).toHaveBeenNthCalledWith(2, {
          ...transition,
          reverse: true,
        });
        expect(game.sceneManager.current?.id).toBe('gameplay');
      });

      it('should route mode changes through explicit transition pairs', async () => {
        const def = makeMinimalDefinition({
          modes: {
            explore: { id: 'explore', systems: [], inputMap: {} },
            combat: { id: 'combat', systems: [], inputMap: {} },
          },
          defaultMode: 'explore',
        });

        const game = createGame(def);
        const transitionOut = { type: 'wipe', duration: 0.2, direction: 'left' } as const;
        const transitionIn = {
          type: 'fade',
          duration: 0.15,
          color: '#111',
          reverse: true,
        } as const;
        const startSpy = vi.spyOn(game.transitionManager, 'start').mockResolvedValue(undefined);

        await game.start();
        await game.replaceMode('combat', { encounterId: 'boss' }, { transitionOut, transitionIn });

        expect(startSpy).toHaveBeenNthCalledWith(1, transitionOut);
        expect(startSpy).toHaveBeenNthCalledWith(2, transitionIn);
        expect(game.modeManager.current?.config.id).toBe('combat');
        expect(game.modeManager.current?.props).toEqual({ encounterId: 'boss' });
      });

      it('should use declarative game-level scene transition defaults when no runtime option is provided', async () => {
        const transition = { type: 'fade', duration: 0.3, color: '#02060a' } as const;
        const def = makeMinimalDefinition({
          scenes: {
            title: { id: 'title', render: () => null },
            gameplay: { id: 'gameplay', render: () => null },
          },
          transitions: {
            scenes: {
              load: { transition },
            },
          },
        });

        const game = createGame(def);
        const startSpy = vi.spyOn(game.transitionManager, 'start').mockResolvedValue(undefined);

        await game.loadScene('gameplay');

        expect(startSpy).toHaveBeenNthCalledWith(1, transition);
        expect(startSpy).toHaveBeenNthCalledWith(2, {
          ...transition,
          reverse: true,
        });
      });

      it('should let scene-specific transition defaults override game-level defaults', async () => {
        const def = makeMinimalDefinition({
          scenes: {
            title: { id: 'title', render: () => null },
            gameplay: {
              id: 'gameplay',
              render: () => null,
              transition: {
                transition: {
                  type: 'wipe',
                  duration: 0.2,
                  direction: 'left',
                },
              },
            },
          },
          transitions: {
            scenes: {
              load: {
                transition: {
                  type: 'fade',
                  duration: 0.35,
                  color: '#000',
                },
              },
            },
          },
        });

        const game = createGame(def);
        const startSpy = vi.spyOn(game.transitionManager, 'start').mockResolvedValue(undefined);

        await game.loadScene('gameplay');

        expect(startSpy).toHaveBeenNthCalledWith(1, {
          type: 'wipe',
          duration: 0.2,
          direction: 'left',
        });
        expect(startSpy).toHaveBeenNthCalledWith(2, {
          type: 'wipe',
          duration: 0.2,
          direction: 'left',
          reverse: true,
        });
      });

      it('should use declarative mode transition defaults when changing modes', async () => {
        const transition = { type: 'crossfade', duration: 0.16, color: '#10141a' } as const;
        const def = makeMinimalDefinition({
          modes: {
            explore: { id: 'explore', systems: [], inputMap: {} },
            combat: { id: 'combat', systems: [], inputMap: {} },
          },
          transitions: {
            modes: {
              replace: { transition },
            },
          },
        });

        const game = createGame(def);
        const startSpy = vi.spyOn(game.transitionManager, 'start').mockResolvedValue(undefined);

        await game.replaceMode('combat');

        expect(startSpy).toHaveBeenNthCalledWith(1, transition);
        expect(startSpy).toHaveBeenNthCalledWith(2, {
          ...transition,
          reverse: true,
        });
        expect(game.modeManager.current?.config.id).toBe('combat');
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

      it('should expose reactive pause state and preserve the pause binding only', async () => {
        const listener = vi.fn();
        const def = makeMinimalDefinition({
          modes: {
            explore: {
              id: 'explore',
              systems: [],
              inputMap: {
                moveForward: {
                  keyboard: ['w'],
                },
                pause: {
                  keyboard: ['escape'],
                },
              },
            },
          },
        });

        const game = createGame(def);
        const element = document.createElement('div');

        game.inputManager.attach(element);
        await game.start();
        const unsubscribe = game.subscribe(listener);

        expect(game.isPaused).toBe(false);
        expect(game.getSnapshot()).toEqual({ activeProfileId: undefined, isPaused: false });
        expect(game.inputManager.getActionMap()).toMatchObject({
          moveForward: { keyboard: ['w'] },
          pause: { keyboard: ['escape'] },
        });

        game.pause();

        expect(game.isPaused).toBe(true);
        expect(game.getSnapshot()).toEqual({ activeProfileId: undefined, isPaused: true });
        expect(listener).toHaveBeenCalledWith({ activeProfileId: undefined, isPaused: true });
        expect(game.inputManager.getActionMap()).toEqual({
          pause: { keyboard: ['escape'] },
        });

        game.resume();

        expect(game.isPaused).toBe(false);
        expect(game.inputManager.getActionMap()).toMatchObject({
          moveForward: { keyboard: ['w'] },
          pause: { keyboard: ['escape'] },
        });

        unsubscribe();
        game.inputManager.detach();
      });
    });

    describe('setActiveProfile()', () => {
      it('should expose reactive active profile state', () => {
        const listener = vi.fn();
        const game = createGame(makeMinimalDefinition());
        const unsubscribe = game.subscribe(listener);

        expect(game.activeProfileId).toBeUndefined();
        expect(game.getSnapshot()).toEqual({ activeProfileId: undefined, isPaused: false });

        game.setActiveProfile('campaign');

        expect(game.activeProfileId).toBe('campaign');
        expect(game.getSnapshot()).toEqual({ activeProfileId: 'campaign', isPaused: false });
        expect(listener).toHaveBeenCalledWith({ activeProfileId: 'campaign', isPaused: false });

        game.setActiveProfile(undefined);

        expect(game.activeProfileId).toBeUndefined();
        expect(game.getSnapshot()).toEqual({ activeProfileId: undefined, isPaused: false });

        unsubscribe();
      });
    });

    describe('resume()', () => {
      it('should call onResume hook', () => {
        const onResume = vi.fn();
        const def = makeMinimalDefinition({
          hooks: { onResume },
        });

        const game = createGame(def);
        game.pause();
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

        game.pause();
        game.resume();
        expect(modeResume).toHaveBeenCalled();
      });

      it('should not throw when resume is called before the game is paused', () => {
        const game = createGame(makeMinimalDefinition());

        expect(() => game.resume()).not.toThrow();
        expect(game.isPaused).toBe(false);
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

      it('should cancel any active transition state', () => {
        const game = createGame(makeMinimalDefinition());
        const cancelSpy = vi.spyOn(game.transitionManager, 'cancel');

        game.stop();

        expect(cancelSpy).toHaveBeenCalledOnce();
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
