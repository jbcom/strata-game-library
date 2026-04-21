import {
  createClearProfileSceneShellAction,
  createDeleteSaveSceneShellAction,
  createLoadActiveProfileSceneShellAction,
  createLoadGameSceneShellAction,
  createLoadLatestProfileSceneShellAction,
  createLoadSceneShellAction,
  createMenuScene,
  createOpenActiveProfileArchiveSceneShellAction,
  createSaveGameSceneShellAction,
  createSaveProfilesScene,
  createSaveScene,
  createSessionSceneShell,
  createTitleScene,
  createTogglePauseSceneShellAction,
} from './scene-shell-presets';
import type { SceneDefinition, SceneShellActionDefinition, SceneShellDefinition } from './types';

export type ShellFlowSceneLoadActionInput = Omit<
  Partial<Extract<SceneShellActionDefinition, { type: 'load-scene' }>>,
  'sceneId' | 'type'
>;

export type ShellFlowLoadLatestProfileActionInput = Omit<
  Partial<Extract<SceneShellActionDefinition, { type: 'load-latest-profile' }>>,
  'profileId' | 'slots' | 'type'
>;

export type ShellFlowTogglePauseActionInput = Omit<
  Partial<Extract<SceneShellActionDefinition, { type: 'toggle-pause' }>>,
  'type'
>;

export type ShellFlowPersistenceActionInput<
  TType extends 'save-game' | 'load-game' | 'delete-save',
> = Omit<Partial<Extract<SceneShellActionDefinition, { type: TType }>>, 'slot' | 'type'>;

export type ShellFlowScaffoldInput = Omit<Partial<SceneShellDefinition>, 'variant'>;

export interface SceneShellFlowSaveSlot {
  allowDelete?: boolean;
  allowLoad?: boolean;
  allowSave?: boolean;
  deleteAction?: ShellFlowPersistenceActionInput<'delete-save'>;
  description?: string;
  emptyLabel?: string;
  label?: string;
  loadAction?: ShellFlowPersistenceActionInput<'load-game'>;
  savedLabel?: string;
  saveAction?: ShellFlowPersistenceActionInput<'save-game'>;
  slot: string;
  storageSlot?: string;
}

export interface SceneShellFlowSaveProfile {
  action?: ShellFlowLoadLatestProfileActionInput;
  allowClear?: boolean;
  clearAction?: Omit<
    Partial<Extract<SceneShellActionDefinition, { type: 'clear-profile' }>>,
    'profileId' | 'slots' | 'type'
  >;
  description?: string;
  emptyActionLabel?: string;
  id: string;
  label?: string;
  manageAction?: ShellFlowSceneLoadActionInput;
  occupiedActionLabel?: string;
  sceneId?: string;
  shell?: ShellFlowScaffoldInput;
  slotNamespace?: string | false;
  slots?: Array<SceneShellFlowSaveSlot | string>;
}

export interface SceneShellFlowActionLabels {
  back?: string;
  clearProfile?: string;
  continue?: string;
  deleteSave?: string;
  load?: string;
  manageProfile?: string;
  menu?: string;
  pause?: string;
  save?: string;
  saves?: string;
  settings?: string;
  start?: string;
  title?: string;
}

export interface SceneShellFlowDefaults {
  actionLabels?: SceneShellFlowActionLabels;
  menu?: ShellFlowScaffoldInput;
  saves?: ShellFlowScaffoldInput;
  settings?: ShellFlowScaffoldInput;
  session?: ShellFlowScaffoldInput;
  title?: ShellFlowScaffoldInput;
}

export interface SceneShellFlowTitleOptions {
  action?: ShellFlowSceneLoadActionInput;
  menuAction?: ShellFlowSceneLoadActionInput;
  render?: SceneDefinition['render'];
  sceneId?: string;
  savesAction?: ShellFlowSceneLoadActionInput;
  settingsAction?: ShellFlowSceneLoadActionInput;
  setup?: SceneDefinition['setup'];
  shell?: ShellFlowScaffoldInput;
  targetSceneId?: string;
  teardown?: SceneDefinition['teardown'];
  transition?: SceneDefinition['transition'];
  ui?: SceneDefinition['ui'];
}

export interface SceneShellFlowMenuOptions {
  backAction?: ShellFlowSceneLoadActionInput;
  backSceneId?: string;
  continueAction?: ShellFlowSceneLoadActionInput;
  render?: SceneDefinition['render'];
  sceneId?: string;
  savesAction?: ShellFlowSceneLoadActionInput;
  settingsAction?: ShellFlowSceneLoadActionInput;
  setup?: SceneDefinition['setup'];
  shell?: ShellFlowScaffoldInput;
  targetSceneId?: string;
  teardown?: SceneDefinition['teardown'];
  transition?: SceneDefinition['transition'];
  ui?: SceneDefinition['ui'];
}

