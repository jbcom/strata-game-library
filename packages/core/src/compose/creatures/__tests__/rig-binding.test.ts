import { describe, expect, it } from 'vitest';
import { createCreatureRigBindingPlan } from '../rig-binding';
import type { CreatureRuntimeRigBindingSource } from '../types';

const runtime = (
  bones: Array<{ id: string; boneId: string; animationTargets?: string[] }>,
  asset?: { model?: string; rig?: string; boneMap?: Record<string, string> }
): CreatureRuntimeRigBindingSource =>
  ({
    id: 'beast',
    bones: bones.map((b) => ({ ...b, animationTargets: b.animationTargets ?? [] })),
    asset: asset ? { boneMap: {}, animationClips: {}, ...asset } : undefined,
  }) as CreatureRuntimeRigBindingSource;

describe('without a source bone list', () => {
  it('marks every binding unverified', () => {
    const plan = createCreatureRigBindingPlan(
      runtime([
        { id: 'beast:bone:head', boneId: 'head' },
        { id: 'beast:bone:tail', boneId: 'tail' },
      ])
    );

    expect(plan.bindings).toHaveLength(2);
    expect(plan.unverified).toHaveLength(2);
    expect(plan.matched).toHaveLength(0);
    expect(plan.missing).toHaveLength(0);
    expect(plan.bindings.every((b) => b.status === 'unverified')).toBe(true);
  });

  it('reports a full matchedRatio of 1 for an empty rig', () => {
    const plan = createCreatureRigBindingPlan(runtime([]));
    expect(plan.coverage).toEqual({
      total: 0,
      matched: 0,
      missing: 0,
      unverified: 0,
      matchedRatio: 1,
    });
  });

  it('defaults sourceBone to the logical bone id', () => {
    const plan = createCreatureRigBindingPlan(runtime([{ id: 'r:head', boneId: 'head' }]));
    expect(plan.bindings[0].sourceBone).toBe('head');
    expect(plan.bindings[0].explicit).toBe(false);
  });
});

describe('with a source bone list', () => {
  it('splits bindings into matched and missing', () => {
    const plan = createCreatureRigBindingPlan(
      runtime([
        { id: 'r:head', boneId: 'head' },
        { id: 'r:tail', boneId: 'tail' },
      ]),
      ['head']
    );

    expect(plan.matched.map((b) => b.boneId)).toEqual(['head']);
    expect(plan.missing.map((b) => b.boneId)).toEqual(['tail']);
    expect(plan.unverified).toHaveLength(0);
    expect(plan.coverage.matchedRatio).toBe(0.5);
  });

  it('reports bones present in the source but unused by the rig', () => {
    const plan = createCreatureRigBindingPlan(runtime([{ id: 'r:head', boneId: 'head' }]), [
      'head',
      'extra_prop',
    ]);
    expect(plan.unmappedSourceBones).toEqual(['extra_prop']);
  });

  it('deduplicates and drops empty names from the source list', () => {
    const plan = createCreatureRigBindingPlan(runtime([{ id: 'r:head', boneId: 'head' }]), [
      'head',
      'head',
      '',
      'spine',
    ]);
    expect(plan.sourceBones).toEqual(['head', 'spine']);
  });

  it('yields a zero matchedRatio when nothing matches', () => {
    const plan = createCreatureRigBindingPlan(runtime([{ id: 'r:head', boneId: 'head' }]), [
      'other',
    ]);
    expect(plan.coverage.matchedRatio).toBe(0);
    expect(plan.missing).toHaveLength(1);
  });

  it('treats an empty source array as verified-but-nothing-present, not unverified', () => {
    const plan = createCreatureRigBindingPlan(runtime([{ id: 'r:head', boneId: 'head' }]), []);
    expect(plan.bindings[0].status).toBe('missing');
    expect(plan.unverified).toHaveLength(0);
  });
});

describe('asset bone maps', () => {
  it('redirects a bone through the map and flags it explicit', () => {
    const plan = createCreatureRigBindingPlan(
      runtime([{ id: 'r:head', boneId: 'head' }], { boneMap: { head: 'Bip01_Head' } }),
      ['Bip01_Head']
    );

    expect(plan.bindings[0].sourceBone).toBe('Bip01_Head');
    expect(plan.bindings[0].explicit).toBe(true);
    expect(plan.bindings[0].status).toBe('matched');
    expect(plan.unmappedSourceBones).toEqual([]);
  });

  it('leaves unmapped bones implicit alongside mapped ones', () => {
    const plan = createCreatureRigBindingPlan(
      runtime([
        { id: 'r:head', boneId: 'head' },
        { id: 'r:tail', boneId: 'tail' },
      ]),
      ['head', 'tail']
    );
    expect(plan.bindings.every((b) => b.explicit === false)).toBe(true);
  });

  it('propagates model and rig identifiers when present', () => {
    const plan = createCreatureRigBindingPlan(
      runtime([{ id: 'r:head', boneId: 'head' }], { model: 'beast.glb', rig: 'beast_rig' })
    );
    expect(plan.model).toBe('beast.glb');
    expect(plan.rig).toBe('beast_rig');
  });

  it('omits model and rig keys entirely when there is no asset', () => {
    const plan = createCreatureRigBindingPlan(runtime([{ id: 'r:head', boneId: 'head' }]));
    expect('model' in plan).toBe(false);
    expect('rig' in plan).toBe(false);
  });

  it('copies animation targets rather than aliasing the runtime bone array', () => {
    const source = runtime([{ id: 'r:head', boneId: 'head', animationTargets: ['idle'] }]);
    const plan = createCreatureRigBindingPlan(source);
    expect(plan.bindings[0].animationTargets).toEqual(['idle']);
    expect(plan.bindings[0].animationTargets).not.toBe(source.bones[0].animationTargets);
  });

  it('counts two bones mapped onto one source bone as a single mapped source', () => {
    const plan = createCreatureRigBindingPlan(
      runtime(
        [
          { id: 'r:a', boneId: 'a' },
          { id: 'r:b', boneId: 'b' },
        ],
        { boneMap: { a: 'shared', b: 'shared' } }
      ),
      ['shared']
    );
    expect(plan.matched).toHaveLength(2);
    expect(plan.unmappedSourceBones).toEqual([]);
  });
});
