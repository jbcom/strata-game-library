import { create } from 'zustand';
import type { GameMode, ModeDefinition as ModeConfig, ModeInstance, ModeManager } from './types';

/**
 * Internal state for the ModeManager.
 */
interface ModeState {
  modes: Map<GameMode, ModeConfig>;
  current: ModeInstance | null;
  stack: ModeInstance[];
}

export interface ModeManagerSnapshot {
  current: ModeInstance | null;
  stack: ModeInstance[];
}

/**
 * Creates a new ModeManager instance.
 *
 * @param defaultMode - Optional ID of the initial mode to activate.
 * @returns A ModeManager instance.
 *
 * @example
 * ```typescript
 * const modes = createModeManager('exploration');
 * modes.register({
 *   id: 'exploration',
 *   systems: [movementSystem, cameraSystem],
 *   inputMap: explorationInputs,
 *   ui: ExplorationHUD
 * });
 * ```
 */
export function createModeManager(defaultMode?: GameMode): ModeManager {
  const useStore = create<ModeState>(() => ({
    modes: new Map(),
    current: null,
    stack: [],
  }));

  const getSnapshot = (): ModeManagerSnapshot => {
    const state = useStore.getState();
    return {
      current: state.current,
      stack: state.stack,
    };
  };

  const manager: ModeManager = {
    register: (mode: ModeConfig) => {
      useStore.getState().modes.set(mode.id, mode);
    },

    push: async (modeId: GameMode, props: Record<string, unknown> = {}) => {
      const state = useStore.getState();
      const config = state.modes.get(modeId);
      if (!config) throw new Error(`Mode "${modeId}" not registered.`);

      // Pause current mode if it exists
      if (state.current) {
        state.current.config.onPause?.(state.current.props);
      }

      const instance: ModeInstance = {
        config,
        props,
        pushedAt: Date.now(),
      };

      await config.setup?.(props);
      config.onEnter?.(props);

      useStore.setState((prev) => ({
        stack: [...prev.stack, instance],
        current: instance,
      }));
    },

    pop: async () => {
      const state = useStore.getState();
      if (state.stack.length === 0) return;

      const topInstance = state.stack[state.stack.length - 1];
      topInstance.config.onExit?.(topInstance.props);
      await topInstance.config.teardown?.(topInstance.props);

      useStore.setState((prev) => {
        const newStack = prev.stack.slice(0, -1);
        const nextMode = newStack[newStack.length - 1] || null;

        if (nextMode) {
          nextMode.config.onResume?.(nextMode.props);
        }

        return {
          stack: newStack,
          current: nextMode,
        };
      });
    },

    replace: async (modeId: GameMode, props: Record<string, unknown> = {}) => {
      const state = useStore.getState();
      const config = state.modes.get(modeId);
      if (!config) throw new Error(`Mode "${modeId}" not registered.`);

      if (state.current) {
        state.current.config.onExit?.(state.current.props);
        await state.current.config.teardown?.(state.current.props);
      }

      const instance: ModeInstance = {
        config,
        props,
        pushedAt: Date.now(),
      };

      await config.setup?.(props);
      config.onEnter?.(props);

      useStore.setState((prev) => {
        const newStack = [...prev.stack.slice(0, -1), instance];
        return {
          stack: newStack,
          current: instance,
        };
      });
    },

    getConfig: (modeId: GameMode) => {
      return useStore.getState().modes.get(modeId);
    },

    isActive: (modeId: GameMode) => {
      const current = useStore.getState().current;
      return current?.config.id === modeId;
    },

    hasMode: (modeId: GameMode) => {
      return useStore.getState().modes.has(modeId);
    },

    get current() {
      return useStore.getState().current;
    },
    get stack() {
      return useStore.getState().stack;
    },
    getSnapshot,
    subscribe: (listener) => useStore.subscribe(() => listener(getSnapshot())),
  };

  if (defaultMode) {
    // We need to wait for registration usually,
    // but if it's called immediately after creation:
    setTimeout(() => {
      if (manager.hasMode(defaultMode)) {
        void manager.push(defaultMode);
      }
    }, 0);
  }

  return manager;
}
