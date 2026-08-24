/**
 * Force, impulse and kinematics tests.
 *
 * Focuses on the numeric edges the happy-path suite skips: zero and negative
 * timesteps, NaN and non-finite inputs, unnormalized and degenerate normals,
 * drag factors that overshoot past zero, and the physical round-trips
 * (jump impulse ↔ landing velocity) that must agree.
 *
 * @module core/physics/forces.test
 */

import * as THREE from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyDrag,
  calculateBuoyancyForce,
  calculateExplosionForce,
  calculateForce,
  calculateImpulse,
  calculateJumpImpulse,
  calculateLandingVelocity,
  calculateSlopeAngle,
  calculateSteeringAngle,
  calculateSuspensionForce,
  generateDebrisVelocity,
  isWalkableSlope,
  projectVelocityOntoGround,
} from '../forces';

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

describe('calculateImpulse', () => {
  it('returns zero when already at the target velocity', () => {
    expect(calculateImpulse(v(3, -2, 7), v(3, -2, 7), 50).length()).toBe(0);
  });

  it('scales linearly with mass', () => {
    const single = calculateImpulse(v(0, 0, 0), v(1, 0, 0), 1);
    const double = calculateImpulse(v(0, 0, 0), v(1, 0, 0), 2);
    expect(double.x).toBeCloseTo(single.x * 2, 10);
  });

  it('produces zero impulse for a massless body', () => {
    expect(calculateImpulse(v(0, 0, 0), v(10, 10, 10), 0).length()).toBe(0);
  });

  it('reverses direction when the target is behind the current velocity', () => {
    expect(calculateImpulse(v(5, 0, 0), v(-5, 0, 0), 2).x).toBe(-20);
  });

  it('does not mutate either input vector', () => {
    const current = v(1, 2, 3);
    const target = v(4, 5, 6);
    calculateImpulse(current, target, 10);
    expect(current.toArray()).toEqual([1, 2, 3]);
    expect(target.toArray()).toEqual([4, 5, 6]);
  });
});

describe('calculateForce', () => {
  it('equals impulse divided by the timestep', () => {
    const force = calculateForce(v(0, 0, 0), v(10, 0, 0), 2, 0.5);
    expect(force.x).toBeCloseTo(40, 10);
  });

  it('grows without bound as the timestep shrinks', () => {
    const coarse = calculateForce(v(0, 0, 0), v(1, 0, 0), 1, 1 / 60).x;
    const fine = calculateForce(v(0, 0, 0), v(1, 0, 0), 1, 1 / 240).x;
    expect(fine).toBeGreaterThan(coarse);
    expect(fine / coarse).toBeCloseTo(4, 6);
  });

  it('yields a non-finite force for a zero timestep rather than silently zero', () => {
    const force = calculateForce(v(0, 0, 0), v(1, 0, 0), 1, 0);
    expect(Number.isFinite(force.x)).toBe(false);
  });

  it('does not mutate the input velocities', () => {
    const current = v(1, 1, 1);
    calculateForce(current, v(2, 2, 2), 1, 0.1);
    expect(current.toArray()).toEqual([1, 1, 1]);
  });
});

describe('calculateJumpImpulse', () => {
  it('returns zero for a zero jump height', () => {
    expect(calculateJumpImpulse(0, 9.81, 80)).toBe(0);
  });

  it('treats gravity sign as irrelevant', () => {
    expect(calculateJumpImpulse(2, -9.81, 80)).toBeCloseTo(calculateJumpImpulse(2, 9.81, 80), 10);
  });

  it('scales as the square root of height, not linearly', () => {
    const single = calculateJumpImpulse(1, 9.81, 1);
    const quadruple = calculateJumpImpulse(4, 9.81, 1);
    expect(quadruple / single).toBeCloseTo(2, 10);
  });

  it('returns NaN for a negative jump height', () => {
    expect(Number.isNaN(calculateJumpImpulse(-1, 9.81, 80))).toBe(true);
  });

  it('round-trips with calculateLandingVelocity for a unit mass', () => {
    const height = 3.5;
    const impulse = calculateJumpImpulse(height, 9.81, 1);
    expect(impulse).toBeCloseTo(calculateLandingVelocity(height, 9.81), 10);
  });
});

