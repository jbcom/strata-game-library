import { createGameStore, createInputManager, createSoundManager, createWorld } from '../core';
import { createModeManager } from '../game/ModeManager';
import { createRegistry } from '../game/Registry';
import { createSceneManager } from '../game/SceneManager';
import type { Game, GameDefinition } from '../game/types';
import { createWorldGraph, isWorldGraph } from '../game/WorldGraph';

/**
 * Creates a new Strata game instance from a declarative definition.
 *
 * @param definition - The game definition object
 * @returns A complete Game instance
 */
export function createGame(definition: GameDefinition): Game {
    // 1. Create content registries
    const registries = {
        materials: createRegistry(definition.content.materials),
        creatures: createRegistry(definition.content.creatures),
        props: createRegistry(definition.content.props),
        items: createRegistry(definition.content.items),
    };

    // 2. Create world graph
    const worldGraph = isWorldGraph(definition.world)
        ? definition.world
        : createWorldGraph(definition.world);

    // 3. Create ECS world
    const world = createWorld();

    // 4. Create state store
    const store = createGameStore(definition.initialState || ({} as any));

    // 5. Create managers
    const sceneManager = createSceneManager({
        initialScene: definition.initialScene,
    });

    // Managers that need game instance reference
    let gameInstance: Game;
    const modeManager = createModeManager(definition.defaultMode);

    const inputManager = createInputManager(definition.controls as any);
    const audioManager = createSoundManager();

    // 6. Register scenes
    for (const [id, scene] of Object.entries(definition.scenes)) {
        sceneManager.register({
            setup: async () => {},
            teardown: async () => {},
            ...scene,
            id,
        });
    }

    // 7. Register modes
    for (const [id, mode] of Object.entries(definition.modes)) {
        modeManager.register({ ...mode, id });
    }

    // 8. Create game instance
    gameInstance = {
        definition,
        registries,
        worldGraph,
        world,
        store,
        sceneManager,
        modeManager,
        inputManager,
        audioManager,

        // Lifecycle
        start: async () => {
            definition.hooks?.onStart?.();
            await sceneManager.load(definition.initialScene);
            await modeManager.push(definition.defaultMode);
        },
        pause: () => {
            definition.hooks?.onPause?.();
            const current = modeManager.current;
            if (current?.config.onPause) {
                current.config.onPause({
                    game: gameInstance,
                    world,
                    modeManager,
                    sceneManager,
                    instance: current,
                });
            }
        },
        resume: () => {
            definition.hooks?.onResume?.();
            const current = modeManager.current;
            if (current?.config.onResume) {
                current.config.onResume({
                    game: gameInstance,
                    world,
                    modeManager,
                    sceneManager,
                    instance: current,
                });
            }
        },
        stop: () => {
            world.clear();
        },
    };

    return gameInstance;
}
