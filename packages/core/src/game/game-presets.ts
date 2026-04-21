import { createGame } from '../api/createGame';
import { createAnnouncementSceneShell } from './scene-shell-presets';
import {
  createSceneShellFlow,
  type SceneShellFlowDefaults,
  type SceneShellFlowMenuOptions,
  type SceneShellFlowSavesOptions,
  type SceneShellFlowSessionOptions,
  type SceneShellFlowSettingsOptions,
  type SceneShellFlowTitleOptions,
} from './shell-flow-presets';
import type {
  ActionState,
  BuiltInStatePreset,
  PresetGameDefinition,
  PuzzleState,
  RacingState,
  RPGState,
  SandboxState,
  StateForPreset,
} from './state-presets';
import type {
  DeepPartial,
  GameDefinition,
  GameTransitionOptions,
  GameTransitionsDefinition,
  GameUIShellDefinition,
  InputMapping,
  ModeDefinition,
  SceneDefinition,
} from './types';

type TemplateSceneInput = Partial<Omit<SceneDefinition, 'id'>> & { id?: string };
type TemplateModeInput = Partial<Omit<ModeDefinition, 'id'>> & { id?: string };
type PresetTitleSceneOptions = SceneShellFlowTitleOptions;
type PresetMenuSceneOptions = SceneShellFlowMenuOptions;
type PresetSaveSceneOptions = SceneShellFlowSavesOptions;
type PresetSettingsSceneOptions = SceneShellFlowSettingsOptions;
type PresetSessionShellOptions = SceneShellFlowSessionOptions;

type TemplateGameOptions<TPreset extends BuiltInStatePreset> = Omit<
  PresetGameDefinition<TPreset>,
  | 'content'
  | 'controls'
  | 'defaultMode'
  | 'initialScene'
  | 'modes'
  | 'name'
  | 'scenes'
  | 'statePreset'
  | 'version'
  | 'world'
> & {
  content?: Partial<GameDefinition<StateForPreset<TPreset>>['content']>;
  controls?: GameDefinition<StateForPreset<TPreset>>['controls'];
  defaultMode?: string;
  initialScene?: string;
  modes?: Record<string, TemplateModeInput>;
  menuScene?: boolean | PresetMenuSceneOptions;
  name?: string;
  saveScene?: boolean | PresetSaveSceneOptions;
  scenes?: Record<string, TemplateSceneInput>;
  settingsScene?: boolean | PresetSettingsSceneOptions;
  sessionShell?: boolean | PresetSessionShellOptions;
  titleScene?: boolean | PresetTitleSceneOptions;
  version?: string;
  world?: GameDefinition<StateForPreset<TPreset>>['world'];
};

export type RPGGameOptions = TemplateGameOptions<'rpg'>;
export type ActionGameOptions = TemplateGameOptions<'action'>;
export type PuzzleGameOptions = TemplateGameOptions<'puzzle'>;
export type SandboxGameOptions = TemplateGameOptions<'sandbox'>;
export type RacingGameOptions = TemplateGameOptions<'racing'>;
export type PlatformerGameOptions = TemplateGameOptions<'action'>;
type PresetShellDefaults = SceneShellFlowDefaults;

interface PresetTemplateDefaults<TPreset extends BuiltInStatePreset> {
  defaultMode: string;
  defaultName: string;
  defaultScene: string;
  modes: Record<string, TemplateModeInput>;
  scenes: Record<string, TemplateSceneInput>;
  shellDefaults?: PresetShellDefaults;
  statePreset: TPreset;
  transitions?: GameTransitionsDefinition;
  uiShell?: GameUIShellDefinition;
}

const DEFAULT_VERSION = '0.1.0';

function createEmptyContent<TState extends object>(): GameDefinition<TState>['content'] {
  return {
    materials: [],
    creatures: [],
    props: [],
    items: [],
  };
}

function createEmptyControls<TState extends object>(): GameDefinition<TState>['controls'] {
  return {};
}

function createEmptyWorld<TState extends object>(): GameDefinition<TState>['world'] {
  return {
    regions: {},
    connections: [],
  };
}

function createNullScene(id: string): TemplateSceneInput {
  return {
    id,
    render: () => null,
  };
}

function createModeTemplate(id: string): TemplateModeInput {
  return {
    id,
    systems: [],
    inputMap: {},
  };
}

function createInputMapping(
  keyboard: string[] = [],
  gamepad?: string | number
): InputMapping[string] {
  return {
    keyboard,
    gamepad,
  };
}

function mergeInputMappings(base: InputMapping = {}, override?: InputMapping): InputMapping {
  const keys = new Set([...Object.keys(base), ...Object.keys(override ?? {})]);

  return Object.fromEntries(
    [...keys].map((action) => [
      action,
      {
        ...base[action],
        ...override?.[action],
      },
    ])
  );
}