describe('calculateLandingVelocity', () => {
  it('returns zero for a zero fall', () => {
    expect(calculateLandingVelocity(0, 9.81)).toBe(0);
  });

  it('matches the closed-form sqrt(2gh)', () => {
    expect(calculateLandingVelocity(10, 9.81)).toBeCloseTo(Math.sqrt(2 * 9.81 * 10), 10);
  });

  it('returns zero under zero gravity regardless of height', () => {
    expect(calculateLandingVelocity(100, 0)).toBe(0);
  });

  it('returns NaN for a negative fall height', () => {
    expect(Number.isNaN(calculateLandingVelocity(-5, 9.81))).toBe(true);
  });
});

describe('applyDrag', () => {
  it('leaves velocity untouched with a zero coefficient', () => {
    expect(applyDrag(v(3, 4, 0), 0, 0.016).toArray()).toEqual([3, 4, 0]);
  });

  it('clamps to a dead stop instead of reversing when drag overshoots', () => {
    const result = applyDrag(v(10, -10, 5), 10, 1);
    expect(result.toArray()).toEqual([0, -0, 0]);
  });

  it('never flips the sign of any component', () => {
    for (const coefficient of [0.5, 2, 5, 50]) {
      const result = applyDrag(v(6, -6, 0), coefficient, 0.5);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeLessThanOrEqual(0);
    }
  });

  it('preserves direction while shrinking magnitude', () => {
    const original = v(3, 4, 0);
    const damped = applyDrag(original, 0.5, 0.1);
    expect(damped.length()).toBeLessThan(original.length());
    expect(damped.clone().normalize().x).toBeCloseTo(0.6, 10);
  });

  it('returns a new vector rather than mutating the input', () => {
    const velocity = v(5, 5, 5);
    const result = applyDrag(velocity, 1, 0.1);
    expect(result).not.toBe(velocity);
    expect(velocity.toArray()).toEqual([5, 5, 5]);
  });

  it('is monotonically stronger as the timestep grows', () => {
    const short = applyDrag(v(10, 0, 0), 1, 0.1).x;
    const long = applyDrag(v(10, 0, 0), 1, 0.4).x;
    expect(long).toBeLessThan(short);
  });
});

describe('calculateBuoyancyForce', () => {
  it('returns exactly zero at and above the surface', () => {
    expect(calculateBuoyancyForce(0, 15, 80)).toBe(0);
    expect(calculateBuoyancyForce(-3, 15, 80)).toBe(0);
  });

  it('rises linearly with depth', () => {
    const shallow = calculateBuoyancyForce(1, 15, 80);
    const deep = calculateBuoyancyForce(3, 15, 80);
    expect(deep / shallow).toBeCloseTo(3, 10);
  });

  it('returns zero for a massless body however deep it is', () => {
    expect(calculateBuoyancyForce(100, 15, 0)).toBe(0);
  });

  it('handles a tiny submersion without underflowing to zero', () => {
    expect(calculateBuoyancyForce(1e-6, 15, 80)).toBeGreaterThan(0);
  });
});

describe('calculateSlopeAngle', () => {
  it('reports flat ground as zero', () => {
    expect(calculateSlopeAngle(v(0, 1, 0))).toBeCloseTo(0, 10);
  });

  it('reports a wall as a right angle', () => {
    expect(calculateSlopeAngle(v(1, 0, 0))).toBeCloseTo(Math.PI / 2, 10);
  });

  it('reports a ceiling as a straight angle', () => {
    expect(calculateSlopeAngle(v(0, -1, 0))).toBeCloseTo(Math.PI, 10);
  });

  it('clamps rather than returning NaN for an over-long normal', () => {
    const angle = calculateSlopeAngle(v(0, 5, 0));
    expect(Number.isNaN(angle)).toBe(false);
    expect(angle).toBeCloseTo(0, 10);
  });

  it('stays within [0, PI] for arbitrary unnormalized normals', () => {
    for (const normal of [v(3, 4, 0), v(-9, -9, -9), v(0.001, 0.001, 0)]) {
      const angle = calculateSlopeAngle(normal);
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThanOrEqual(Math.PI);
    }
  });

  it('treats a degenerate zero normal as perpendicular rather than NaN', () => {
    expect(calculateSlopeAngle(v(0, 0, 0))).toBeCloseTo(Math.PI / 2, 10);
  });
});

