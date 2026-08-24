import { describe, expect, it } from 'vitest';
import type { RuntimeVector3Tuple } from '../../runtime-types';
import { createCreatureIKPosePlan, createCreatureIKRigPlan } from '../ik';
import type { CreatureRuntimeIKRigPlan } from '../types';
import { distance3 } from '../vector-math';

const bone = (
  boneId: string,
  position: RuntimeVector3Tuple,
  size: RuntimeVector3Tuple = [1, 1, 1]
) =>
  ({
    id: `beast:bone:${boneId}`,
    boneId,
    shape: 'box',
    size,
    position,
    animationTargets: [],
  }) as never;

const rigSource = (
  bones: ReturnType<typeof bone>[],
  ikChains: Array<{ id: string; bones: string[]; target: string }>
) => ({ id: 'beast', bones, ikChains }) as never;

/** A straight arm on +X: three unit bones at x = 0, 1, 2 with a hand target at x = 3. */
const straightArm = () =>
  createCreatureIKRigPlan(
    rigSource(
      [
        bone('upper', [0, 0, 0]),
        bone('fore', [1, 0, 0]),
        bone('wrist', [2, 0, 0]),
        bone('hand', [3, 0, 0]),
      ],
      [{ id: 'arm', bones: ['upper', 'fore', 'wrist'], target: 'hand' }]
    )
  );

describe('createCreatureIKRigPlan', () => {
  it('reports full readiness for a rig with no chains at all', () => {
    const plan = createCreatureIKRigPlan(rigSource([], []));
    expect(plan.chains).toEqual([]);
    expect(plan.coverage).toEqual({ total: 0, ready: 0, missing: 0, readyRatio: 1 });
  });

  it('treats an absent ikChains list as no chains', () => {
    const plan = createCreatureIKRigPlan({ id: 'beast', bones: [] } as never);
    expect(plan.chains).toEqual([]);
    expect(plan.coverage.readyRatio).toBe(1);
  });

  it('marks a fully-resolved chain ready and records its target position', () => {
    const plan = straightArm();
    expect(plan.chains).toHaveLength(1);
    expect(plan.chains[0].status).toBe('ready');
    expect(plan.chains[0].targetPosition).toEqual([3, 0, 0]);
    expect(plan.chains[0].targetRuntimeBoneId).toBe('beast:bone:hand');
    expect(plan.coverage).toEqual({ total: 1, ready: 1, missing: 0, readyRatio: 1 });
  });

  it('flags missing chain bones and lists them', () => {
    const plan = createCreatureIKRigPlan(
      rigSource(
        [bone('upper', [0, 0, 0]), bone('hand', [2, 0, 0])],
        [{ id: 'arm', bones: ['upper', 'ghost'], target: 'hand' }]
      )
    );
    expect(plan.chains[0].status).toBe('missing-bones');
    expect(plan.chains[0].missingBones).toEqual(['ghost']);
    expect(plan.chains[0].bones).toHaveLength(1);
    expect(plan.missing).toHaveLength(1);
  });

  it('flags a missing target separately from missing bones', () => {
    const plan = createCreatureIKRigPlan(
      rigSource([bone('upper', [0, 0, 0])], [{ id: 'arm', bones: ['upper'], target: 'nowhere' }])
    );
    expect(plan.chains[0].status).toBe('missing-target');
    expect(plan.chains[0].missingBones).toEqual([]);
    expect(plan.chains[0].targetPosition).toBeUndefined();
  });

  it('prefers missing-bones over missing-target when both are wrong', () => {
    const plan = createCreatureIKRigPlan(
      rigSource([], [{ id: 'arm', bones: ['ghost'], target: 'nowhere' }])
    );
    expect(plan.chains[0].status).toBe('missing-bones');
  });

  it('picks a solver by bone count', () => {
    const solverFor = (boneIds: string[]) =>
      createCreatureIKRigPlan(
        rigSource(
          [bone('a', [0, 0, 0]), bone('b', [1, 0, 0]), bone('c', [2, 0, 0]), bone('t', [3, 0, 0])],
          [{ id: 'chain', bones: boneIds, target: 't' }]
        )
      ).chains[0].solver;

    expect(solverFor([])).toBe('single-bone');
    expect(solverFor(['a'])).toBe('single-bone');
    expect(solverFor(['a', 'b'])).toBe('two-bone');
    expect(solverFor(['a', 'b', 'c'])).toBe('fabrik');
  });

  it('uses the dominant axis of each bone as its length', () => {
    const plan = createCreatureIKRigPlan(
      rigSource(
        [bone('a', [0, 0, 0], [1, 7, 2]), bone('t', [0, 0, 0])],
        [{ id: 'chain', bones: ['a'], target: 't' }]
      )
    );
    expect(plan.chains[0].bones[0].length).toBe(7);
  });

  it('sums bone lengths, inter-bone gaps, and the final hop to the target', () => {
    // Three unit-size bones spaced 1 apart, target 1 beyond the last.
    // 3 lengths + 2 gaps + 1 final hop = 6.
    expect(straightArm().chains[0].totalLength).toBeCloseTo(6, 12);
  });

  it('copies bone positions rather than aliasing the runtime bones', () => {
    const bones = [bone('a', [1, 2, 3]), bone('t', [4, 5, 6])];
    const plan = createCreatureIKRigPlan(
      rigSource(bones, [{ id: 'chain', bones: ['a'], target: 't' }])
    );
    expect(plan.chains[0].bones[0].position).toEqual([1, 2, 3]);
    expect(plan.chains[0].bones[0].position).not.toBe(
      (bones[0] as unknown as { position: unknown }).position
    );
  });
});

