/**
 * Top-level React Three Fiber game component.
 *
 * StrataGame is the primary entry point for rendering a Strata game in React.
 * It wraps the R3F Canvas, initializes the game lifecycle, provides game context
 * to child components, and renders scene/mode content with UI overlays.
 *
 * @module StrataGame
 * @category Player Experience
 *
 * @example
 * ```tsx
 * import { StrataGame } from '@strata-game-library/r3f';
 *
 * <StrataGame game={myGame} loading={<LoadingScreen />}>
 *   <CustomOverlay />
 * </StrataGame>
 * ```
 */

import { Canvas, useThree } from '@react-three/fiber';
import type {
  Game,
  GameHUDDefinition,
  GameLoadingOverlayDefinition,
  GameSnapshot,
  GameTransitionOptions,
  InputEvent,
  InputManagerSnapshot,
  PauseMenuDefinition,
  SaveInfo,
  SceneShellActionDefinition,
  SceneShellDefinition,
} from '@strata-game-library/core';
import type React from 'react';
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { AudioListener } from './components/audio/AudioListener';
import { GameStateProvider } from './components/state/context';
import {
  BASE_PANEL_STYLE,
  formatActionLabel,
  formatBindingLabel,
} from './components/ui/game-ui-shared';
import { SceneCard } from './components/ui/SceneCard';

const GameContext = createContext<Game | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a StrataGame');
  return context;
};

export interface StrataGameProps {
  game: Game;
  loading?: React.ReactNode;
  error?: React.ComponentType<{ error: Error }>;
  children?: React.ReactNode;
  autoPause?: boolean;
  pauseAction?: string;
}

type SceneRenderable = {
  id: string;
  render: () => React.ReactNode;
  shell?: SceneShellDefinition;
  ui?: () => React.ReactNode;
};

type SceneManagerStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => {
    current: SceneRenderable | null;
    isLoading: boolean;
    loadProgress: number;
    pendingSceneId?: string;
  };
};

type ModeRenderable = {
  config: {
    id: string;
    inputMap: Game['definition']['modes'][string]['inputMap'];
    render?: (context: { instance: ModeRenderable }) => React.ReactNode;
    ui?: React.ComponentType<{ instance: ModeRenderable }>;
  };
};

type ModeManagerStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => {
    current: ModeRenderable | null;
  };
};

type TransitionSnapshot = {
  config: Game['transitionManager']['config'];
  isTransitioning: boolean;
  progress: number;
};

type TransitionManagerStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => TransitionSnapshot;
};

type GameRuntimeStore = {
  subscribe: (listener: (snapshot: GameSnapshot) => void) => () => void;
  getSnapshot: () => GameSnapshot;
};

type InputManagerStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => InputManagerSnapshot;
};

type BuiltInControlHint = {
  action: string;
  keyboard?: string[];
  gamepad?: string | number;
  tilt?: boolean;
};

type LoadingPhase = 'boot' | 'scene';

