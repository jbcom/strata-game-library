import { describe, expect, it } from 'vitest';
import { resolveCreatureComposition } from '../runtime';
import type { CreateCreatureInput } from '../types';

/** Deterministic stand-in for Math.random so variation is reproducible. */
const constantRng = (value: number) => () => value;

const customInput = (overrides: Partial<CreateCreatureInput> = {}): CreateCreatureInput => ({
  id: 'test_beast',
  skeleton: 'quadruped_medium',
  covering: { skeleton: 'quadruped_medium', regions: { '*': { material: 'fur_otter' } } },
  stats: { health: 10, speed: 4 },
  ai: 'prey',
  ...overrides,
});

describe('composition shape', () => {
  it('resolves a built-in preset end to end', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));

    expect(composition.definition.id).toBe('otter_river');
    expect(composition.skeleton.bones.length).toBeGreaterThan(0);
    expect(composition.runtime.kind).toBe('creature');
    expect(composition.runtime.id).toBe('otter_river');
    expect(composition.runtime.name).toBe('River Otter');
  });

  it('produces one runtime bone per skeleton bone', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    expect(composition.runtime.bones).toHaveLength(composition.skeleton.bones.length);
  });

  it('namespaces runtime bone ids by creature and bone', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    for (const bone of composition.runtime.bones) {
      expect(bone.id).toBe(`otter_river:bone:${bone.boneId}`);
    }
  });

  it('resolves a material for every bone', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    for (const bone of composition.skeleton.bones) {
      expect(composition.materialsByBone[bone.id]).toBeDefined();
      expect(composition.materialsByBone[bone.id].boneId).toBe(bone.id);
    }
  });

  it('throws a bone-named error when no covering region matches', () => {
    expect(() =>
      resolveCreatureComposition(
        customInput({
          covering: {
            skeleton: 'quadruped_medium',
            regions: { no_such_bone: { material: 'fur_otter' } },
          },
        }),
        {},
        constantRng(0.5)
      )
    ).toThrow(/No covering region matched bone/);
  });
});

describe('scale resolution', () => {
  it('applies no variation when the rng sits at the midpoint', () => {
    // rng 0.5 maps to (0.5 * 2 - 1) == 0, so scale is exactly the base.
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    expect(composition.scale).toBeCloseTo(1, 12);
  });

  it('scales down at the low end of the variation range', () => {
    // otter scaleVariation is 0.15, so rng 0 gives 1 * (1 - 0.15).
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0));
    expect(composition.scale).toBeCloseTo(0.85, 12);
  });

  it('scales up at the high end of the variation range', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(1));
    expect(composition.scale).toBeCloseTo(1.15, 12);
  });

  it('never drops below the 0.01 floor', () => {
    const composition = resolveCreatureComposition(
      customInput({ scale: 0.000001 }) as CreateCreatureInput,
      {},
      constantRng(0.5)
    );
    expect(composition.scale).toBe(0.01);
  });

  it('skips the rng entirely when there is no scale variation', () => {
    let calls = 0;
    const counting = () => {
      calls += 1;
      return 0.5;
    };
    const composition = resolveCreatureComposition(customInput(), {}, counting);
    expect(composition.scale).toBe(1);
    // No region declares `variation`, and no scaleVariation is set, so the
    // rng is never consulted.
    expect(calls).toBe(0);
  });

  it('multiplies bone sizes and positions by the resolved scale', () => {
    const small = resolveCreatureComposition('otter_river', { scale: 1 }, constantRng(0.5));
    const large = resolveCreatureComposition('otter_river', { scale: 2 }, constantRng(0.5));

    expect(large.scale).toBeCloseTo(2 * small.scale, 12);
    const smallBone = small.runtime.bones[0];
    const largeBone = large.runtime.bones[0];
    expect(largeBone.size[0]).toBeCloseTo(smallBone.size[0] * 2, 10);
    expect(largeBone.position[1]).toBeCloseTo(smallBone.position[1] * 2, 10);
  });
});

describe('physics aggregation', () => {
  it('sums bone masses into the creature mass', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    const summed = composition.runtime.bones.reduce(
      (total, bone) => total + (bone.physics.mass ?? 0),
      0
    );
    expect(composition.runtime.physics.mass).toBeCloseTo(summed, 10);
  });

  it('marks every bone dynamic', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    expect(composition.runtime.physics.mode).toBe('dynamic');
    expect(composition.runtime.bones.every((b) => b.physics.mode === 'dynamic')).toBe(true);
  });

  it('labels the physics source consistently with its inputs', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    expect(['definition', 'material', 'mixed', 'implicit']).toContain(
      composition.runtime.physics.source
    );
  });

  it('gives every bone a non-negative volume', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    expect(composition.runtime.bones.every((b) => b.volume >= 0)).toBe(true);
  });
});