describe('createCreatureIKPosePlan chain selection', () => {
  it('produces an empty pose for a rig with no chains', () => {
    const plan = createCreatureIKPosePlan(createCreatureIKRigPlan(rigSource([], [])));
    expect(plan.chains).toEqual([]);
    expect(plan.pose).toEqual({});
  });

  it('skips non-ready chains by default', () => {
    const rig = createCreatureIKRigPlan(
      rigSource([bone('a', [0, 0, 0])], [{ id: 'arm', bones: ['a'], target: 'nowhere' }])
    );
    expect(createCreatureIKPosePlan(rig, { arm: [1, 0, 0] }).chains).toHaveLength(0);
  });

  it('still refuses a non-ready chain when includeMissing is set', () => {
    const rig = createCreatureIKRigPlan(
      rigSource([bone('a', [0, 0, 0])], [{ id: 'arm', bones: ['a'], target: 'nowhere' }])
    );
    // includeMissing widens the candidate list, but the per-chain planner
    // still declines anything that is not ready.
    expect(
      createCreatureIKPosePlan(rig, { arm: [1, 0, 0] }, { includeMissing: true }).chains
    ).toHaveLength(0);
  });

  it('falls back to the chain rest target when no explicit target is supplied', () => {
    const plan = createCreatureIKPosePlan(straightArm());
    expect(plan.chains).toHaveLength(1);
    expect(plan.chains[0].target).toEqual([3, 0, 0]);
  });

  it('resolves a target keyed by chain id', () => {
    const plan = createCreatureIKPosePlan(straightArm(), { arm: [0, 3, 0] });
    expect(plan.chains[0].target[1]).toBeCloseTo(3, 6);
  });

  it('resolves a target keyed by runtime bone id and by logical bone id', () => {
    expect(
      createCreatureIKPosePlan(straightArm(), { 'beast:bone:hand': [0, 2, 0] }).chains[0].target[1]
    ).toBeCloseTo(2, 6);
    expect(
      createCreatureIKPosePlan(straightArm(), { hand: [0, 2, 0] }).chains[0].target[1]
    ).toBeCloseTo(2, 6);
  });

  it('accepts a vector-like object and a wrapped { position } target', () => {
    expect(
      createCreatureIKPosePlan(straightArm(), { arm: { x: 0, y: 2, z: 0 } }).chains[0].target[1]
    ).toBeCloseTo(2, 6);
    expect(
      createCreatureIKPosePlan(straightArm(), { arm: { position: [0, 2, 0] } }).chains[0].target[1]
    ).toBeCloseTo(2, 6);
  });

  it('merges every chain pose into one flat pose map', () => {
    const rig = createCreatureIKRigPlan(
      rigSource(
        [
          bone('l1', [0, 0, 0]),
          bone('l2', [1, 0, 0]),
          bone('lt', [2, 0, 0]),
          bone('r1', [0, 5, 0]),
          bone('r2', [1, 5, 0]),
          bone('rt', [2, 5, 0]),
        ],
        [
          { id: 'left', bones: ['l1', 'l2'], target: 'lt' },
          { id: 'right', bones: ['r1', 'r2'], target: 'rt' },
        ]
      )
    );
    const plan = createCreatureIKPosePlan(rig);
    expect(plan.chains).toHaveLength(2);
    expect(Object.keys(plan.pose).length).toBeGreaterThanOrEqual(4);
  });
});

