import type {
  GameTransitionOptions,
  SceneDefinition,
  SceneShellActionDefinition,
  SceneShellDefinition,
} from './types';

type SceneShellActionStyle = NonNullable<SceneShellActionDefinition['variant']>;

interface BaseSceneShellActionOptions {
  closeOnSuccess?: boolean;
  description?: string;
  id?: string;
  label?: string;
  variant?: SceneShellActionStyle;
}

interface TransitionSceneShellActionOptions extends BaseSceneShellActionOptions {
  transition?: GameTransitionOptions;
}

interface LoadSceneShellActionOptions extends TransitionSceneShellActionOptions {
  profileId?: string;
}

interface ModeSceneShellActionOptions extends TransitionSceneShellActionOptions {
  props?: Record<string, unknown>;
}

interface ProfileSceneShellActionOptions extends TransitionSceneShellActionOptions {
  emptySceneId?: string;
}

interface ActiveProfileArchiveSceneShellActionOptions extends TransitionSceneShellActionOptions {
  fallbackSceneId?: string;
}

interface ActiveProfileLoadSceneShellActionOptions extends TransitionSceneShellActionOptions {
  fallbackSceneId?: string;
}

type CreateSceneShellOptions = Omit<Partial<SceneShellDefinition>, 'variant'>;
interface CreateScenePresetOptions {
  render?: SceneDefinition['render'];
  setup?: SceneDefinition['setup'];
  teardown?: SceneDefinition['teardown'];
  transition?: SceneDefinition['transition'];
  ui?: SceneDefinition['ui'];
  shell?: CreateSceneShellOptions;
}

type BaseActionKeys = 'closeOnSuccess' | 'description' | 'id' | 'label' | 'type' | 'variant';
type BaseSceneShellAction<TType extends SceneShellActionDefinition['type']> = Pick<
  Extract<SceneShellActionDefinition, { type: TType }>,
  BaseActionKeys
>;

function cloneTransitionOptions(
  options?: GameTransitionOptions
): GameTransitionOptions | undefined {
  if (!options) {
    return undefined;
  }

  return {
    transition: options.transition ? { ...options.transition } : undefined,
    transitionIn: options.transitionIn ? { ...options.transitionIn } : undefined,
    transitionOut: options.transitionOut ? { ...options.transitionOut } : undefined,
  };
}

