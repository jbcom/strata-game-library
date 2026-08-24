import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  applyVariance,
  computeEmitPosition,
  computeEmitVelocity,
  orientToDirection,
  type RandomSource,
  sampleShapePosition,
} from '../emission';

/** A random source that replays a fixed sequence, then repeats the last value. */
function sequence(values: number[]): RandomSource {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

/** A random source pinned to one value — makes jitter terms exactly zero at 0.5. */
const constant =
  (value: number): RandomSource =>
  () =>
    value;

const ZERO = () => new THREE.Vector3(0, 0, 0);

describe('sampleShapePosition', () => {
  describe('point', () => {
    it('always emits at the local origin', () => {
      const p = sampleShapePosition('point', {}, constant(0.9));
      expect(p.x).toBe(0);
      expect(p.y).toBe(0);
      expect(p.z).toBe(0);
    });

    it('ignores shape params entirely', () => {
      const p = sampleShapePosition('point', { radius: 100, width: 50 }, constant(0.1));
      expect(p.length()).toBe(0);
    });
  });

  describe('box', () => {
    it('centres the box on the origin when random is 0.5', () => {
      const p = sampleShapePosition('box', { width: 4, height: 6, depth: 8 }, constant(0.5));
      expect(p.x).toBeCloseTo(0);
      expect(p.y).toBeCloseTo(0);
      expect(p.z).toBeCloseTo(0);
    });

    it('reaches the negative corner when random is 0', () => {
      const p = sampleShapePosition('box', { width: 4, height: 6, depth: 8 }, constant(0));
      expect(p.x).toBeCloseTo(-2);
      expect(p.y).toBeCloseTo(-3);
      expect(p.z).toBeCloseTo(-4);
    });

    it('approaches the positive corner as random approaches 1', () => {
      const p = sampleShapePosition('box', { width: 4, height: 6, depth: 8 }, constant(1));
      expect(p.x).toBeCloseTo(2);
      expect(p.y).toBeCloseTo(3);
      expect(p.z).toBeCloseTo(4);
    });

    it('defaults every extent to 1', () => {
      const p = sampleShapePosition('box', {}, constant(1));
      expect(p.x).toBeCloseTo(0.5);
      expect(p.y).toBeCloseTo(0.5);
      expect(p.z).toBeCloseTo(0.5);
    });

    it('collapses to a plane when one extent is zero', () => {
      const p = sampleShapePosition('box', { width: 2, height: 0, depth: 2 }, constant(0));
      // A zero extent yields -0 from the (r - 0.5) * 2 * 0 term; compare by value.
      expect(p.y).toBeCloseTo(0);
      expect(p.x).toBeCloseTo(-1);
    });

    it('draws each axis from a separate random value', () => {
      const p = sampleShapePosition(
        'box',
        { width: 2, height: 2, depth: 2 },
        sequence([0, 0.5, 1])
      );
      expect(p.x).toBeCloseTo(-1);
      expect(p.y).toBeCloseTo(0);
      expect(p.z).toBeCloseTo(1);
    });

    it('stays inside the extents across many random samples', () => {
      for (let i = 0; i < 200; i++) {
        const p = sampleShapePosition('box', { width: 3, height: 5, depth: 7 });
        expect(Math.abs(p.x)).toBeLessThanOrEqual(1.5);
        expect(Math.abs(p.y)).toBeLessThanOrEqual(2.5);
        expect(Math.abs(p.z)).toBeLessThanOrEqual(3.5);
      }
    });
  });

  describe('sphere', () => {
    it('places points on the sphere surface at the given radius', () => {
      for (let i = 0; i < 200; i++) {
        const p = sampleShapePosition('sphere', { radius: 3 });
        expect(p.length()).toBeCloseTo(3, 5);
      }
    });

    it('defaults the radius to 1', () => {
      const p = sampleShapePosition('sphere', {});
      expect(p.length()).toBeCloseTo(1, 5);
    });

    it('collapses to the origin at radius zero', () => {
      const p = sampleShapePosition('sphere', { radius: 0 });
      expect(p.length()).toBeCloseTo(0);
    });

    it('reaches the south pole when the polar sample is 0', () => {
      // phi = acos(2*0 - 1) = acos(-1) = PI, so the point sits at -Z.
      const p = sampleShapePosition('sphere', { radius: 2 }, sequence([0, 0]));
      expect(p.z).toBeCloseTo(-2);
      expect(p.x).toBeCloseTo(0);
      expect(p.y).toBeCloseTo(0);
    });

    it('reaches the north pole when the polar sample is 1', () => {
      // phi = acos(1) = 0, so the point sits at +Z.
      const p = sampleShapePosition('sphere', { radius: 2 }, sequence([0, 1]));
      expect(p.z).toBeCloseTo(2);
    });

    it('distributes points over both hemispheres rather than bunching at a pole', () => {
      let north = 0;
      let south = 0;
      for (let i = 0; i < 400; i++) {
        const p = sampleShapePosition('sphere', { radius: 1 });
        if (p.z > 0) north++;
        else south++;
      }
      // Uniform sampling should be near an even split; allow generous slack.
      expect(north).toBeGreaterThan(120);
      expect(south).toBeGreaterThan(120);
    });

    it('mirrors the surface for a negative radius', () => {
      const p = sampleShapePosition('sphere', { radius: -2 });
      expect(p.length()).toBeCloseTo(2, 5);
    });
  });

  describe('cone', () => {
    it('collapses to the apex when the axial sample is 0', () => {
      const p = sampleShapePosition('cone', { radius: 5, height: 10 }, sequence([0, 0.5]));
      expect(p.length()).toBeCloseTo(0);
    });

    it('reaches the base rim when the axial sample is 1', () => {
      const p = sampleShapePosition('cone', { radius: 5, height: 10 }, sequence([1, 0]));
      expect(p.y).toBeCloseTo(10);
      expect(p.x).toBeCloseTo(5);
      expect(p.z).toBeCloseTo(0);
    });

    it('widens linearly with height', () => {
      const p = sampleShapePosition('cone', { radius: 4, height: 8 }, sequence([0.5, 0]));
      expect(p.y).toBeCloseTo(4);
      expect(Math.hypot(p.x, p.z)).toBeCloseTo(2);
    });

    it('keeps every sample inside the cone envelope', () => {
      for (let i = 0; i < 200; i++) {
        const p = sampleShapePosition('cone', { radius: 3, height: 6 });
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(6);
        const radialAtHeight = (3 * p.y) / 6;
        expect(Math.hypot(p.x, p.z)).toBeLessThanOrEqual(radialAtHeight + 1e-6);
      }
    });

    it('defaults radius and height to 1', () => {
      const p = sampleShapePosition('cone', {}, sequence([1, 0]));
      expect(p.y).toBeCloseTo(1);
      expect(p.x).toBeCloseTo(1);
    });

    it('points along +Y by default', () => {
      const p = sampleShapePosition('cone', { radius: 0, height: 5 }, sequence([1, 0]));
      expect(p.y).toBeCloseTo(5);
    });

    it('reorients the volume onto a custom direction', () => {
      const p = sampleShapePosition(
        'cone',
        { radius: 0, height: 5, direction: new THREE.Vector3(1, 0, 0) },
        sequence([1, 0])
      );
      expect(p.x).toBeCloseTo(5);
      expect(p.y).toBeCloseTo(0);
      expect(p.z).toBeCloseTo(0);
    });

    it('handles a direction that is the exact opposite of +Y', () => {
      const p = sampleShapePosition(
        'cone',
        { radius: 0, height: 5, direction: new THREE.Vector3(0, -1, 0) },
        sequence([1, 0])
      );
      expect(p.y).toBeCloseTo(-5);
      expect(Number.isNaN(p.x)).toBe(false);
      expect(Number.isNaN(p.z)).toBe(false);
    });

    it('normalizes a non-unit direction rather than scaling by it', () => {
      const p = sampleShapePosition(
        'cone',
        { radius: 0, height: 5, direction: new THREE.Vector3(0, 100, 0) },
        sequence([1, 0])
      );
      expect(p.y).toBeCloseTo(5);
    });

    it('leaves the sample untouched for a zero-length direction', () => {
      const p = sampleShapePosition(
        'cone',
        { radius: 0, height: 5, direction: new THREE.Vector3(0, 0, 0) },
        sequence([1, 0])
      );
      expect(p.y).toBeCloseTo(5);
      expect(Number.isNaN(p.x)).toBe(false);
    });
  });

  describe('defaults', () => {
    it('treats a missing params object as all-defaults', () => {
      expect(sampleShapePosition('point').length()).toBe(0);
      expect(sampleShapePosition('sphere').length()).toBeCloseTo(1, 5);
    });

    it('returns a fresh vector on every call', () => {
      const a = sampleShapePosition('sphere', { radius: 1 });
      const b = sampleShapePosition('sphere', { radius: 1 });
      expect(a).not.toBe(b);
    });
  });
});

describe('orientToDirection', () => {
  it('is a no-op for the canonical +Y axis', () => {
    const v = new THREE.Vector3(1, 2, 3);
    orientToDirection(v, new THREE.Vector3(0, 1, 0));
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
  });

  it('rotates +Y onto the target direction', () => {
    const v = new THREE.Vector3(0, 1, 0);
    orientToDirection(v, new THREE.Vector3(0, 0, 1));
    expect(v.z).toBeCloseTo(1);
    expect(v.y).toBeCloseTo(0);
  });

  it('preserves vector length', () => {
    const v = new THREE.Vector3(0, 7, 0);
    orientToDirection(v, new THREE.Vector3(3, 4, 0));
    expect(v.length()).toBeCloseTo(7);
  });

  it('mutates and returns the same instance', () => {
    const v = new THREE.Vector3(0, 1, 0);
    const returned = orientToDirection(v, new THREE.Vector3(1, 0, 0));
    expect(returned).toBe(v);
  });

  it('leaves the vector alone for a zero-length direction instead of producing NaN', () => {
    const v = new THREE.Vector3(0, 1, 0);
    orientToDirection(v, new THREE.Vector3(0, 0, 0));
    expect(v.y).toBe(1);
    expect(Number.isNaN(v.x)).toBe(false);
  });

  it('leaves the vector alone for a non-finite direction', () => {
    const v = new THREE.Vector3(0, 1, 0);
    orientToDirection(v, new THREE.Vector3(Number.NaN, 1, 0));
    expect(v.y).toBe(1);
    expect(Number.isNaN(v.x)).toBe(false);
  });
});

describe('applyVariance', () => {
  it('leaves the position untouched for zero variance', () => {
    const p = new THREE.Vector3(1, 2, 3);
    applyVariance(p, ZERO(), constant(0.9));
    expect(p.x).toBe(1);
    expect(p.y).toBe(2);
    expect(p.z).toBe(3);
  });

  it('is a no-op when random sits exactly at the midpoint', () => {
    const p = new THREE.Vector3(1, 2, 3);
    applyVariance(p, new THREE.Vector3(10, 10, 10), constant(0.5));
    expect(p.x).toBeCloseTo(1);
    expect(p.y).toBeCloseTo(2);
    expect(p.z).toBeCloseTo(3);
  });

  it('offsets by the full negative variance at random 0', () => {
    const p = new THREE.Vector3(0, 0, 0);
    applyVariance(p, new THREE.Vector3(1, 2, 3), constant(0));
    expect(p.x).toBeCloseTo(-1);
    expect(p.y).toBeCloseTo(-2);
    expect(p.z).toBeCloseTo(-3);
  });

  it('offsets by the full positive variance at random 1', () => {
    const p = new THREE.Vector3(0, 0, 0);
    applyVariance(p, new THREE.Vector3(1, 2, 3), constant(1));
    expect(p.x).toBeCloseTo(1);
    expect(p.y).toBeCloseTo(2);
    expect(p.z).toBeCloseTo(3);
  });

  it('draws an independent value per axis', () => {
    const p = new THREE.Vector3(0, 0, 0);
    applyVariance(p, new THREE.Vector3(1, 1, 1), sequence([0, 0.5, 1]));
    expect(p.x).toBeCloseTo(-1);
    expect(p.y).toBeCloseTo(0);
    expect(p.z).toBeCloseTo(1);
  });

  it('mutates and returns the same instance', () => {
    const p = new THREE.Vector3(0, 0, 0);
    expect(applyVariance(p, ZERO())).toBe(p);
  });

  it('stays within the variance envelope over many samples', () => {
    for (let i = 0; i < 200; i++) {
      const p = new THREE.Vector3(0, 0, 0);
      applyVariance(p, new THREE.Vector3(2, 2, 2));
      expect(Math.abs(p.x)).toBeLessThanOrEqual(2);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(2);
      expect(Math.abs(p.z)).toBeLessThanOrEqual(2);
    }
  });
});

describe('computeEmitPosition', () => {
  it('returns the emitter origin for a point shape with no variance', () => {
    const p = computeEmitPosition({
      shape: 'point',
      position: new THREE.Vector3(5, 6, 7),
      positionVariance: ZERO(),
    });
    expect(p.x).toBe(5);
    expect(p.y).toBe(6);
    expect(p.z).toBe(7);
  });

  it('translates the sampled shape by the emitter origin', () => {
    const p = computeEmitPosition(
      {
        shape: 'box',
        shapeParams: { width: 2, height: 2, depth: 2 },
        position: new THREE.Vector3(10, 0, 0),
        positionVariance: ZERO(),
      },
      constant(1)
    );
    expect(p.x).toBeCloseTo(11);
    expect(p.y).toBeCloseTo(1);
  });

  it('adds positional variance on top of the shape sample', () => {
    const p = computeEmitPosition(
      {
        shape: 'point',
        position: new THREE.Vector3(0, 0, 0),
        positionVariance: new THREE.Vector3(1, 1, 1),
      },
      constant(1)
    );
    expect(p.x).toBeCloseTo(1);
    expect(p.y).toBeCloseTo(1);
    expect(p.z).toBeCloseTo(1);
  });

  it('does not mutate the emitter origin', () => {
    const origin = new THREE.Vector3(1, 2, 3);
    computeEmitPosition({
      shape: 'sphere',
      shapeParams: { radius: 5 },
      position: origin,
      positionVariance: new THREE.Vector3(1, 1, 1),
    });
    expect(origin.x).toBe(1);
    expect(origin.y).toBe(2);
    expect(origin.z).toBe(3);
  });

  it('treats a missing shapeParams as defaults', () => {
    const p = computeEmitPosition({
      shape: 'sphere',
      position: new THREE.Vector3(0, 0, 0),
      positionVariance: ZERO(),
    });
    expect(p.length()).toBeCloseTo(1, 5);
  });

  it('returns a distinct vector on each call', () => {
    const args = {
      shape: 'point' as const,
      position: new THREE.Vector3(),
      positionVariance: ZERO(),
    };
    expect(computeEmitPosition(args)).not.toBe(computeEmitPosition(args));
  });
});

describe('computeEmitVelocity', () => {
  it('returns the base velocity when variance is zero', () => {
    const v = computeEmitVelocity({
      velocity: new THREE.Vector3(0, 3, 0),
      velocityVariance: ZERO(),
      shape: 'point',
    });
    expect(v.x).toBe(0);
    expect(v.y).toBe(3);
    expect(v.z).toBe(0);
  });

  it('does not mutate the configured base velocity', () => {
    const base = new THREE.Vector3(1, 2, 3);
    computeEmitVelocity({
      velocity: base,
      velocityVariance: new THREE.Vector3(5, 5, 5),
      shape: 'point',
    });
    expect(base.x).toBe(1);
    expect(base.y).toBe(2);
    expect(base.z).toBe(3);
  });

  it('applies symmetric variance around the base velocity', () => {
    const v = computeEmitVelocity(
      {
        velocity: new THREE.Vector3(0, 0, 0),
        velocityVariance: new THREE.Vector3(1, 2, 3),
        shape: 'box',
      },
      constant(0)
    );
    expect(v.x).toBeCloseTo(-1);
    expect(v.y).toBeCloseTo(-2);
    expect(v.z).toBeCloseTo(-3);
  });

  it('stays within the variance envelope for non-cone shapes', () => {
    for (let i = 0; i < 200; i++) {
      const v = computeEmitVelocity({
        velocity: new THREE.Vector3(0, 10, 0),
        velocityVariance: new THREE.Vector3(1, 1, 1),
        shape: 'sphere',
      });
      expect(Math.abs(v.x)).toBeLessThanOrEqual(1);
      expect(v.y).toBeGreaterThanOrEqual(9);
      expect(v.y).toBeLessThanOrEqual(11);
    }
  });

  describe('cone', () => {
    it('emits along +Y when the polar sample is 0', () => {
      const v = computeEmitVelocity(
        {
          velocity: new THREE.Vector3(0, 4, 0),
          velocityVariance: ZERO(),
          shape: 'cone',
          shapeParams: { angle: Math.PI / 4 },
        },
        // three values for the variance axes, then theta and phi.
        sequence([0.5, 0.5, 0.5, 0, 0])
      );
      expect(v.y).toBeCloseTo(4);
      expect(v.x).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });

    it('preserves the base velocity magnitude regardless of spread', () => {
      for (let i = 0; i < 100; i++) {
        const v = computeEmitVelocity({
          velocity: new THREE.Vector3(0, 6, 0),
          velocityVariance: new THREE.Vector3(9, 9, 9),
          shape: 'cone',
          shapeParams: { angle: Math.PI / 3 },
        });
        expect(v.length()).toBeCloseTo(6, 5);
      }
    });

    it('keeps directions within the configured half-angle', () => {
      const angle = Math.PI / 6;
      const axis = new THREE.Vector3(0, 1, 0);
      for (let i = 0; i < 200; i++) {
        const v = computeEmitVelocity({
          velocity: new THREE.Vector3(0, 1, 0),
          velocityVariance: ZERO(),
          shape: 'cone',
          shapeParams: { angle },
        });
        const spread = v.clone().normalize().angleTo(axis);
        expect(spread).toBeLessThanOrEqual(angle + 1e-6);
      }
    });

    it('collapses to a straight line at zero angle', () => {
      const v = computeEmitVelocity({
        velocity: new THREE.Vector3(0, 2, 0),
        velocityVariance: new THREE.Vector3(5, 5, 5),
        shape: 'cone',
        shapeParams: { angle: 0 },
      });
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(2);
      expect(v.z).toBeCloseTo(0);
    });

    it('produces a stationary particle when the base velocity has no magnitude', () => {
      // The cone branch rescales to velocity.length(), so a zero base velocity
      // yields zero speed even though the variance is large.
      const v = computeEmitVelocity({
        velocity: new THREE.Vector3(0, 0, 0),
        velocityVariance: new THREE.Vector3(10, 10, 10),
        shape: 'cone',
        shapeParams: { angle: Math.PI / 4 },
      });
      expect(v.length()).toBeCloseTo(0);
    });

    it('emits along a custom direction', () => {
      const v = computeEmitVelocity(
        {
          velocity: new THREE.Vector3(0, 3, 0),
          velocityVariance: ZERO(),
          shape: 'cone',
          shapeParams: { angle: 0, direction: new THREE.Vector3(0, 0, 1) },
        },
        constant(0.5)
      );
      expect(v.z).toBeCloseTo(3);
      expect(v.y).toBeCloseTo(0);
    });

    it('defaults the opening angle to 45 degrees', () => {
      const axis = new THREE.Vector3(0, 1, 0);
      for (let i = 0; i < 100; i++) {
        const v = computeEmitVelocity({
          velocity: new THREE.Vector3(0, 1, 0),
          velocityVariance: ZERO(),
          shape: 'cone',
        });
        expect(v.clone().normalize().angleTo(axis)).toBeLessThanOrEqual(Math.PI / 4 + 1e-6);
      }
    });
  });
});