describe('single-bone chains', () => {
  const singleBone = () =>
    createCreatureIKRigPlan(
      rigSource(
        [bone('only', [0, 0, 0], [2, 1, 1]), bone('tip', [2, 0, 0])],
        [{ id: 'chain', bones: ['only'], target: 'tip' }]
      )
    );

  it('reaches a target inside its span and reports zero residual distance', () => {
    const plan = createCreatureIKPosePlan(singleBone(), { chain: [1, 0, 0] });
    expect(plan.chains[0].reached).toBe(true);
    expect(plan.chains[0].distanceToTarget).toBe(0);
    expect(plan.chains[0].solver).toBe('single-bone');
  });

  it('clamps an out-of-reach target back onto the reach sphere', () => {
    const rig = singleBone();
    const reach = rig.chains[0].totalLength;
    const plan = createCreatureIKPosePlan(rig, { chain: [1000, 0, 0] });

    expect(plan.chains[0].reached).toBe(false);
    expect(plan.chains[0].target[0]).toBeCloseTo(reach, 6);
    expect(plan.chains[0].distanceToTarget).toBeCloseTo(1000 - reach, 6);
  });

  it('leaves an out-of-reach target unclamped when clampToReach is false', () => {
    const plan = createCreatureIKPosePlan(
      singleBone(),
      { chain: [1000, 0, 0] },
      { clampToReach: false }
    );
    expect(plan.chains[0].target).toEqual([1000, 0, 0]);
    expect(plan.chains[0].reached).toBe(false);
  });

  it('writes the solved position into the pose under the runtime bone id', () => {
    const plan = createCreatureIKPosePlan(singleBone(), { chain: [1, 0, 0] });
    expect(plan.pose['beast:bone:only'].position).toEqual([1, 0, 0]);
  });
});