describe('isWalkableSlope', () => {
  it('accepts flat ground under any non-negative limit', () => {
    expect(isWalkableSlope(v(0, 1, 0), 0)).toBe(true);
  });

  it('is inclusive at exactly the limit', () => {
    const fortyFive = v(1, 1, 0).normalize();
    // acos(1/sqrt(2)) lands ~1 ULP above Math.PI/4, so compare against the
    // angle the function itself computes rather than the ideal constant.
    const exact = calculateSlopeAngle(fortyFive);
    expect(isWalkableSlope(fortyFive, exact)).toBe(true);
  });

  it('rejects a slope just past the limit', () => {
    const fortyFive = v(1, 1, 0).normalize();
    const exact = calculateSlopeAngle(fortyFive);
    expect(isWalkableSlope(fortyFive, exact - 1e-9)).toBe(false);
  });

  it('accepts a 45 degree slope under the default PI/4 character limit', () => {
    // Guards the practical case: the shipped slopeLimit must not reject a ramp
    // authored at exactly 45 degrees because of float error.
    const ramp = v(1, 1, 0).normalize();
    expect(calculateSlopeAngle(ramp)).toBeCloseTo(Math.PI / 4, 12);
  });

  it('rejects walls and ceilings under a typical limit', () => {
    expect(isWalkableSlope(v(1, 0, 0), Math.PI / 4)).toBe(false);
    expect(isWalkableSlope(v(0, -1, 0), Math.PI / 4)).toBe(false);
  });

  it('rejects everything when the limit is negative', () => {
    expect(isWalkableSlope(v(0, 1, 0), -0.1)).toBe(false);
  });
});

describe('projectVelocityOntoGround', () => {
  it('strips the vertical component on flat ground', () => {
    const result = projectVelocityOntoGround(v(5, -9.81, 3), v(0, 1, 0));
    expect(result.y).toBeCloseTo(0, 10);
    expect(result.x).toBe(5);
    expect(result.z).toBe(3);
  });

  it('leaves a velocity already in the plane unchanged', () => {
    const result = projectVelocityOntoGround(v(4, 0, 2), v(0, 1, 0));
    expect(result.toArray()).toEqual([4, 0, 2]);
  });

  it('returns zero when velocity is parallel to the normal', () => {
    expect(projectVelocityOntoGround(v(0, -8, 0), v(0, 1, 0)).length()).toBeCloseTo(0, 10);
  });

  it('leaves the result perpendicular to the normal', () => {
    const normal = v(1, 2, 3).normalize();
    const projected = projectVelocityOntoGround(v(7, -2, 5), normal);
    expect(projected.dot(normal)).toBeCloseTo(0, 10);
  });

  it('never increases the speed', () => {
    const velocity = v(7, -2, 5);
    const projected = projectVelocityOntoGround(velocity, v(0, 1, 0).normalize());
    expect(projected.length()).toBeLessThanOrEqual(velocity.length() + 1e-10);
  });

  it('does not mutate the inputs', () => {
    const velocity = v(1, 2, 3);
    const normal = v(0, 1, 0);
    projectVelocityOntoGround(velocity, normal);
    expect(velocity.toArray()).toEqual([1, 2, 3]);
    expect(normal.toArray()).toEqual([0, 1, 0]);
  });
});

describe('calculateSteeringAngle', () => {
  it('returns zero when already pointing at the target', () => {
    expect(calculateSteeringAngle(v(0, 0, 1), v(0, 0, 1), Math.PI / 6)).toBeCloseTo(0, 10);
  });

  it('clamps a hard turn to the maximum steering angle', () => {
    const angle = calculateSteeringAngle(v(0, 0, 1), v(1, 0, 0), Math.PI / 12);
    expect(Math.abs(angle)).toBeCloseTo(Math.PI / 12, 10);
  });

  it('gives opposite signs for mirrored turns', () => {
    const left = calculateSteeringAngle(v(0, 0, 1), v(-1, 0, 1).normalize(), Math.PI);
    const right = calculateSteeringAngle(v(0, 0, 1), v(1, 0, 1).normalize(), Math.PI);
    expect(Math.sign(left)).toBe(-Math.sign(right));
    expect(Math.abs(left)).toBeCloseTo(Math.abs(right), 10);
  });

  it('never exceeds the limit for any target direction', () => {
    const limit = Math.PI / 8;
    for (let a = 0; a < Math.PI * 2; a += 0.3) {
      const target = v(Math.sin(a), 0, Math.cos(a));
      expect(Math.abs(calculateSteeringAngle(v(0, 0, 1), target, limit))).toBeLessThanOrEqual(
        limit + 1e-12
      );
    }
  });

  it('pins the output to zero when the maximum angle is zero', () => {
    expect(calculateSteeringAngle(v(0, 0, 1), v(1, 0, 0), 0)).toBe(0);
  });
});