function shouldExtendTemplateRecords<T extends object>(
  overrides: Record<string, T> | undefined,
  defaults: Record<string, T>
): boolean {
  if (!overrides || Object.keys(overrides).length === 0) {
    return true;
  }

  return Object.keys(overrides).some((key) => key in defaults);
}

function normalizeScenes(
  scenes: Record<string, TemplateSceneInput> | undefined,
  defaults: Record<string, TemplateSceneInput>
): Record<string, SceneDefinition> {
  const extendDefaults = shouldExtendTemplateRecords(scenes, defaults);
  const keys = extendDefaults
    ? new Set([...Object.keys(defaults), ...Object.keys(scenes ?? {})])
    : new Set(Object.keys(scenes ?? defaults));

  return Object.fromEntries(
    [...keys].map((id) => {
      const base = extendDefaults ? (defaults[id] ?? createNullScene(id)) : createNullScene(id);
      const override = scenes?.[id];

      return [
        id,
        {
          ...base,
          ...override,
          id,
          render: override?.render ?? base.render ?? (() => null),
          shell: mergeSceneShell(base.shell, override?.shell),
          transition: mergeTransitionOptions(base.transition, override?.transition),
        } satisfies SceneDefinition,
      ];
    })
  );
}

function normalizeModes(
  modes: Record<string, TemplateModeInput> | undefined,
  defaults: Record<string, TemplateModeInput>
): Record<string, ModeDefinition> {
  const extendDefaults = shouldExtendTemplateRecords(modes, defaults);
  const keys = extendDefaults
    ? new Set([...Object.keys(defaults), ...Object.keys(modes ?? {})])
    : new Set(Object.keys(modes ?? defaults));

  return Object.fromEntries(
    [...keys].map((id) => {
      const base = extendDefaults
        ? (defaults[id] ?? createModeTemplate(id))
        : createModeTemplate(id);
      const override = modes?.[id];

      return [
        id,
        {
          ...base,
          ...override,
          id,
          systems: override?.systems ?? base.systems ?? [],
          inputMap: mergeInputMappings(base.inputMap ?? {}, override?.inputMap),
          transition: mergeTransitionOptions(base.transition, override?.transition),
        } satisfies ModeDefinition,
      ];
    })
  );
}

function resolveRecordKey(
  kind: 'mode' | 'scene',
  record: Record<string, unknown>,
  explicit: string | undefined,
  fallback: string
): string {
  if (explicit) {
    if (!(explicit in record)) {
      throw new Error(`Unknown ${kind} "${explicit}" in preset game definition`);
    }

    return explicit;
  }

  if (fallback in record) {
    return fallback;
  }

  const firstKey = Object.keys(record)[0];
  if (!firstKey) {
    throw new Error(`Preset game definition requires at least one ${kind}`);
  }

  return firstKey;
}

function mergeTransitionOptions(
  ...options: Array<GameTransitionOptions | undefined>
): GameTransitionOptions | undefined {
  let merged: GameTransitionOptions | undefined;

  for (const option of options) {
    if (!option) {
      continue;
    }

    merged = {
      transition: option.transition ?? merged?.transition,
      transitionOut: option.transitionOut ?? merged?.transitionOut,
      transitionIn: option.transitionIn ?? merged?.transitionIn,
    };
  }

  return merged;
}

function mergeSceneShell(
  base: SceneDefinition['shell'],
  override: SceneDefinition['shell']
): SceneDefinition['shell'] {
  if (!base) {
    return override ? { ...override } : undefined;
  }

  if (!override) {
    return base;
  }

  return {
    ...base,
    ...override,
  };
}

function mergeGameTransitions(
  defaults?: GameTransitionsDefinition,
  overrides?: GameTransitionsDefinition
): GameTransitionsDefinition | undefined {
  const merged: GameTransitionsDefinition = {
    scenes: {
      load: mergeTransitionOptions(defaults?.scenes?.load, overrides?.scenes?.load),
      push: mergeTransitionOptions(defaults?.scenes?.push, overrides?.scenes?.push),
      pop: mergeTransitionOptions(defaults?.scenes?.pop, overrides?.scenes?.pop),
    },
    modes: {
      push: mergeTransitionOptions(defaults?.modes?.push, overrides?.modes?.push),
      replace: mergeTransitionOptions(defaults?.modes?.replace, overrides?.modes?.replace),
      pop: mergeTransitionOptions(defaults?.modes?.pop, overrides?.modes?.pop),
    },
  };

  const hasSceneTransitions = Boolean(
    merged.scenes?.load || merged.scenes?.push || merged.scenes?.pop
  );
  const hasModeTransitions = Boolean(
    merged.modes?.push || merged.modes?.replace || merged.modes?.pop
  );

  if (!hasSceneTransitions && !hasModeTransitions) {
    return undefined;
  }

  return {
    scenes: hasSceneTransitions ? merged.scenes : undefined,
    modes: hasModeTransitions ? merged.modes : undefined,
  };
}

