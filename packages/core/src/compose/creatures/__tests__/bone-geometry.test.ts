import { describe, expect, it } from 'vitest';
import type { SkeletonDefinition } from '../../skeletons/types';
import {
  boundsForBones,
  emptyBounds,
  estimateBoneVolume,
  matchesBonePattern,
  type PreparedCreatureBone,
  resolveBoneWorldPositions,
  selectRegionPattern,
  toQuaternionTuple,
  toVector3Tuple,
  weightedAverage,
} from '../bone-geometry';

function bone(
  position: [number, number, number],
  size: [number, number, number]
): PreparedCreatureBone {
  return {
    bone: { id: 'b', shape: 'box', size, position },
    index: 0,
    position,
    size,
    volume: 0,
    material: {} as PreparedCreatureBone['material'],
  } as PreparedCreatureBone;
}

describe('matchesBonePattern', () => {
  it('matches everything against a bare wildcard', () => {
    expect(matchesBonePattern('leg_front_left', '*')).toBe(true);
    expect(matchesBonePattern('', '*')).toBe(true);
  });

  it('requires an exact match when the pattern has no wildcard', () => {
    expect(matchesBonePattern('head', 'head')).toBe(true);
    expect(matchesBonePattern('head_top', 'head')).toBe(false);
    expect(matchesBonePattern('Head', 'head')).toBe(false);
  });

  it('anchors wildcard patterns at both ends', () => {
    expect(matchesBonePattern('leg_front_left', 'leg_*')).toBe(true);
    expect(matchesBonePattern('front_leg', 'leg_*')).toBe(false);
    expect(matchesBonePattern('leg_front_left', '*_left')).toBe(true);
    expect(matchesBonePattern('left_leg', '*_left')).toBe(false);
  });

  it('supports an interior wildcard', () => {
    expect(matchesBonePattern('leg_front_left', 'leg_*_left')).toBe(true);
    expect(matchesBonePattern('leg_front_right', 'leg_*_left')).toBe(false);
  });

  it('matches an empty run against a wildcard', () => {
    expect(matchesBonePattern('leg_', 'leg_*')).toBe(true);
  });

  it('treats regex metacharacters in the pattern as literals', () => {
    expect(matchesBonePattern('leg.front', 'leg.front')).toBe(true);
    expect(matchesBonePattern('legXfront', 'leg.front')).toBe(false);
    expect(matchesBonePattern('a+b', 'a+b')).toBe(true);
    expect(matchesBonePattern('aab', 'a+b')).toBe(false);
    expect(matchesBonePattern('tail(1)', 'tail(1)')).toBe(true);
  });
});

describe('selectRegionPattern', () => {
  const region = (material: string) => ({ material });

  it('returns undefined when nothing matches', () => {
    expect(selectRegionPattern('head', { 'leg_*': region('fur') })).toBeUndefined();
  });

  it('returns undefined for an empty region map', () => {
    expect(selectRegionPattern('head', {})).toBeUndefined();
  });

  it('prefers an exact pattern over a wildcard', () => {
    const picked = selectRegionPattern('head', {
      '*': region('fur'),
      head: region('skin'),
    });
    expect(picked?.[0]).toBe('head');
    expect(picked?.[1].material).toBe('skin');
  });

  it('prefers the longest literal text among competing wildcards', () => {
    const picked = selectRegionPattern('leg_front_left', {
      '*': region('fur'),
      'leg_*': region('shortfur'),
      'leg_front_*': region('boot'),
    });
    expect(picked?.[0]).toBe('leg_front_*');
  });

  it('falls back to the bare wildcard when it is the only match', () => {
    const picked = selectRegionPattern('tail', { '*': region('fur') });
    expect(picked?.[0]).toBe('*');
  });
});

describe('toVector3Tuple / toQuaternionTuple', () => {
  it('copies an array rather than aliasing it', () => {
    const source: [number, number, number] = [1, 2, 3];
    const result = toVector3Tuple(source);
    expect(result).toEqual([1, 2, 3]);
    expect(result).not.toBe(source);
  });

  it('reads x/y/z off a vector-like object', () => {
    expect(toVector3Tuple({ x: 4, y: 5, z: 6 } as never)).toEqual([4, 5, 6]);
  });

  it('returns undefined for an absent rotation', () => {
    expect(toQuaternionTuple(undefined)).toBeUndefined();
  });

  it('copies a quaternion array and reads x/y/z/w off an object', () => {
    expect(toQuaternionTuple([0, 0, 0, 1])).toEqual([0, 0, 0, 1]);
    expect(toQuaternionTuple({ x: 1, y: 2, z: 3, w: 4 } as never)).toEqual([1, 2, 3, 4]);
  });
});

describe('resolveBoneWorldPositions', () => {
  it('accumulates local offsets down the parent chain', () => {
    const skeleton = {
      bones: [
        { id: 'root', shape: 'box', size: [1, 1, 1], position: [0, 1, 0] },
        { id: 'spine', parent: 'root', shape: 'box', size: [1, 1, 1], position: [0, 0.5, 0] },
        { id: 'head', parent: 'spine', shape: 'box', size: [1, 1, 1], position: [0, 0.5, 0.2] },
      ],
    } as unknown as SkeletonDefinition;

    const positions = resolveBoneWorldPositions(skeleton);
    expect(positions.get('root')).toEqual([0, 1, 0]);
    expect(positions.get('spine')).toEqual([0, 1.5, 0]);
    expect(positions.get('head')).toEqual([0, 2, 0.2]);
  });

  it('resolves a child declared before its parent', () => {
    const skeleton = {
      bones: [
        { id: 'child', parent: 'root', shape: 'box', size: [1, 1, 1], position: [1, 0, 0] },
        { id: 'root', shape: 'box', size: [1, 1, 1], position: [10, 0, 0] },
      ],
    } as unknown as SkeletonDefinition;

    expect(resolveBoneWorldPositions(skeleton).get('child')).toEqual([11, 0, 0]);
  });

  it('treats a bone whose parent is missing as a root', () => {
    const skeleton = {
      bones: [
        { id: 'orphan', parent: 'ghost', shape: 'box', size: [1, 1, 1], position: [3, 0, 0] },
      ],
    } as unknown as SkeletonDefinition;

    expect(resolveBoneWorldPositions(skeleton).get('orphan')).toEqual([3, 0, 0]);
  });

  it('returns an empty map for a skeleton with no bones', () => {
    expect(resolveBoneWorldPositions({ bones: [] } as unknown as SkeletonDefinition).size).toBe(0);
  });
});

