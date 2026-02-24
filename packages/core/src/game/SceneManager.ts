import type React from 'react';
import { create } from 'zustand';

/**
 * Represents a top-level game state with a complete render tree.
 */
export interface Scene {
  /** Unique identifier for the scene. */
  id: string;
  /** Called before the scene is loaded. Useful for asset preloading. */
  setup: () => Promise<void>;
  /** Called after the scene is unloaded. Useful for cleanup. */
  teardown: () => Promise<void>;
  /** React Three Fiber content to render for this scene. */
  render: () => React.ReactNode;
  /** Optional 2D UI overlay for this scene. */
  ui?: () => React.ReactNode;
}

/**
 * Configuration for the SceneManager.
 */
export interface SceneManagerConfig {
  /** The ID of the scene to load initially. */
  initialScene?: string;
  /** Optional component to display during scene transitions. */
  loadingComponent?: React.ComponentType<{ progress: number }>;
}

/**
 * Internal state for the SceneManager.
 */
interface SceneState {
  scenes: Map<string, Scene>;
  current: Scene | null;
  stack: Scene[];
  isLoading: boolean;
  loadProgress: number;
}

/**
 * Public interface for the SceneManager.
 */
export interface SceneManager {
  /** Registers a new scene definition. */
  register: (scene: Scene) => void;
  /** Replaces the current scene with a new one. */
  load: (sceneId: string) => Promise<void>;
  /** Pushes a new scene onto the stack (overlaying the current one). */
  push: (sceneId: string) => Promise<void>;
  /** Removes the top-most scene from the stack. */
  pop: () => Promise<void>;
  /** The currently active scene. */
  current: Scene | null;
  /** The stack of active scenes (for overlays). */
  stack: Scene[];
  /** Whether a scene is currently being loaded. */
  isLoading: boolean;
  /** Progress of the current load operation (0-100). */
  loadProgress: number;
}

/**
 * Creates a new SceneManager instance.
 *
 * @param config - Configuration options
 * @returns A SceneManager instance
 *
 * @example
 * ```typescript
 * const scenes = createSceneManager({ initialScene: 'title' });
 * scenes.register({
 *   id: 'title',
 *   setup: async () => { ... },
 *   teardown: async () => { ... },
 *   render: () => <TitleScreen />,
 *   ui: () => <TitleUI />
 * });
 * ```
 */
export function createSceneManager(config: SceneManagerConfig = {}): SceneManager {
  const useStore = create<SceneState>(() => ({
    scenes: new Map(),
    current: null,
    stack: [],
    isLoading: false,
    loadProgress: 0,
  }));

  const manager: SceneManager = {
    register: (scene: Scene) => {
      useStore.getState().scenes.set(scene.id, scene);
    },

    load: async (sceneId: string) => {
      const state = useStore.getState();
      const scene = state.scenes.get(sceneId);
      if (!scene) throw new Error(`Scene "${sceneId}" not registered.`);

      useStore.setState({ isLoading: true, loadProgress: 0 });

      if (state.current) {
        await state.current.teardown();
      }

      try {
        await scene.setup();
        useStore.setState({
          current: scene,
          stack: [scene],
          isLoading: false,
          loadProgress: 100,
        });
      } catch (error) {
        useStore.setState({ isLoading: false });
        throw error;
      }
    },

    push: async (sceneId: string) => {
      const state = useStore.getState();
      const scene = state.scenes.get(sceneId);
      if (!scene) throw new Error(`Scene "${sceneId}" not registered.`);

      useStore.setState({ isLoading: true, loadProgress: 0 });

      try {
        await scene.setup();
        useStore.setState((prev) => ({
          stack: [...prev.stack, scene],
          current: scene,
          isLoading: false,
          loadProgress: 100,
        }));
      } catch (error) {
        useStore.setState({ isLoading: false });
        throw error;
      }
    },

    pop: async () => {
      const state = useStore.getState();
      if (state.stack.length <= 1) return;

      const topScene = state.stack[state.stack.length - 1];
      await topScene.teardown();

      useStore.setState((prev) => {
        const newStack = prev.stack.slice(0, -1);
        return {
          stack: newStack,
          current: newStack[newStack.length - 1],
        };
      });
    },

    get current() {
      return useStore.getState().current;
    },
    get stack() {
      return useStore.getState().stack;
    },
    get isLoading() {
      return useStore.getState().isLoading;
    },
    get loadProgress() {
      return useStore.getState().loadProgress;
    },
  };

  if (config.initialScene) {
    // We can't await here in a sync factory,
    // but we can start the load.
    // The user should probably handle the promise if they care.
    const initialScene = config.initialScene;
    setTimeout(() => manager.load(initialScene), 0);
  }

  return manager;
}