function cloneSceneShellAction(action: SceneShellActionDefinition): SceneShellActionDefinition {
  switch (action.type) {
    case 'load-scene':
    case 'push-scene':
      return {
        ...action,
        transition: cloneTransitionOptions(action.transition),
      };
    case 'push-mode':
    case 'replace-mode':
      return {
        ...action,
        props: action.props ? { ...action.props } : undefined,
        transition: cloneTransitionOptions(action.transition),
      };
    case 'pop-scene':
    case 'pop-mode':
      return {
        ...action,
        transition: cloneTransitionOptions(action.transition),
      };
    case 'load-latest-profile':
      return {
        ...action,
        slots: [...action.slots],
        transition: cloneTransitionOptions(action.transition),
      };
    case 'load-active-profile':
      return {
        ...action,
        profiles: Object.fromEntries(
          Object.entries(action.profiles).map(([profileId, target]) => [
            profileId,
            {
              ...target,
              slots: [...target.slots],
            },
          ])
        ),
        transition: cloneTransitionOptions(action.transition),
      };
    case 'open-active-profile-archive':
      return {
        ...action,
        profileSceneIds: { ...action.profileSceneIds },
        transition: cloneTransitionOptions(action.transition),
      };
    case 'dismiss-shell':
    case 'pause':
    case 'resume':
    case 'save-game':
    case 'load-game':
    case 'delete-save':
    case 'toggle-pause':
      return {
        ...action,
      };
    case 'clear-profile':
      return {
        ...action,
        slots: [...action.slots],
      };
    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}

function cloneSceneShellActions(
  actions?: SceneShellActionDefinition[]
): SceneShellActionDefinition[] | undefined {
  return actions?.map((action) => cloneSceneShellAction(action));
}

function cloneSceneShellSaveSlots(
  saveSlots?: SceneShellDefinition['saveSlots']
): SceneShellDefinition['saveSlots'] {
  return saveSlots?.map((slot) => ({ ...slot }));
}

function cloneSceneShellSaveProfiles(
  saveProfiles?: SceneShellDefinition['saveProfiles']
): SceneShellDefinition['saveProfiles'] {
  return saveProfiles?.map((profile) => ({
    ...profile,
    slots: cloneSceneShellSaveSlots(profile.slots),
  }));
}

function createSceneShell(
  variant: NonNullable<SceneShellDefinition['variant']>,
  defaults: Omit<SceneShellDefinition, 'variant'>,
  options: CreateSceneShellOptions = {}
): SceneShellDefinition {
  return {
    ...defaults,
    ...options,
    actions: cloneSceneShellActions(options.actions ?? defaults.actions),
    saveProfiles: cloneSceneShellSaveProfiles(options.saveProfiles ?? defaults.saveProfiles),
    saveSlots: cloneSceneShellSaveSlots(options.saveSlots ?? defaults.saveSlots),
    variant,
  };
}

function createSceneWithShell(
  id: string,
  createShellPreset: (options?: CreateSceneShellOptions) => SceneShellDefinition,
  options: CreateScenePresetOptions = {}
): SceneDefinition {
  return {
    id,
    render: options.render ?? (() => null),
    setup: options.setup,
    teardown: options.teardown,
    transition: options.transition,
    ui: options.ui,
    shell: createShellPreset(options.shell),
  };
}

function createBaseAction<TType extends SceneShellActionDefinition['type']>(
  type: TType,
  defaultLabel: string,
  options: BaseSceneShellActionOptions = {}
): BaseSceneShellAction<TType> {
  return {
    closeOnSuccess: options.closeOnSuccess,
    description: options.description,
    id: options.id,
    label: options.label ?? defaultLabel,
    type,
    variant: options.variant,
  } as BaseSceneShellAction<TType>;
}

export function createAnnouncementSceneShell(
  options: CreateSceneShellOptions = {}
): SceneShellDefinition {
  return createSceneShell(
    'announcement',
    {
      durationMs: 3200,
      position: 'top-left',
      subtitle: 'SCENE READY',
    },
    options
  );
}

export function createTitleSceneShell(options: CreateSceneShellOptions = {}): SceneShellDefinition {
  return createSceneShell(
    'title',
    {
      durationMs: 0,
      position: 'center',
      subtitle: 'GAME READY',
    },
    options
  );
}

export function createMenuSceneShell(options: CreateSceneShellOptions = {}): SceneShellDefinition {
  return createSceneShell(
    'menu',
    {
      durationMs: 0,
      position: 'center',
      subtitle: 'SCENE MENU',
    },
    options
  );
}

export function createSessionSceneShell(
  options: CreateSceneShellOptions = {}
): SceneShellDefinition {
  return createSceneShell(
    'session',
    {
      durationMs: 0,
      position: 'bottom-left',
      subtitle: 'SESSION LIVE',
    },
    options
  );
}

export function createSaveSceneShell(options: CreateSceneShellOptions = {}): SceneShellDefinition {
  return createSceneShell(
    'archive',
    {
      durationMs: 0,
      position: 'center',
      subtitle: 'SAVE ARCHIVE',
    },
    options
  );
}

export function createSaveProfilesSceneShell(
  options: CreateSceneShellOptions = {}
): SceneShellDefinition {
  return createSceneShell(
    'profiles',
    {
      durationMs: 0,
      position: 'center',
      subtitle: 'SAVE PROFILES',
    },
    options
  );
}

export function createAnnouncementScene(
  id: string,
  options: CreateScenePresetOptions = {}
): SceneDefinition {
  return createSceneWithShell(id, createAnnouncementSceneShell, options);
}

export function createTitleScene(
  id: string,
  options: CreateScenePresetOptions = {}
): SceneDefinition {
  return createSceneWithShell(id, createTitleSceneShell, options);
}

export function createMenuScene(
  id: string,
  options: CreateScenePresetOptions = {}
): SceneDefinition {
  return createSceneWithShell(id, createMenuSceneShell, options);
}

export function createSessionScene(
  id: string,
  options: CreateScenePresetOptions = {}
): SceneDefinition {
  return createSceneWithShell(id, createSessionSceneShell, options);
}

export function createSaveScene(
  id: string,
  options: CreateScenePresetOptions = {}
): SceneDefinition {
  return createSceneWithShell(id, createSaveSceneShell, options);
}

export function createSaveProfilesScene(
  id: string,
  options: CreateScenePresetOptions = {}
): SceneDefinition {
  return createSceneWithShell(id, createSaveProfilesSceneShell, options);
}

export function createDismissSceneShellAction(
  options: BaseSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return createBaseAction('dismiss-shell', 'Dismiss', options);
}

export function createLoadSceneShellAction(
  sceneId: string,
  options: LoadSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('load-scene', 'Continue', options),
    profileId: options.profileId,
    sceneId,
    transition: cloneTransitionOptions(options.transition),
  };
}