function createTransitionDefaults(
  transition: NonNullable<GameTransitionOptions['transition']>
): GameTransitionOptions {
  return { transition };
}

function mergeUIShellSection<T extends object>(
  base: T | false | undefined,
  override: T | false | undefined
): T | false | undefined {
  if (override === false) {
    return false;
  }

  if (override === undefined) {
    return base;
  }

  if (base === false || base === undefined) {
    return { ...override };
  }

  return {
    ...base,
    ...override,
  };
}

function mergeUIShell(
  defaults?: GameUIShellDefinition,
  overrides?: GameUIShellDefinition
): GameUIShellDefinition | undefined {
  const hud = mergeUIShellSection(defaults?.hud, overrides?.hud);
  const loadingOverlay = mergeUIShellSection(defaults?.loadingOverlay, overrides?.loadingOverlay);
  const pauseMenu = mergeUIShellSection(defaults?.pauseMenu, overrides?.pauseMenu);

  if (hud === undefined && loadingOverlay === undefined && pauseMenu === undefined) {
    return undefined;
  }

  return {
    hud,
    loadingOverlay,
    pauseMenu,
  };
}

function mergeUIConfig<TState extends object>(
  defaults: GameUIShellDefinition | undefined,
  overrides?: GameDefinition<TState>['ui']
): GameDefinition<TState>['ui'] | undefined {
  const shell = mergeUIShell(defaults, overrides?.shell);
  const menus = overrides?.menus ? { ...overrides.menus } : undefined;
  const ui = {
    ...overrides,
    fonts: overrides?.fonts ? [...overrides.fonts] : undefined,
    menus,
    shell,
  } satisfies GameDefinition<TState>['ui'];

  if (
    ui.hud === undefined &&
    ui.menus === undefined &&
    ui.shell === undefined &&
    ui.theme === undefined &&
    ui.fonts === undefined
  ) {
    return undefined;
  }

  return ui;
}

function createPresetGame<TPreset extends BuiltInStatePreset>(
  options: TemplateGameOptions<TPreset>,
  defaults: PresetTemplateDefaults<TPreset>
) {
  const {
    menuScene: menuSceneInput,
    saveScene: saveSceneInput,
    settingsScene: settingsSceneInput,
    sessionShell: sessionShellInput,
    titleScene: titleSceneInput,
    ...gameOptions
  } = options;
  const scenes = normalizeScenes(gameOptions.scenes, defaults.scenes);
  const modes = normalizeModes(gameOptions.modes, defaults.modes);
  const ui = mergeUIConfig<StateForPreset<TPreset>>(defaults.uiShell, gameOptions.ui);
  const gameplayInitialScene = resolveRecordKey('scene', scenes, undefined, defaults.defaultScene);
  const shellFlow = createSceneShellFlow({
    defaultSceneId: gameplayInitialScene,
    defaults: defaults.shellDefaults,
    initialScene: gameOptions.initialScene,
    menu: menuSceneInput,
    name: gameOptions.name ?? defaults.defaultName,
    saves: saveSceneInput,
    scenes,
    settings: settingsSceneInput,
    session: sessionShellInput,
    title: titleSceneInput,
  });

  return createGame({
    ...gameOptions,
    name: gameOptions.name ?? defaults.defaultName,
    version: gameOptions.version ?? DEFAULT_VERSION,
    content: {
      ...createEmptyContent<StateForPreset<TPreset>>(),
      ...gameOptions.content,
    },
    controls: gameOptions.controls ?? createEmptyControls<StateForPreset<TPreset>>(),
    defaultMode: resolveRecordKey('mode', modes, gameOptions.defaultMode, defaults.defaultMode),
    initialScene: shellFlow.initialScene,
    modes,
    scenes: shellFlow.scenes,
    statePreset: defaults.statePreset,
    transitions: mergeGameTransitions(defaults.transitions, gameOptions.transitions),
    ui,
    world: gameOptions.world ?? createEmptyWorld<StateForPreset<TPreset>>(),
  });
}

