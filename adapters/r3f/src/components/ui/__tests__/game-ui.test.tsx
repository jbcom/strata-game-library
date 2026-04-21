import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const runtime = {
  activeActions: ['moveForward'],
  activeProfileId: undefined as string | undefined,
  hints: [
    {
      action: 'moveForward',
      keyboard: ['w'],
    },
    {
      action: 'pause',
      keyboard: ['escape'],
    },
  ],
  isPaused: false,
  loadScene: vi.fn(),
  modeId: 'exploration',
  pause: vi.fn(),
  popMode: vi.fn(),
  popScene: vi.fn(),
  pushMode: vi.fn(),
  pushScene: vi.fn(),
  replaceMode: vi.fn(),
  resume: vi.fn(),
  sceneId: 'frontier',
};

vi.mock('../../../StrataGame', () => ({
  useGame: () => ({
    loadScene: runtime.loadScene,
    pause: runtime.pause,
    popMode: runtime.popMode,
    popScene: runtime.popScene,
    pushMode: runtime.pushMode,
    pushScene: runtime.pushScene,
    replaceMode: runtime.replaceMode,
    resume: runtime.resume,
  }),
  useMode: () => ({
    config: {
      id: runtime.modeId,
      inputMap: {
        pause: {
          keyboard: ['escape'],
        },
      },
    },
  }),
  useScene: () => ({
    id: runtime.sceneId,
  }),
}));

vi.mock('../../../hooks/useGameStatus', () => ({
  useGameStatus: () => ({
    activeProfileId: runtime.activeProfileId,
    isPaused: runtime.isPaused,
  }),
}));

vi.mock('../../../hooks/useInput', () => ({
  useControlHints: () => runtime.hints,
  useInput: () => ({
    activeActions: runtime.activeActions,
  }),
}));

import { createGameHUD, GameHUD } from '../GameHUD';
import { createPauseMenu, PauseMenu } from '../PauseMenu';
import { createSceneCard, SceneCard } from '../SceneCard';

