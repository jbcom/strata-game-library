/**
 * Adapter-neutral creature IK: chain planning from skeleton metadata, and a
 * FABRIK/analytic solver that turns chain plans plus targets into serializable
 * runtime pose transforms.
 *
 * Core never drives a renderer here — it emits validated plans and solved
 * joint positions that any adapter can apply.
 *
 * @module CreatureIK
 * @category Entities & Simulation
 */

import type { RuntimeVector3Tuple } from '../runtime-types';
import type {
  CreatureComposition,
  CreatureRuntimeBone,
  CreatureRuntimeIKChainBonePlan,
  CreatureRuntimeIKChainPlan,
  CreatureRuntimeIKChainPosePlan,
  CreatureRuntimeIKPose,
  CreatureRuntimeIKPosePlan,
  CreatureRuntimeIKPosePlanOptions,
  CreatureRuntimeIKPoseVector,
  CreatureRuntimeIKRigPlan,
  CreatureRuntimeIKSolverKind,
  CreatureRuntimeIKTargetMap,
} from './types';
import { distance3, offsetToward } from './vector-math';

function creatureRuntimeIKVectorTuple(value: CreatureRuntimeIKPoseVector): RuntimeVector3Tuple {
  return Array.isArray(value) ? [...value] : [value.x, value.y, value.z];
}

function dominantBoneLength(bone: CreatureRuntimeBone): number {
  return Math.max(...bone.size);
}

function ikSolverForBoneCount(count: number): CreatureRuntimeIKSolverKind {
  if (count <= 1) {
    return 'single-bone';
  }

  return count === 2 ? 'two-bone' : 'fabrik';
}

function ikChainTotalLength(
  bones: CreatureRuntimeIKChainBonePlan[],
  targetPosition?: RuntimeVector3Tuple
): number {
  if (bones.length === 0) {
    return 0;
  }

  let total = bones.reduce((sum, bone) => sum + bone.length, 0);

  for (let index = 1; index < bones.length; index += 1) {
    total += distance3(
      bones[index - 1]?.position ?? [0, 0, 0],
      bones[index]?.position ?? [0, 0, 0]
    );
  }

  const last = bones.at(-1);
  if (last && targetPosition) {
    total += distance3(last.position, targetPosition);
  }

  return total;
}

/**
 * Creates an adapter-neutral IK rig plan from runtime creature bones and skeleton IK chains.
 *
 * This does not solve IK directly; it gives adapters enough validated chain metadata
 * to choose Three, Babylon, or custom solver implementations consistently.
 */
export function createCreatureIKRigPlan(
  runtime: Pick<CreatureComposition['runtime'], 'id' | 'bones' | 'ikChains'>
): CreatureRuntimeIKRigPlan {
  const bonesById = new Map(runtime.bones.map((bone) => [bone.boneId, bone]));
  const chains = (runtime.ikChains ?? []).map<CreatureRuntimeIKChainPlan>((chain) => {
    const missingBones = chain.bones.filter((boneId) => !bonesById.has(boneId));
    const plannedBones = chain.bones.flatMap<CreatureRuntimeIKChainBonePlan>((boneId) => {
      const bone = bonesById.get(boneId);

      return bone
        ? [
            {
              runtimeBoneId: bone.id,
              boneId: bone.boneId,
              parent: bone.parent,
              position: [...bone.position],
              length: dominantBoneLength(bone),
            },
          ]
        : [];
    });
    const target = bonesById.get(chain.target);
    const status = missingBones.length > 0 ? 'missing-bones' : target ? 'ready' : 'missing-target';

    return {
      id: chain.id,
      bones: plannedBones,
      targetBoneId: chain.target,
      targetRuntimeBoneId: target?.id,
      targetPosition: target ? [...target.position] : undefined,
      solver: ikSolverForBoneCount(plannedBones.length),
      totalLength: ikChainTotalLength(plannedBones, target?.position),
      status,
      missingBones,
    };
  });
  const ready = chains.filter((chain) => chain.status === 'ready');
  const missing = chains.filter((chain) => chain.status !== 'ready');

  return {
    creatureId: runtime.id,
    chains,
    ready,
    missing,
    coverage: {
      total: chains.length,
      ready: ready.length,
      missing: missing.length,
      readyRatio: chains.length > 0 ? ready.length / chains.length : 1,
    },
  };
}