export interface SceneShellFlowSettingsOptions {
  backAction?: ShellFlowSceneLoadActionInput;
  backSceneId?: string;
  render?: SceneDefinition['render'];
  sceneId?: string;
  savesAction?: ShellFlowSceneLoadActionInput;
  setup?: SceneDefinition['setup'];
  shell?: ShellFlowScaffoldInput;
  teardown?: SceneDefinition['teardown'];
  transition?: SceneDefinition['transition'];
  ui?: SceneDefinition['ui'];
}

export interface SceneShellFlowSaveProfileSelectorOptions {
  backAction?: ShellFlowSceneLoadActionInput;
  backSceneId?: string;
  render?: SceneDefinition['render'];
  setup?: SceneDefinition['setup'];
  shell?: ShellFlowScaffoldInput;
  teardown?: SceneDefinition['teardown'];
  transition?: SceneDefinition['transition'];
  ui?: SceneDefinition['ui'];
}

export interface SceneShellFlowSavesOptions {
  backAction?: ShellFlowSceneLoadActionInput;
  backSceneId?: string;
  profileSelector?: SceneShellFlowSaveProfileSelectorOptions;
  profiles?: Array<SceneShellFlowSaveProfile | string>;
  render?: SceneDefinition['render'];
  sceneId?: string;
  setup?: SceneDefinition['setup'];
  shell?: ShellFlowScaffoldInput;
  slots?: Array<SceneShellFlowSaveSlot | string>;
  teardown?: SceneDefinition['teardown'];
  transition?: SceneDefinition['transition'];
  ui?: SceneDefinition['ui'];
}

export interface SceneShellFlowSessionOptions {
  menuAction?: ShellFlowSceneLoadActionInput;
  pauseAction?: ShellFlowTogglePauseActionInput;
  savesAction?: ShellFlowSceneLoadActionInput;
  settingsAction?: ShellFlowSceneLoadActionInput;
  shell?: ShellFlowScaffoldInput;
  targetSceneId?: string;
  titleAction?: ShellFlowSceneLoadActionInput;
}

export interface CreateSceneShellFlowOptions {
  defaultSceneId: string;
  defaults?: SceneShellFlowDefaults;
  initialScene?: string;
  menu?: boolean | SceneShellFlowMenuOptions;
  name?: string;
  saves?: boolean | SceneShellFlowSavesOptions;
  scenes: Record<string, SceneDefinition>;
  settings?: boolean | SceneShellFlowSettingsOptions;
  session?: boolean | SceneShellFlowSessionOptions;
  title?: boolean | SceneShellFlowTitleOptions;
}

export interface SceneShellFlowResult {
  initialScene: string;
  menuSceneId?: string;
  saveProfileSceneIds?: Record<string, string>;
  scenes: Record<string, SceneDefinition>;
  savesSceneId?: string;
  settingsSceneId?: string;
  targetSceneId: string;
  titleSceneId?: string;
}

function normalizeTitleOptions(
  title: boolean | SceneShellFlowTitleOptions | undefined
): SceneShellFlowTitleOptions | undefined {
  if (!title) {
    return undefined;
  }

  return title === true ? {} : title;
}

function normalizeMenuOptions(
  menu: boolean | SceneShellFlowMenuOptions | undefined
): SceneShellFlowMenuOptions | undefined {
  if (!menu) {
    return undefined;
  }

  return menu === true ? {} : menu;
}

function normalizeSessionOptions(
  session: boolean | SceneShellFlowSessionOptions | undefined
): SceneShellFlowSessionOptions | undefined {
  if (!session) {
    return undefined;
  }

  return session === true ? {} : session;
}

function normalizeSavesOptions(
  saves: boolean | SceneShellFlowSavesOptions | undefined
): SceneShellFlowSavesOptions | undefined {
  if (!saves) {
    return undefined;
  }

  return saves === true ? {} : saves;
}

function normalizeSettingsOptions(
  settings: boolean | SceneShellFlowSettingsOptions | undefined
): SceneShellFlowSettingsOptions | undefined {
  if (!settings) {
    return undefined;
  }

  return settings === true ? {} : settings;
}

function resolveSceneKey(
  record: Record<string, SceneDefinition>,
  explicit: string | undefined,
  fallback: string
): string {
  if (explicit) {
    if (!(explicit in record)) {
      throw new Error(`Unknown scene "${explicit}" in shell flow definition`);
    }

    return explicit;
  }

  if (!(fallback in record)) {
    throw new Error(`Unknown scene "${fallback}" in shell flow definition`);
  }

  return fallback;
}

function createSceneLoadAction(
  sceneId: string,
  action: ShellFlowSceneLoadActionInput | undefined,
  label: string,
  variant: NonNullable<SceneShellActionDefinition['variant']>
): SceneShellActionDefinition {
  return createLoadSceneShellAction(sceneId, {
    ...action,
    label: action?.label ?? label,
    variant: action?.variant ?? variant,
  });
}

