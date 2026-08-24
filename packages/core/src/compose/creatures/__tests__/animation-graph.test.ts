import { describe, expect, it } from 'vitest';
import { createCreatureAnimationGraph } from '../animation-graph';
import type { CreatureRuntimeAnimationBinding } from '../types';

const binding = (name: string, targetBones: string[] = ['root']): CreatureRuntimeAnimationBinding =>
  ({ name, clip: `${name}_clip`, targetBones }) as CreatureRuntimeAnimationBinding;

const source = (names: string[], stats: Record<string, number> = { health: 10, speed: 5 }) =>
  ({
    id: 'beast',
    animations: names.map((name) => binding(name)),
    stats,
  }) as never;

const hasTransition = (
  graph: ReturnType<typeof createCreatureAnimationGraph>,
  from: string,
  to: string,
  event?: string
) =>
  graph.transitions.some(
    (t) => t.from === from && t.to === to && (event === undefined || t.event === event)
  );

describe('states', () => {
  it('emits one state per animation binding, carrying the creature id', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'walk']));
    expect(graph.creatureId).toBe('beast');
    expect(graph.states.map((s) => s.id)).toEqual(['idle', 'walk']);
  });

  it('loops locomotion states and does not clamp them', () => {
    const walk = createCreatureAnimationGraph(source(['walk'])).states[0];
    expect(walk.loop).toBe(true);
    expect(walk.clampWhenFinished).toBe(false);
    expect(walk.tags).toContain('locomotion');
    expect(walk.tags).toContain('walk');
  });

  it('makes one-shot actions non-looping and clamped', () => {
    for (const name of ['attack', 'hurt', 'eat', 'play']) {
      const state = createCreatureAnimationGraph(source([name])).states[0];
      expect(state.loop).toBe(false);
      expect(state.clampWhenFinished).toBe(true);
    }
  });

  it('tags terminal death states and treats them as one-shot', () => {
    for (const name of ['death', 'die', 'dead']) {
      const state = createCreatureAnimationGraph(source([name])).states[0];
      expect(state.tags).toContain('terminal');
      expect(state.loop).toBe(false);
      expect(state.clampWhenFinished).toBe(true);
    }
  });

  it('tags attack as both action and combat', () => {
    const state = createCreatureAnimationGraph(source(['attack'])).states[0];
    expect(state.tags).toEqual(expect.arrayContaining(['action', 'combat']));
  });

  it('gives an unrecognised animation no tags and a neutral loop', () => {
    const state = createCreatureAnimationGraph(source(['groom'])).states[0];
    expect(state.tags).toEqual([]);
    expect(state.loop).toBe(true);
    expect(state.speedScale).toBe(1);
  });
});

describe('speed scaling', () => {
  it('scales run up by a fixed factor', () => {
    const run = createCreatureAnimationGraph(source(['run'])).states[0];
    expect(run.speedScale).toBe(1.4);
  });

  it('scales swim by the swim/ground speed ratio', () => {
    const swim = createCreatureAnimationGraph(
      source(['swim'], { health: 1, speed: 6, swimSpeed: 12 })
    ).states[0];
    expect(swim.speedScale).toBe(2);
  });

  it('scales fly by the fly/ground speed ratio', () => {
    const fly = createCreatureAnimationGraph(source(['fly'], { health: 1, speed: 4, flySpeed: 10 }))
      .states[0];
    expect(fly.speedScale).toBe(2.5);
  });

  it('falls back to 1 when the paired speed stat is absent', () => {
    const swim = createCreatureAnimationGraph(source(['swim'], { health: 1, speed: 6 })).states[0];
    expect(swim.speedScale).toBe(1);
  });

  it('treats a zero ground speed as 1 rather than dividing by zero', () => {
    const swim = createCreatureAnimationGraph(
      source(['swim'], { health: 1, speed: 0, swimSpeed: 3 })
    ).states[0];
    expect(swim.speedScale).toBe(3);
    expect(Number.isFinite(swim.speedScale)).toBe(true);
  });

  it('falls back to 1 when the ratio would be zero or non-finite', () => {
    const zero = createCreatureAnimationGraph(
      source(['swim'], { health: 1, speed: 5, swimSpeed: 0 })
    ).states[0];
    expect(zero.speedScale).toBe(1);

    const nan = createCreatureAnimationGraph(
      source(['swim'], { health: 1, speed: 5, swimSpeed: Number.NaN })
    ).states[0];
    expect(nan.speedScale).toBe(1);
  });
});

