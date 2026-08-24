/**
 * Bone-level geometry for creature composition: covering-region pattern
 * matching, skeleton-space world positions, axis-aligned bounds, and shape
 * volume estimation.
 *
 * @module CreatureBoneGeometry
 * @category Entities & Simulation
 */

import type * as THREE from 'three';
import type { RuntimeBounds, RuntimeQuaternionTuple, RuntimeVector3Tuple } from '../runtime-types';
import type { BoneDefinition, SkeletonDefinition } from '../skeletons/types';
import type { ResolvedCreatureMaterial } from './types';
import { addVector } from './vector-math';

export interface PreparedCreatureBone {
  bone: BoneDefinition;
  index: number;
  position: RuntimeVector3Tuple;
  rotation?: RuntimeQuaternionTuple;
  size: RuntimeVector3Tuple;
  volume: number;
  material: ResolvedCreatureMaterial;
}

export type CreatureCoveringRegion = {
  material: string;
  color?: string | THREE.Color;
  scale?: number;
  variation?: number;
};

function escapePattern(pattern: string): string {
  return pattern.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

/**
 * Tests a bone id against a covering region pattern. `*` matches any run of
 * characters; a pattern without `*` must match the bone id exactly.
 */
export function matchesBonePattern(boneId: string, pattern: string): boolean {
  if (pattern === '*') {
    return true;
  }

  if (!pattern.includes('*')) {
    return boneId === pattern;
  }

  return new RegExp(`^${escapePattern(pattern).replace(/\*/g, '.*')}$`).test(boneId);
}

/**
 * Picks the most specific covering region matching a bone. Exact patterns beat
 * wildcard patterns; among equals, the longest literal text wins.
 */
export function selectRegionPattern(
  boneId: string,
  regions: Record<string, CreatureCoveringRegion>
): [string, CreatureCoveringRegion] | undefined {
  const matches = Object.entries(regions).filter(([pattern]) =>
    matchesBonePattern(boneId, pattern)
  );
  if (matches.length === 0) {
    return undefined;
  }

  return matches.sort(([patternA], [patternB]) => {
    const score = (pattern: string) =>
      (pattern.includes('*') ? 0 : 10_000) + pattern.replaceAll('*', '').length;
    return score(patternB) - score(patternA);
  })[0];
}

export function toVector3Tuple(
  position: [number, number, number] | THREE.Vector3
): RuntimeVector3Tuple {
  return Array.isArray(position) ? [...position] : [position.x, position.y, position.z];
}

export function toQuaternionTuple(
  rotation: [number, number, number, number] | THREE.Quaternion | undefined
): RuntimeQuaternionTuple | undefined {
  return rotation
    ? Array.isArray(rotation)
      ? [...rotation]
      : [rotation.x, rotation.y, rotation.z, rotation.w]
    : undefined;
}

/**
 * Accumulates each bone's local position down the parent chain into skeleton
 * world space. Results are memoised per bone, so each chain is walked once.
 */
export function resolveBoneWorldPositions(
  skeleton: SkeletonDefinition
): Map<string, RuntimeVector3Tuple> {
  const bonesById = new Map(skeleton.bones.map((bone) => [bone.id, bone]));
  const positions = new Map<string, RuntimeVector3Tuple>();

  const resolveBone = (bone: BoneDefinition): RuntimeVector3Tuple => {
    const cached = positions.get(bone.id);
    if (cached) {
      return cached;
    }

    const local = toVector3Tuple(bone.position);
    const parent = bone.parent ? bonesById.get(bone.parent) : undefined;
    const world = parent ? addVector(resolveBone(parent), local) : local;
    positions.set(bone.id, world);
    return world;
  };

  for (const bone of skeleton.bones) {
    resolveBone(bone);
  }

  return positions;
}

export function emptyBounds(): RuntimeBounds {
  return {
    min: [0, 0, 0],
    max: [0, 0, 0],
    size: [0, 0, 0],
    center: [0, 0, 0],
  };
}

/** Axis-aligned bounds enclosing every prepared bone's box extent. */
export function boundsForBones(bones: PreparedCreatureBone[]): RuntimeBounds {
  if (bones.length === 0) {
    return emptyBounds();
  }

  const min: RuntimeVector3Tuple = [
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
  ];
  const max: RuntimeVector3Tuple = [
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ];

  for (const { position, size } of bones) {
    for (let axis = 0; axis < 3; axis += 1) {
      const half = size[axis] / 2;
      min[axis] = Math.min(min[axis], position[axis] - half);
      max[axis] = Math.max(max[axis], position[axis] + half);
    }
  }

  return {
    min,
    max,
    size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
    center: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
  };
}

/** Approximate volume of a bone's primitive shape at the given size. */
export function estimateBoneVolume(
  shape: BoneDefinition['shape'],
  size: RuntimeVector3Tuple
): number {
  const [x, y, z] = size.map((value) => Math.max(0, value)) as RuntimeVector3Tuple;

  switch (shape) {
    case 'sphere':
      return (4 / 3) * Math.PI * (x / 2) * (y / 2) * (z / 2);
    case 'cylinder':
      return Math.PI * (x / 2) * (z / 2) * y;
    case 'capsule': {
      const [length, diameterA, diameterB] = [x, y, z].sort((a, b) => b - a);
      const radius = (diameterA + diameterB) / 4;
      const cylinderLength = Math.max(0, length - 2 * radius);
      return Math.PI * radius * radius * cylinderLength + (4 / 3) * Math.PI * radius ** 3;
    }
    case 'box':
    case 'custom':
      return x * y * z;
  }
}

export function weightedAverage(
  values: Array<{ value: number | undefined; weight: number }>
): number | undefined {
  const weighted = values.filter((entry) => entry.value !== undefined && entry.weight > 0);
  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);

  if (totalWeight === 0) {
    return undefined;
  }

  return weighted.reduce((sum, entry) => sum + (entry.value ?? 0) * entry.weight, 0) / totalWeight;
}