const RPG_TEMPLATE_DEFAULTS: PresetTemplateDefaults<'rpg'> = {
  defaultMode: 'exploration',
  defaultName: 'Untitled RPG Game',
  defaultScene: 'gameplay',
  modes: {
    exploration: {
      ...createModeTemplate('exploration'),
      inputMap: {
        moveForward: createInputMapping(['w', 'arrowup'], 'up'),
        moveBackward: createInputMapping(['s', 'arrowdown'], 'down'),
        moveLeft: createInputMapping(['a', 'arrowleft'], 'left'),
        moveRight: createInputMapping(['d', 'arrowright'], 'right'),
        jump: createInputMapping([' ', 'space'], 'south'),
        interact: createInputMapping(['e', 'enter'], 'west'),
        sprint: createInputMapping(['shift'], 'l3'),
        inventory: createInputMapping(['i', 'tab'], 'north'),
        map: createInputMapping(['m'], 'back'),
        pause: createInputMapping(['escape'], 'start'),
      },
    },
    combat: {
      ...createModeTemplate('combat'),
      inputMap: {
        moveForward: createInputMapping(['w', 'arrowup'], 'up'),
        moveBackward: createInputMapping(['s', 'arrowdown'], 'down'),
        moveLeft: createInputMapping(['a', 'arrowleft'], 'left'),
        moveRight: createInputMapping(['d', 'arrowright'], 'right'),
        attack: createInputMapping(['f', 'enter'], 'west'),
        heavyAttack: createInputMapping(['g'], 'north'),
        dodge: createInputMapping([' ', 'space'], 'east'),
        guard: createInputMapping(['shift'], 'l1'),
        skillPrimary: createInputMapping(['q'], 'r1'),
        skillSecondary: createInputMapping(['r'], 'r2'),
        target: createInputMapping(['tab'], 'south'),
        pause: createInputMapping(['escape'], 'start'),
      },
    },
    dialogue: {
      ...createModeTemplate('dialogue'),
      inputMap: {
        choiceUp: createInputMapping(['w', 'arrowup'], 'up'),
        choiceDown: createInputMapping(['s', 'arrowdown'], 'down'),
        choiceLeft: createInputMapping(['a', 'arrowleft'], 'left'),
        choiceRight: createInputMapping(['d', 'arrowright'], 'right'),
        advance: createInputMapping(['e', 'enter', ' '], 'south'),
        skip: createInputMapping(['escape', 'backspace'], 'east'),
      },
    },
  },
  scenes: {
    gameplay: {
      ...createNullScene('gameplay'),
      shell: createAnnouncementSceneShell({
        description: 'Exploration systems are live and the default adventure shell is ready.',
        position: 'top-left',
        subtitle: 'ADVENTURE ZONE',
        title: 'Adventure Begins',
      }),
    },
  },
  statePreset: 'rpg',
  transitions: {
    scenes: {
      load: createTransitionDefaults({ type: 'fade', duration: 0.35, color: '#05070b' }),
    },
    modes: {
      replace: createTransitionDefaults({ type: 'crossfade', duration: 0.18, color: '#05070b' }),
    },
  },
  uiShell: {
    hud: {
      title: 'Adventure HUD',
    },
    loadingOverlay: {
      title: 'Preparing Adventure',
      bootLabel: 'BOOTING ADVENTURE',
      bootDescription: 'Initializing the world state, scene runtime, and default exploration mode.',
      sceneLabel: 'TRAVELING',
      sceneDescription:
        'Loading the next destination and restoring your active journey scaffolding.',
    },
    pauseMenu: {
      title: 'Adventure Paused',
      description: 'Your active mode remains mounted, and the pause binding stays available.',
    },
  },
  shellDefaults: {
    actionLabels: {
      back: 'Back to Hub',
      clearProfile: 'Reset',
      continue: 'Resume Adventure',
      deleteSave: 'Delete',
      load: 'Load',
      manageProfile: 'Manage',
      menu: 'Adventure Menu',
      pause: 'Pause Adventure',
      save: 'Save',
      saves: 'Adventure Saves',
      settings: 'Adventure Settings',
      start: 'Begin Adventure',
      title: 'Return to Hub',
    },
    menu: {
      description: 'Review the active expedition shell, then jump back into the current journey.',
      subtitle: 'JOURNEY MENU',
      title: 'Adventure Menu',
    },
    saves: {
      description: 'Manage saved adventure checkpoints and restore the current expedition state.',
      subtitle: 'SAVE ARCHIVE',
      title: 'Adventure Saves',
    },
    settings: {
      description: 'Adjust the active adventure shell and then return to the current journey.',
      subtitle: 'JOURNEY SETTINGS',
      title: 'Adventure Settings',
    },
    session: {
      description: 'Exploration systems and adventure bindings are live for the active journey.',
      subtitle: 'ADVENTURE LIVE',
      title: 'Adventure Live',
    },
    title: {
      description: 'Choose how to enter the active adventure shell and current world state.',
      subtitle: 'ADVENTURE READY',
    },
  },
};