describe('initial state', () => {
  it('prefers idle when present', () => {
    expect(createCreatureAnimationGraph(source(['walk', 'idle'])).initialState).toBe('idle');
  });

  it('falls back to the first state when idle is absent', () => {
    expect(createCreatureAnimationGraph(source(['walk', 'run'])).initialState).toBe('walk');
  });

  it('honours an explicit initialState that exists', () => {
    expect(
      createCreatureAnimationGraph(source(['idle', 'run']), { initialState: 'run' }).initialState
    ).toBe('run');
  });

  it('ignores an explicit initialState that does not exist', () => {
    expect(
      createCreatureAnimationGraph(source(['idle', 'run']), { initialState: 'ghost' }).initialState
    ).toBe('idle');
  });

  it('is an empty string when there are no animations at all', () => {
    const graph = createCreatureAnimationGraph(source([]));
    expect(graph.initialState).toBe('');
    expect(graph.states).toEqual([]);
    expect(graph.transitions).toEqual([]);
  });
});

describe('transitions', () => {
  it('wires the ground locomotion cycle', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'walk', 'run']));
    expect(hasTransition(graph, 'idle', 'walk', 'move')).toBe(true);
    expect(hasTransition(graph, 'walk', 'idle', 'stop')).toBe(true);
    expect(hasTransition(graph, 'walk', 'run', 'sprint')).toBe(true);
    expect(hasTransition(graph, 'run', 'walk', 'walk')).toBe(true);
    expect(hasTransition(graph, 'run', 'idle', 'stop')).toBe(true);
  });

  it('omits transitions whose endpoints are missing', () => {
    const graph = createCreatureAnimationGraph(source(['idle']));
    expect(hasTransition(graph, 'idle', 'walk')).toBe(false);
    expect(graph.transitions).toEqual([]);
  });

  it('enters water from every ground state and exits to idle', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'walk', 'run', 'swim']));
    for (const from of ['idle', 'walk', 'run']) {
      expect(hasTransition(graph, from, 'swim', 'enter-water')).toBe(true);
    }
    expect(hasTransition(graph, 'swim', 'idle', 'exit-water')).toBe(true);
  });

  it('takes off from every ground state and lands to idle', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'walk', 'fly']));
    expect(hasTransition(graph, 'idle', 'fly', 'take-off')).toBe(true);
    expect(hasTransition(graph, 'walk', 'fly', 'take-off')).toBe(true);
    expect(hasTransition(graph, 'fly', 'idle', 'land')).toBe(true);
  });

  it('allows attack from every non-terminal state but not from death', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'walk', 'attack', 'death']));
    expect(hasTransition(graph, 'idle', 'attack', 'attack')).toBe(true);
    expect(hasTransition(graph, 'walk', 'attack', 'attack')).toBe(true);
    expect(hasTransition(graph, 'death', 'attack')).toBe(false);
  });

  it('returns from attack to the initial state on complete', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'attack']));
    expect(hasTransition(graph, 'attack', 'idle', 'complete')).toBe(true);
  });

  it('routes death from every non-terminal state and never out of it', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'walk', 'death']));
    expect(hasTransition(graph, 'idle', 'death', 'die')).toBe(true);
    expect(hasTransition(graph, 'walk', 'death', 'die')).toBe(true);
    expect(graph.transitions.some((t) => t.from === 'death')).toBe(false);
  });

  it('gives death the highest priority and an instant play transition', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'death']));
    const die = graph.transitions.find((t) => t.event === 'die');
    expect(die?.priority).toBe(100);
    expect(die?.mode).toBe('play');
    expect(die?.duration).toBe(0);
  });

  it('never emits a self-transition', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'walk', 'run', 'attack', 'death']));
    expect(graph.transitions.every((t) => t.from !== t.to)).toBe(true);
  });

  it('emits unique transition ids', () => {
    const graph = createCreatureAnimationGraph(
      source(['idle', 'walk', 'run', 'swim', 'fly', 'attack', 'death'])
    );
    const ids = graph.transitions.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('applies the configured transition duration', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'walk']), {
      transitionDuration: 0.75,
    });
    expect(graph.transitions.find((t) => t.event === 'move')?.duration).toBe(0.75);
  });

  it('clamps a negative transition duration to zero', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'walk']), {
      transitionDuration: -5,
    });
    expect(graph.transitions.find((t) => t.event === 'move')?.duration).toBe(0);
  });

  it('appends custom transitions and clamps their negative durations', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'walk']), {
      transitions: [
        { from: 'walk', to: 'idle', event: 'freeze', mode: 'play', duration: -2, priority: 1 },
      ] as never,
    });
    const custom = graph.transitions.find((t) => t.event === 'freeze');
    expect(custom?.duration).toBe(0);
  });

  it('drops a custom transition referencing an unknown state', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'walk']), {
      transitions: [
        { from: 'idle', to: 'ghost', event: 'vanish', mode: 'play', duration: 0, priority: 1 },
      ] as never,
    });
    expect(graph.transitions.some((t) => t.event === 'vanish')).toBe(false);
  });
});