describe('material slots', () => {
  it('registers a slot for each bone and back-references it', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));

    for (const bone of composition.runtime.bones) {
      const slot = composition.runtime.materialSlots[bone.materialSlot];
      expect(slot).toBeDefined();
      expect(slot.id).toBe(bone.materialSlot);
      expect(slot.materialId).toBe(bone.materialId);
    }
  });

  it('never offers a slot its own material as a swap candidate', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    for (const slot of Object.values(composition.runtime.materialSlots)) {
      expect(slot.swappableWith).not.toContain(slot.materialId);
    }
  });
});

describe('bounds', () => {
  it('produces bounds enclosing the creature with non-negative extents', () => {
    const { bounds } = resolveCreatureComposition('otter_river', {}, constantRng(0.5)).runtime;

    expect(bounds.size.every((n) => n >= 0)).toBe(true);
    for (let axis = 0; axis < 3; axis += 1) {
      expect(bounds.max[axis]).toBeGreaterThanOrEqual(bounds.min[axis]);
      expect(bounds.center[axis]).toBeCloseTo((bounds.min[axis] + bounds.max[axis]) / 2, 12);
    }
  });

  it('grows the bounds with the creature scale', () => {
    const small = resolveCreatureComposition('otter_river', { scale: 1 }, constantRng(0.5));
    const large = resolveCreatureComposition('otter_river', { scale: 3 }, constantRng(0.5));
    expect(large.runtime.bounds.size[0]).toBeGreaterThan(small.runtime.bounds.size[0]);
  });
});

describe('animations and graph', () => {
  it('binds every defined animation clip', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    const names = composition.runtime.animations.map((a) => a.name).sort();
    expect(names).toEqual(['eat', 'idle', 'play', 'run', 'swim', 'walk']);
  });

  it('targets all bones for an animation with no explicit target list', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    const idle = composition.runtime.animations.find((a) => a.name === 'idle');
    expect(idle?.targetBones.length).toBeGreaterThan(0);
  });

  it('builds an animation graph matching the bound animations', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    const graph = composition.runtime.animationGraph;

    expect(graph.creatureId).toBe('otter_river');
    expect(graph.states.map((s) => s.id).sort()).toEqual(
      composition.runtime.animations.map((a) => a.name).sort()
    );
    expect(graph.initialState).toBe('idle');
  });

  it('scales the swim state by the otter swim/ground speed ratio', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    const swim = composition.runtime.animationGraph.states.find((s) => s.id === 'swim');
    // Preset stats are speed 6 and swimSpeed 12.
    expect(swim?.speedScale).toBe(2);
  });
});

describe('spawn, stats, drops, and sounds', () => {
  it('copies spawn rules onto the runtime', () => {
    const { spawn } = resolveCreatureComposition('otter_river', {}, constantRng(0.5)).runtime;
    expect(spawn.biomes).toEqual(['marsh']);
    expect(spawn.spawnWeight).toBe(0.4);
    expect(spawn.packSize).toEqual([2, 6]);
    expect(spawn.timeOfDay).toEqual(['day', 'dawn', 'dusk']);
  });

  it('copies rather than aliases the definition arrays', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    expect(composition.runtime.spawn.biomes).not.toBe(composition.definition.biomes);
    expect(composition.runtime.stats).not.toBe(composition.definition.stats);
  });

  it('carries stats, ai, drops, and sounds through', () => {
    const { runtime } = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    expect(runtime.stats.health).toBe(50);
    expect(runtime.ai).toBe('prey');
    expect(runtime.drops?.guaranteed?.[0]).toEqual({ item: 'otter_pelt', count: 1 });
    expect(runtime.sounds?.alert).toBe('otter_alert');
  });

  it('leaves the asset binding undefined when the definition declares no assets', () => {
    const composition = resolveCreatureComposition('otter_river', {}, constantRng(0.5));
    expect(composition.runtime.asset).toBeUndefined();
  });
});

describe('IK rig plan', () => {
  it('always attaches an IK rig plan with coherent coverage', () => {
    const { ikRig } = resolveCreatureComposition('otter_river', {}, constantRng(0.5)).runtime;

    expect(ikRig.creatureId).toBe('otter_river');
    expect(ikRig.coverage.total).toBe(ikRig.chains.length);
    expect(ikRig.coverage.ready + ikRig.coverage.missing).toBe(ikRig.coverage.total);
  });
});

describe('determinism', () => {
  it('produces identical geometry for the same seed', () => {
    const a = resolveCreatureComposition('otter_river', {}, constantRng(0.25));
    const b = resolveCreatureComposition('otter_river', {}, constantRng(0.25));

    expect(a.scale).toBe(b.scale);
    expect(a.runtime.bones.map((x) => x.position)).toEqual(b.runtime.bones.map((x) => x.position));
    expect(a.runtime.bounds).toEqual(b.runtime.bounds);
  });

  it('produces different scales for different seeds', () => {
    const low = resolveCreatureComposition('otter_river', {}, constantRng(0));
    const high = resolveCreatureComposition('otter_river', {}, constantRng(1));
    expect(low.scale).not.toBe(high.scale);
  });
});