const ACTION_TEMPLATE_DEFAULTS: PresetTemplateDefaults<'action'> = {
  defaultMode: 'action',
  defaultName: 'Untitled Action Game',
  defaultScene: 'gameplay',
  modes: {
    action: {
      ...createModeTemplate('action'),
      inputMap: {
        moveForward: createInputMapping(['w', 'arrowup'], 'up'),
        moveBackward: createInputMapping(['s', 'arrowdown'], 'down'),
        moveLeft: createInputMapping(['a', 'arrowleft'], 'left'),
        moveRight: createInputMapping(['d', 'arrowright'], 'right'),
        jump: createInputMapping([' ', 'space'], 'south'),
        attack: createInputMapping(['f', 'enter'], 'west'),
        dash: createInputMapping(['shift'], 'east'),
        interact: createInputMapping(['e'], 'north'),
        pause: createInputMapping(['escape'], 'start'),
      },
    },
  },
  scenes: {
    gameplay: {
      ...createNullScene('gameplay'),
      shell: createAnnouncementSceneShell({
        description: 'The combat runtime is online and the next encounter is ready.',
        position: 'top-right',
        subtitle: 'ACTION READY',
        title: 'Drop In',
      }),
    },
  },
  statePreset: 'action',
  transitions: {
    scenes: {
      load: createTransitionDefaults({ type: 'crossfade', duration: 0.18, color: '#090c14' }),
    },
  },
  uiShell: {
    hud: {
      title: 'Action HUD',
    },
    loadingOverlay: {
      title: 'Preparing Action',
      bootLabel: 'BOOTING ACTION',
      bootDescription:
        'Staging the current encounter, player state, and combat-ready runtime systems.',
      sceneLabel: 'LOADING ENCOUNTER',
      sceneDescription: 'Bringing the next arena online and rebuilding the action loop.',
    },
    pauseMenu: {
      title: 'Action Paused',
      description: 'Combat-ready controls remain visible while the game is paused.',
    },
  },
  shellDefaults: {
    actionLabels: {
      back: 'Back to Drop',
      clearProfile: 'Reset',
      continue: 'Resume Encounter',
      deleteSave: 'Delete',
      load: 'Load',
      manageProfile: 'Manage',
      menu: 'Loadout',
      pause: 'Pause Action',
      save: 'Save',
      saves: 'Save Archive',
      settings: 'Action Settings',
      start: 'Drop In',
      title: 'Return to Drop',
    },
    menu: {
      description: 'Check the current encounter shell, then dive back into the action loop.',
      subtitle: 'LOADOUT MENU',
      title: 'Action Menu',
    },
    saves: {
      description: 'Manage saved encounter setups and restore the current combat-ready runtime.',
      subtitle: 'SAVE ARCHIVE',
      title: 'Action Saves',
    },
    settings: {
      description: 'Tune the encounter shell and then jump back into the live action loop.',
      subtitle: 'LOADOUT SETTINGS',
      title: 'Action Settings',
    },
    session: {
      description: 'Combat systems are hot, and the encounter runtime is live around the player.',
      subtitle: 'ACTION LIVE',
      title: 'Encounter Live',
    },
    title: {
      description: 'Stage the encounter shell and choose how to enter the live action scene.',
      subtitle: 'DROP READY',
    },
  },
};