export function StrataGame({
  game,
  loading,
  error: ErrorComponent,
  children,
  autoPause = true,
  pauseAction = 'pause',
}: StrataGameProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [gameError, setError] = useState<Error | null>(null);

  useEffect(() => {
    game
      .start()
      .then(() => setStatus('ready'))
      .catch((e: Error) => {
        console.error('Failed to start game:', e);
        setError(e);
        setStatus('error');
      });

    return () => {
      game.stop();
    };
  }, [game]);

  if (status === 'loading') {
    return loading || <BootLoadingRenderer game={game} />;
  }
  if (status === 'error') {
    return ErrorComponent && gameError ? (
      <ErrorComponent error={gameError} />
    ) : (
      <div>Error: {gameError?.message}</div>
    );
  }

  return (
    <GameContext.Provider value={game}>
      <GameStateProvider store={game.store}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
          }}
        >
          <Canvas>
            <InputBinder game={game} />
            <PauseActionBinder action={pauseAction} enabled={autoPause} game={game} />
            <AudioListener />

            {/* Scene Rendering */}
            <SceneRenderer sceneManager={game.sceneManager} />

            {/* Mode Rendering */}
            <ModeRenderer modeManager={game.modeManager} />

            {children}
          </Canvas>

          {/* UI Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div style={{ pointerEvents: 'auto' }}>
              <SceneUI sceneManager={game.sceneManager} />
              <ModeUI modeManager={game.modeManager} />
              <SceneShellRenderer game={game} />
              <LoadingOverlayRenderer game={game} />
              <HudRenderer game={game} />
              <PauseMenuRenderer game={game} />
            </div>
            <TransitionOverlay transitionManager={game.transitionManager} />
          </div>
        </div>
      </GameStateProvider>
    </GameContext.Provider>
  );
}

function InputBinder({ game }: { game: Game }) {
  const { gl } = useThree();

  useEffect(() => {
    const element = gl.domElement as HTMLElement | undefined;
    if (!element) {
      return;
    }

    game.inputManager.attach(element);

    return () => {
      game.inputManager.detach();
    };
  }, [game, gl]);

  return null;
}

function PauseActionBinder({
  action,
  enabled,
  game,
}: {
  action: string;
  enabled: boolean;
  game: Game;
}) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handlePauseAction = (event: InputEvent) => {
      if (event.action !== action) {
        return;
      }

      if (game.isPaused) {
        game.resume();
        return;
      }

      game.pause();
    };

    game.inputManager.on('actionStart', handlePauseAction);

    return () => {
      game.inputManager.off('actionStart', handlePauseAction);
    };
  }, [action, enabled, game]);

  return null;
}

function useSceneManagerSnapshot(sceneManager: Game['sceneManager']) {
  const store = sceneManager as Game['sceneManager'] & SceneManagerStore;
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

function useModeManagerSnapshot(modeManager: Game['modeManager']) {
  const store = modeManager as Game['modeManager'] & ModeManagerStore;
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

function useTransitionManagerSnapshot(transitionManager: Game['transitionManager']) {
  const store = transitionManager as Game['transitionManager'] & TransitionManagerStore;
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

function useGameRuntimeSnapshot(game: Game) {
  const store = game as Game & GameRuntimeStore;
  return useSyncExternalStore(
    (listener) => store.subscribe(() => listener()),
    store.getSnapshot,
    store.getSnapshot
  );
}

function useInputRuntimeSnapshot(inputManager: Game['inputManager']) {
  const store = inputManager as Game['inputManager'] & InputManagerStore;
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

function getControlHints(mode: ModeRenderable | null): BuiltInControlHint[] {
  return Object.entries(mode?.config.inputMap ?? {}).map(([action, binding]) => ({
    action,
    ...binding,
    keyboard: binding.keyboard ? [...binding.keyboard] : undefined,
  }));
}

function resolveBuiltInHUDConfig(game: Game): GameHUDDefinition | undefined {
  const config = game.definition.ui?.shell?.hud;
  return config === false || !config ? undefined : config;
}

function resolveBuiltInLoadingOverlayConfig(game: Game): GameLoadingOverlayDefinition | undefined {
  const config = game.definition.ui?.shell?.loadingOverlay;
  return config === false || !config ? undefined : config;
}

function resolveBuiltInPauseMenuConfig(game: Game): PauseMenuDefinition | undefined {
  const config = game.definition.ui?.shell?.pauseMenu;
  return config === false || !config ? undefined : config;
}

function getSceneShellDefaultDuration(shell: SceneShellDefinition) {
  if (shell.durationMs !== undefined) {
    return shell.durationMs;
  }

  return shell.variant && shell.variant !== 'announcement' ? 0 : 3200;
}

function getSceneShellActionId(action: SceneShellActionDefinition, index: number) {
  return action.id ?? `${action.type}:${index}`;
}

function isPersistenceSceneShellAction(action: SceneShellActionDefinition) {
  return (
    action.type === 'save-game' ||
    action.type === 'load-game' ||
    action.type === 'delete-save' ||
    action.type === 'load-latest-profile' ||
    action.type === 'clear-profile'
  );
}

function shellUsesSaveRuntime(shell: SceneShellDefinition | undefined) {
  return Boolean(
    shell?.saveSlots?.length ||
      shell?.saveProfiles?.length ||
      shell?.actions?.some(isPersistenceSceneShellAction)
  );
}

async function getSceneShellSaveRuntime(game: Game) {
  const slots = [...(await game.listSaves())];
  const saveSlotInfo = Object.fromEntries(
    await Promise.all(slots.map(async (slot) => [slot, await game.getSaveInfo(slot)] as const))
  ) as Record<string, SaveInfo | null>;

  return {
    saveSlotInfo,
    slots,
  };
}

async function loadLatestProfile(
  game: Game,
  profileId: string,
  slots: string[],
  emptySceneId: string | undefined,
  transition: GameTransitionOptions | undefined
) {
  const existingSlots = new Set(await game.listSaves());
  const candidateSlots = slots.filter((slot) => existingSlots.has(slot));

  if (candidateSlots.length === 0) {
    if (!emptySceneId) {
      throw new Error(`No saves available for profile "${profileId}"`);
    }

    await game.loadScene(emptySceneId, transition);
    game.setActiveProfile(profileId);
    return;
  }

  const rankedSlots = await Promise.all(
    candidateSlots.map(async (slot) => ({
      saveInfo: await game.getSaveInfo(slot),
      slot,
    }))
  );
  const targetSlot = rankedSlots.reduce<(typeof rankedSlots)[number] | undefined>(
    (latest, candidate) => {
      if (!latest) {
        return candidate;
      }

      const latestTimestamp = latest.saveInfo?.timestamp ?? Number.NEGATIVE_INFINITY;
      const candidateTimestamp = candidate.saveInfo?.timestamp ?? Number.NEGATIVE_INFINITY;
      return candidateTimestamp > latestTimestamp ? candidate : latest;
    },
    undefined
  )?.slot;

  if (!targetSlot) {
    throw new Error(`No loadable saves available for profile "${profileId}"`);
  }

  const loaded = await game.load(targetSlot);
  if (!loaded) {
    throw new Error(`Failed to load latest save for profile "${profileId}"`);
  }
  game.setActiveProfile(profileId);
}

async function runSceneShellAction(game: Game, action: SceneShellActionDefinition) {
  switch (action.type) {
    case 'dismiss-shell':
      return;
    case 'load-scene':
      await game.loadScene(action.sceneId, action.transition);
      if (action.profileId !== undefined) {
        game.setActiveProfile(action.profileId);
      }
      return;
    case 'push-scene':
      await game.pushScene(action.sceneId, action.transition);
      return;
    case 'pop-scene':
      await game.popScene(action.transition);
      return;
    case 'push-mode':
      await game.pushMode(action.modeId, action.props, action.transition);
      return;
    case 'replace-mode':
      await game.replaceMode(action.modeId, action.props, action.transition);
      return;
    case 'pop-mode':
      await game.popMode(action.transition);
      return;
    case 'pause':
      game.pause();
      return;
    case 'resume':
      game.resume();
      return;
    case 'toggle-pause':
      if (game.isPaused) {
        game.resume();
        return;
      }

      game.pause();
      return;
    case 'save-game': {
      const saved = await game.save(action.slot);
      if (!saved) {
        throw new Error(`Failed to save game${action.slot ? ` to slot "${action.slot}"` : ''}`);
      }
      return;
    }
    case 'open-active-profile-archive': {
      const targetSceneId = game.activeProfileId
        ? action.profileSceneIds[game.activeProfileId]
        : undefined;
      const fallbackSceneId = action.fallbackSceneId;
      const sceneId = targetSceneId ?? fallbackSceneId;

      if (!sceneId) {
        throw new Error('No active profile archive is available for this scene-shell action');
      }

      await game.loadScene(sceneId, action.transition);
      return;
    }
    case 'load-active-profile': {
      const activeProfileId = game.activeProfileId;
      const profileTarget = activeProfileId ? action.profiles[activeProfileId] : undefined;

      if (!activeProfileId || !profileTarget) {
        if (!action.fallbackSceneId) {
          throw new Error('No active profile is available for this scene-shell action');
        }

        await game.loadScene(action.fallbackSceneId, action.transition);
        return;
      }

      await loadLatestProfile(
        game,
        activeProfileId,
        profileTarget.slots,
        profileTarget.emptySceneId,
        action.transition
      );
      return;
    }
    case 'load-game': {
      const loaded = await game.load(action.slot);
      if (!loaded) {
        throw new Error(`Failed to load game${action.slot ? ` from slot "${action.slot}"` : ''}`);
      }
      return;
    }
    case 'delete-save': {
      const deleted = await game.deleteSave(action.slot);
      if (!deleted) {
        throw new Error(`Failed to delete save slot "${action.slot}"`);
      }
      return;
    }
    case 'load-latest-profile': {
      await loadLatestProfile(
        game,
        action.profileId,
        action.slots,
        action.emptySceneId,
        action.transition
      );
      return;
    }
    case 'clear-profile': {
      const existingSlots = new Set(await game.listSaves());
      const slotsToDelete = action.slots.filter((slot) => existingSlots.has(slot));

      for (const slot of slotsToDelete) {
        const deleted = await game.deleteSave(slot);
        if (!deleted) {
          throw new Error(`Failed to delete save slot "${slot}" for profile "${action.profileId}"`);
        }
      }
      return;
    }
    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}

export function useScene() {
  const game = useGame();
  return useSceneManagerSnapshot(game.sceneManager).current;
}

export function useMode() {
  const game = useGame();
  return useModeManagerSnapshot(game.modeManager).current;
}

export function useTransition() {
  const game = useGame();
  return useTransitionManagerSnapshot(game.transitionManager);
}

export function useGameStatus() {
  const game = useGame();
  return useGameRuntimeSnapshot(game);
}

function SceneRenderer({ sceneManager }: { sceneManager: Game['sceneManager'] }) {
  const { current } = useSceneManagerSnapshot(sceneManager);

  if (!current) return null;
  return <>{current.render()}</>;
}

function SceneUI({ sceneManager }: { sceneManager: Game['sceneManager'] }) {
  const { current } = useSceneManagerSnapshot(sceneManager);

  if (!current || !current.ui) return null;
  return <>{current.ui()}</>;
}

function ModeRenderer({ modeManager }: { modeManager: Game['modeManager'] }) {
  const { current } = useModeManagerSnapshot(modeManager);

  if (!current || !current.config.render) return null;
  return <>{current.config.render({ instance: current })}</>;
}

function ModeUI({ modeManager }: { modeManager: Game['modeManager'] }) {
  const { current } = useModeManagerSnapshot(modeManager);

  if (!current || !current.config.ui) return null;
  const UIComponent = current.config.ui;
  return <UIComponent instance={current} />;
}

function SceneShellRenderer({ game }: { game: Game }) {
  const scene = useSceneManagerSnapshot(game.sceneManager);
  const { activeProfileId } = useGameRuntimeSnapshot(game);
  const [activeShell, setActiveShell] = useState<{
    sceneId: string;
    shell: SceneShellDefinition;
  } | null>(null);
  const [availableSaveSlots, setAvailableSaveSlots] = useState<string[]>([]);
  const [saveSlotInfo, setSaveSlotInfo] = useState<Record<string, SaveInfo | null>>({});
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  useEffect(() => {
    const current = scene.current;

    if (!current || scene.isLoading || !current.shell || current.shell.showOnEnter === false) {
      setActiveShell(null);
      setAvailableSaveSlots([]);
      setSaveSlotInfo({});
      setPendingActionId(null);
      return;
    }

    setActiveShell({
      sceneId: current.id,
      shell: current.shell,
    });
    setPendingActionId(null);
  }, [scene.current, scene.isLoading]);

  useEffect(() => {
    let cancelled = false;

    if (!activeShell || !shellUsesSaveRuntime(activeShell.shell)) {
      setAvailableSaveSlots([]);
      setSaveSlotInfo({});
      return () => {
        cancelled = true;
      };
    }

    void getSceneShellSaveRuntime(game)
      .then(({ saveSlotInfo: nextSaveSlotInfo, slots }) => {
        if (!cancelled) {
          setAvailableSaveSlots([...slots]);
          setSaveSlotInfo(nextSaveSlotInfo);
        }
      })
      .catch((error) => {
        console.error('Failed to list save slots for scene shell:', error);
        if (!cancelled) {
          setAvailableSaveSlots([]);
          setSaveSlotInfo({});
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeShell, game]);

  useEffect(() => {
    if (!activeShell) {
      return;
    }

    const durationMs = getSceneShellDefaultDuration(activeShell.shell);
    if (durationMs <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setActiveShell((current) => (current?.sceneId === activeShell.sceneId ? null : current));
    }, durationMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [activeShell]);

  const dismissShell = () => {
    setActiveShell(null);
    setAvailableSaveSlots([]);
    setSaveSlotInfo({});
    setPendingActionId(null);
  };

  const handleAction = async (action: SceneShellActionDefinition) => {
    const actionIndex = activeShell?.shell.actions?.indexOf(action) ?? -1;
    const actionId =
      actionIndex >= 0 ? getSceneShellActionId(action, actionIndex) : (action.id ?? action.type);

    setPendingActionId(actionId);

    try {
      await runSceneShellAction(game, action);

      if (
        isPersistenceSceneShellAction(action) &&
        activeShell &&
        shellUsesSaveRuntime(activeShell.shell)
      ) {
        try {
          const { saveSlotInfo: nextSaveSlotInfo, slots } = await getSceneShellSaveRuntime(game);
          setAvailableSaveSlots(slots);
          setSaveSlotInfo(nextSaveSlotInfo);
        } catch (error) {
          console.error('Failed to refresh save slots after scene shell action:', error);
        }
      }

      if (action.type === 'dismiss-shell' || action.closeOnSuccess) {
        dismissShell();
      }
    } catch (error) {
      console.error('Failed to execute scene shell action:', error);
    } finally {
      setPendingActionId((current) => (current === actionId ? null : current));
    }
  };

  if (!activeShell || scene.isLoading || scene.current?.id !== activeShell.sceneId) {
    return null;
  }

  return (
    <SceneCard
      {...activeShell.shell}
      activeProfileId={activeProfileId}
      availableSaveSlots={availableSaveSlots}
      onAction={handleAction}
      pendingActionId={pendingActionId}
      sceneId={activeShell.sceneId}
      saveSlotInfo={saveSlotInfo}
    />
  );
}

function BootLoadingRenderer({ game }: { game: Game }) {
  const config = resolveBuiltInLoadingOverlayConfig(game);

  if (!config) {
    return <div>Loading...</div>;
  }

  return <DefinitionDrivenLoadingOverlay config={config} game={game} phase="boot" />;
}

function LoadingOverlayRenderer({ game }: { game: Game }) {
  const scene = useSceneManagerSnapshot(game.sceneManager);
  const config = resolveBuiltInLoadingOverlayConfig(game);

  if (!scene.isLoading || !config) {
    return null;
  }

  return <DefinitionDrivenLoadingOverlay config={config} game={game} phase="scene" />;
}

function DefinitionDrivenLoadingOverlay({
  config,
  game,
  phase,
}: {
  config: GameLoadingOverlayDefinition;
  game: Game;
  phase: LoadingPhase;
}) {
  const scene = useSceneManagerSnapshot(game.sceneManager);
  const {
    bootDescription,
    bootLabel = 'BOOTING GAME',
    description,
    sceneDescription,
    sceneLabel = 'LOADING SCENE',
    showProgress = true,
    showScene = true,
    title = 'Loading',
  } = config;
  const progress = normalizeLoadingProgress(scene.loadProgress);
  const progressPercent = Math.round(progress * 100);
  const resolvedDescription =
    phase === 'boot'
      ? (bootDescription ??
        description ??
        'Initializing the game runtime and preparing the first playable scene.')
      : (sceneDescription ??
        description ??
        'Loading the next scene and restoring the surrounding game shell.');
  const sceneId = scene.pendingSceneId ?? scene.current?.id ?? game.definition.initialScene;
  const phaseLabel = phase === 'boot' ? bootLabel : sceneLabel;
  const progressLabel = phase === 'boot' ? 'Startup progress' : 'Load progress';
  const progressWidth = Math.max(progressPercent, phase === 'boot' ? 8 : 0);

  return (
    <div
      style={{
        alignItems: 'center',
        background:
          'radial-gradient(circle at top, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.82) 58%, rgba(2, 6, 23, 0.92))',
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        padding: 24,
        position: 'absolute',
      }}
    >
      <div
        style={{
          ...BASE_PANEL_STYLE,
          maxWidth: 500,
          padding: 24,
          width: '100%',
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: '0.14em', opacity: 0.72 }}>{phaseLabel}</div>
        <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 10, opacity: 0.88 }}>
          {resolvedDescription}
        </div>

        {showScene && sceneId && (
          <div
            style={{
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: 12,
              fontSize: 12,
              letterSpacing: '0.04em',
              marginTop: 16,
              padding: '10px 12px',
            }}
          >
            Scene: <strong>{sceneId}</strong>
          </div>
        )}

        {showProgress && (
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                fontSize: 12,
                justifyContent: 'space-between',
                opacity: 0.82,
              }}
            >
              <span>{progressLabel}</span>
              <span>{progressPercent}%</span>
            </div>
            <div
              style={{
                background: 'rgba(51, 65, 85, 0.58)',
                borderRadius: 999,
                height: 10,
                marginTop: 10,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #38bdf8, #22c55e)',
                  borderRadius: 999,
                  height: '100%',
                  transition: 'width 180ms ease',
                  width: `${progressWidth}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HudRenderer({ game }: { game: Game }) {
  const HudComponent = game.definition.ui?.hud as React.ComponentType | undefined;

  if (HudComponent) {
    return <HudComponent />;
  }

  const config = resolveBuiltInHUDConfig(game);
  if (!config) {
    return null;
  }

  return <DefinitionDrivenGameHUD config={config} game={game} />;
}

function DefinitionDrivenGameHUD({ config, game }: { config: GameHUDDefinition; game: Game }) {
  const mode = useModeManagerSnapshot(game.modeManager).current;
  const input = useInputRuntimeSnapshot(game.inputManager);
  const { activeProfileId, isPaused } = useGameRuntimeSnapshot(game);
  const {
    hintLimit = 6,
    showControls = true,
    showMode = true,
    showPressedActions = true,
    title = 'Game HUD',
  } = config;
  const hints = getControlHints(mode).slice(0, hintLimit);

  return (
    <div
      style={{
        ...BASE_PANEL_STYLE,
        bottom: 20,
        left: 20,
        maxWidth: 340,
        padding: 14,
        position: 'absolute',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: 12,
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', opacity: 0.7 }}>{title}</div>
          {showMode && (
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
              {mode?.config.id ?? 'No Active Mode'}
            </div>
          )}
        </div>
        <div
          style={{
            backgroundColor: isPaused ? 'rgba(248, 113, 113, 0.18)' : 'rgba(74, 222, 128, 0.14)',
            border: `1px solid ${isPaused ? 'rgba(248, 113, 113, 0.28)' : 'rgba(74, 222, 128, 0.24)'}`,
            borderRadius: 999,
            fontSize: 11,
            letterSpacing: '0.08em',
            padding: '6px 10px',
            textTransform: 'uppercase',
          }}
        >
          {isPaused ? 'Paused' : 'Live'}
        </div>
      </div>

      {showPressedActions && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.68 }}>
            Pressed Actions
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
            {input.activeActions.length > 0
              ? input.activeActions.map(formatActionLabel).join(', ')
              : 'None'}
          </div>
        </div>
      )}

      {activeProfileId && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.68 }}>
            Current Profile
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
            {formatActionLabel(activeProfileId)}
          </div>
        </div>
      )}

      {showControls && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.68 }}>Control Hints</div>
          <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
            {hints.map((hint) => (
              <div
                key={hint.action}
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  fontSize: 12,
                  gap: 12,
                  justifyContent: 'space-between',
                  opacity: input.activeActions.includes(hint.action) ? 1 : 0.82,
                }}
              >
                <strong style={{ fontWeight: 600 }}>{formatActionLabel(hint.action)}</strong>
                <span style={{ opacity: 0.86 }}>{formatBindingLabel(hint)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PauseMenuRenderer({ game }: { game: Game }) {
  const { isPaused } = useGameRuntimeSnapshot(game);
  const PauseMenu = game.definition.ui?.menus?.pause as React.ComponentType | undefined;

  if (!isPaused) {
    return null;
  }

  if (PauseMenu) {
    return <PauseMenu />;
  }

  const config = resolveBuiltInPauseMenuConfig(game);
  if (!config) {
    return null;
  }

  return <DefinitionDrivenPauseMenu config={config} game={game} />;
}

function DefinitionDrivenPauseMenu({ config, game }: { config: PauseMenuDefinition; game: Game }) {
  const mode = useModeManagerSnapshot(game.modeManager).current;
  const { activeProfileId } = useGameRuntimeSnapshot(game);
  const {
    description = 'Your current mode bindings stay visible while the game is paused.',
    hintLimit = 6,
    resumeLabel = 'Resume',
    showControls = true,
    showMode = true,
    title = 'Paused',
  } = config;
  const hints = getControlHints(mode).slice(0, hintLimit);

  return (
    <div
      style={{
        alignItems: 'center',
        background: 'rgba(2, 6, 23, 0.56)',
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        padding: 24,
        position: 'absolute',
      }}
    >
      <div
        style={{
          ...BASE_PANEL_STYLE,
          maxWidth: 460,
          padding: 22,
          width: '100%',
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: '0.14em', opacity: 0.72 }}>GAME MENU</div>
        <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{title}</div>
        {showMode && (
          <div style={{ fontSize: 13, marginTop: 10, opacity: 0.82 }}>
            Active mode: <strong>{mode?.config.id ?? 'none'}</strong>
          </div>
        )}
        {activeProfileId && (
          <div style={{ fontSize: 13, marginTop: 6, opacity: 0.82 }}>
            Current profile: <strong>{formatActionLabel(activeProfileId)}</strong>
          </div>
        )}
        <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 10, opacity: 0.88 }}>
          {description}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button
            onClick={() => game.resume()}
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              border: 'none',
              borderRadius: 12,
              color: '#082f49',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 700,
              padding: '12px 16px',
            }}
            type="button"
          >
            {resumeLabel}
          </button>
          <div
            style={{
              alignItems: 'center',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: 12,
              display: 'flex',
              fontSize: 12,
              opacity: 0.84,
              padding: '12px 14px',
            }}
          >
            {formatBindingLabel(mode?.config.inputMap.pause ?? {})} toggles pause
          </div>
        </div>

        {showControls && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.68 }}>
              Active Controls
            </div>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              {hints.map((hint) => (
                <div
                  key={hint.action}
                  style={{
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
                    display: 'flex',
                    fontSize: 12,
                    gap: 12,
                    justifyContent: 'space-between',
                    paddingBottom: 8,
                  }}
                >
                  <strong>{formatActionLabel(hint.action)}</strong>
                  <span style={{ opacity: 0.84 }}>{formatBindingLabel(hint)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function clampUnit(value: number) {
  return Math.max(0, Math.min(value, 1));
}

function normalizeLoadingProgress(progress: number) {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  if (progress > 1) {
    return clampUnit(progress / 100);
  }

  return clampUnit(progress);
}

function getTransitionCoverage(progress: number, reverse?: boolean) {
  const normalized = clampUnit(progress);
  return reverse ? 1 - normalized : normalized;
}

function getTransitionOverlayStyle(snapshot: TransitionSnapshot): React.CSSProperties | null {
  const config = snapshot.config;
  if (!config || config.type === 'none') {
    return null;
  }

  const coverage = getTransitionCoverage(snapshot.progress, config.reverse);
  if (!snapshot.isTransitioning && coverage <= 0) {
    return null;
  }

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundColor: config.color ?? '#000',
    zIndex: 20,
  };

  switch (config.type) {
    case 'crossfade':
      return {
        ...baseStyle,
        opacity: Math.min(coverage, 0.92),
        mixBlendMode: 'multiply',
      };
    case 'dissolve':
      return {
        ...baseStyle,
        opacity: coverage,
        backgroundImage:
          'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0 10%, transparent 11%), radial-gradient(circle at 70% 35%, rgba(255,255,255,0.16) 0 8%, transparent 9%), radial-gradient(circle at 40% 70%, rgba(255,255,255,0.12) 0 12%, transparent 13%)',
        backgroundSize: '28px 28px, 34px 34px, 42px 42px',
      };
    case 'wipe': {
      const reveal = `${100 - coverage * 100}%`;
      const direction = config.direction ?? 'right';
      const clipPath =
        direction === 'left'
          ? `inset(0 ${reveal} 0 0)`
          : direction === 'right'
            ? `inset(0 0 0 ${reveal})`
            : direction === 'up'
              ? `inset(${reveal} 0 0 0)`
              : `inset(0 0 ${reveal} 0)`;
      return {
        ...baseStyle,
        clipPath,
      };
    }
    case 'iris': {
      const [x = 0.5, y = 0.5] = config.center ?? [0.5, 0.5];
      return {
        ...baseStyle,
        clipPath: `circle(${coverage * 150}% at ${x * 100}% ${y * 100}%)`,
      };
    }
    default:
      return {
        ...baseStyle,
        opacity: coverage,
      };
  }
}

function TransitionOverlay({
  transitionManager,
}: {
  transitionManager: Game['transitionManager'];
}) {
  const snapshot = useTransitionManagerSnapshot(transitionManager);
  const style = getTransitionOverlayStyle(snapshot);

  if (!style) {
    return null;
  }

  return <div aria-hidden="true" style={style} />;
}