function resolveCreatureRuntimeIKTarget(
  chain: CreatureRuntimeIKChainPlan,
  targets: CreatureRuntimeIKTargetMap
): RuntimeVector3Tuple | undefined {
  const target =
    targets[chain.id] ??
    targets[chain.targetRuntimeBoneId ?? ''] ??
    targets[chain.targetBoneId] ??
    chain.targetPosition;

  if (!target) {
    return undefined;
  }

  if (Array.isArray(target) || 'x' in target) {
    return creatureRuntimeIKVectorTuple(target);
  }

  return creatureRuntimeIKVectorTuple(target.position);
}

function createCreatureIKChainJoints(chain: CreatureRuntimeIKChainPlan): RuntimeVector3Tuple[] {
  const joints = chain.bones.map((bone) => [...bone.position] as RuntimeVector3Tuple);

  if (chain.targetPosition) {
    joints.push([...chain.targetPosition] as RuntimeVector3Tuple);
  } else if (chain.bones.at(-1)?.position) {
    joints.push([...(chain.bones.at(-1)?.position ?? [0, 0, 0])] as RuntimeVector3Tuple);
  }

  return joints;
}

function creatureIKSegmentLengths(
  chain: CreatureRuntimeIKChainPlan,
  joints: RuntimeVector3Tuple[]
): number[] {
  return joints.slice(0, -1).map((joint, index) => {
    const measured = distance3(joint, joints[index + 1] ?? joint);
    const planned = chain.bones[index]?.length ?? 0;

    return measured > 0 ? measured : planned;
  });
}

function solveCreatureIKJoints(
  joints: RuntimeVector3Tuple[],
  lengths: number[],
  target: RuntimeVector3Tuple,
  options: Required<Pick<CreatureRuntimeIKPosePlanOptions, 'iterations' | 'tolerance'>> &
    Pick<CreatureRuntimeIKPosePlanOptions, 'clampToReach'>
): {
  positions: RuntimeVector3Tuple[];
  target: RuntimeVector3Tuple;
  reached: boolean;
  distanceToTarget: number;
  iterations: number;
} {
  const positions = joints.map((joint) => [...joint] as RuntimeVector3Tuple);
  const root = [...(positions[0] ?? [0, 0, 0])] as RuntimeVector3Tuple;
  const reach = lengths.reduce((sum, length) => sum + length, 0);
  const requestedDistance = distance3(root, target);
  const clampedTarget =
    options.clampToReach === false || requestedDistance <= reach
      ? target
      : offsetToward(root, target, reach);

  if (positions.length <= 1 || lengths.length === 0) {
    return {
      positions,
      target: clampedTarget,
      reached: requestedDistance <= reach,
      distanceToTarget: Math.max(0, requestedDistance - reach),
      iterations: 0,
    };
  }

  if (requestedDistance > reach) {
    for (let index = 1; index < positions.length; index += 1) {
      positions[index] = offsetToward(
        positions[index - 1] ?? root,
        clampedTarget,
        lengths[index - 1] ?? 0
      );
    }

    return {
      positions,
      target: clampedTarget,
      reached: false,
      distanceToTarget: Math.max(0, requestedDistance - reach),
      iterations: 1,
    };
  }

  let iterations = 0;
  let error = distance3(positions.at(-1) ?? root, clampedTarget);

  while (error > options.tolerance && iterations < options.iterations) {
    positions[positions.length - 1] = [...clampedTarget] as RuntimeVector3Tuple;

    for (let index = positions.length - 2; index >= 0; index -= 1) {
      positions[index] = offsetToward(
        positions[index + 1] ?? clampedTarget,
        positions[index] ?? root,
        lengths[index] ?? 0
      );
    }

    positions[0] = [...root] as RuntimeVector3Tuple;

    for (let index = 1; index < positions.length; index += 1) {
      positions[index] = offsetToward(
        positions[index - 1] ?? root,
        positions[index] ?? clampedTarget,
        lengths[index - 1] ?? 0
      );
    }

    error = distance3(positions.at(-1) ?? root, clampedTarget);
    iterations += 1;
  }

  return {
    positions,
    target: clampedTarget,
    reached: error <= options.tolerance,
    distanceToTarget: distance3(positions.at(-1) ?? root, target),
    iterations,
  };
}

