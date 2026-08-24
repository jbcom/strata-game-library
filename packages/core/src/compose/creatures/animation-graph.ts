/**
 * Declarative creature animation state graph construction.
 *
 * Emits states, transitions, and locomotion blend groups as plain data so an
 * adapter can map them onto Three actions, Babylon animation groups, or a
 * custom playback system without core owning playback.
 *
 * @module CreatureAnimationGraph
 * @category Entities & Simulation
 */

import type {
  CreatureComposition,
  CreatureDefinition,
  CreatureRuntimeAnimationBinding,
  CreatureRuntimeAnimationGraph,
  CreatureRuntimeAnimationGraphOptions,
  CreatureRuntimeAnimationGraphState,
  CreatureRuntimeAnimationGraphTransition,
} from './types';

const CREATURE_TERMINAL_ANIMATIONS = new Set(['death', 'die', 'dead']);
const CREATURE_ONE_SHOT_ANIMATIONS = new Set(['attack', 'hurt', 'eat', 'play']);
const CREATURE_LOCOMOTION_ANIMATIONS = ['walk', 'run', 'swim', 'fly'] as const;

function clampPositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function creatureAnimationTags(name: string): string[] {
  const tags = new Set<string>();

  if (name === 'idle') {
    tags.add('idle');
  }

  if (
    CREATURE_LOCOMOTION_ANIMATIONS.includes(name as (typeof CREATURE_LOCOMOTION_ANIMATIONS)[number])
  ) {
    tags.add('locomotion');
    tags.add(name);
  }

  if (name === 'attack') {
    tags.add('action');
    tags.add('combat');
  }

  if (CREATURE_TERMINAL_ANIMATIONS.has(name)) {
    tags.add('terminal');
  }

  return [...tags];
}

function creatureAnimationSpeedScale(name: string, stats: CreatureDefinition['stats']): number {
  if (name === 'run') {
    return 1.4;
  }

  if (name === 'swim' && stats.swimSpeed !== undefined) {
    return clampPositive(stats.swimSpeed / clampPositive(stats.speed, 1), 1);
  }

  if (name === 'fly' && stats.flySpeed !== undefined) {
    return clampPositive(stats.flySpeed / clampPositive(stats.speed, 1), 1);
  }

  return 1;
}

function defaultCreatureAnimationGraphState(
  animation: CreatureRuntimeAnimationBinding,
  stats: CreatureDefinition['stats']
): CreatureRuntimeAnimationGraphState {
  const terminal = CREATURE_TERMINAL_ANIMATIONS.has(animation.name);
  const oneShot = terminal || CREATURE_ONE_SHOT_ANIMATIONS.has(animation.name);

  return {
    id: animation.name,
    animation: animation.name,
    targetBones: [...animation.targetBones],
    loop: !oneShot,
    speedScale: creatureAnimationSpeedScale(animation.name, stats),
    clampWhenFinished: oneShot,
    tags: creatureAnimationTags(animation.name),
  };
}

function transitionId(from: string, event: string, to: string): string {
  return `${from}:${event}:${to}`;
}

function appendCreatureAnimationTransition(
  transitions: CreatureRuntimeAnimationGraphTransition[],
  availableStates: ReadonlySet<string>,
  transition: Omit<CreatureRuntimeAnimationGraphTransition, 'id'> & { id?: string }
): void {
  if (
    transition.from === transition.to ||
    !availableStates.has(transition.from) ||
    !availableStates.has(transition.to)
  ) {
    return;
  }

  const id = transition.id ?? transitionId(transition.from, transition.event, transition.to);

  if (transitions.some((candidate) => candidate.id === id)) {
    return;
  }

  transitions.push({ ...transition, id });
}

function appendCreatureAnimationTransitionFromMany(
  transitions: CreatureRuntimeAnimationGraphTransition[],
  availableStates: ReadonlySet<string>,
  fromStates: readonly string[],
  transition: Omit<CreatureRuntimeAnimationGraphTransition, 'id' | 'from'> & { id?: string }
): void {
  for (const from of fromStates) {
    appendCreatureAnimationTransition(transitions, availableStates, { ...transition, from });
  }
}

