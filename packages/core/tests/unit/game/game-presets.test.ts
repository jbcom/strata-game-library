import { describe, expect, it } from 'vitest';
import {
  createPlatformerGame,
  createPuzzleGame,
  createRacingGame,
  createRPGGame,
  createSandboxGame,
} from '../../../src/game/game-presets';

describe('game presets', () => {
  it('creates an RPG game with default scenes, modes, and state preset', () => {
    const game = createRPGGame();

    expect(game.definition.name).toBe('Untitled RPG Game');
    expect(game.definition.version).toBe('0.1.0');
    expect(game.definition.statePreset).toBe('rpg');
    expect(game.definition.initialScene).toBe('gameplay');
    expect(game.definition.defaultMode).toBe('exploration');
    expect(game.modeManager.hasMode('combat')).toBe(true);
    expect(game.sceneManager.current).toBeNull();
    expect(game.store.getState().data.currentRegion).toBe('start');
    expect(game.definition.transitions?.scenes?.load?.transition).toMatchObject({
      type: 'fade',
      duration: 0.35,
    });
    expect(game.definition.scenes.gameplay.shell).toMatchObject({
      title: 'Adventure Begins',
      subtitle: 'ADVENTURE ZONE',
      variant: 'announcement',
    });
    expect(game.definition.ui?.shell?.hud).toMatchObject({
      title: 'Adventure HUD',
    });
    expect(game.definition.ui?.shell?.loadingOverlay).toMatchObject({
      title: 'Preparing Adventure',
      bootLabel: 'BOOTING ADVENTURE',
    });
    expect(game.definition.ui?.shell?.pauseMenu).toMatchObject({
      title: 'Adventure Paused',
    });
    expect(game.definition.modes.exploration.inputMap.moveForward.keyboard).toContain('w');
    expect(game.definition.modes.exploration.inputMap.interact.gamepad).toBe('west');
    expect(game.definition.modes.combat.inputMap.attack.keyboard).toContain('f');
  });

  it('creates a platformer helper on top of the action preset', () => {
    const game = createPlatformerGame({
      initialState: {
        level: 2,
        player: {
          score: 1200,
        },
      },
    });

    expect(game.definition.statePreset).toBe('action');
    expect(game.definition.initialScene).toBe('level1');
    expect(game.definition.defaultMode).toBe('platforming');
    expect(game.store.getState().data.level).toBe(2);
    expect(game.store.getState().data.player.score).toBe(1200);
    expect(game.store.getState().data.player.lives).toBe(3);
    expect(game.definition.transitions?.scenes?.load?.transition).toMatchObject({
      type: 'wipe',
      direction: 'right',
    });
  });

  it('infers initial scene and default mode from custom records when template defaults are absent', () => {
    const game = createRacingGame({
      modes: {
        qualify: {
          systems: [],
        },
      },
      scenes: {
        qualifier: {
          render: () => null,
        },
      },
    });

    expect(game.definition.initialScene).toBe('qualifier');
    expect(game.definition.defaultMode).toBe('qualify');
    expect(game.definition.statePreset).toBe('racing');
    expect(game.modeManager.hasMode('race')).toBe(false);
  });

  it('merges sandbox defaults with custom metadata', () => {
    const game = createSandboxGame({
      initialState: {
        worldName: 'River Delta',
        weather: 'fog',
      },
      name: 'Riverbox',
      version: '2.0.0',
    });

    expect(game.definition.name).toBe('Riverbox');
    expect(game.definition.version).toBe('2.0.0');
    expect(game.store.getState().data.worldName).toBe('River Delta');
    expect(game.store.getState().data.weather).toBe('fog');
    expect(game.store.getState().data.playerPosition.y).toBe(1);
    expect(game.definition.transitions?.scenes?.load?.transition).toMatchObject({
      type: 'dissolve',
    });
  });

  it('deep-merges transition defaults with preset overrides', () => {
    const game = createRPGGame({
      transitions: {
        modes: {
          push: {
            transition: {
              type: 'fade',
              duration: 0.12,
              color: '#111',
            },
          },
        },
      },
    });

    expect(game.definition.transitions?.scenes?.load?.transition).toMatchObject({
      type: 'fade',
      duration: 0.35,
    });
    expect(game.definition.transitions?.modes?.replace?.transition).toMatchObject({
      type: 'crossfade',
      duration: 0.18,
    });
    expect(game.definition.transitions?.modes?.push?.transition).toMatchObject({
      type: 'fade',
      duration: 0.12,
      color: '#111',
    });
  });

  it('preserves preset mode defaults when overriding matching keys partially', () => {
    const game = createRPGGame({
      modes: {
        exploration: {
          systems: [],
        },
      },
    });

    expect(game.modeManager.hasMode('combat')).toBe(true);
    expect(game.modeManager.hasMode('dialogue')).toBe(true);
    expect(game.definition.modes.exploration.inputMap.moveForward.keyboard).toContain('w');
    expect(game.definition.modes.exploration.inputMap.pause.keyboard).toContain('escape');
  });

  it('deep-merges action bindings when overriding a preset control', () => {
    const game = createPlatformerGame({
      modes: {
        platforming: {
          inputMap: {
            jump: {
              keyboard: ['x'],
            },
          },
        },
      },
    });

    expect(game.definition.modes.platforming.inputMap.jump.keyboard).toEqual(['x']);
    expect(game.definition.modes.platforming.inputMap.jump.gamepad).toBe('south');
    expect(game.definition.modes.platforming.inputMap.moveLeft.keyboard).toContain('a');
  });

  it('merges built-in game-shell defaults and allows targeted overrides', () => {
    const game = createRPGGame({
      ui: {
        shell: {
          hud: {
            title: 'Quest HUD',
          },
          loadingOverlay: {
            sceneLabel: 'FAST TRAVEL',
          },
          pauseMenu: false,
        },
      },
      scenes: {
        gameplay: {
          shell: {
            title: 'Trailhead',
          },
        },
      },
    });

    expect(game.definition.scenes.gameplay.shell).toMatchObject({
      title: 'Trailhead',
      subtitle: 'ADVENTURE ZONE',
      variant: 'announcement',
    });
    expect(game.definition.ui?.shell?.hud).toMatchObject({
      title: 'Quest HUD',
    });
    expect(game.definition.ui?.shell?.loadingOverlay).toMatchObject({
      title: 'Preparing Adventure',
      sceneLabel: 'FAST TRAVEL',
    });
    expect(game.definition.ui?.shell?.pauseMenu).toBe(false);
  });

  it('can synthesize a title scene in front of the preset gameplay flow', () => {
    const game = createRPGGame({
      titleScene: true,
    });

    expect(game.definition.initialScene).toBe('title');
    expect(game.definition.scenes.title.shell).toMatchObject({
      subtitle: 'ADVENTURE READY',
      title: 'Untitled RPG Game',
      variant: 'title',
    });
    expect(game.definition.scenes.title.shell?.actions).toMatchObject([
      {
        label: 'Begin Adventure',
        sceneId: 'gameplay',
        type: 'load-scene',
        variant: 'primary',
      },
    ]);
  });

  it('can synthesize a menu scene and wire it into the generated title flow', () => {
    const game = createRPGGame({
      menuScene: true,
      titleScene: true,
    });

    expect(game.definition.initialScene).toBe('title');
    expect(game.definition.scenes.title.shell?.actions).toMatchObject([
      {
        label: 'Begin Adventure',
        sceneId: 'gameplay',
        type: 'load-scene',
        variant: 'primary',
      },
      {
        label: 'Adventure Menu',
        sceneId: 'menu',
        type: 'load-scene',
        variant: 'secondary',
      },
    ]);
    expect(game.definition.scenes.menu.shell).toMatchObject({
      subtitle: 'JOURNEY MENU',
      title: 'Adventure Menu',
      variant: 'menu',
    });
    expect(game.definition.scenes.menu.shell?.actions).toMatchObject([
      {
        label: 'Resume Adventure',
        sceneId: 'gameplay',
        type: 'load-scene',
        variant: 'primary',
      },
      {
        label: 'Back to Hub',
        sceneId: 'title',
        type: 'load-scene',
        variant: 'secondary',
      },
    ]);
  });

  it('can boot into a generated menu scene when no title scene is requested', () => {
    const game = createSandboxGame({
      menuScene: true,
    });

    expect(game.definition.initialScene).toBe('menu');
    expect(game.definition.scenes.menu.shell).toMatchObject({
      subtitle: 'WORLD MENU',
      title: 'Sandbox Menu',
      variant: 'menu',
    });
    expect(game.definition.scenes.menu.shell?.actions).toMatchObject([
      {
        label: 'Enter World',
        sceneId: 'world',
        type: 'load-scene',
        variant: 'primary',
      },
    ]);
  });

  it('can decorate the resolved gameplay scene with a generated session shell', () => {
    const game = createRPGGame({
      menuScene: true,
      sessionShell: true,
      titleScene: true,
    });

    expect(game.definition.scenes.gameplay.shell).toMatchObject({
      subtitle: 'ADVENTURE LIVE',
      title: 'Adventure Live',
      variant: 'session',
    });
    expect(game.definition.scenes.gameplay.shell?.actions).toMatchObject([
      {
        label: 'Adventure Menu',
        sceneId: 'menu',
        type: 'load-scene',
        variant: 'secondary',
      },
      {
        label: 'Return to Hub',
        sceneId: 'title',
        type: 'load-scene',
        variant: 'secondary',
      },
      {
        label: 'Pause Adventure',
        type: 'toggle-pause',
        variant: 'ghost',
      },
    ]);
  });

  it('can synthesize a generated settings scene and wire it into title/menu/session flows', () => {
    const game = createRPGGame({
      menuScene: true,
      settingsScene: true,
      sessionShell: true,
      titleScene: true,
    });

    expect(game.definition.scenes.title.shell?.actions).toMatchObject([
      {
        label: 'Begin Adventure',
        sceneId: 'gameplay',
        type: 'load-scene',
      },
      {
        label: 'Adventure Menu',
        sceneId: 'menu',
        type: 'load-scene',
      },
      {
        label: 'Adventure Settings',
        sceneId: 'settings',
        type: 'load-scene',
      },
    ]);
    expect(game.definition.scenes.menu.shell?.actions).toMatchObject([
      {
        label: 'Resume Adventure',
        sceneId: 'gameplay',
        type: 'load-scene',
      },
      {
        label: 'Adventure Settings',
        sceneId: 'settings',
        type: 'load-scene',
      },
      {
        label: 'Back to Hub',
        sceneId: 'title',
        type: 'load-scene',
      },
    ]);
    expect(game.definition.scenes.settings.shell).toMatchObject({
      subtitle: 'JOURNEY SETTINGS',
      title: 'Adventure Settings',
      variant: 'menu',
    });
    expect(game.definition.scenes.settings.shell?.actions).toMatchObject([
      {
        label: 'Back to Menu',
        sceneId: 'menu',
        type: 'load-scene',
      },
    ]);
    expect(game.definition.scenes.gameplay.shell?.actions).toMatchObject([
      {
        label: 'Adventure Menu',
        sceneId: 'menu',
        type: 'load-scene',
      },
      {
        label: 'Return to Hub',
        sceneId: 'title',
        type: 'load-scene',
      },
      {
        label: 'Adventure Settings',
        sceneId: 'settings',
        type: 'load-scene',
      },
      {
        label: 'Pause Adventure',
        type: 'toggle-pause',
      },
    ]);
  });

  it('can synthesize a generated save scene and wire it into title/menu/settings/session flows', () => {
    const game = createRPGGame({
      menuScene: true,
      saveScene: {
        slots: ['camp', 'autosave'],
      },
      settingsScene: true,
      sessionShell: true,
      titleScene: true,
    });

    expect(game.definition.scenes.title.shell?.actions).toMatchObject([
      {
        label: 'Begin Adventure',
        sceneId: 'gameplay',
        type: 'load-scene',
      },
      {
        label: 'Adventure Menu',
        sceneId: 'menu',
        type: 'load-scene',
      },
      {
        label: 'Adventure Settings',
        sceneId: 'settings',
        type: 'load-scene',
      },
      {
        label: 'Adventure Saves',
        sceneId: 'saves',
        type: 'load-scene',
      },
    ]);
    expect(game.definition.scenes.menu.shell?.actions).toMatchObject([
      {
        label: 'Resume Adventure',
        sceneId: 'gameplay',
        type: 'load-scene',
      },
      {
        label: 'Adventure Settings',
        sceneId: 'settings',
        type: 'load-scene',
      },
      {
        label: 'Adventure Saves',
        sceneId: 'saves',
        type: 'load-scene',
      },
      {
        label: 'Back to Hub',
        sceneId: 'title',
        type: 'load-scene',
      },
    ]);
    expect(game.definition.scenes.settings.shell?.actions).toMatchObject([
      {
        label: 'Adventure Saves',
        sceneId: 'saves',
        type: 'load-scene',
      },
      {
        label: 'Back to Menu',
        sceneId: 'menu',
        type: 'load-scene',
      },
    ]);
    expect(game.definition.scenes.saves.shell).toMatchObject({
      saveSlots: [
        { label: 'Camp', slot: 'camp' },
        { label: 'Autosave', slot: 'autosave' },
      ],
      subtitle: 'SAVE ARCHIVE',
      title: 'Adventure Saves',
      variant: 'archive',
    });
    expect(game.definition.scenes.saves.shell?.actions).toMatchObject([
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
      {
        label: 'Delete Autosave',
        slot: 'autosave',
        type: 'delete-save',
        variant: 'ghost',
      },
      {
        label: 'Back to Settings',
        sceneId: 'settings',
        type: 'load-scene',
        variant: 'secondary',
      },
    ]);
    expect(game.definition.scenes.gameplay.shell?.actions).toMatchObject([
      {
        label: 'Adventure Menu',
        sceneId: 'menu',
        type: 'load-scene',
      },
      {
        label: 'Return to Hub',
        sceneId: 'title',
        type: 'load-scene',
      },
      {
        label: 'Adventure Settings',
        sceneId: 'settings',
        type: 'load-scene',
      },
      {
        label: 'Adventure Saves',
        sceneId: 'saves',
        type: 'load-scene',
      },
      {
        label: 'Pause Adventure',
        type: 'toggle-pause',
      },
    ]);
  });

  it('can synthesize a generated save-profile selector and per-profile archives', () => {
    const game = createRPGGame({
      menuScene: true,
      saveScene: {
        profileSelector: {
          shell: {
            description: 'Pick a profile archive before you manage save slots.',
            title: 'Adventure Profiles',
          },
        },
        profiles: [
          {
            description: 'Primary campaign progress.',
            id: 'campaign',
            label: 'Campaign',
            slots: ['camp', 'autosave'],
          },
          {
            description: 'High-risk challenge runs.',
            id: 'challenge',
            sceneId: 'challenge-archive',
            slots: ['slot-1'],
          },
        ],
        sceneId: 'profiles',
      },
      settingsScene: true,
      sessionShell: true,
      titleScene: true,
    });

    expect(game.definition.scenes.title.shell?.actions).toContainEqual(
      expect.objectContaining({
        fallbackSceneId: 'profiles',
        label: 'Resume Adventure',
        profiles: {
          campaign: {
            emptySceneId: 'gameplay',
            slots: ['campaign:camp', 'campaign:autosave'],
          },
          challenge: {
            emptySceneId: 'gameplay',
            slots: ['challenge:slot-1'],
          },
        },
        type: 'load-active-profile',
      })
    );
    expect(game.definition.scenes.title.shell?.actions).toContainEqual(
      expect.objectContaining({
        label: 'Adventure Saves',
        fallbackSceneId: 'profiles',
        profileSceneIds: {
          campaign: 'profiles-campaign',
          challenge: 'challenge-archive',
        },
        type: 'open-active-profile-archive',
      })
    );
    expect(game.definition.scenes.menu.shell?.actions).toContainEqual(
      expect.objectContaining({
        fallbackSceneId: 'gameplay',
        label: 'Resume Adventure',
        profiles: {
          campaign: {
            emptySceneId: 'gameplay',
            slots: ['campaign:camp', 'campaign:autosave'],
          },
          challenge: {
            emptySceneId: 'gameplay',
            slots: ['challenge:slot-1'],
          },
        },
        type: 'load-active-profile',
      })
    );
    expect(game.definition.scenes.menu.shell?.actions).toContainEqual(
      expect.objectContaining({
        label: 'Adventure Saves',
        fallbackSceneId: 'profiles',
        profileSceneIds: {
          campaign: 'profiles-campaign',
          challenge: 'challenge-archive',
        },
        type: 'open-active-profile-archive',
      })
    );
    expect(game.definition.scenes.settings.shell?.actions).toContainEqual(
      expect.objectContaining({
        label: 'Adventure Saves',
        fallbackSceneId: 'profiles',
        profileSceneIds: {
          campaign: 'profiles-campaign',
          challenge: 'challenge-archive',
        },
        type: 'open-active-profile-archive',
      })
    );
    expect(game.definition.scenes.gameplay.shell?.actions).toContainEqual(
      expect.objectContaining({
        label: 'Adventure Saves',
        fallbackSceneId: 'profiles',
        profileSceneIds: {
          campaign: 'profiles-campaign',
          challenge: 'challenge-archive',
        },
        type: 'open-active-profile-archive',
      })
    );
    expect(game.definition.scenes.profiles.shell).toMatchObject({
      description: 'Pick a profile archive before you manage save slots.',
      saveProfiles: [
        {
          description: 'Primary campaign progress.',
          id: 'campaign',
          label: 'Campaign',
          sceneId: 'profiles-campaign',
          slots: [
            { label: 'Camp', slot: 'camp', storageSlot: 'campaign:camp' },
            { label: 'Autosave', slot: 'autosave', storageSlot: 'campaign:autosave' },
          ],
        },
        {
          description: 'High-risk challenge runs.',
          id: 'challenge',
          label: 'Challenge',
          sceneId: 'challenge-archive',
          slots: [{ label: 'Slot 1', slot: 'slot-1', storageSlot: 'challenge:slot-1' }],
        },
      ],
      subtitle: 'SAVE PROFILES',
      title: 'Adventure Profiles',
      variant: 'profiles',
    });
    expect(game.definition.scenes.profiles.shell?.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: 'Primary campaign progress.',
          emptySceneId: 'gameplay',
          label: 'Campaign',
          profileId: 'campaign',
          slots: ['campaign:camp', 'campaign:autosave'],
          type: 'load-latest-profile',
        }),
        expect.objectContaining({
          label: 'Manage Campaign',
          profileId: 'campaign',
          sceneId: 'profiles-campaign',
          type: 'load-scene',
        }),
        expect.objectContaining({
          label: 'Reset Campaign',
          profileId: 'campaign',
          slots: ['campaign:camp', 'campaign:autosave'],
          type: 'clear-profile',
        }),
        expect.objectContaining({
          description: 'High-risk challenge runs.',
          emptySceneId: 'gameplay',
          label: 'Challenge',
          profileId: 'challenge',
          slots: ['challenge:slot-1'],
          type: 'load-latest-profile',
        }),
        expect.objectContaining({
          label: 'Manage Challenge',
          profileId: 'challenge',
          sceneId: 'challenge-archive',
          type: 'load-scene',
        }),
        expect.objectContaining({
          label: 'Reset Challenge',
          profileId: 'challenge',
          slots: ['challenge:slot-1'],
          type: 'clear-profile',
        }),
        expect.objectContaining({
          label: 'Back to Settings',
          sceneId: 'settings',
          type: 'load-scene',
        }),
      ])
    );
    expect(game.definition.scenes['profiles-campaign'].shell).toMatchObject({
      saveSlots: [
        { label: 'Camp', slot: 'camp', storageSlot: 'campaign:camp' },
        { label: 'Autosave', slot: 'autosave', storageSlot: 'campaign:autosave' },
      ],
      title: 'Campaign Saves',
      variant: 'archive',
    });
    expect(game.definition.scenes['challenge-archive'].shell).toMatchObject({
      description: 'High-risk challenge runs.',
      saveSlots: [{ label: 'Slot 1', slot: 'slot-1', storageSlot: 'challenge:slot-1' }],
      title: 'Challenge Saves',
      variant: 'archive',
    });
  });

  it('allows custom title-scene ids, labels, and targets without breaking explicit initial scenes', () => {
    const game = createSandboxGame({
      initialScene: 'world',
      titleScene: {
        action: {
          description: 'Load the creative world shell.',
          label: 'Enter World',
        },
        sceneId: 'hub',
        shell: {
          subtitle: 'SANDBOX HUB',
          title: 'Riverbox',
        },
        targetSceneId: 'world',
      },
    });

    expect(game.definition.initialScene).toBe('world');
    expect(game.definition.scenes.hub.shell).toMatchObject({
      subtitle: 'SANDBOX HUB',
      title: 'Riverbox',
      variant: 'title',
    });
    expect(game.definition.scenes.hub.shell?.actions).toMatchObject([
      {
        description: 'Load the creative world shell.',
        label: 'Enter World',
        sceneId: 'world',
        type: 'load-scene',
      },
    ]);
  });

  it('allows custom generated menu-scene actions and ids', () => {
    const game = createRPGGame({
      menuScene: {
        backAction: {
          description: 'Return to the hub scene.',
          label: 'Back to Hub',
        },
        continueAction: {
          description: 'Drop back into the live adventure scene.',
          label: 'Resume Adventure',
        },
        sceneId: 'briefing',
      },
      titleScene: {
        menuAction: {
          label: 'Mission Briefing',
        },
      },
    });

    expect(game.definition.scenes.title.shell?.actions?.[1]).toMatchObject({
      label: 'Mission Briefing',
      sceneId: 'briefing',
      type: 'load-scene',
    });
    expect(game.definition.scenes.briefing.shell?.actions).toMatchObject([
      {
        description: 'Drop back into the live adventure scene.',
        label: 'Resume Adventure',
        sceneId: 'gameplay',
        type: 'load-scene',
      },
      {
        description: 'Return to the hub scene.',
        label: 'Back to Hub',
        sceneId: 'title',
        type: 'load-scene',
      },
    ]);
  });

  it('allows custom generated session-shell actions and copy', () => {
    const game = createRPGGame({
      menuScene: true,
      sessionShell: {
        menuAction: {
          label: 'Open Briefing',
        },
        pauseAction: {
          label: 'Hold Adventure',
        },
        shell: {
          subtitle: 'SESSION SHELL',
          title: 'Arena Online',
        },
        titleAction: {
          label: 'Return to Camp',
          variant: 'ghost',
        },
      },
      titleScene: true,
    });

    expect(game.definition.scenes.gameplay.shell).toMatchObject({
      subtitle: 'SESSION SHELL',
      title: 'Arena Online',
      variant: 'session',
    });
    expect(game.definition.scenes.gameplay.shell?.actions).toMatchObject([
      {
        label: 'Open Briefing',
        sceneId: 'menu',
        type: 'load-scene',
      },
      {
        label: 'Return to Camp',
        sceneId: 'title',
        type: 'load-scene',
        variant: 'ghost',
      },
      {
        label: 'Hold Adventure',
        type: 'toggle-pause',
      },
    ]);
  });

  it('allows explicitly booting into a generated title scene', () => {
    const game = createRacingGame({
      initialScene: 'lobby',
      titleScene: {
        sceneId: 'lobby',
      },
    });

    expect(game.definition.initialScene).toBe('lobby');
    expect(game.definition.scenes.lobby.shell).toMatchObject({
      title: 'Untitled Racing Game',
      variant: 'title',
    });
    expect(game.definition.scenes.lobby.shell?.actions?.[0]).toMatchObject({
      sceneId: 'race',
      type: 'load-scene',
    });
  });

  it('allows explicitly booting into a generated menu scene', () => {
    const game = createPuzzleGame({
      initialScene: 'briefing',
      menuScene: {
        sceneId: 'briefing',
      },
    });

    expect(game.definition.initialScene).toBe('briefing');
    expect(game.definition.scenes.briefing.shell).toMatchObject({
      title: 'Puzzle Menu',
      variant: 'menu',
    });
    expect(game.definition.scenes.briefing.shell?.actions?.[0]).toMatchObject({
      label: 'Resume Puzzle',
      sceneId: 'puzzle',
      type: 'load-scene',
    });
  });

  it('throws when a generated title scene conflicts with an existing scene id', () => {
    expect(() =>
      createRPGGame({
        titleScene: {
          sceneId: 'gameplay',
        },
      })
    ).toThrow('Title scene id "gameplay" conflicts with an existing scene');
  });

  it('throws when a generated menu scene conflicts with an existing or generated scene id', () => {
    expect(() =>
      createRPGGame({
        menuScene: {
          sceneId: 'gameplay',
        },
      })
    ).toThrow('Menu scene id "gameplay" conflicts with an existing scene');

    expect(() =>
      createRPGGame({
        menuScene: {
          sceneId: 'hub',
        },
        titleScene: {
          sceneId: 'hub',
        },
      })
    ).toThrow('Menu scene id "hub" conflicts with the generated title scene');
  });

  it('throws when a generated session shell targets an unknown scene', () => {
    expect(() =>
      createRPGGame({
        sessionShell: {
          targetSceneId: 'missing',
        },
      })
    ).toThrow('Unknown scene "missing"');
  });

  it('throws when explicit scene or mode keys do not exist', () => {
    expect(() =>
      createRPGGame({
        initialScene: 'missing',
      })
    ).toThrow('Unknown scene "missing"');

    expect(() =>
      createRPGGame({
        defaultMode: 'missing',
      })
    ).toThrow('Unknown mode "missing"');
  });
});