function createCreatureIKChainPosePlan(
  chain: CreatureRuntimeIKChainPlan,
  target: RuntimeVector3Tuple,
  options: CreatureRuntimeIKPosePlanOptions
): CreatureRuntimeIKChainPosePlan | undefined {
  if (chain.status !== 'ready' || chain.bones.length === 0) {
    return undefined;
  }

  const base = [...(chain.bones[0]?.position ?? [0, 0, 0])] as RuntimeVector3Tuple;

  if (chain.bones.length === 1) {
    const reach = Math.max(0, chain.totalLength);
    const requestedDistance = distance3(base, target);
    const clampedTarget =
      options.clampToReach === false || requestedDistance <= reach
        ? target
        : offsetToward(base, target, reach);
    const bone = chain.bones[0];

    return {
      chain,
      target: clampedTarget,
      reached: requestedDistance <= reach,
      distanceToTarget: Math.max(0, requestedDistance - reach),
      iterations: 1,
      solver: chain.solver,
      pose: bone ? { [bone.runtimeBoneId]: { position: clampedTarget } } : {},
    };
  }

  const joints = createCreatureIKChainJoints(chain);
  const lengths = creatureIKSegmentLengths(chain, joints);
  const solved = solveCreatureIKJoints(joints, lengths, target, {
    clampToReach: options.clampToReach,
    iterations: options.iterations ?? 12,
    tolerance: options.tolerance ?? 0.001,
  });
  const pose: CreatureRuntimeIKPose = {};
  const targetBoneIndex = chain.bones.findIndex(
    (bone) => bone.runtimeBoneId === chain.targetRuntimeBoneId || bone.boneId === chain.targetBoneId
  );

  for (let index = 0; index < chain.bones.length; index += 1) {
    const bone = chain.bones[index];
    const position = index === targetBoneIndex ? solved.positions.at(-1) : solved.positions[index];

    if (bone && position) {
      pose[bone.runtimeBoneId] = { position };
    }
  }

  const endPosition = solved.positions.at(-1);
  if (
    chain.targetRuntimeBoneId &&
    endPosition &&
    !chain.bones.some((bone) => bone.runtimeBoneId === chain.targetRuntimeBoneId)
  ) {
    pose[chain.targetRuntimeBoneId] = { position: endPosition };
  }

  return {
    chain,
    target: solved.target,
    reached: solved.reached,
    distanceToTarget: solved.distanceToTarget,
    iterations: solved.iterations,
    solver: chain.solver,
    pose,
  };
}

/**
 * Solves core IK rig chains into serializable runtime pose targets for adapters.
 */
export function createCreatureIKPosePlan(
  ikRig: CreatureRuntimeIKRigPlan,
  targets: CreatureRuntimeIKTargetMap = {},
  options: CreatureRuntimeIKPosePlanOptions = {}
): CreatureRuntimeIKPosePlan {
  const chains = (options.includeMissing ? ikRig.chains : ikRig.ready).flatMap((chain) => {
    const target = resolveCreatureRuntimeIKTarget(chain, targets);

    return target ? [createCreatureIKChainPosePlan(chain, target, options)].filter(Boolean) : [];
  }) as CreatureRuntimeIKChainPosePlan[];
  const pose: CreatureRuntimeIKPose = {};

  for (const chain of chains) {
    Object.assign(pose, chain.pose);
  }

  return {
    ikRig,
    pose,
    chains,
  };
}