/**
 * Creates an adapter-neutral animation graph from runtime creature animation bindings.
 *
 * The graph is deliberately declarative: adapters can map states to Three actions,
 * Babylon animation groups, or custom animation systems without core owning playback.
 */
export function createCreatureAnimationGraph(
  source: Pick<CreatureComposition['runtime'], 'id' | 'animations' | 'stats'>,
  options: CreatureRuntimeAnimationGraphOptions = {}
): CreatureRuntimeAnimationGraph {
  const states = source.animations.map((animation) => {
    const defaults = defaultCreatureAnimationGraphState(animation, source.stats);
    const override = options.stateOverrides?.[animation.name];

    return {
      ...defaults,
      ...override,
      targetBones: override?.targetBones ? [...override.targetBones] : defaults.targetBones,
      tags: override?.tags ? [...override.tags] : defaults.tags,
    };
  });
  const availableStates = new Set(states.map((state) => state.id));
  const defaultDuration = Math.max(0, options.transitionDuration ?? 0.2);
  const initialState =
    options.initialState && availableStates.has(options.initialState)
      ? options.initialState
      : availableStates.has('idle')
        ? 'idle'
        : (states[0]?.id ?? '');
  const transitions: CreatureRuntimeAnimationGraphTransition[] = [];

  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'idle',
    to: 'walk',
    event: 'move',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 10,
    guard: 'canMove',
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'walk',
    to: 'idle',
    event: 'stop',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 10,
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'walk',
    to: 'run',
    event: 'sprint',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 20,
    guard: 'canSprint',
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'run',
    to: 'walk',
    event: 'walk',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 20,
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'run',
    to: 'idle',
    event: 'stop',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 10,
  });

  const groundStates = ['idle', 'walk', 'run'];
  appendCreatureAnimationTransitionFromMany(transitions, availableStates, groundStates, {
    to: 'swim',
    event: 'enter-water',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 30,
    guard: 'canSwim',
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'swim',
    to: 'idle',
    event: 'exit-water',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 30,
  });
  appendCreatureAnimationTransitionFromMany(transitions, availableStates, groundStates, {
    to: 'fly',
    event: 'take-off',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 30,
    guard: 'canFly',
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'fly',
    to: 'idle',
    event: 'land',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 30,
  });

  const nonTerminalStates = states
    .map((state) => state.id)
    .filter((state) => !CREATURE_TERMINAL_ANIMATIONS.has(state));
  appendCreatureAnimationTransitionFromMany(transitions, availableStates, nonTerminalStates, {
    to: 'attack',
    event: 'attack',
    mode: 'cross-fade',
    duration: Math.min(defaultDuration, 0.1),
    priority: 50,
    guard: 'canAttack',
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'attack',
    to: initialState,
    event: 'complete',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 40,
  });
  for (const deathState of ['death', 'die', 'dead']) {
    appendCreatureAnimationTransitionFromMany(transitions, availableStates, nonTerminalStates, {
      to: deathState,
      event: 'die',
      mode: 'play',
      duration: 0,
      priority: 100,
      guard: 'isDead',
    });
  }

  for (const transition of options.transitions ?? []) {
    appendCreatureAnimationTransition(transitions, availableStates, {
      ...transition,
      id: transition.id,
      duration: Math.max(0, transition.duration),
    });
  }

  const locomotionStates = CREATURE_LOCOMOTION_ANIMATIONS.filter((state) =>
    availableStates.has(state)
  );

  return {
    creatureId: source.id,
    initialState,
    states,
    transitions,
    blendGroups:
      options.includeLocomotionBlend === false || locomotionStates.length < 2
        ? []
        : [
            {
              id: 'locomotion',
              states: [...locomotionStates],
              normalized: true,
              tags: ['locomotion'],
            },
          ],
  };
}