describe('Game UI scaffolding', () => {
  beforeEach(() => {
    runtime.activeActions = ['moveForward'];
    runtime.activeProfileId = undefined;
    runtime.isPaused = false;
    runtime.modeId = 'exploration';
    runtime.sceneId = 'frontier';
    runtime.hints = [
      {
        action: 'moveForward',
        keyboard: ['w'],
      },
      {
        action: 'pause',
        keyboard: ['escape'],
      },
    ];
    runtime.loadScene.mockReset();
    runtime.pause.mockReset();
    runtime.popMode.mockReset();
    runtime.popScene.mockReset();
    runtime.pushMode.mockReset();
    runtime.pushScene.mockReset();
    runtime.replaceMode.mockReset();
    runtime.resume.mockReset();
  });

  it('renders a game HUD with mode and control hints', () => {
    runtime.activeProfileId = 'expedition';

    render(<GameHUD title="Field HUD" />);

    expect(screen.getByText('Field HUD')).toBeDefined();
    expect(screen.getByText('exploration')).toBeDefined();
    expect(screen.getAllByText('Current Profile').length).toBeGreaterThan(0);
    expect(screen.getByText('Expedition')).toBeDefined();
    expect(screen.getAllByText('Move Forward')).toHaveLength(2);
    expect(screen.getByText('W')).toBeDefined();
  });

  it('renders a pause menu overlay and resumes when requested', () => {
    runtime.activeProfileId = 'expedition';
    runtime.isPaused = true;

    render(<PauseMenu title="Expedition Paused" />);

    expect(screen.getByText('Expedition Paused')).toBeDefined();
    expect(screen.getByText('Current profile:')).toBeDefined();
    expect(screen.getByText('Expedition')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(runtime.resume).toHaveBeenCalledOnce();
  });

  it('creates renderable preset components', () => {
    runtime.isPaused = true;
    const PresetHUD = createGameHUD({ title: 'Ops HUD' });
    const PresetPauseMenu = createPauseMenu({ title: 'Hold Position' });
    const PresetSceneCard = createSceneCard({ title: 'Arrival', subtitle: 'SCENE READY' });

    const { rerender } = render(<PresetHUD />);
    expect(screen.getByText('Ops HUD')).toBeDefined();

    rerender(<PresetPauseMenu />);
    expect(screen.getByText('Hold Position')).toBeDefined();

    rerender(<PresetSceneCard />);
    expect(screen.getByText('Arrival')).toBeDefined();
  });

  it('renders a scene card scaffold', () => {
    render(
      <SceneCard
        description="The world is now active."
        sceneId="frontier"
        showSceneId
        title="Frontier Reach"
      />
    );

    expect(screen.getByText('Frontier Reach')).toBeDefined();
    expect(screen.getByText('The world is now active.')).toBeDefined();
    expect(screen.getByText('frontier')).toBeDefined();
  });

  it('renders interactive scene shell actions', () => {
    const handleAction = vi.fn();

    render(
      <SceneCard
        actions={[
          {
            description: 'Load the arena scene using the live game runtime.',
            label: 'Enter Arena',
            sceneId: 'arena',
            type: 'load-scene',
            variant: 'primary',
          },
        ]}
        onAction={handleAction}
        pendingActionId={null}
        title="Expedition Hub"
        variant="menu"
      />
    );

    expect(screen.getByText('SCENE MENU')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Enter Arena/i }));
    expect(handleAction).toHaveBeenCalledOnce();
    expect(handleAction.mock.calls[0]?.[0]).toMatchObject({
      sceneId: 'arena',
      type: 'load-scene',
    });
  });

  it('renders archive scene cards with slot state and disables unavailable actions', () => {
    const handleAction = vi.fn();

    render(
      <SceneCard
        actions={[
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
            label: 'Save Autosave',
            slot: 'autosave',
            type: 'save-game',
            variant: 'primary',
          },
          {
            label: 'Load Autosave',
            slot: 'autosave',
            type: 'load-game',
            variant: 'secondary',
          },
        ]}
        availableSaveSlots={['camp']}
        onAction={handleAction}
        pendingActionId={null}
        saveSlots={[
          {
            description: 'Manual expedition checkpoint.',
            label: 'Camp',
            slot: 'camp',
          },
          {
            label: 'Autosave',
            slot: 'autosave',
          },
        ]}
        title="Save Archive"
        variant="archive"
      />
    );

    expect(screen.getByText('SAVE ARCHIVE')).toBeDefined();
    expect(screen.getByText('Camp')).toBeDefined();
    expect(screen.getByText('Manual expedition checkpoint.')).toBeDefined();
    expect(screen.getByText('Saved')).toBeDefined();
    expect(screen.getByText('Empty')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Load Camp/i }));
    expect(handleAction).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: /Load Autosave/i })).toHaveProperty('disabled', true);
  });

  it('respects slot-level archive capabilities and custom status labels', () => {
    render(
      <SceneCard
        actions={[
          {
            label: 'Save Autosave',
            slot: 'autosave',
            type: 'save-game',
            variant: 'primary',
          },
          {
            label: 'Load Autosave',
            slot: 'autosave',
            type: 'load-game',
            variant: 'secondary',
          },
          {
            label: 'Save Locked Slot',
            slot: 'locked',
            type: 'save-game',
            variant: 'primary',
          },
          {
            label: 'Delete Locked Slot',
            slot: 'locked',
            type: 'delete-save',
            variant: 'ghost',
          },
        ]}
        availableSaveSlots={['autosave']}
        onAction={vi.fn()}
        pendingActionId={null}
        saveSlotInfo={{
          autosave: {
            timestamp: Date.UTC(2026, 3, 15, 18, 30),
            version: 3,
          },
        }}
        saveSlots={[
          {
            allowDelete: false,
            emptyLabel: 'Ready',
            label: 'Autosave',
            savedLabel: 'Synced',
            slot: 'autosave',
          },
          {
            allowLoad: false,
            allowSave: false,
            emptyLabel: 'Locked',
            label: 'Locked Slot',
            slot: 'locked',
          },
        ]}
        title="Profile Archive"
        variant="archive"
      />
    );

    expect(screen.getByText('Synced')).toBeDefined();
    expect(screen.getByText('Saved 2026-04-15 18:30 UTC • v3')).toBeDefined();
    expect(screen.getByText('Locked')).toBeDefined();
    expect(screen.getByRole('button', { name: /Save Autosave/i })).toHaveProperty(
      'disabled',
      false
    );
    expect(screen.getByRole('button', { name: /Save Locked Slot/i })).toHaveProperty(
      'disabled',
      true
    );
    expect(screen.getByRole('button', { name: /Delete Locked Slot/i })).toHaveProperty(
      'disabled',
      true
    );
  });

  it('renders save-profile selector cards with live occupancy summaries', () => {
    const handleAction = vi.fn();

    render(
      <SceneCard
        actions={[
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
        ]}
        activeProfileId="expedition"
        availableSaveSlots={['expedition:camp', 'expedition:autosave']}
        onAction={handleAction}
        pendingActionId={null}
        saveSlotInfo={{
          'expedition:autosave': {
            timestamp: Date.UTC(2026, 3, 15, 20, 45),
            version: 4,
          },
        }}
        saveProfiles={[
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
        ]}
        title="Save Profiles"
        variant="profiles"
      />
    );

    expect(screen.getByText('SAVE PROFILES')).toBeDefined();
    expect(screen.getByText('Current Profile')).toBeDefined();
    expect(screen.getByText('2 / 2 Saved')).toBeDefined();
    expect(screen.getByText('Empty')).toBeDefined();
    expect(screen.getByText('Slots: Camp • Autosave')).toBeDefined();
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
    const expeditionHeading = screen.getAllByText('Expedition')[0];
    const challengeHeading = screen.getAllByText('Challenge')[0];
    expect(
      Boolean(
        expeditionHeading.compareDocumentPosition(challengeHeading) &
          Node.DOCUMENT_POSITION_FOLLOWING
      )
    ).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /Continue Expedition/i }));
    expect(handleAction).toHaveBeenCalledOnce();
    expect(handleAction.mock.calls[0]?.[0]).toMatchObject({
      emptySceneId: 'gameplay',
      profileId: 'expedition',
      slots: ['expedition:camp', 'expedition:autosave'],
      type: 'load-latest-profile',
    });
    fireEvent.click(screen.getByRole('button', { name: /Clear Expedition/i }));
    expect(handleAction).toHaveBeenCalledTimes(2);
    expect(handleAction.mock.calls[1]?.[0]).toMatchObject({
      profileId: 'expedition',
      slots: ['expedition:camp', 'expedition:autosave'],
      type: 'clear-profile',
    });
    expect(screen.getByRole('button', { name: /Back to Menu/i })).toBeDefined();
  });
});