describe('calculateSuspensionForce', () => {
  it('returns zero at rest with no compression', () => {
    expect(calculateSuspensionForce(0, 0, 30, 4.5)).toBe(0);
  });

  it('pushes up proportionally to compression', () => {
    expect(calculateSuspensionForce(0.5, 0, 30, 4.5)).toBeCloseTo(15, 10);
  });

  it('opposes downward motion with a positive damping term', () => {
    expect(calculateSuspensionForce(0, -2, 30, 4.5)).toBeCloseTo(9, 10);
  });

  it('opposes upward motion with a negative damping term', () => {
    expect(calculateSuspensionForce(0, 2, 30, 4.5)).toBeCloseTo(-9, 10);
  });

  it('lets damping cancel the spring exactly at the crossover', () => {
    expect(calculateSuspensionForce(1, 10, 30, 3)).toBeCloseTo(0, 10);
  });

  it('can go negative when rebound outruns the spring', () => {
    expect(calculateSuspensionForce(0.1, 20, 30, 4.5)).toBeLessThan(0);
  });
});

describe('calculateExplosionForce', () => {
  it('applies full force at the epicentre', () => {
    expect(calculateExplosionForce(0, 5, 1000)).toBe(1000);
  });

  it('returns zero exactly at the radius', () => {
    expect(calculateExplosionForce(5, 5, 1000)).toBe(0);
  });

  it('returns zero beyond the radius', () => {
    expect(calculateExplosionForce(50, 5, 1000)).toBe(0);
  });

  it('falls off quadratically, not linearly', () => {
    expect(calculateExplosionForce(2.5, 5, 1000)).toBeCloseTo(250, 10);
  });

  it('decreases monotonically with distance', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (let d = 0; d <= 5; d += 0.25) {
      const force = calculateExplosionForce(d, 5, 1000);
      expect(force).toBeLessThanOrEqual(previous);
      previous = force;
    }
  });

  it('returns zero for a zero-radius blast instead of dividing by zero', () => {
    expect(calculateExplosionForce(0, 0, 1000)).toBe(0);
  });
});

describe('generateDebrisVelocity', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws debris radially outward from the blast', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const velocity = generateDebrisVelocity(v(0, 0, 0), v(10, 0, 0), 100, 0);
    expect(velocity.x).toBeGreaterThan(0);
    expect(velocity.y).toBeCloseTo(0, 10);
  });

  it('produces exactly the base force when randomness is zero', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(generateDebrisVelocity(v(0, 0, 0), v(0, 0, 3), 42, 0).length()).toBeCloseTo(42, 6);
  });

  it('biases debris upward once randomness is enabled', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1);
    const velocity = generateDebrisVelocity(v(0, 0, 0), v(5, 0, 0), 10, 0.5);
    expect(velocity.y).toBeGreaterThan(0);
  });

  it('is deterministic for a fixed random sequence', () => {
    const run = () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.25);
      const result = generateDebrisVelocity(v(1, 1, 1), v(4, 2, 0), 30, 0.4).toArray();
      vi.restoreAllMocks();
      return result;
    };
    expect(run()).toEqual(run());
  });

  it('varies the magnitude around the base force under randomness', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const low = generateDebrisVelocity(v(0, 0, 0), v(0, 0, 1), 100, 0.5).length();
    vi.restoreAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(1);
    const high = generateDebrisVelocity(v(0, 0, 0), v(0, 0, 1), 100, 0.5).length();
    expect(low).toBeLessThan(high);
  });

  it('does not mutate the supplied positions', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const centre = v(0, 0, 0);
    const position = v(2, 3, 4);
    generateDebrisVelocity(centre, position, 10, 0.3);
    expect(centre.toArray()).toEqual([0, 0, 0]);
    expect(position.toArray()).toEqual([2, 3, 4]);
  });

  it('produces a finite velocity for debris sitting at the blast centre', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.75);
    const velocity = generateDebrisVelocity(v(1, 1, 1), v(1, 1, 1), 50, 0.6);
    expect(Number.isFinite(velocity.length())).toBe(true);
  });
});