export function createPushSceneShellAction(
  sceneId: string,
  options: TransitionSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('push-scene', 'Open Scene', options),
    sceneId,
    transition: cloneTransitionOptions(options.transition),
  };
}

export function createPopSceneShellAction(
  options: TransitionSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('pop-scene', 'Back', options),
    transition: cloneTransitionOptions(options.transition),
  };
}

export function createPushModeSceneShellAction(
  modeId: string,
  options: ModeSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('push-mode', 'Push Mode', options),
    modeId,
    props: options.props ? { ...options.props } : undefined,
    transition: cloneTransitionOptions(options.transition),
  };
}

export function createReplaceModeSceneShellAction(
  modeId: string,
  options: ModeSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('replace-mode', 'Switch Mode', options),
    modeId,
    props: options.props ? { ...options.props } : undefined,
    transition: cloneTransitionOptions(options.transition),
  };
}

export function createPopModeSceneShellAction(
  options: TransitionSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('pop-mode', 'Leave Mode', options),
    transition: cloneTransitionOptions(options.transition),
  };
}

export function createPauseSceneShellAction(
  options: BaseSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return createBaseAction('pause', 'Pause', options);
}

export function createResumeSceneShellAction(
  options: BaseSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return createBaseAction('resume', 'Resume', options);
}

export function createTogglePauseSceneShellAction(
  options: BaseSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return createBaseAction('toggle-pause', 'Toggle Pause', options);
}

export function createSaveGameSceneShellAction(
  slot?: string,
  options: BaseSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('save-game', 'Save Game', options),
    slot,
  };
}

export function createLoadGameSceneShellAction(
  slot?: string,
  options: BaseSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('load-game', 'Load Game', options),
    slot,
  };
}

export function createDeleteSaveSceneShellAction(
  slot: string,
  options: BaseSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('delete-save', 'Delete Save', options),
    slot,
  };
}

export function createLoadLatestProfileSceneShellAction(
  profileId: string,
  slots: string[],
  options: ProfileSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('load-latest-profile', 'Continue Profile', options),
    emptySceneId: options.emptySceneId,
    profileId,
    slots: [...slots],
    transition: cloneTransitionOptions(options.transition),
  };
}

export function createOpenActiveProfileArchiveSceneShellAction(
  profileSceneIds: Record<string, string>,
  options: ActiveProfileArchiveSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('open-active-profile-archive', 'Open Save Archive', options),
    fallbackSceneId: options.fallbackSceneId,
    profileSceneIds: { ...profileSceneIds },
    transition: cloneTransitionOptions(options.transition),
  };
}

export function createLoadActiveProfileSceneShellAction(
  profiles: Extract<SceneShellActionDefinition, { type: 'load-active-profile' }>['profiles'],
  options: ActiveProfileLoadSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('load-active-profile', 'Continue Current Profile', options),
    fallbackSceneId: options.fallbackSceneId,
    profiles: Object.fromEntries(
      Object.entries(profiles).map(([profileId, target]) => [
        profileId,
        {
          ...target,
          slots: [...target.slots],
        },
      ])
    ),
    transition: cloneTransitionOptions(options.transition),
  };
}

export function createClearProfileSceneShellAction(
  profileId: string,
  slots: string[],
  options: BaseSceneShellActionOptions = {}
): SceneShellActionDefinition {
  return {
    ...createBaseAction('clear-profile', 'Clear Profile', options),
    profileId,
    slots: [...slots],
  };
}