describe('boundsForBones', () => {
  it('returns zeroed bounds for no bones', () => {
    expect(boundsForBones([])).toEqual(emptyBounds());
  });

  it('expands each bone by half its size on every axis', () => {
    const bounds = boundsForBones([bone([0, 0, 0], [2, 4, 6])]);
    expect(bounds.min).toEqual([-1, -2, -3]);
    expect(bounds.max).toEqual([1, 2, 3]);
    expect(bounds.size).toEqual([2, 4, 6]);
    expect(bounds.center).toEqual([0, 0, 0]);
  });

  it('unions multiple bones and centres between them', () => {
    const bounds = boundsForBones([bone([0, 0, 0], [2, 2, 2]), bone([10, 0, 0], [2, 2, 2])]);
    expect(bounds.min).toEqual([-1, -1, -1]);
    expect(bounds.max).toEqual([11, 1, 1]);
    expect(bounds.size).toEqual([12, 2, 2]);
    expect(bounds.center).toEqual([5, 0, 0]);
  });

  it('handles a zero-size bone as a point', () => {
    const bounds = boundsForBones([bone([5, 5, 5], [0, 0, 0])]);
    expect(bounds.min).toEqual([5, 5, 5]);
    expect(bounds.max).toEqual([5, 5, 5]);
    expect(bounds.size).toEqual([0, 0, 0]);
    expect(bounds.center).toEqual([5, 5, 5]);
  });

  it('handles negative positions', () => {
    const bounds = boundsForBones([bone([-10, -10, -10], [2, 2, 2])]);
    expect(bounds.min).toEqual([-11, -11, -11]);
    expect(bounds.center).toEqual([-10, -10, -10]);
  });
});

describe('estimateBoneVolume', () => {
  it('multiplies extents for a box and a custom shape', () => {
    expect(estimateBoneVolume('box', [2, 3, 4])).toBe(24);
    expect(estimateBoneVolume('custom', [2, 3, 4])).toBe(24);
  });

  it('uses the ellipsoid formula for a sphere', () => {
    expect(estimateBoneVolume('sphere', [2, 2, 2])).toBeCloseTo((4 / 3) * Math.PI, 12);
  });

  it('uses pi*r^2*h for a cylinder, with y as the axis', () => {
    expect(estimateBoneVolume('cylinder', [2, 10, 2])).toBeCloseTo(Math.PI * 10, 12);
  });

  it('models a capsule as a cylinder plus a full sphere of caps', () => {
    // length 10, diameters 2 and 2 -> radius 1, cylinder length 8.
    const expected = Math.PI * 8 + (4 / 3) * Math.PI;
    expect(estimateBoneVolume('capsule', [10, 2, 2])).toBeCloseTo(expected, 12);
  });

  it('degenerates a capsule to a sphere when the caps consume the length', () => {
    // length 2 == 2*radius, so the cylindrical section clamps to zero.
    expect(estimateBoneVolume('capsule', [2, 2, 2])).toBeCloseTo((4 / 3) * Math.PI, 12);
  });

  it('is orientation-independent for a capsule', () => {
    const a = estimateBoneVolume('capsule', [10, 2, 2]);
    expect(estimateBoneVolume('capsule', [2, 10, 2])).toBeCloseTo(a, 12);
    expect(estimateBoneVolume('capsule', [2, 2, 10])).toBeCloseTo(a, 12);
  });

  it('clamps negative extents to zero rather than returning a negative volume', () => {
    expect(estimateBoneVolume('box', [-2, 3, 4])).toBe(0);
    expect(estimateBoneVolume('sphere', [-1, -1, -1])).toBe(0);
  });

  it('is zero for a zero-size bone of any shape', () => {
    for (const shape of ['box', 'sphere', 'cylinder', 'capsule', 'custom'] as const) {
      expect(estimateBoneVolume(shape, [0, 0, 0])).toBe(0);
    }
  });
});

describe('weightedAverage', () => {
  it('averages by weight', () => {
    expect(
      weightedAverage([
        { value: 10, weight: 1 },
        { value: 20, weight: 3 },
      ])
    ).toBe(17.5);
  });

  it('ignores undefined values', () => {
    expect(
      weightedAverage([
        { value: undefined, weight: 100 },
        { value: 4, weight: 1 },
      ])
    ).toBe(4);
  });

  it('ignores zero and negative weights', () => {
    expect(
      weightedAverage([
        { value: 1000, weight: 0 },
        { value: 1000, weight: -5 },
        { value: 2, weight: 2 },
      ])
    ).toBe(2);
  });

  it('returns undefined when no entry carries weight', () => {
    expect(weightedAverage([])).toBeUndefined();
    expect(weightedAverage([{ value: 5, weight: 0 }])).toBeUndefined();
    expect(weightedAverage([{ value: undefined, weight: 3 }])).toBeUndefined();
  });
});
