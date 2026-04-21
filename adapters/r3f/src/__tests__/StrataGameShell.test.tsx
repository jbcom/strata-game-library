import type {
  Game,
  InputManagerSnapshot,
  SaveInfo,
  SceneShellActionDefinition,
} from '@strata-game-library/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { StrataGame } from '../StrataGame';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: ReactNode }) => <>{children}</>,
  useThree: () => ({
    camera: { add: vi.fn(), remove: vi.fn() },
    gl: { domElement: document.createElement('canvas') },
  }),
}));

function createSnapshotStore<T>(initialSnapshot: T) {
  let snapshot = initialSnapshot;
  const listeners = new Set<() => void>();

  return {
    emit(nextSnapshot: T) {
      snapshot = nextSnapshot;
      for (const listener of listeners) {
        listener();
      }
    },
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function createStoreMock() {
  const storeFn = vi.fn(() => ({
    canRedo: () => false,
    canUndo: () => false,
    data: {},
  }));

  return Object.assign(storeFn, {
    getState: () => ({
      canRedo: () => false,
      canUndo: () => false,
      data: {},
      deleteSave: vi.fn(),
      getSaveInfo: vi.fn(),
      listSaves: vi.fn(),
      load: vi.fn(),
      redo: vi.fn(),
      save: vi.fn(),
      set: vi.fn(),
      undo: vi.fn(),
    }),
    subscribe: vi.fn(() => () => {}),
  });
}

function createShellGame({
  activeProfileId,
  currentSceneId = 'gameplay',
  isPaused = true,
  listedSaveSlots,
  loadProgress = 1,
  pendingSceneId,
  saveInfoBySlot,
  saveSlots,
  saveProfiles,
  sceneIsLoading = false,
  shellActions = [
    {
      description: 'Load the next frontier scene through the shell runtime.',
      label: 'Enter Frontier',
      sceneId: 'frontier',
      type: 'load-scene',
      variant: 'primary',
    },
    {
      closeOnSuccess: true,
      description: 'Hide the scene shell without changing the live scene.',
      label: 'Dismiss Briefing',
      type: 'dismiss-shell',
      variant: 'ghost',
    },
  ] satisfies SceneShellActionDefinition[],
  shellVariant = 'menu',
  start = vi.fn().mockResolvedValue(undefined),
}: {
  activeProfileId?: string;
  currentSceneId?: string;
  isPaused?: boolean;
  loadProgress?: number;
  pendingSceneId?: string;
  listedSaveSlots?: string[];
  saveInfoBySlot?: Record<string, SaveInfo | null | undefined>;
  saveProfiles?: Array<{
    description?: string;
    id: string;
    label?: string;
    sceneId: string;
    slots?: Array<{ description?: string; label?: string; slot: string; storageSlot?: string }>;
  }>;
  saveSlots?: Array<{ description?: string; label?: string; slot: string }>;
  sceneIsLoading?: boolean;
  shellActions?: SceneShellActionDefinition[];
  shellVariant?: 'announcement' | 'title' | 'menu' | 'session' | 'archive' | 'profiles';
  start?: ReturnType<typeof vi.fn>;
} = {}): Game {
  let runtimeSaveSlots = [...(listedSaveSlots ?? ['default'])];
  const runtimeSaveInfo: Record<string, SaveInfo | null | undefined> = {
    ...(saveInfoBySlot ?? {}),
  };
  const actionMap = {
    moveForward: { keyboard: ['w'] },
    pause: { keyboard: ['escape'] },
  };
  const inputStore = createSnapshotStore<InputManagerSnapshot>({
    actionMap,
    activeActions: ['moveForward'],
    axis: { x: 0, y: 0 },
    dragState: 'idle',
    force: 0,
    gamepad: {
      axes: [],
      buttons: [],
      connected: false,
      timestamp: 0,
    },
    isPressed: false,
  });
  const sceneStore = createSnapshotStore({
    current: currentSceneId
      ? {
          id: currentSceneId,
          render: () => null,
          shell: {
            actions: shellActions,
            description: 'The current frontier scene is active.',
            durationMs: 0,
            saveProfiles,
            saveSlots,
            showSceneId: true,
            subtitle: 'SCENE READY',
            title: 'Frontier Reach',
            variant: shellVariant,
          },
          ui: undefined,
        }
      : null,
    isLoading: sceneIsLoading,
    loadProgress,
    pendingSceneId,
  });
  const modeStore = createSnapshotStore({
    current: {
      config: {
        id: 'exploration',
        inputMap: actionMap,
      },
    },
  });
  const transitionStore = createSnapshotStore({
    config: null,
    isTransitioning: false,
    progress: 0,
  });

  let gameSnapshot = { activeProfileId, isPaused };
  const gameListeners = new Set<
    (snapshot: { activeProfileId?: string; isPaused: boolean }) => void
  >();

  const emitGameSnapshot = (snapshot = gameSnapshot) => {
    gameSnapshot = snapshot;
    for (const listener of gameListeners) {
      listener(gameSnapshot);
    }
  };

  const game = {
    audioManager: {},
    definition: {
      content: {
        creatures: [],
        items: [],
        materials: [],
        props: [],
      },
      controls: {},
      defaultMode: 'exploration',
      initialScene: 'gameplay',
      modes: {
        exploration: {
          id: 'exploration',
          inputMap: actionMap,
          systems: [],
        },
      },
      name: 'Shell Test',
      scenes: {
        gameplay: {
          id: 'gameplay',
          render: () => null,
          shell: {
            actions: shellActions,
            description: 'The current frontier scene is active.',
            durationMs: 0,
            saveProfiles,
            saveSlots,
            showSceneId: true,
            subtitle: 'SCENE READY',
            title: 'Frontier Reach',
            variant: shellVariant,
          },
        },
      },
      statePreset: 'rpg',
      ui: {
        shell: {
          hud: {
            title: 'Adventure HUD',
          },
          loadingOverlay: {
            title: 'Preparing Adventure',
            bootLabel: 'BOOTING ADVENTURE',
            sceneLabel: 'TRAVELING',
          },
          pauseMenu: {
            title: 'Quest Paused',
          },
        },
      },
      version: '0.1.0',
      world: {
        connections: [],
        regions: {},
      },
    },
    get isPaused() {
      return gameSnapshot.isPaused;
    },
    get activeProfileId() {
      return gameSnapshot.activeProfileId;
    },
    getSnapshot: () => gameSnapshot,
    inputManager: {
      attach: vi.fn(),
      clearActionMap: vi.fn(),
      detach: vi.fn(),
      getSnapshot: inputStore.getSnapshot,
      off: vi.fn(),
      on: vi.fn(),
      setActionMap: vi.fn(),
      subscribe: inputStore.subscribe,
    },
    loadScene: vi.fn(),
    load: vi.fn().mockResolvedValue(true),
    getSaveInfo: vi.fn().mockImplementation(async (slot: string) => runtimeSaveInfo[slot] ?? null),
    modeManager: {
      current: modeStore.getSnapshot().current,
      getConfig: vi.fn(),
      getSnapshot: modeStore.getSnapshot,
      hasMode: vi.fn(() => true),
      isActive: vi.fn(() => true),
      pop: vi.fn(),
      push: vi.fn(),
      register: vi.fn(),
      replace: vi.fn(),
      stack: [],
      subscribe: modeStore.subscribe,
    },
    pause: vi.fn(() => {
      emitGameSnapshot({ ...gameSnapshot, isPaused: true });
    }),
    popMode: vi.fn(),
    popScene: vi.fn(),
    pushMode: vi.fn(),
    pushScene: vi.fn(),
    registries: {
      creatures: { all: vi.fn(() => []), get: vi.fn(), register: vi.fn() },
      items: { all: vi.fn(() => []), get: vi.fn(), register: vi.fn() },
      materials: { all: vi.fn(() => []), get: vi.fn(), register: vi.fn() },
      props: { all: vi.fn(() => []), get: vi.fn(), register: vi.fn() },
    },
    replaceMode: vi.fn(),
    resume: vi.fn(() => {
      emitGameSnapshot({ ...gameSnapshot, isPaused: false });
    }),
    deleteSave: vi.fn().mockImplementation(async (slot: string) => {
      if (!runtimeSaveSlots.includes(slot)) {
        return false;
      }

      runtimeSaveSlots = runtimeSaveSlots.filter((candidate) => candidate !== slot);
      delete runtimeSaveInfo[slot];
      return true;
    }),
    sceneManager: {
      current: sceneStore.getSnapshot().current,
      getSnapshot: sceneStore.getSnapshot,
      isLoading: sceneStore.getSnapshot().isLoading,
      load: vi.fn(),
      loadProgress: sceneStore.getSnapshot().loadProgress,
      pendingSceneId: sceneStore.getSnapshot().pendingSceneId,
      pop: vi.fn(),
      push: vi.fn(),
      register: vi.fn(),
      stack: [],
      subscribe: sceneStore.subscribe,
    },
    start,
    stop: vi.fn(),
    store: createStoreMock(),
    save: vi.fn().mockResolvedValue(true),
    setActiveProfile: vi.fn((profileId?: string) => {
      emitGameSnapshot({ ...gameSnapshot, activeProfileId: profileId });
    }),
    subscribe(listener: (snapshot: { activeProfileId?: string; isPaused: boolean }) => void) {
      gameListeners.add(listener);
      return () => {
        gameListeners.delete(listener);
      };
    },
    transitionManager: {
      cancel: vi.fn(),
      config: null,
      getSnapshot: transitionStore.getSnapshot,
      isTransitioning: false,
      progress: 0,
      start: vi.fn(),
      subscribe: transitionStore.subscribe,
    },
    world: {
      clear: vi.fn(),
    },
    worldGraph: {},
    listSaves: vi.fn().mockImplementation(async () => [...runtimeSaveSlots]),
  } as unknown as Game;

  return game;
}

describe('StrataGame definition-driven shell', () => {
  it('renders built-in HUD and pause menu scaffolding from ui.shell metadata', async () => {
    const game = createShellGame();

    render(<StrataGame game={game} />);

    expect(await screen.findByText('Adventure HUD')).toBeDefined();
    expect(await screen.findByText('Frontier Reach')).toBeDefined();
    expect(screen.getByText('Quest Paused')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(game.resume).toHaveBeenCalledOnce();
  });

  it('renders a built-in boot loading scaffold when no custom loading prop is supplied', async () => {
    const game = createShellGame({
      currentSceneId: undefined,
      loadProgress: 42,
      pendingSceneId: 'gameplay',
      sceneIsLoading: true,
      start: vi.fn(() => new Promise<void>(() => {})),
    });

    render(<StrataGame game={game} />);

    expect(await screen.findByText('Preparing Adventure')).toBeDefined();
    expect(screen.getByText('BOOTING ADVENTURE')).toBeDefined();
    expect(screen.getByText('Scene:')).toBeDefined();
    expect(screen.getByText('42%')).toBeDefined();
  });

  it('renders a built-in scene loading scaffold while a scene transition is active', async () => {
    const game = createShellGame({
      loadProgress: 64,
      pendingSceneId: 'dungeon',
      sceneIsLoading: true,
    });

    render(<StrataGame game={game} />);

    expect(await screen.findByText('Adventure HUD')).toBeDefined();
    expect(screen.getByText('TRAVELING')).toBeDefined();
    expect(screen.getByText('64%')).toBeDefined();
    expect(screen.getByText('dungeon')).toBeDefined();
  });

  it('routes scene-shell actions through the live game runtime', async () => {
    const game = createShellGame({
      isPaused: false,
    });

    render(<StrataGame game={game} />);

    expect(await screen.findByText('Adventure HUD')).toBeDefined();
    fireEvent.click(await screen.findByRole('button', { name: /Enter Frontier/i }));
    await waitFor(() => {
      expect(game.loadScene).toHaveBeenCalledWith('frontier', undefined);
    });
  });

  it('dismisses a persistent scene shell when requested', async () => {
    const game = createShellGame({
      isPaused: false,
    });

    render(<StrataGame game={game} />);

    expect(await screen.findByText('Frontier Reach')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Dismiss Briefing/i }));
    await waitFor(() => {
      expect(screen.queryByText('Frontier Reach')).toBeNull();
    });
  });

  it('routes persistence scene-shell actions through the live game runtime', async () => {
    const game = createShellGame({
      isPaused: false,
      shellActions: [
        {
          closeOnSuccess: true,
          label: 'Save Expedition',
          slot: 'camp',
          type: 'save-game',
          variant: 'primary',
        },
        {
          label: 'Load Expedition',
          slot: 'camp',
          type: 'load-game',
          variant: 'secondary',
        },
        {
          label: 'Delete Expedition',
          slot: 'camp',
          type: 'delete-save',
          variant: 'ghost',
        },
      ],
    });

    render(<StrataGame game={game} />);

    fireEvent.click(await screen.findByRole('button', { name: /Save Expedition/i }));
    await waitFor(() => {
      expect(game.save).toHaveBeenCalledWith('camp');
      expect(screen.queryByText('Frontier Reach')).toBeNull();
    });

    const loadGame = createShellGame({
      isPaused: false,
      listedSaveSlots: ['camp'],
      shellActions: [
        {
          label: 'Load Expedition',
          slot: 'camp',
          type: 'load-game',
          variant: 'secondary',
        },
      ],
    });

    render(<StrataGame game={loadGame} />);

    const loadButton = await screen.findByRole('button', { name: /Load Expedition/i });
    await waitFor(() => {
      expect(loadButton).toHaveProperty('disabled', false);
    });
    fireEvent.click(loadButton);
    await waitFor(() => {
      expect(loadGame.load).toHaveBeenCalledWith('camp');
    });

    const deleteGame = createShellGame({
      isPaused: false,
      listedSaveSlots: ['camp'],
      shellActions: [
        {
          label: 'Delete Expedition',
          slot: 'camp',
          type: 'delete-save',
          variant: 'ghost',
        },
      ],
    });

    render(<StrataGame game={deleteGame} />);

    const deleteButton = await screen.findByRole('button', { name: /Delete Expedition/i });
    await waitFor(() => {
      expect(deleteButton).toHaveProperty('disabled', false);
    });
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(deleteGame.deleteSave).toHaveBeenCalledWith('camp');
    });
  });

  it('renders archive slot state from the live runtime and disables unavailable slot actions', async () => {
    const game = createShellGame({
      isPaused: false,
      listedSaveSlots: ['camp'],
      saveInfoBySlot: {
        camp: {
          timestamp: Date.UTC(2026, 3, 15, 18, 30),
          version: 3,
        },
      },
      saveSlots: [
        {
          description: 'Manual expedition checkpoint.',
          label: 'Camp',
          slot: 'camp',
        },
        {
          label: 'Autosave',
          slot: 'autosave',
        },
      ],
      shellActions: [
        {
          label: 'Save Camp',
          slot: 'camp',
          type: 'save-game',
          variant: 'primary',
        },
        {
          label: 'Load Camp',
          slot: 'camp',
          type: 'load-game',
          variant: 'secondary',
        },
        {
          label: 'Delete Camp',
          slot: 'camp',
          type: 'delete-save',
          variant: 'ghost',
        },
        {
          label: 'Load Autosave',
          slot: 'autosave',
          type: 'load-game',
          variant: 'secondary',
        },
      ],
      shellVariant: 'archive',
    });

    render(<StrataGame game={game} />);

    expect(await screen.findByText('Camp')).toBeDefined();
    expect(await screen.findByText('Manual expedition checkpoint.')).toBeDefined();
    expect(screen.getByText('Saved')).toBeDefined();
    expect(screen.getByText('Saved 2026-04-15 18:30 UTC • v3')).toBeDefined();
    expect(screen.getByText('Empty')).toBeDefined();
    expect(screen.getByRole('button', { name: /Load Camp/i })).toHaveProperty('disabled', false);
    expect(screen.getByRole('button', { name: /Load Autosave/i })).toHaveProperty('disabled', true);
    expect(game.listSaves).toHaveBeenCalled();
    expect(game.getSaveInfo).toHaveBeenCalledWith('camp');
  });

  it('renders save-profile selector summaries from the live runtime', async () => {
    const game = createShellGame({
      activeProfileId: 'expedition',
      isPaused: false,
      listedSaveSlots: ['expedition:camp'],
      saveInfoBySlot: {
        'expedition:camp': {
          timestamp: Date.UTC(2026, 3, 15, 20, 45),
          version: 4,
        },
      },
      saveProfiles: [
        {
          description: 'Primary expedition progress and checkpoints.',
          id: 'expedition',
          label: 'Expedition',
          sceneId: 'profiles-expedition',
          slots: [
            {
              label: 'Camp',
              slot: 'camp',
              storageSlot: 'expedition:camp',
            },
            {
              label: 'Autosave',
              slot: 'autosave',
              storageSlot: 'expedition:autosave',
            },
          ],
        },
        {
          description: 'Hard-mode challenge runs.',
          id: 'challenge',
          label: 'Challenge',
          sceneId: 'challenge-archive',
          slots: [
            {
              label: 'Slot 1',
              slot: 'slot-1',
              storageSlot: 'challenge:slot-1',
            },
          ],
        },
      ],
      shellActions: [
        {
          emptySceneId: 'gameplay',
          label: 'Expedition',
          profileId: 'expedition',
          slots: ['expedition:camp', 'expedition:autosave'],
          type: 'load-latest-profile',
          variant: 'primary',
        },
        {
          label: 'Manage Expedition',
          sceneId: 'profiles-expedition',
          type: 'load-scene',
          variant: 'secondary',
        },
        {
          label: 'Clear Expedition',
          profileId: 'expedition',
          slots: ['expedition:camp', 'expedition:autosave'],
          type: 'clear-profile',
          variant: 'ghost',
        },
        {
          emptySceneId: 'gameplay',
          label: 'Challenge',
          profileId: 'challenge',
          slots: ['challenge:slot-1'],
          type: 'load-latest-profile',
          variant: 'secondary',
        },
        {
          label: 'Manage Challenge',
          sceneId: 'challenge-archive',
          type: 'load-scene',
          variant: 'secondary',
        },
        {
          label: 'Clear Challenge',
          profileId: 'challenge',
          slots: ['challenge:slot-1'],
          type: 'clear-profile',
          variant: 'ghost',
        },
        {
          label: 'Back to Menu',
          sceneId: 'menu',
          type: 'load-scene',
          variant: 'secondary',
        },
      ],
      shellVariant: 'profiles',
    });

    render(<StrataGame game={game} />);

    expect(await screen.findByText('Expedition')).toBeDefined();
    expect(screen.getAllByText('Current Profile').length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(screen.getByText('1 / 2 Saved')).toBeDefined();
    });
    expect(screen.getByText('Empty')).toBeDefined();
    expect(screen.getByText('Latest save: Saved 2026-04-15 20:45 UTC • v4')).toBeDefined();
    expect(screen.getByRole('button', { name: /Continue Expedition/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Start Challenge/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Manage Expedition/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Clear Expedition/i })).toHaveProperty(
      'disabled',
      false
    );
    expect(screen.getByRole('button', { name: /Clear Challenge/i })).toHaveProperty(
      'disabled',
      true
    );

    fireEvent.click(screen.getByRole('button', { name: /Continue Expedition/i }));
    await waitFor(() => {
      expect(game.load).toHaveBeenCalledWith('expedition:camp');
    });

    fireEvent.click(screen.getByRole('button', { name: /Clear Expedition/i }));
    await waitFor(() => {
      expect(game.deleteSave).toHaveBeenCalledWith('expedition:camp');
    });
    expect(game.deleteSave).not.toHaveBeenCalledWith('expedition:autosave');
    await waitFor(() => {
      expect(screen.getAllByText('Empty').length).toBeGreaterThanOrEqual(2);
    });
    expect(screen.queryByText('Latest save: Saved 2026-04-15 20:45 UTC • v4')).toBeNull();
    expect(screen.getByRole('button', { name: /Clear Expedition/i })).toHaveProperty(
      'disabled',
      true
    );

    fireEvent.click(screen.getByRole('button', { name: /Start Expedition/i }));
    await waitFor(() => {
      expect(game.loadScene).toHaveBeenCalledWith('gameplay', undefined);
    });
    expect(game.listSaves).toHaveBeenCalled();
    expect(game.getSaveInfo).toHaveBeenCalledWith('expedition:camp');
  });

  it('routes session save actions through the active profile archive with selector fallback', async () => {
    const activeProfileGame = createShellGame({
      activeProfileId: 'expedition',
      isPaused: false,
      shellActions: [
        {
          fallbackSceneId: 'profiles',
          label: 'Adventure Saves',
          profileSceneIds: {
            challenge: 'challenge-archive',
            expedition: 'profiles-expedition',
          },
          type: 'open-active-profile-archive',
          variant: 'secondary',
        },
      ],
      shellVariant: 'session',
    });

    const rendered = render(<StrataGame game={activeProfileGame} />);

    fireEvent.click(await screen.findByRole('button', { name: /Adventure Saves/i }));
    await waitFor(() => {
      expect(activeProfileGame.loadScene).toHaveBeenCalledWith('profiles-expedition', undefined);
    });

    rendered.unmount();

    const fallbackGame = createShellGame({
      isPaused: false,
      shellActions: [
        {
          fallbackSceneId: 'profiles',
          label: 'Adventure Saves',
          profileSceneIds: {
            challenge: 'challenge-archive',
            expedition: 'profiles-expedition',
          },
          type: 'open-active-profile-archive',
          variant: 'secondary',
        },
      ],
      shellVariant: 'session',
    });

    render(<StrataGame game={fallbackGame} />);

    fireEvent.click(await screen.findByRole('button', { name: /Adventure Saves/i }));
    await waitFor(() => {
      expect(fallbackGame.loadScene).toHaveBeenCalledWith('profiles', undefined);
    });
  });

  it('continues the active profile from generated shell actions and falls back when none is selected', async () => {
    const activeProfileGame = createShellGame({
      activeProfileId: 'expedition',
      isPaused: false,
      listedSaveSlots: ['expedition:camp'],
      saveInfoBySlot: {
        'expedition:camp': {
          timestamp: Date.UTC(2026, 3, 15, 20, 45),
          version: 4,
        },
      },
      shellActions: [
        {
          fallbackSceneId: 'profiles',
          label: 'Continue Adventure',
          profiles: {
            challenge: {
              emptySceneId: 'gameplay',
              slots: ['challenge:slot-1'],
            },
            expedition: {
              emptySceneId: 'gameplay',
              slots: ['expedition:camp', 'expedition:autosave'],
            },
          },
          type: 'load-active-profile',
          variant: 'primary',
        },
      ],
      shellVariant: 'title',
    });

    const rendered = render(<StrataGame game={activeProfileGame} />);

    fireEvent.click(await screen.findByRole('button', { name: /Continue Adventure/i }));
    await waitFor(() => {
      expect(activeProfileGame.load).toHaveBeenCalledWith('expedition:camp');
    });

    rendered.unmount();

    const fallbackGame = createShellGame({
      isPaused: false,
      shellActions: [
        {
          fallbackSceneId: 'profiles',
          label: 'Continue Adventure',
          profiles: {
            challenge: {
              emptySceneId: 'gameplay',
              slots: ['challenge:slot-1'],
            },
            expedition: {
              emptySceneId: 'gameplay',
              slots: ['expedition:camp', 'expedition:autosave'],
            },
          },
          type: 'load-active-profile',
          variant: 'primary',
        },
      ],
      shellVariant: 'title',
    });

    render(<StrataGame game={fallbackGame} />);

    fireEvent.click(await screen.findByRole('button', { name: /Continue Adventure/i }));
    await waitFor(() => {
      expect(fallbackGame.loadScene).toHaveBeenCalledWith('profiles', undefined);
    });
  });
});