function createOpenActiveProfileArchiveAction(
  profileSceneIds: Record<string, string>,
  fallbackSceneId: string | undefined,
  action: ShellFlowSceneLoadActionInput | undefined,
  label: string,
  variant: NonNullable<SceneShellActionDefinition['variant']>
): SceneShellActionDefinition {
  return createOpenActiveProfileArchiveSceneShellAction(profileSceneIds, {
    ...action,
    fallbackSceneId,
    label: action?.label ?? label,
    variant: action?.variant ?? variant,
  });
}

function createActiveProfileTargets(
  profiles: SceneShellFlowSaveProfile[],
  fallbackSlots: Array<SceneShellFlowSaveSlot | string> | undefined,
  emptySceneIds: Record<string, string>
) {
  return Object.fromEntries(
    profiles.map((profile) => [
      profile.id,
      {
        emptySceneId: emptySceneIds[profile.id],
        slots: normalizeProfileSaveSlots(profile, profile.slots ?? fallbackSlots).map((slot) =>
          getSaveSlotStorageId(slot)
        ),
      },
    ])
  );
}

function createLoadActiveProfileAction(
  profiles: SceneShellFlowSaveProfile[],
  fallbackSlots: Array<SceneShellFlowSaveSlot | string> | undefined,
  emptySceneIds: Record<string, string>,
  fallbackSceneId: string | undefined,
  action:
    | Omit<
        Partial<Extract<SceneShellActionDefinition, { type: 'load-active-profile' }>>,
        'profiles' | 'type'
      >
    | undefined,
  label: string,
  variant: NonNullable<SceneShellActionDefinition['variant']>
): SceneShellActionDefinition {
  return createLoadActiveProfileSceneShellAction(
    createActiveProfileTargets(profiles, fallbackSlots, emptySceneIds),
    {
      ...action,
      fallbackSceneId,
      label: action?.label ?? label,
      variant: action?.variant ?? variant,
    }
  );
}

function createTogglePauseAction(
  action: ShellFlowTogglePauseActionInput | undefined,
  label: string
): SceneShellActionDefinition {
  return createTogglePauseSceneShellAction({
    ...action,
    label: action?.label ?? label,
    variant: action?.variant ?? 'ghost',
  });
}

function createShellScaffold(
  defaults: ShellFlowScaffoldInput | undefined,
  override: ShellFlowScaffoldInput | undefined,
  fallback: ShellFlowScaffoldInput = {}
): ShellFlowScaffoldInput {
  return {
    ...fallback,
    ...defaults,
    ...override,
  };
}