describe('multi-bone FABRIK solving', () => {
  it('reaches a target well inside the chain span', () => {
    const plan = createCreatureIKPosePlan(straightArm(), { arm: [0, 2, 0] });
    const chain = plan.chains[0];

    expect(chain.reached).toBe(true);
    expect(chain.distanceToTarget).toBeLessThan(0.01);
    expect(chain.iterations).toBeGreaterThan(0);
  });

  it('holds the root bone fixed while solving', () => {
    const plan = createCreatureIKPosePlan(straightArm(), { arm: [0, 2, 0] });
    expect(plan.pose['beast:bone:upper'].position).toEqual([0, 0, 0]);
  });

  it('preserves each segment length within tolerance after solving', () => {
    const rig = straightArm();
    const plan = createCreatureIKPosePlan(rig, { arm: [1, 1.5, 0] });
    const ordered = ['upper', 'fore', 'wrist', 'hand'].map(
      (id) => plan.pose[`beast:bone:${id}`]?.position
    );

    for (let i = 0; i < ordered.length - 1; i += 1) {
      const a = ordered[i];
      const b = ordered[i + 1];
      if (a && b) {
        expect(distance3(a, b)).toBeCloseTo(1, 3);
      }
    }
  });

  it('straightens toward an unreachable target and reports the shortfall', () => {
    const plan = createCreatureIKPosePlan(straightArm(), { arm: [100, 0, 0] });
    const chain = plan.chains[0];

    expect(chain.reached).toBe(false);
    expect(chain.iterations).toBe(1);
    expect(chain.distanceToTarget).toBeGreaterThan(0);
    // The multi-bone solver clamps to the sum of *segment* lengths measured
    // between joints (3 unit gaps here), not to `totalLength`, which also
    // counts inter-bone spacing and the final hop to the target.
    expect(chain.target[0]).toBeCloseTo(3, 6);
    expect(chain.chain.totalLength).toBeCloseTo(6, 12);
  });

  it('respects an iteration budget of zero by not iterating', () => {
    const plan = createCreatureIKPosePlan(straightArm(), { arm: [0, 2, 0] }, { iterations: 0 });
    expect(plan.chains[0].iterations).toBe(0);
  });

  it('converges in fewer iterations with a looser tolerance', () => {
    const tight = createCreatureIKPosePlan(
      straightArm(),
      { arm: [0.5, 2, 0] },
      { tolerance: 1e-9, iterations: 64 }
    ).chains[0].iterations;
    const loose = createCreatureIKPosePlan(
      straightArm(),
      { arm: [0.5, 2, 0] },
      { tolerance: 0.5, iterations: 64 }
    ).chains[0].iterations;

    expect(loose).toBeLessThanOrEqual(tight);
  });

  it('handles a target exactly at the chain rest pose', () => {
    const plan = createCreatureIKPosePlan(straightArm(), { arm: [3, 0, 0] });
    expect(plan.chains[0].reached).toBe(true);
  });

  it('produces finite positions for a degenerate all-coincident chain', () => {
    const rig = createCreatureIKRigPlan(
      rigSource(
        [bone('a', [0, 0, 0]), bone('b', [0, 0, 0]), bone('t', [0, 0, 0])],
        [{ id: 'chain', bones: ['a', 'b'], target: 't' }]
      )
    );
    const plan = createCreatureIKPosePlan(rig, { chain: [0, 0, 0] });

    for (const transform of Object.values(plan.pose)) {
      expect(transform.position.every((n) => Number.isFinite(n))).toBe(true);
    }
  });

  it('writes a pose entry for the target bone even though it is not a chain bone', () => {
    const plan = createCreatureIKPosePlan(straightArm(), { arm: [0, 2, 0] });
    expect(plan.pose['beast:bone:hand']).toBeDefined();
  });

  it('carries the originating rig plan through on the result', () => {
    const rig = straightArm();
    const plan = createCreatureIKPosePlan(rig, { arm: [0, 2, 0] });
    expect(plan.ikRig).toBe(rig);
    expect(plan.chains[0].chain).toBe(rig.chains[0]);
  });

  it('is deterministic across repeated runs with the same inputs', () => {
    const a = createCreatureIKPosePlan(straightArm(), { arm: [0.5, 1.5, 0.25] });
    const b = createCreatureIKPosePlan(straightArm(), { arm: [0.5, 1.5, 0.25] });
    expect(a.pose).toEqual(b.pose);
  });
});

describe('empty rig plan handling', () => {
  it('accepts a hand-built empty rig plan without throwing', () => {
    const empty: CreatureRuntimeIKRigPlan = {
      creatureId: 'beast',
      chains: [],
      ready: [],
      missing: [],
      coverage: { total: 0, ready: 0, missing: 0, readyRatio: 1 },
    };
    expect(createCreatureIKPosePlan(empty).pose).toEqual({});
  });
});