describe('state overrides', () => {
  it('merges an override over the computed defaults', () => {
    const graph = createCreatureAnimationGraph(source(['walk']), {
      stateOverrides: { walk: { speedScale: 9, loop: false } },
    });
    const walk = graph.states[0];
    expect(walk.speedScale).toBe(9);
    expect(walk.loop).toBe(false);
    // Untouched fields keep their computed values.
    expect(walk.tags).toContain('locomotion');
  });

  it('copies overridden arrays instead of aliasing the caller value', () => {
    const targetBones = ['a', 'b'];
    const tags = ['custom'];
    const graph = createCreatureAnimationGraph(source(['walk']), {
      stateOverrides: { walk: { targetBones, tags } },
    });
    expect(graph.states[0].targetBones).toEqual(['a', 'b']);
    expect(graph.states[0].targetBones).not.toBe(targetBones);
    expect(graph.states[0].tags).not.toBe(tags);
  });
});

describe('blend groups', () => {
  it('groups two or more locomotion states', () => {
    const graph = createCreatureAnimationGraph(source(['idle', 'walk', 'run']));
    expect(graph.blendGroups).toHaveLength(1);
    expect(graph.blendGroups[0].id).toBe('locomotion');
    expect(graph.blendGroups[0].states).toEqual(['walk', 'run']);
    expect(graph.blendGroups[0].normalized).toBe(true);
  });

  it('emits no blend group for a single locomotion state', () => {
    expect(createCreatureAnimationGraph(source(['idle', 'walk'])).blendGroups).toEqual([]);
  });

  it('orders blend states walk, run, swim, fly regardless of input order', () => {
    const graph = createCreatureAnimationGraph(source(['fly', 'swim', 'run', 'walk']));
    expect(graph.blendGroups[0].states).toEqual(['walk', 'run', 'swim', 'fly']);
  });

  it('can be disabled explicitly', () => {
    const graph = createCreatureAnimationGraph(source(['walk', 'run']), {
      includeLocomotionBlend: false,
    });
    expect(graph.blendGroups).toEqual([]);
  });
});
