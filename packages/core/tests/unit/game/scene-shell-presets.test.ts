import { describe, expect, it } from 'vitest';
import {
  createAnnouncementScene,
  createClearProfileSceneShellAction,
  createDismissSceneShellAction,
  createLoadActiveProfileSceneShellAction,
  createLoadLatestProfileSceneShellAction,
  createLoadSceneShellAction,
  createMenuScene,
  createMenuSceneShell,
  createOpenActiveProfileArchiveSceneShellAction,
  createReplaceModeSceneShellAction,
  createSaveProfilesScene,
  createSaveProfilesSceneShell,
  createSaveScene,
  createSaveSceneShell,
  createSessionScene,
  createSessionSceneShell,
  createTitleScene,
  createTitleSceneShell,
  createTogglePauseSceneShellAction,
} from '../../../src/game/scene-shell-presets';

describe('scene shell presets', () => {
  it('creates title, menu, session, profile, and archive shells with stable defaults', () => {
    expect(createTitleSceneShell({ title: 'Expedition Hub' })).toMatchObject({
      durationMs: 0,
      position: 'center',
      subtitle: 'GAME READY',
      title: 'Expedition Hub',
      variant: 'title',
    });

    expect(createMenuSceneShell({ title: 'Briefing' })).toMatchObject({
      durationMs: 0,
      position: 'center',
      subtitle: 'SCENE MENU',
      title: 'Briefing',
      variant: 'menu',
    });

    expect(createSessionSceneShell({ title: 'Arena Online' })).toMatchObject({
      durationMs: 0,
      position: 'bottom-left',
      subtitle: 'SESSION LIVE',
      title: 'Arena Online',
      variant: 'session',
    });

    expect(
      createSaveProfilesSceneShell({
        saveProfiles: [
          {
            id: 'expedition',
            label: 'Expedition',
            sceneId: 'profiles-expedition',
          },
        ],
        title: 'Save Profiles',
      })
    ).toMatchObject({
      durationMs: 0,
      position: 'center',
      saveProfiles: [
        {
          id: 'expedition',
          label: 'Expedition',
          sceneId: 'profiles-expedition',
        },
      ],
      subtitle: 'SAVE PROFILES',
      title: 'Save Profiles',
      variant: 'profiles',
    });

    expect(
      createSaveSceneShell({
        saveSlots: [{ label: 'Camp', slot: 'camp' }],
        title: 'Save Archive',
      })
    ).toMatchObject({
      durationMs: 0,
      position: 'center',
      saveSlots: [{ label: 'Camp', slot: 'camp' }],
      subtitle: 'SAVE ARCHIVE',
      title: 'Save Archive',
      variant: 'archive',
    });
  });

  it('creates reusable scene shell actions for scene and mode runtime operations', () => {
    expect(
      createLoadSceneShellAction('arena', {
        label: 'Enter Arena',
        variant: 'primary',
      })
    ).toMatchObject({
      label: 'Enter Arena',
      sceneId: 'arena',
      type: 'load-scene',
      variant: 'primary',
    });

    expect(
      createReplaceModeSceneShellAction('combat', {
        label: 'Enter Combat',
        props: {
          difficulty: 'hard',
        },
        transition: {
          transition: {
            duration: 0.18,
            type: 'fade',
          },
        },
      })
    ).toMatchObject({
      label: 'Enter Combat',
      modeId: 'combat',
      props: {
        difficulty: 'hard',
      },
      transition: {
        transition: {
          duration: 0.18,
          type: 'fade',
        },
      },
      type: 'replace-mode',
    });

    expect(createDismissSceneShellAction()).toMatchObject({
      label: 'Dismiss',
      type: 'dismiss-shell',
    });

    expect(createTogglePauseSceneShellAction()).toMatchObject({
      label: 'Toggle Pause',
      type: 'toggle-pause',
    });

    expect(
      createLoadLatestProfileSceneShellAction(
        'expedition',
        ['expedition:camp', 'expedition:autosave'],
        {
          emptySceneId: 'gameplay',
          label: 'Expedition',
        }
      )
    ).toMatchObject({
      emptySceneId: 'gameplay',
      label: 'Expedition',
      profileId: 'expedition',
      slots: ['expedition:camp', 'expedition:autosave'],
      type: 'load-latest-profile',
    });

    expect(
      createClearProfileSceneShellAction('expedition', ['expedition:camp', 'expedition:autosave'], {
        label: 'Reset Expedition',
      })
    ).toMatchObject({
      label: 'Reset Expedition',
      profileId: 'expedition',
      slots: ['expedition:camp', 'expedition:autosave'],
      type: 'clear-profile',
    });

    expect(
      createOpenActiveProfileArchiveSceneShellAction(
        {
          challenge: 'challenge-archive',
          expedition: 'profiles-expedition',
        },
        {
          fallbackSceneId: 'profiles',
          label: 'Adventure Saves',
        }
      )
    ).toMatchObject({
      fallbackSceneId: 'profiles',
      label: 'Adventure Saves',
      profileSceneIds: {
        challenge: 'challenge-archive',
        expedition: 'profiles-expedition',
      },
      type: 'open-active-profile-archive',
    });

    expect(
      createLoadActiveProfileSceneShellAction(
        {
          expedition: {
            emptySceneId: 'gameplay',
            slots: ['expedition:camp', 'expedition:autosave'],
          },
        },
        {
          fallbackSceneId: 'profiles',
          label: 'Resume Adventure',
        }
      )
    ).toMatchObject({
      fallbackSceneId: 'profiles',
      label: 'Resume Adventure',
      profiles: {
        expedition: {
          emptySceneId: 'gameplay',
          slots: ['expedition:camp', 'expedition:autosave'],
        },
      },
      type: 'load-active-profile',
    });
  });

  it('creates ready-to-register scene definitions around the built-in shell variants', () => {
    const titleScene = createTitleScene('title', {
      shell: {
        title: 'Expedition Hub',
      },
      transition: {
        transition: {
          duration: 0.24,
          type: 'fade',
        },
      },
    });
    const menuScene = createMenuScene('menu', {
      shell: {
        title: 'Briefing',
      },
    });
    const sessionScene = createSessionScene('session', {
      shell: {
        title: 'Arena Online',
      },
      ui: () => 'session-ui',
    });
    const profilesScene = createSaveProfilesScene('profiles', {
      shell: {
        saveProfiles: [
          {
            id: 'expedition',
            label: 'Expedition',
            sceneId: 'profiles-expedition',
          },
        ],
        title: 'Save Profiles',
      },
    });
    const saveScene = createSaveScene('archive', {
      shell: {
        saveSlots: [{ label: 'Camp', slot: 'camp' }],
        title: 'Save Archive',
      },
    });
    const announcementScene = createAnnouncementScene('announcement');

    expect(titleScene).toMatchObject({
      id: 'title',
      shell: {
        title: 'Expedition Hub',
        variant: 'title',
      },
      transition: {
        transition: {
          duration: 0.24,
          type: 'fade',
        },
      },
    });
    expect(titleScene.render()).toBeNull();

    expect(menuScene.shell).toMatchObject({
      title: 'Briefing',
      variant: 'menu',
    });
    expect(sessionScene.shell).toMatchObject({
      title: 'Arena Online',
      variant: 'session',
    });
    expect(profilesScene.shell).toMatchObject({
      saveProfiles: [
        {
          id: 'expedition',
          label: 'Expedition',
          sceneId: 'profiles-expedition',
        },
      ],
      title: 'Save Profiles',
      variant: 'profiles',
    });
    expect(saveScene.shell).toMatchObject({
      saveSlots: [{ label: 'Camp', slot: 'camp' }],
      title: 'Save Archive',
      variant: 'archive',
    });
    expect(sessionScene.ui?.()).toBe('session-ui');
    expect(announcementScene.shell).toMatchObject({
      subtitle: 'SCENE READY',
      variant: 'announcement',
    });
  });

  it('clones provided actions when building shells so callers can reuse action templates safely', () => {
    const action = createLoadSceneShellAction('arena', {
      label: 'Enter Arena',
      variant: 'primary',
    });

    const shell = createMenuSceneShell({
      actions: [action],
      title: 'Hub',
    });

    action.label = 'Mutated';

    expect(shell.actions).toHaveLength(1);
    expect(shell.actions?.[0]).toMatchObject({
      label: 'Enter Arena',
      sceneId: 'arena',
      type: 'load-scene',
    });
  });
});