const PUZZLE_TEMPLATE_DEFAULTS: PresetTemplateDefaults<'puzzle'> = {
  defaultMode: 'puzzle',
  defaultName: 'Untitled Puzzle Game',
  defaultScene: 'puzzle',
  modes: {
    puzzle: {
      ...createModeTemplate('puzzle'),
      inputMap: {
        moveUp: createInputMapping(['w', 'arrowup'], 'up'),
        moveDown: createInputMapping(['s', 'arrowdown'], 'down'),
        moveLeft: createInputMapping(['a', 'arrowleft'], 'left'),
        moveRight: createInputMapping(['d', 'arrowright'], 'right'),
        confirm: createInputMapping(['enter', ' '], 'south'),
        cancel: createInputMapping(['escape', 'backspace'], 'east'),
        rotate: createInputMapping(['r'], 'north'),
        hint: createInputMapping(['h'], 'west'),
        reset: createInputMapping(['tab'], 'back'),
      },
    },
  },
  scenes: {
    puzzle: {
      ...createNullScene('puzzle'),
      shell: createAnnouncementSceneShell({
        description: 'Board state and puzzle bindings are loaded for the current solve.',
        position: 'top-left',
        subtitle: 'PUZZLE BOARD',
        title: 'New Board',
      }),
    },
  },
  statePreset: 'puzzle',
  transitions: {
    scenes: {
      load: createTransitionDefaults({
        type: 'wipe',
        duration: 0.22,
        direction: 'right',
        color: '#101820',
      }),
    },
  },
  uiShell: {
    hud: {
      title: 'Puzzle HUD',
      showPressedActions: false,
    },
    loadingOverlay: {
      title: 'Preparing Puzzle',
      bootLabel: 'BOOTING PUZZLE',
      bootDescription:
        'Restoring board state, interaction bindings, and puzzle progression systems.',
      sceneLabel: 'LOADING BOARD',
      sceneDescription:
        'Setting up the next puzzle space and preserving the current solve context.',
    },
    pauseMenu: {
      title: 'Puzzle Paused',
      description:
        'Board controls stay visible while paused so you can resume without losing context.',
    },
  },
  shellDefaults: {
    actionLabels: {
      back: 'Back to Board Select',
      clearProfile: 'Reset',
      continue: 'Resume Puzzle',
      deleteSave: 'Delete',
      load: 'Load',
      manageProfile: 'Manage',
      menu: 'Board Menu',
      pause: 'Pause Puzzle',
      save: 'Save',
      saves: 'Puzzle Saves',
      settings: 'Puzzle Settings',
      start: 'Start Puzzle',
      title: 'Return to Board Select',
    },
    menu: {
      description: 'Review the current board shell, hints, and puzzle state before resuming.',
      subtitle: 'BOARD MENU',
      title: 'Puzzle Menu',
    },
    saves: {
      description: 'Manage saved board states and restore the active puzzle solve context.',
      subtitle: 'SAVE ARCHIVE',
      title: 'Puzzle Saves',
    },
    settings: {
      description: 'Adjust the board shell and then return to the active puzzle state.',
      subtitle: 'PUZZLE SETTINGS',
      title: 'Puzzle Settings',
    },
    session: {
      description: 'Board interactions and puzzle bindings are live for the active solve.',
      subtitle: 'PUZZLE LIVE',
      title: 'Solve In Progress',
    },
    title: {
      description: 'Set the board shell and enter the next puzzle with the current solve context.',
      subtitle: 'PUZZLE READY',
    },
  },
};

const SANDBOX_TEMPLATE_DEFAULTS: PresetTemplateDefaults<'sandbox'> = {
  defaultMode: 'creative',
  defaultName: 'Untitled Sandbox Game',
  defaultScene: 'world',
  modes: {
    creative: {
      ...createModeTemplate('creative'),
      inputMap: {
        moveForward: createInputMapping(['w', 'arrowup'], 'up'),
        moveBackward: createInputMapping(['s', 'arrowdown'], 'down'),
        moveLeft: createInputMapping(['a', 'arrowleft'], 'left'),
        moveRight: createInputMapping(['d', 'arrowright'], 'right'),
        ascend: createInputMapping(['e'], 'r1'),
        descend: createInputMapping(['q'], 'l1'),
        place: createInputMapping(['f'], 'south'),
        remove: createInputMapping(['g', 'backspace'], 'east'),
        cycleNext: createInputMapping([']'], 'right'),
        cyclePrev: createInputMapping(['['], 'left'),
        pause: createInputMapping(['escape'], 'start'),
      },
    },
    survival: {
      ...createModeTemplate('survival'),
      inputMap: {
        moveForward: createInputMapping(['w', 'arrowup'], 'up'),
        moveBackward: createInputMapping(['s', 'arrowdown'], 'down'),
        moveLeft: createInputMapping(['a', 'arrowleft'], 'left'),
        moveRight: createInputMapping(['d', 'arrowright'], 'right'),
        jump: createInputMapping([' ', 'space'], 'south'),
        sprint: createInputMapping(['shift'], 'l3'),
        crouch: createInputMapping(['control'], 'l1'),
        interact: createInputMapping(['e'], 'west'),
        use: createInputMapping(['f'], 'north'),
        pause: createInputMapping(['escape'], 'start'),
      },
    },
  },
  scenes: {
    world: {
      ...createNullScene('world'),
      shell: createAnnouncementSceneShell({
        description: 'Open-world traversal and build tools are now active.',
        position: 'bottom-left',
        subtitle: 'OPEN WORLD',
        title: 'World Loaded',
      }),
    },
  },
  statePreset: 'sandbox',
  transitions: {
    scenes: {
      load: createTransitionDefaults({ type: 'dissolve', duration: 0.25, color: '#0f1720' }),
    },
  },
  uiShell: {
    hud: {
      title: 'Sandbox HUD',
    },
    loadingOverlay: {
      title: 'Preparing Sandbox',
      bootLabel: 'BOOTING SANDBOX',
      bootDescription:
        'Initializing the simulation, build tools, and open-world traversal systems.',
      sceneLabel: 'LOADING WORLD',
      sceneDescription: 'Streaming the next sandbox slice and keeping your creative tools aligned.',
    },
    pauseMenu: {
      title: 'Sandbox Paused',
      description: 'Build and traversal bindings stay visible while the world is paused.',
    },
  },
  shellDefaults: {
    actionLabels: {
      back: 'Back to Hub',
      clearProfile: 'Reset',
      continue: 'Enter World',
      deleteSave: 'Delete',
      load: 'Load',
      manageProfile: 'Manage',
      menu: 'World Menu',
      pause: 'Pause Sandbox',
      save: 'Save',
      saves: 'World Saves',
      settings: 'World Settings',
      start: 'Launch World',
      title: 'Return to Hub',
    },
    menu: {
      description: 'Review the current world shell, tools, and traversal state before resuming.',
      subtitle: 'WORLD MENU',
      title: 'Sandbox Menu',
    },
    saves: {
      description: 'Manage saved world states and restore the active sandbox session.',
      subtitle: 'WORLD SAVES',
      title: 'Sandbox Saves',
    },
    settings: {
      description: 'Adjust the world shell and then return to the current sandbox session.',
      subtitle: 'WORLD SETTINGS',
      title: 'World Settings',
    },
    session: {
      description: 'Build tools, traversal bindings, and world simulation systems are live.',
      subtitle: 'WORLD LIVE',
      title: 'Sandbox Live',
    },
    title: {
      description: 'Stage the open world shell and choose how to enter the active sandbox.',
      subtitle: 'WORLD READY',
    },
  },
};

