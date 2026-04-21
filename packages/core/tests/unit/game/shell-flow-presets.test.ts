import { describe, expect, it } from 'vitest';
import { createSceneShellFlow } from '../../../src/game/shell-flow-presets';

describe('shell flow presets', () => {
  it('can synthesize a title/menu/session shell flow around a live scene', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'gameplay',
      defaults: {
        actionLabels: {
          continue: 'Resume Adventure',
          deleteSave: 'Delete',
          load: 'Load',
          menu: 'Adventure Menu',
          pause: 'Pause Adventure',
          save: 'Save',
          saves: 'Adventure Saves',
          settings: 'Adventure Settings',
          start: 'Begin Adventure',
          title: 'Return to Hub',
        },
        menu: {
          subtitle: 'JOURNEY MENU',
          title: 'Adventure Menu',
        },
        saves: {
          subtitle: 'SAVE ARCHIVE',
          title: 'Adventure Saves',
        },
        settings: {
          subtitle: 'JOURNEY SETTINGS',
          title: 'Adventure Settings',
        },
        session: {
          subtitle: 'ADVENTURE LIVE',
          title: 'Adventure Live',
        },
        title: {
          subtitle: 'ADVENTURE READY',
        },
      },
      menu: true,
      name: 'River Quest',
      saves: {
        slots: ['camp', 'autosave'],
      },
      scenes: {
        gameplay: {
          id: 'gameplay',
          render: () => null,
          shell: {
            description: 'Existing gameplay shell copy.',
            title: 'Gameplay Scene',
          },
        },
      },
      settings: true,
      session: true,
      title: true,
    });

    expect(flow.initialScene).toBe('title');
    expect(flow.targetSceneId).toBe('gameplay');
    expect(flow.savesSceneId).toBe('saves');
    expect(flow.settingsSceneId).toBe('settings');
    expect(flow.scenes.title.shell).toMatchObject({
      subtitle: 'ADVENTURE READY',
      title: 'River Quest',
      variant: 'title',
    });
    expect(flow.scenes.title.shell?.actions).toMatchObject([
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
      {
        label: 'Adventure Settings',
        sceneId: 'settings',
        type: 'load-scene',
        variant: 'secondary',
      },
      {
        label: 'Adventure Saves',
        sceneId: 'saves',
        type: 'load-scene',
        variant: 'secondary',
      },
    ]);
    expect(flow.scenes.menu.shell).toMatchObject({
      subtitle: 'JOURNEY MENU',
      title: 'Adventure Menu',
      variant: 'menu',
    });
    expect(flow.scenes.menu.shell?.actions).toMatchObject([
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
        label: 'Back',
        sceneId: 'title',
        type: 'load-scene',
      },
    ]);
    expect(flow.scenes.settings.shell).toMatchObject({
      subtitle: 'JOURNEY SETTINGS',
      title: 'Adventure Settings',
      variant: 'menu',
    });
    expect(flow.scenes.settings.shell?.actions).toMatchObject([
      {
        label: 'Adventure Saves',
        sceneId: 'saves',
        type: 'load-scene',
        variant: 'secondary',
      },
      {
        label: 'Back to Menu',
        sceneId: 'menu',
        type: 'load-scene',
        variant: 'secondary',
      },
    ]);
    expect(flow.scenes.saves.shell).toMatchObject({
      saveSlots: [
        { label: 'Camp', slot: 'camp' },
        { label: 'Autosave', slot: 'autosave' },
      ],
      subtitle: 'SAVE ARCHIVE',
      title: 'Adventure Saves',
      variant: 'archive',
    });
    expect(flow.scenes.saves.shell?.actions).toMatchObject([
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
    expect(flow.scenes.gameplay.shell).toMatchObject({
      description: 'Existing gameplay shell copy.',
      subtitle: 'ADVENTURE LIVE',
      title: 'Adventure Live',
      variant: 'session',
    });
    expect(flow.scenes.gameplay.shell?.actions).toMatchObject([
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

  it('allows explicitly booting into a generated save scene', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'world',
      initialScene: 'archive',
      saves: {
        sceneId: 'archive',
        slots: ['slot-1'],
      },
      scenes: {
        world: {
          id: 'world',
          render: () => null,
        },
      },
    });

    expect(flow.initialScene).toBe('archive');
    expect(flow.savesSceneId).toBe('archive');
    expect(flow.scenes.archive.shell).toMatchObject({
      saveSlots: [{ label: 'Slot 1', slot: 'slot-1' }],
      title: 'Game Saves',
      variant: 'archive',
    });
    expect(flow.scenes.archive.shell?.actions).toMatchObject([
      {
        label: 'Save Game',
        slot: 'slot-1',
        type: 'save-game',
      },
      {
        label: 'Load Game',
        slot: 'slot-1',
        type: 'load-game',
      },
      {
        label: 'Delete Save',
        slot: 'slot-1',
        type: 'delete-save',
      },
      {
        label: 'Back',
        sceneId: 'world',
        type: 'load-scene',
      },
    ]);
  });

  it('respects per-slot archive capabilities and status labels', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'world',
      saves: {
        slots: [
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
            label: 'Locked Slot',
            slot: 'locked',
          },
        ],
      },
      scenes: {
        world: {
          id: 'world',
          render: () => null,
        },
      },
    });

    expect(flow.scenes.saves.shell).toMatchObject({
      saveSlots: [
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
          label: 'Locked Slot',
          slot: 'locked',
        },
      ],
      variant: 'archive',
    });
    expect(flow.scenes.saves.shell?.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Save Autosave',
          slot: 'autosave',
          type: 'save-game',
        }),
        expect.objectContaining({
          label: 'Load Autosave',
          slot: 'autosave',
          type: 'load-game',
        }),
        expect.objectContaining({
          label: 'Delete Locked Slot',
          slot: 'locked',
          type: 'delete-save',
        }),
        expect.objectContaining({
          label: 'Back',
          sceneId: 'world',
          type: 'load-scene',
        }),
      ])
    );
    expect(flow.scenes.saves.shell?.actions).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slot: 'autosave',
          type: 'delete-save',
        }),
        expect.objectContaining({
          slot: 'locked',
          type: 'save-game',
        }),
        expect.objectContaining({
          slot: 'locked',
          type: 'load-game',
        }),
      ])
    );
  });

  it('can synthesize a save-profile selector with generated archive scenes', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'gameplay',
      initialScene: 'profiles',
      menu: true,
      saves: {
        profileSelector: {
          shell: {
            description: 'Choose a save profile before entering an archive.',
            title: 'Save Profiles',
          },
        },
        profiles: [
          {
            description: 'Primary expedition progress and checkpoints.',
            id: 'expedition',
            label: 'Expedition',
            slots: ['camp', 'autosave'],
          },
          {
            description: 'Hard-mode challenge runs.',
            id: 'challenge',
            sceneId: 'challenge-archive',
            slots: ['slot-1'],
          },
        ],
        sceneId: 'profiles',
      },
      scenes: {
        gameplay: {
          id: 'gameplay',
          render: () => null,
        },
      },
      settings: true,
      title: true,
    });

    expect(flow.initialScene).toBe('profiles');
    expect(flow.savesSceneId).toBe('profiles');
    expect(flow.saveProfileSceneIds).toEqual({
      challenge: 'challenge-archive',
      expedition: 'profiles-expedition',
    });
    expect(flow.scenes.title.shell?.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Start Game',
          sceneId: 'gameplay',
          type: 'load-scene',
        }),
        expect.objectContaining({
          fallbackSceneId: 'profiles',
          label: 'Continue',
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
        }),
        expect.objectContaining({
          fallbackSceneId: 'profiles',
          label: 'Saves',
          profileSceneIds: {
            challenge: 'challenge-archive',
            expedition: 'profiles-expedition',
          },
          type: 'open-active-profile-archive',
        }),
      ])
    );
    expect(flow.scenes.menu.shell?.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fallbackSceneId: 'gameplay',
          label: 'Continue',
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
        }),
        expect.objectContaining({
          fallbackSceneId: 'profiles',
          label: 'Saves',
          profileSceneIds: {
            challenge: 'challenge-archive',
            expedition: 'profiles-expedition',
          },
          type: 'open-active-profile-archive',
        }),
      ])
    );
    expect(flow.scenes.settings.shell?.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fallbackSceneId: 'profiles',
          label: 'Saves',
          profileSceneIds: {
            challenge: 'challenge-archive',
            expedition: 'profiles-expedition',
          },
          type: 'open-active-profile-archive',
        }),
      ])
    );
    expect(flow.scenes.profiles.shell).toMatchObject({
      description: 'Choose a save profile before entering an archive.',
      saveProfiles: [
        {
          description: 'Primary expedition progress and checkpoints.',
          emptyActionLabel: 'Start Expedition',
          id: 'expedition',
          label: 'Expedition',
          occupiedActionLabel: 'Continue Expedition',
          sceneId: 'profiles-expedition',
          slots: [
            { label: 'Camp', slot: 'camp', storageSlot: 'expedition:camp' },
            { label: 'Autosave', slot: 'autosave', storageSlot: 'expedition:autosave' },
          ],
        },
        {
          description: 'Hard-mode challenge runs.',
          emptyActionLabel: 'Start Challenge',
          id: 'challenge',
          label: 'Challenge',
          occupiedActionLabel: 'Continue Challenge',
          sceneId: 'challenge-archive',
          slots: [{ label: 'Slot 1', slot: 'slot-1', storageSlot: 'challenge:slot-1' }],
        },
      ],
      subtitle: 'SAVE PROFILES',
      title: 'Save Profiles',
      variant: 'profiles',
    });
    expect(flow.scenes.profiles.shell?.actions).toMatchObject([
      {
        description: 'Primary expedition progress and checkpoints.',
        emptySceneId: 'gameplay',
        label: 'Expedition',
        profileId: 'expedition',
        slots: ['expedition:camp', 'expedition:autosave'],
        type: 'load-latest-profile',
        variant: 'primary',
      },
      {
        label: 'Manage Expedition',
        profileId: 'expedition',
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
        description: 'Hard-mode challenge runs.',
        emptySceneId: 'gameplay',
        label: 'Challenge',
        profileId: 'challenge',
        slots: ['challenge:slot-1'],
        type: 'load-latest-profile',
        variant: 'secondary',
      },
      {
        label: 'Manage Challenge',
        profileId: 'challenge',
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
        label: 'Back to Settings',
        sceneId: 'settings',
        type: 'load-scene',
        variant: 'secondary',
      },
    ]);
    expect(flow.scenes['profiles-expedition'].shell).toMatchObject({
      saveSlots: [
        { label: 'Camp', slot: 'camp', storageSlot: 'expedition:camp' },
        { label: 'Autosave', slot: 'autosave', storageSlot: 'expedition:autosave' },
      ],
      subtitle: 'SAVE ARCHIVE',
      title: 'Expedition Saves',
      variant: 'archive',
    });
    expect(flow.scenes['profiles-expedition'].shell?.actions).toMatchObject([
      {
        label: 'Save Camp',
        slot: 'expedition:camp',
        type: 'save-game',
        variant: 'primary',
      },
      {
        label: 'Load Camp',
        slot: 'expedition:camp',
        type: 'load-game',
        variant: 'secondary',
      },
      {
        label: 'Delete Camp',
        slot: 'expedition:camp',
        type: 'delete-save',
        variant: 'ghost',
      },
      {
        label: 'Save Autosave',
        slot: 'expedition:autosave',
        type: 'save-game',
        variant: 'primary',
      },
      {
        label: 'Load Autosave',
        slot: 'expedition:autosave',
        type: 'load-game',
        variant: 'secondary',
      },
      {
        label: 'Delete Autosave',
        slot: 'expedition:autosave',
        type: 'delete-save',
        variant: 'ghost',
      },
      {
        label: 'Back to Saves',
        sceneId: 'profiles',
        type: 'load-scene',
        variant: 'secondary',
      },
    ]);
    expect(flow.scenes['challenge-archive'].shell).toMatchObject({
      description: 'Hard-mode challenge runs.',
      saveSlots: [{ label: 'Slot 1', slot: 'slot-1', storageSlot: 'challenge:slot-1' }],
      title: 'Challenge Saves',
      variant: 'archive',
    });
  });

  it('routes generated session save actions through the active profile archive when profiles are enabled', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'gameplay',
      saves: {
        profiles: [
          {
            id: 'campaign',
            slots: ['camp'],
          },
          {
            id: 'challenge',
            sceneId: 'challenge-archive',
            slots: ['slot-1'],
          },
        ],
        sceneId: 'profiles',
      },
      scenes: {
        gameplay: {
          id: 'gameplay',
          render: () => null,
        },
      },
      session: true,
    });

    expect(flow.scenes.gameplay.shell?.actions).toContainEqual(
      expect.objectContaining({
        fallbackSceneId: 'profiles',
        label: 'Saves',
        profileSceneIds: {
          campaign: 'profiles-campaign',
          challenge: 'challenge-archive',
        },
        type: 'open-active-profile-archive',
        variant: 'secondary',
      })
    );
  });

  it('preserves custom save-profile entry labels for empty and occupied states', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'world',
      saves: {
        profiles: [
          {
            emptyActionLabel: 'Start Fresh Run',
            id: 'campaign',
            occupiedActionLabel: 'Resume Campaign',
            slots: ['slot-1'],
          },
        ],
      },
      scenes: {
        world: {
          id: 'world',
          render: () => null,
        },
      },
    });

    expect(flow.scenes.saves.shell).toMatchObject({
      saveProfiles: [
        {
          emptyActionLabel: 'Start Fresh Run',
          id: 'campaign',
          occupiedActionLabel: 'Resume Campaign',
        },
      ],
    });
  });

  it('allows opting out of generated profile clear actions', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'world',
      saves: {
        profiles: [
          {
            allowClear: false,
            id: 'campaign',
            slots: ['slot-1'],
          },
        ],
      },
      scenes: {
        world: {
          id: 'world',
          render: () => null,
        },
      },
    });

    expect(flow.scenes.saves.shell?.actions).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          profileId: 'campaign',
          type: 'clear-profile',
        }),
      ])
    );
  });

  it('allows explicitly booting into a generated save-profile archive scene', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'world',
      initialScene: 'profiles-main',
      saves: {
        profiles: [
          {
            id: 'main',
            slots: ['slot-1'],
          },
        ],
        sceneId: 'profiles',
      },
      scenes: {
        world: {
          id: 'world',
          render: () => null,
        },
      },
    });

    expect(flow.initialScene).toBe('profiles-main');
    expect(flow.saveProfileSceneIds).toEqual({
      main: 'profiles-main',
    });
    expect(flow.scenes['profiles-main'].shell).toMatchObject({
      saveSlots: [{ label: 'Slot 1', slot: 'slot-1', storageSlot: 'main:slot-1' }],
      title: 'Main Saves',
      variant: 'archive',
    });
  });

  it('namespaces overlapping profile slot ids by default', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'world',
      saves: {
        profiles: [
          {
            id: 'campaign',
            slots: ['slot-1'],
          },
          {
            id: 'challenge',
            slots: ['slot-1'],
          },
        ],
      },
      scenes: {
        world: {
          id: 'world',
          render: () => null,
        },
      },
    });

    expect(flow.scenes['saves-campaign'].shell).toMatchObject({
      saveSlots: [{ label: 'Slot 1', slot: 'slot-1', storageSlot: 'campaign:slot-1' }],
    });
    expect(flow.scenes['saves-challenge'].shell).toMatchObject({
      saveSlots: [{ label: 'Slot 1', slot: 'slot-1', storageSlot: 'challenge:slot-1' }],
    });
    expect(flow.scenes['saves-campaign'].shell?.actions).toContainEqual(
      expect.objectContaining({
        slot: 'campaign:slot-1',
        type: 'save-game',
      })
    );
    expect(flow.scenes['saves-challenge'].shell?.actions).toContainEqual(
      expect.objectContaining({
        slot: 'challenge:slot-1',
        type: 'save-game',
      })
    );
  });

  it('allows opting out of generated profile slot namespacing', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'world',
      saves: {
        profiles: [
          {
            id: 'campaign',
            slotNamespace: false,
            slots: ['slot-1'],
          },
        ],
      },
      scenes: {
        world: {
          id: 'world',
          render: () => null,
        },
      },
    });

    expect(flow.scenes['saves-campaign'].shell).toMatchObject({
      saveSlots: [{ label: 'Slot 1', slot: 'slot-1' }],
    });
    expect(flow.scenes['saves-campaign'].shell?.actions).toContainEqual(
      expect.objectContaining({
        slot: 'slot-1',
        type: 'save-game',
      })
    );
  });

  it('preserves explicit storageSlot overrides inside namespaced profiles', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'world',
      saves: {
        profiles: [
          {
            id: 'campaign',
            slots: [
              {
                label: 'Autosave',
                slot: 'autosave',
                storageSlot: 'global:autosave',
              },
            ],
          },
        ],
      },
      scenes: {
        world: {
          id: 'world',
          render: () => null,
        },
      },
    });

    expect(flow.scenes['saves-campaign'].shell).toMatchObject({
      saveSlots: [{ label: 'Autosave', slot: 'autosave', storageSlot: 'global:autosave' }],
    });
    expect(flow.scenes['saves-campaign'].shell?.actions).toContainEqual(
      expect.objectContaining({
        slot: 'global:autosave',
        type: 'save-game',
      })
    );
  });

  it('allows menu-only shell flows and explicit boot into the generated menu', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'world',
      initialScene: 'briefing',
      menu: {
        sceneId: 'briefing',
        shell: {
          title: 'World Briefing',
        },
      },
      name: 'Riverbox',
      scenes: {
        world: {
          id: 'world',
          render: () => null,
        },
      },
    });

    expect(flow.initialScene).toBe('briefing');
    expect(flow.menuSceneId).toBe('briefing');
    expect(flow.titleSceneId).toBeUndefined();
    expect(flow.scenes.briefing.shell).toMatchObject({
      title: 'World Briefing',
      variant: 'menu',
    });
    expect(flow.scenes.briefing.shell?.actions).toMatchObject([
      {
        label: 'Continue',
        sceneId: 'world',
        type: 'load-scene',
      },
    ]);
  });

  it('preserves explicit title or menu scene ids when no generated shell scenes are requested', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'gameplay',
      initialScene: 'title',
      scenes: {
        gameplay: {
          id: 'gameplay',
          render: () => null,
        },
        title: {
          id: 'title',
          render: () => null,
        },
      },
    });

    expect(flow.initialScene).toBe('title');
    expect(flow.targetSceneId).toBe('title');
    expect(flow.scenes.title.render()).toBeNull();
  });

  it('allows custom generated session-shell actions and targets', () => {
    const flow = createSceneShellFlow({
      defaultSceneId: 'gameplay',
      menu: {
        sceneId: 'briefing',
      },
      scenes: {
        gameplay: {
          id: 'gameplay',
          render: () => null,
        },
        postgame: {
          id: 'postgame',
          render: () => null,
        },
      },
      session: {
        menuAction: {
          label: 'Open Briefing',
        },
        pauseAction: {
          label: 'Hold Session',
        },
        shell: {
          subtitle: 'SESSION SHELL',
          title: 'Arena Online',
        },
        targetSceneId: 'postgame',
      },
      title: {
        sceneId: 'hub',
      },
    });

    expect(flow.scenes.postgame.shell).toMatchObject({
      subtitle: 'SESSION SHELL',
      title: 'Arena Online',
      variant: 'session',
    });
    expect(flow.scenes.postgame.shell?.actions).toMatchObject([
      {
        label: 'Open Briefing',
        sceneId: 'briefing',
        type: 'load-scene',
      },
      {
        label: 'Return to Hub',
        sceneId: 'hub',
        type: 'load-scene',
      },
      {
        label: 'Hold Session',
        type: 'toggle-pause',
      },
    ]);
  });

  it('throws on conflicting generated ids or unknown targets', () => {
    expect(() =>
      createSceneShellFlow({
        defaultSceneId: 'gameplay',
        menu: {
          sceneId: 'gameplay',
        },
        scenes: {
          gameplay: {
            id: 'gameplay',
            render: () => null,
          },
        },
      })
    ).toThrow('Menu scene id "gameplay" conflicts with an existing scene');

    expect(() =>
      createSceneShellFlow({
        defaultSceneId: 'gameplay',
        scenes: {
          gameplay: {
            id: 'gameplay',
            render: () => null,
          },
        },
        settings: {
          sceneId: 'menu',
        },
        menu: true,
      })
    ).toThrow('Settings scene id "menu" conflicts with the generated menu scene');

    expect(() =>
      createSceneShellFlow({
        defaultSceneId: 'gameplay',
        scenes: {
          gameplay: {
            id: 'gameplay',
            render: () => null,
          },
        },
        session: {
          targetSceneId: 'missing',
        },
      })
    ).toThrow('Unknown scene "missing" in shell flow definition');

    expect(() =>
      createSceneShellFlow({
        defaultSceneId: 'gameplay',
        saves: {
          sceneId: 'settings',
        },
        scenes: {
          gameplay: {
            id: 'gameplay',
            render: () => null,
          },
        },
        settings: true,
      })
    ).toThrow('Settings scene id "settings" conflicts with the generated save scene');
  });
});