function formatSaveSlotLabel(slot: string): string {
  return slot
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function createSaveProfileSceneId(selectorSceneId: string, profileId: string): string {
  return `${selectorSceneId}-${profileId}`;
}

function createProfileActionLabel(state: 'empty' | 'occupied', label: string): string {
  return state === 'empty' ? `Start ${label}` : `Continue ${label}`;
}

function mapSaveSlotDefinitions(slots: SceneShellFlowSaveSlot[]) {
  return slots.map((slot) => ({
    allowDelete: slot.allowDelete,
    allowLoad: slot.allowLoad,
    allowSave: slot.allowSave,
    description: slot.description,
    emptyLabel: slot.emptyLabel,
    label: slot.label,
    savedLabel: slot.savedLabel,
    slot: slot.slot,
    storageSlot: slot.storageSlot,
  }));
}

function normalizeSaveSlots(
  slots: Array<SceneShellFlowSaveSlot | string> | undefined
): SceneShellFlowSaveSlot[] {
  if (!slots || slots.length === 0) {
    return [
      {
        label: 'Slot 1',
        slot: 'slot-1',
      },
    ];
  }

  return slots.map((slot) =>
    typeof slot === 'string'
      ? {
          label: formatSaveSlotLabel(slot),
          slot,
        }
      : {
          allowDelete: slot.allowDelete,
          allowLoad: slot.allowLoad,
          allowSave: slot.allowSave,
          ...slot,
          emptyLabel: slot.emptyLabel,
          label: slot.label ?? formatSaveSlotLabel(slot.slot),
          savedLabel: slot.savedLabel,
          storageSlot: slot.storageSlot,
        }
  );
}

function getSaveSlotStorageId(slot: SceneShellFlowSaveSlot) {
  return slot.storageSlot ?? slot.slot;
}

function normalizeProfileSaveSlots(
  profile: SceneShellFlowSaveProfile,
  slots: Array<SceneShellFlowSaveSlot | string> | undefined
): SceneShellFlowSaveSlot[] {
  const normalizedSlots = normalizeSaveSlots(slots);
  const slotNamespace =
    profile.slotNamespace === false ? undefined : (profile.slotNamespace ?? profile.id);

  return normalizedSlots.map((slot) => ({
    ...slot,
    storageSlot: slot.storageSlot ?? (slotNamespace ? `${slotNamespace}:${slot.slot}` : undefined),
  }));
}

function mapSaveProfileDefinitions(
  selectorSceneId: string,
  profiles: SceneShellFlowSaveProfile[],
  fallbackSlots: Array<SceneShellFlowSaveSlot | string> | undefined
) {
  return profiles.map((profile) => {
    const label = profile.label ?? formatSaveSlotLabel(profile.id);

    return {
      description: profile.description,
      emptyActionLabel: profile.emptyActionLabel ?? createProfileActionLabel('empty', label),
      id: profile.id,
      label,
      occupiedActionLabel:
        profile.occupiedActionLabel ?? createProfileActionLabel('occupied', label),
      sceneId: profile.sceneId ?? createSaveProfileSceneId(selectorSceneId, profile.id),
      slots: mapSaveSlotDefinitions(
        normalizeProfileSaveSlots(profile, profile.slots ?? fallbackSlots)
      ),
    };
  });
}

function normalizeSaveProfiles(
  profiles: Array<SceneShellFlowSaveProfile | string> | undefined,
  selectorSceneId: string
): SceneShellFlowSaveProfile[] {
  if (!profiles || profiles.length === 0) {
    return [];
  }

  return profiles.map((profile) =>
    typeof profile === 'string'
      ? {
          id: profile,
          label: formatSaveSlotLabel(profile),
          sceneId: createSaveProfileSceneId(selectorSceneId, profile),
        }
      : {
          ...profile,
          allowClear: profile.allowClear,
          clearAction: profile.clearAction ? { ...profile.clearAction } : undefined,
          emptyActionLabel: profile.emptyActionLabel,
          label: profile.label ?? formatSaveSlotLabel(profile.id),
          manageAction: profile.manageAction ? { ...profile.manageAction } : undefined,
          occupiedActionLabel: profile.occupiedActionLabel,
          sceneId: profile.sceneId ?? createSaveProfileSceneId(selectorSceneId, profile.id),
        }
  );
}

function createClearProfileActionLabel(
  explicitLabel: string | undefined,
  profileLabel: string,
  labels: SceneShellFlowActionLabels | undefined
) {
  if (explicitLabel) {
    return explicitLabel;
  }

  return `${labels?.clearProfile ?? 'Clear'} ${profileLabel}`;
}

function createManageProfileActionLabel(
  explicitLabel: string | undefined,
  profileLabel: string,
  labels: SceneShellFlowActionLabels | undefined
) {
  if (explicitLabel) {
    return explicitLabel;
  }

  return `${labels?.manageProfile ?? 'Manage'} ${profileLabel}`;
}

function createPersistenceActionLabel(
  explicitLabel: string | undefined,
  singularLabel: string,
  pluralLabel: string,
  slotLabel: string,
  multipleSlots: boolean
): string {
  if (explicitLabel) {
    return explicitLabel;
  }

  return multipleSlots ? `${pluralLabel} ${slotLabel}` : singularLabel;
}

function createSaveSceneActions(
  slots: SceneShellFlowSaveSlot[],
  labels: SceneShellFlowActionLabels | undefined,
  backSceneId: string | undefined,
  backAction: ShellFlowSceneLoadActionInput | undefined,
  backLabel: string
): SceneShellActionDefinition[] | undefined {
  const multipleSlots = slots.length > 1;
  const actions = slots.flatMap((slot) => {
    const slotLabel = slot.label ?? formatSaveSlotLabel(slot.slot);
    const slotActions: SceneShellActionDefinition[] = [];

    if (slot.allowSave !== false) {
      slotActions.push(
        createSaveGameSceneShellAction(getSaveSlotStorageId(slot), {
          ...slot.saveAction,
          label: createPersistenceActionLabel(
            slot.saveAction?.label,
            labels?.save ?? 'Save Game',
            labels?.save ?? 'Save',
            slotLabel,
            multipleSlots
          ),
          variant: slot.saveAction?.variant ?? 'primary',
        })
      );
    }

    if (slot.allowLoad !== false) {
      slotActions.push(
        createLoadGameSceneShellAction(getSaveSlotStorageId(slot), {
          ...slot.loadAction,
          label: createPersistenceActionLabel(
            slot.loadAction?.label,
            labels?.load ?? 'Load Game',
            labels?.load ?? 'Load',
            slotLabel,
            multipleSlots
          ),
          variant: slot.loadAction?.variant ?? 'secondary',
        })
      );
    }

    if (slot.allowDelete !== false) {
      slotActions.push(
        createDeleteSaveSceneShellAction(getSaveSlotStorageId(slot), {
          ...slot.deleteAction,
          label: createPersistenceActionLabel(
            slot.deleteAction?.label,
            labels?.deleteSave ?? 'Delete Save',
            labels?.deleteSave ?? 'Delete',
            slotLabel,
            multipleSlots
          ),
          variant: slot.deleteAction?.variant ?? 'ghost',
        })
      );
    }

    return slotActions;
  });

  if (backSceneId) {
    actions.push(createSceneLoadAction(backSceneId, backAction, backLabel, 'secondary'));
  }

  return actions.length > 0 ? actions : undefined;
}

function createSaveProfileActions(
  profiles: SceneShellFlowSaveProfile[],
  fallbackSlots: Array<SceneShellFlowSaveSlot | string> | undefined,
  emptySceneIds: Record<string, string>,
  labels: SceneShellFlowActionLabels | undefined,
  backSceneId: string | undefined,
  backAction: ShellFlowSceneLoadActionInput | undefined,
  backLabel: string
): SceneShellActionDefinition[] | undefined {
  const actions = profiles.flatMap((profile, index) => {
    const profileLabel = profile.label ?? formatSaveSlotLabel(profile.id);
    const profileSceneId = profile.sceneId ?? createSaveProfileSceneId('saves', profile.id);
    const profileSlots = normalizeProfileSaveSlots(profile, profile.slots ?? fallbackSlots);
    const profileActions = [
      createLoadLatestProfileSceneShellAction(
        profile.id,
        profileSlots.map((slot) => getSaveSlotStorageId(slot)),
        {
          ...profile.action,
          description: profile.action?.description ?? profile.description,
          emptySceneId: emptySceneIds[profile.id],
          label: profileLabel,
          variant: profile.action?.variant ?? (index === 0 ? 'primary' : 'secondary'),
        }
      ),
      createSceneLoadAction(
        profileSceneId,
        {
          ...profile.manageAction,
          profileId: profile.manageAction?.profileId ?? profile.id,
        },
        createManageProfileActionLabel(profile.manageAction?.label, profileLabel, labels),
        profile.manageAction?.variant ?? 'secondary'
      ),
    ];

    if (profile.allowClear !== false && profileSlots.length > 0) {
      profileActions.push(
        createClearProfileSceneShellAction(
          profile.id,
          profileSlots.map((slot) => getSaveSlotStorageId(slot)),
          {
            ...profile.clearAction,
            label: createClearProfileActionLabel(profile.clearAction?.label, profileLabel, labels),
            variant: profile.clearAction?.variant ?? 'ghost',
          }
        )
      );
    }

    return profileActions;
  });

  if (backSceneId) {
    actions.push(createSceneLoadAction(backSceneId, backAction, backLabel, 'secondary'));
  }

  return actions.length > 0 ? actions : undefined;
}

export function createSceneShellFlow(options: CreateSceneShellFlowOptions): SceneShellFlowResult {
  const title = normalizeTitleOptions(options.title);
  const menu = normalizeMenuOptions(options.menu);
  const session = normalizeSessionOptions(options.session);
  const saves = normalizeSavesOptions(options.saves);
  const settings = normalizeSettingsOptions(options.settings);
  const shellDefaults = options.defaults;
  const labels = shellDefaults?.actionLabels;
  const titleSceneId = title?.sceneId ?? 'title';
  const menuSceneId = menu?.sceneId ?? 'menu';
  const savesSceneId = saves?.sceneId ?? 'saves';
  const settingsSceneId = settings?.sceneId ?? 'settings';
  const saveProfiles = saves ? normalizeSaveProfiles(saves.profiles, savesSceneId) : [];
  const hasSaveProfiles = saveProfiles.length > 0;
  const saveProfileSceneIds = Object.fromEntries(
    saveProfiles.map((profile) => [
      profile.id,
      profile.sceneId ?? createSaveProfileSceneId(savesSceneId, profile.id),
    ])
  );
  const defaultSceneId = resolveSceneKey(
    options.scenes,
    options.defaultSceneId,
    options.defaultSceneId
  );
  const generatedInitialSceneIds = new Set([
    ...(title ? [titleSceneId] : []),
    ...(menu ? [menuSceneId] : []),
    ...(saves ? [savesSceneId] : []),
    ...(settings ? [settingsSceneId] : []),
    ...Object.values(saveProfileSceneIds),
  ]);
  const baseInitialScene =
    options.initialScene && generatedInitialSceneIds.has(options.initialScene)
      ? undefined
      : options.initialScene;
  const targetSceneId = resolveSceneKey(options.scenes, baseInitialScene, defaultSceneId);
  const saveProfileEntrySceneIds = Object.fromEntries(
    saveProfiles.map((profile) => [
      profile.id,
      resolveSceneKey(options.scenes, profile.action?.emptySceneId, targetSceneId),
    ])
  );

  if (title && titleSceneId in options.scenes) {
    throw new Error(`Title scene id "${titleSceneId}" conflicts with an existing scene`);
  }

  if (menu && menuSceneId in options.scenes) {
    throw new Error(`Menu scene id "${menuSceneId}" conflicts with an existing scene`);
  }

  if (title && menu && titleSceneId === menuSceneId) {
    throw new Error(`Menu scene id "${menuSceneId}" conflicts with the generated title scene`);
  }

  if (saves && savesSceneId in options.scenes) {
    throw new Error(`Save scene id "${savesSceneId}" conflicts with an existing scene`);
  }

  if (saves && title && savesSceneId === titleSceneId) {
    throw new Error(`Save scene id "${savesSceneId}" conflicts with the generated title scene`);
  }

  if (saves && menu && savesSceneId === menuSceneId) {
    throw new Error(`Save scene id "${savesSceneId}" conflicts with the generated menu scene`);
  }

  if (settings && settingsSceneId in options.scenes) {
    throw new Error(`Settings scene id "${settingsSceneId}" conflicts with an existing scene`);
  }

  if (settings && saves && settingsSceneId === savesSceneId) {
    throw new Error(
      `Settings scene id "${settingsSceneId}" conflicts with the generated save scene`
    );
  }

  if (settings && title && settingsSceneId === titleSceneId) {
    throw new Error(
      `Settings scene id "${settingsSceneId}" conflicts with the generated title scene`
    );
  }

  if (settings && menu && settingsSceneId === menuSceneId) {
    throw new Error(
      `Settings scene id "${settingsSceneId}" conflicts with the generated menu scene`
    );
  }

  if (saves) {
    const generatedSceneOwners = new Map<string, string>([
      [savesSceneId, hasSaveProfiles ? 'generated save selector scene' : 'generated save scene'],
    ]);

    if (title) {
      generatedSceneOwners.set(titleSceneId, 'generated title scene');
    }

    if (menu) {
      generatedSceneOwners.set(menuSceneId, 'generated menu scene');
    }

    if (settings) {
      generatedSceneOwners.set(settingsSceneId, 'generated settings scene');
    }

    for (const profile of saveProfiles) {
      const profileSceneId = profile.sceneId ?? createSaveProfileSceneId(savesSceneId, profile.id);

      if (profileSceneId in options.scenes) {
        throw new Error(
          `Save profile scene id "${profileSceneId}" conflicts with an existing scene`
        );
      }

      const owner = generatedSceneOwners.get(profileSceneId);
      if (owner) {
        throw new Error(`Save profile scene id "${profileSceneId}" conflicts with the ${owner}`);
      }

      generatedSceneOwners.set(profileSceneId, `generated save profile "${profile.id}"`);
    }
  }

  const titleTargetSceneId = title
    ? resolveSceneKey(options.scenes, title.targetSceneId, targetSceneId)
    : undefined;
  const menuTargetSceneId = menu
    ? resolveSceneKey(options.scenes, menu.targetSceneId, targetSceneId)
    : undefined;
  const settingsBackSceneId =
    settings?.backSceneId ?? (menu ? menuSceneId : title ? titleSceneId : targetSceneId);
  const settingsBackLabel =
    menu && settingsBackSceneId === menuSceneId ? 'Back to Menu' : (labels?.back ?? 'Back');
  const savesBackSceneId =
    saves?.backSceneId ??
    (settings ? settingsSceneId : menu ? menuSceneId : title ? titleSceneId : targetSceneId);
  const savesBackLabel =
    settings && savesBackSceneId === settingsSceneId
      ? 'Back to Settings'
      : menu && savesBackSceneId === menuSceneId
        ? 'Back to Menu'
        : (labels?.back ?? 'Back');
  const saveProfileBackLabel = `Back to ${labels?.saves ?? 'Saves'}`;
  const profileSelectorBackSceneId = saves?.profileSelector?.backSceneId ?? savesBackSceneId;
  const profileSelectorBackAction = saves?.profileSelector?.backAction ?? saves?.backAction;
  const profileSelectorBackLabel =
    settings && profileSelectorBackSceneId === settingsSceneId
      ? 'Back to Settings'
      : menu && profileSelectorBackSceneId === menuSceneId
        ? 'Back to Menu'
        : (labels?.back ?? 'Back');
  const sessionTargetSceneId = session
    ? resolveSceneKey(options.scenes, session.targetSceneId, targetSceneId)
    : undefined;
  const menuBackSceneId = menu?.backSceneId ?? (title ? titleSceneId : undefined);
  const saveSlots = saves ? normalizeSaveSlots(saves.slots) : [];
  const profileSaveShellDefaults = shellDefaults?.saves
    ? (({
        description: _ignoredDescription,
        title: _ignoredTitle,
        ...rest
      }: ShellFlowScaffoldInput) => rest)(shellDefaults.saves)
    : undefined;

  const generatedScenes = {
    ...options.scenes,
    ...(menu
      ? {
          [menuSceneId]: createMenuScene(menuSceneId, {
            render: menu.render,
            setup: menu.setup,
            teardown: menu.teardown,
            transition: menu.transition,
            ui: menu.ui,
            shell: {
              ...createShellScaffold(shellDefaults?.menu, menu.shell, {
                title: `${options.name ?? 'Game'} Menu`,
              }),
              actions:
                menu.shell?.actions ??
                (menuTargetSceneId
                  ? [
                      hasSaveProfiles
                        ? createLoadActiveProfileAction(
                            saveProfiles,
                            saves?.slots,
                            saveProfileEntrySceneIds,
                            menuTargetSceneId,
                            menu.continueAction,
                            labels?.continue ?? 'Continue',
                            'primary'
                          )
                        : createSceneLoadAction(
                            menuTargetSceneId,
                            menu.continueAction,
                            labels?.continue ?? 'Continue',
                            'primary'
                          ),
                      ...(settings
                        ? [
                            createSceneLoadAction(
                              settingsSceneId,
                              menu.settingsAction,
                              labels?.settings ?? 'Settings',
                              'secondary'
                            ),
                          ]
                        : []),
                      ...(saves
                        ? [
                            hasSaveProfiles
                              ? createOpenActiveProfileArchiveAction(
                                  saveProfileSceneIds,
                                  savesSceneId,
                                  menu.savesAction,
                                  labels?.saves ?? 'Saves',
                                  'secondary'
                                )
                              : createSceneLoadAction(
                                  savesSceneId,
                                  menu.savesAction,
                                  labels?.saves ?? 'Saves',
                                  'secondary'
                                ),
                          ]
                        : []),
                      ...(menuBackSceneId
                        ? [
                            createSceneLoadAction(
                              menuBackSceneId,
                              menu.backAction,
                              labels?.back ?? 'Back',
                              'secondary'
                            ),
                          ]
                        : []),
                    ]
                  : undefined),
            },
          }),
        }
      : {}),
    ...(title
      ? {
          [titleSceneId]: createTitleScene(titleSceneId, {
            render: title.render,
            setup: title.setup,
            teardown: title.teardown,
            transition: title.transition,
            ui: title.ui,
            shell: {
              ...createShellScaffold(shellDefaults?.title, title.shell, {
                title: options.name ?? 'Game',
              }),
              actions:
                title.shell?.actions ??
                (titleTargetSceneId
                  ? [
                      createSceneLoadAction(
                        titleTargetSceneId,
                        title.action,
                        labels?.start ?? 'Start Game',
                        'primary'
                      ),
                      ...(hasSaveProfiles
                        ? [
                            createLoadActiveProfileAction(
                              saveProfiles,
                              saves?.slots,
                              saveProfileEntrySceneIds,
                              savesSceneId,
                              undefined,
                              labels?.continue ?? 'Continue',
                              'secondary'
                            ),
                          ]
                        : []),
                      ...(menu
                        ? [
                            createSceneLoadAction(
                              menuSceneId,
                              title.menuAction,
                              labels?.menu ?? 'Options',
                              'secondary'
                            ),
                          ]
                        : []),
                      ...(settings
                        ? [
                            createSceneLoadAction(
                              settingsSceneId,
                              title.settingsAction,
                              labels?.settings ?? 'Settings',
                              'secondary'
                            ),
                          ]
                        : []),
                      ...(saves
                        ? [
                            hasSaveProfiles
                              ? createOpenActiveProfileArchiveAction(
                                  saveProfileSceneIds,
                                  savesSceneId,
                                  title.savesAction,
                                  labels?.saves ?? 'Saves',
                                  'secondary'
                                )
                              : createSceneLoadAction(
                                  savesSceneId,
                                  title.savesAction,
                                  labels?.saves ?? 'Saves',
                                  'secondary'
                                ),
                          ]
                        : []),
                    ]
                  : undefined),
            },
          }),
        }
      : {}),
    ...(saves
      ? hasSaveProfiles
        ? {
            [savesSceneId]: createSaveProfilesScene(savesSceneId, {
              render: saves.profileSelector?.render,
              setup: saves.profileSelector?.setup,
              teardown: saves.profileSelector?.teardown,
              transition: saves.profileSelector?.transition,
              ui: saves.profileSelector?.ui,
              shell: {
                ...createShellScaffold(undefined, saves.profileSelector?.shell, {
                  description: 'Choose a save profile to manage its archive slots.',
                  subtitle: 'SAVE PROFILES',
                  title: `${options.name ?? 'Game'} Saves`,
                }),
                saveProfiles: mapSaveProfileDefinitions(savesSceneId, saveProfiles, saves.slots),
                actions:
                  saves.profileSelector?.shell?.actions ??
                  createSaveProfileActions(
                    saveProfiles,
                    saves.slots,
                    saveProfileEntrySceneIds,
                    labels,
                    profileSelectorBackSceneId,
                    profileSelectorBackAction,
                    profileSelectorBackLabel
                  ),
              },
            }),
            ...Object.fromEntries(
              saveProfiles.map((profile) => {
                const profileSceneId =
                  profile.sceneId ?? createSaveProfileSceneId(savesSceneId, profile.id);
                const profileSaveSlots = normalizeProfileSaveSlots(
                  profile,
                  profile.slots ?? saves.slots
                );

                return [
                  profileSceneId,
                  createSaveScene(profileSceneId, {
                    render: saves.render,
                    setup: saves.setup,
                    teardown: saves.teardown,
                    transition: saves.transition,
                    ui: saves.ui,
                    shell: {
                      ...createShellScaffold(
                        profileSaveShellDefaults,
                        createShellScaffold(saves.shell, profile.shell),
                        {
                          description: profile.description,
                          title: `${profile.label ?? formatSaveSlotLabel(profile.id)} Saves`,
                        }
                      ),
                      saveSlots: mapSaveSlotDefinitions(profileSaveSlots),
                      actions:
                        profile.shell?.actions ??
                        saves.shell?.actions ??
                        createSaveSceneActions(
                          profileSaveSlots,
                          labels,
                          savesSceneId,
                          undefined,
                          saveProfileBackLabel
                        ),
                    },
                  }),
                ] as const;
              })
            ),
          }
        : {
            [savesSceneId]: createSaveScene(savesSceneId, {
              render: saves.render,
              setup: saves.setup,
              teardown: saves.teardown,
              transition: saves.transition,
              ui: saves.ui,
              shell: {
                ...createShellScaffold(shellDefaults?.saves, saves.shell, {
                  title: `${options.name ?? 'Game'} Saves`,
                }),
                saveSlots: mapSaveSlotDefinitions(saveSlots),
                actions:
                  saves.shell?.actions ??
                  createSaveSceneActions(
                    saveSlots,
                    labels,
                    savesBackSceneId,
                    saves.backAction,
                    savesBackLabel
                  ),
              },
            }),
          }
      : {}),
    ...(settings
      ? {
          [settingsSceneId]: createMenuScene(settingsSceneId, {
            render: settings.render,
            setup: settings.setup,
            teardown: settings.teardown,
            transition: settings.transition,
            ui: settings.ui,
            shell: {
              ...createShellScaffold(shellDefaults?.settings, settings.shell, {
                title: `${options.name ?? 'Game'} Settings`,
              }),
              actions:
                settings.shell?.actions ??
                (settingsBackSceneId || saves
                  ? [
                      ...(saves
                        ? [
                            hasSaveProfiles
                              ? createOpenActiveProfileArchiveAction(
                                  saveProfileSceneIds,
                                  savesSceneId,
                                  settings.savesAction,
                                  labels?.saves ?? 'Saves',
                                  'secondary'
                                )
                              : createSceneLoadAction(
                                  savesSceneId,
                                  settings.savesAction,
                                  labels?.saves ?? 'Saves',
                                  'secondary'
                                ),
                          ]
                        : []),
                      ...(settingsBackSceneId
                        ? [
                            createSceneLoadAction(
                              settingsBackSceneId,
                              settings.backAction,
                              settingsBackLabel,
                              'secondary'
                            ),
                          ]
                        : []),
                    ]
                  : undefined),
            },
          }),
        }
      : {}),
  };

  const scenes =
    session && sessionTargetSceneId
      ? {
          ...generatedScenes,
          [sessionTargetSceneId]: {
            ...generatedScenes[sessionTargetSceneId],
            shell: createSessionSceneShell({
              ...createShellScaffold(shellDefaults?.session, session.shell, {
                description: generatedScenes[sessionTargetSceneId].shell?.description,
                showSceneId: generatedScenes[sessionTargetSceneId].shell?.showSceneId,
                showOnEnter: generatedScenes[sessionTargetSceneId].shell?.showOnEnter,
                title: generatedScenes[sessionTargetSceneId].shell?.title,
              }),
              actions: session.shell?.actions ?? [
                ...(menu
                  ? [
                      createSceneLoadAction(
                        menuSceneId,
                        session.menuAction,
                        labels?.menu ?? 'Open Menu',
                        'secondary'
                      ),
                    ]
                  : []),
                ...(title
                  ? [
                      createSceneLoadAction(
                        titleSceneId,
                        session.titleAction,
                        labels?.title ?? 'Return to Hub',
                        'secondary'
                      ),
                    ]
                  : []),
                ...(settings
                  ? [
                      createSceneLoadAction(
                        settingsSceneId,
                        session.settingsAction,
                        labels?.settings ?? 'Settings',
                        'secondary'
                      ),
                    ]
                  : []),
                ...(saves
                  ? [
                      hasSaveProfiles
                        ? createOpenActiveProfileArchiveAction(
                            saveProfileSceneIds,
                            savesSceneId,
                            session.savesAction,
                            labels?.saves ?? 'Saves',
                            'secondary'
                          )
                        : createSceneLoadAction(
                            savesSceneId,
                            session.savesAction,
                            labels?.saves ?? 'Saves',
                            'secondary'
                          ),
                    ]
                  : []),
                createTogglePauseAction(session.pauseAction, labels?.pause ?? 'Pause'),
              ],
            }),
          },
        }
      : generatedScenes;

  return {
    initialScene:
      options.initialScene ??
      (title ? titleSceneId : menu ? menuSceneId : saves ? savesSceneId : targetSceneId),
    menuSceneId: menu ? menuSceneId : undefined,
    saveProfileSceneIds: hasSaveProfiles ? saveProfileSceneIds : undefined,
    scenes,
    savesSceneId: saves ? savesSceneId : undefined,
    settingsSceneId: settings ? settingsSceneId : undefined,
    targetSceneId,
    titleSceneId: title ? titleSceneId : undefined,
  };
}