const RACING_TEMPLATE_DEFAULTS: PresetTemplateDefaults<'racing'> = {
  defaultMode: 'race',
  defaultName: 'Untitled Racing Game',
  defaultScene: 'race',
  modes: {
    race: {
      ...createModeTemplate('race'),
      inputMap: {
        accelerate: createInputMapping(['w', 'arrowup'], 'south'),
        brake: createInputMapping(['s', 'arrowdown'], 'east'),
        steerLeft: createInputMapping(['a', 'arrowleft'], 'left'),
        steerRight: createInputMapping(['d', 'arrowright'], 'right'),
        drift: createInputMapping(['shift'], 'l1'),
        boost: createInputMapping([' ', 'space'], 'r1'),
        lookBack: createInputMapping(['r'], 'north'),
        reset: createInputMapping(['tab'], 'west'),
        pause: createInputMapping(['escape'], 'start'),
      },
    },
  },
  scenes: {
    race: {
      ...createNullScene('race'),
      shell: createAnnouncementSceneShell({
        description: 'Telemetry is live and the current track is ready for launch.',
        position: 'top-right',
        subtitle: 'RACE DAY',
        title: 'Track Ready',
      }),
    },
  },
  statePreset: 'racing',
  transitions: {
    scenes: {
      load: createTransitionDefaults({
        type: 'wipe',
        duration: 0.18,
        direction: 'left',
        color: '#07090c',
      }),
    },
  },
  uiShell: {
    hud: {
      title: 'Race HUD',
      showMode: false,
    },
    loadingOverlay: {
      title: 'Preparing Race',
      bootLabel: 'BOOTING RACE',
      bootDescription: 'Dialing in vehicle systems, track state, and race-day control bindings.',
      sceneLabel: 'LOADING TRACK',
      sceneDescription: 'Bringing the next course online and restoring race telemetry.',
      showScene: false,
    },
    pauseMenu: {
      title: 'Race Paused',
      description: 'Race controls stay visible so you can drop straight back onto the track.',
      showMode: false,
    },
  },
  shellDefaults: {
    actionLabels: {
      back: 'Back to Grid',
      clearProfile: 'Reset',
      continue: 'Resume Race',
      deleteSave: 'Delete',
      load: 'Load',
      manageProfile: 'Manage',
      menu: 'Race Menu',
      pause: 'Pause Race',
      save: 'Save',
      saves: 'Race Saves',
      settings: 'Race Settings',
      start: 'Start Race',
      title: 'Return to Grid',
    },
    menu: {
      description: 'Check track state and race shell details before dropping back onto the course.',
      subtitle: 'RACE MENU',
      title: 'Race Day Menu',
    },
    saves: {
      description: 'Manage saved race sessions and restore the active track and lap state.',
      subtitle: 'RACE SAVES',
      title: 'Race Saves',
    },
    settings: {
      description: 'Adjust the race-day shell and then head back to the active course.',
      subtitle: 'RACE SETTINGS',
      title: 'Race Settings',
    },
    session: {
      description: 'Telemetry, course state, and race-day bindings are live for the active run.',
      subtitle: 'RACE LIVE',
      title: 'Race In Progress',
    },
    title: {
      description: 'Stage the current course and choose how to launch into race day.',
      subtitle: 'GRID READY',
    },
  },
};

