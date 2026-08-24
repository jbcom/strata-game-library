/**
 * Maps Strata logical creature bones onto an imported asset or source rig,
 * reporting per-bone match status and overall coverage.
 *
 * @module CreatureRigBinding
 * @category Entities & Simulation
 */

import type {
  CreatureRuntimeRigBindingPlan,
  CreatureRuntimeRigBindingSource,
  CreatureRuntimeRigBindingStatus,
} from './types';

function uniqueStrings(values: readonly string[] | undefined): string[] {
  return values ? [...new Set(values.filter((value) => value.length > 0))] : [];
}

function rigBindingStatus(
  sourceBones: Set<string> | undefined,
  sourceBone: string
): CreatureRuntimeRigBindingStatus {
  if (!sourceBones) {
    return 'unverified';
  }

  return sourceBones.has(sourceBone) ? 'matched' : 'missing';
}

/**
 * Creates a deterministic binding plan from Strata logical bones to an asset/source rig.
 *
 * The optional source bone list should come from an imported model or rig. Without it,
 * bindings are still emitted but remain unverified so adapters can surface expected
 * source names before assets are loaded.
 */
export function createCreatureRigBindingPlan(
  runtime: CreatureRuntimeRigBindingSource,
  sourceBoneNames?: readonly string[]
): CreatureRuntimeRigBindingPlan {
  const sourceBones = uniqueStrings(sourceBoneNames);
  const sourceBoneSet = sourceBoneNames ? new Set(sourceBones) : undefined;
  const mappedSourceBones = new Set<string>();
  const bindings = runtime.bones.map((bone) => {
    const sourceBone = runtime.asset?.boneMap[bone.boneId] ?? bone.boneId;
    const explicit = runtime.asset?.boneMap[bone.boneId] !== undefined;

    mappedSourceBones.add(sourceBone);

    return {
      runtimeBoneId: bone.id,
      boneId: bone.boneId,
      sourceBone,
      explicit,
      status: rigBindingStatus(sourceBoneSet, sourceBone),
      animationTargets: [...bone.animationTargets],
    };
  });
  const matched = bindings.filter((binding) => binding.status === 'matched');
  const missing = bindings.filter((binding) => binding.status === 'missing');
  const unverified = bindings.filter((binding) => binding.status === 'unverified');

  return {
    creatureId: runtime.id,
    ...(runtime.asset?.model ? { model: runtime.asset.model } : {}),
    ...(runtime.asset?.rig ? { rig: runtime.asset.rig } : {}),
    sourceBones,
    bindings,
    matched,
    missing,
    unverified,
    unmappedSourceBones: sourceBones.filter((sourceBone) => !mappedSourceBones.has(sourceBone)),
    coverage: {
      total: bindings.length,
      matched: matched.length,
      missing: missing.length,
      unverified: unverified.length,
      matchedRatio: bindings.length > 0 ? matched.length / bindings.length : 1,
    },
  };
}