const PLATFORMER_TEMPLATE_DEFAULTS: PresetTemplateDefaults<'action'> = {
  defaultMode: 'platforming',
  defaultName: 'Untitled Platformer Game',
  defaultScene: 'level1',
  modes: {
    platforming: {
      ...createModeTemplate('platforming'),
      inputMap: {
        moveLeft: createInputMapping(['a', 'arrowleft'], 'left'),
        moveRight: createInputMapping(['d', 'arrowright'], 'right'),
        jump: createInputMapping([' ', 'w', 'arrowup'], 'south'),
        crouch: createInputMapping(['s', 'arrowdown'], 'down'),
        dash: createInputMapping(['shift'], 'east'),
        interact: createInputMapping(['e'], 'west'),
        pause: createInputMapping(['escape'], 'start'),
      },
    },
  },
  scenes: {
    level1: {
      ...createNullScene('level1'),
      shell: createAnnouncementSceneShell({
        description: 'Traversal systems are active and the current run is ready to start.',
        position: 'top-left',
        subtitle: 'RUN START',
        title: 'Level Ready',
      }),
    },
  },
  statePreset: 'action',
  transitions: {
    scenes: {
      load: createTransitionDefaults({
        type: 'wipe',
        duration: 0.16,
        direction: 'right',
        color: '#0a0f16',
      }),
    },
    modes: {
      replace: createTransitionDefaults({ type: 'crossfade', duration: 0.14, color: '#0a0f16' }),
    },
  },
  uiShell: {
    hud: {
      title: 'Platform HUD',
    },
    loadingOverlay: {
      title: 'Preparing Run',
      bootLabel: 'BOOTING PLATFORMER',
      bootDescription: 'Setting the current level, player motion systems, and traversal bindings.',
      sceneLabel: 'LOADING LEVEL',
      sceneDescription: 'Preparing the next stage and preserving the run-ready shell around it.',
    },
    pauseMenu: {
      title: 'Platformer Paused',
      description: 'Movement bindings remain visible while the current run is paused.',
    },
  },
  shellDefaults: {
    actionLabels: {
      back: 'Back to Stage Select',
      clearProfile: 'Reset',
      continue: 'Resume Run',
      deleteSave: 'Delete',
      load: 'Load',
      manageProfile: 'Manage',
      menu: 'Stage Menu',
      pause: 'Pause Run',
      save: 'Save',
      saves: 'Run Saves',
      settings: 'Run Settings',
      start: 'Start Run',
      title: 'Return to Stage Select',
    },
    menu: {
      description: 'Review the current run shell and stage state before resuming traversal.',
      subtitle: 'STAGE MENU',
      title: 'Run Menu',
    },
    saves: {
      description: 'Manage saved runs and restore the active platforming stage state.',
      subtitle: 'RUN SAVES',
      title: 'Run Saves',
    },
    settings: {
      description: 'Adjust the current run shell and then return to the active stage.',
      subtitle: 'RUN SETTINGS',
      title: 'Run Settings',
    },
    session: {
      description: 'Traversal bindings and run-state systems are live for the active stage.',
      subtitle: 'RUN LIVE',
      title: 'Run In Progress',
    },
    title: {
      description: 'Stage the current level shell and choose how to launch into the run.',
      subtitle: 'RUN READY',
    },
  },
};

export function createRPGGame(options: RPGGameOptions = {}) {
  return createPresetGame(options, RPG_TEMPLATE_DEFAULTS);
}

export function createActionGame(options: ActionGameOptions = {}) {
  return createPresetGame(options, ACTION_TEMPLATE_DEFAULTS);
}

export function createPuzzleGame(options: PuzzleGameOptions = {}) {
  return createPresetGame(options, PUZZLE_TEMPLATE_DEFAULTS);
}

export function createSandboxGame(options: SandboxGameOptions = {}) {
  return createPresetGame(options, SANDBOX_TEMPLATE_DEFAULTS);
}

export function createRacingGame(options: RacingGameOptions = {}) {
  return createPresetGame(options, RACING_TEMPLATE_DEFAULTS);
}

export function createPlatformerGame(options: PlatformerGameOptions = {}) {
  return createPresetGame(options, PLATFORMER_TEMPLATE_DEFAULTS);
}

export type { ActionState, DeepPartial, PuzzleState, RPGState, RacingState, SandboxState };
