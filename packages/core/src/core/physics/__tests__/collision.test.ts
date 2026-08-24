/**
 * Collision layer bitmask tests.
 *
 * Covers the invariants that make the bitmask system usable: layers must be
 * disjoint single bits, `All` must cover every layer, and each preset filter must
 * express the interaction matrix the docs promise — including the asymmetries
 * (debris ignores characters, triggers ignore debris) that are easy to regress.
 *
 * @module core/physics/collision.test
 */

import { describe, expect, it } from 'vitest';
import { type CollisionFilter, CollisionLayer, collisionFilters } from '../collision';

const NAMED_LAYERS = [
  CollisionLayer.Default,
  CollisionLayer.Static,
  CollisionLayer.Dynamic,
  CollisionLayer.Character,
  CollisionLayer.Vehicle,
  CollisionLayer.Projectile,
  CollisionLayer.Trigger,
  CollisionLayer.Debris,
  CollisionLayer.Water,
] as const;

/** Mirrors how a physics backend decides whether two bodies interact. */
function interacts(a: CollisionFilter, b: CollisionFilter): boolean {
  return (a.filter & b.memberships) !== 0 && (b.filter & a.memberships) !== 0;
}

describe('CollisionLayer bit allocation', () => {
  it('assigns every named layer exactly one bit', () => {
    for (const layer of NAMED_LAYERS) {
      expect(layer).toBeGreaterThan(0);
      expect(layer & (layer - 1)).toBe(0);
    }
  });

  it('assigns a distinct bit to every named layer', () => {
    expect(new Set(NAMED_LAYERS).size).toBe(NAMED_LAYERS.length);
  });

  it('allocates layers contiguously from bit 0 with no gaps', () => {
    const union = NAMED_LAYERS.reduce((acc, layer) => acc | layer, 0);
    expect(union).toBe((1 << NAMED_LAYERS.length) - 1);
  });

  it('makes All a superset of every named layer', () => {
    for (const layer of NAMED_LAYERS) {
      expect(CollisionLayer.All & layer).toBe(layer);
    }
  });

  it('leaves room above the named layers for user-defined ones', () => {
    const union = NAMED_LAYERS.reduce((acc, layer) => acc | layer, 0);
    expect(CollisionLayer.All & ~union).toBeGreaterThan(0);
  });
});

describe('collisionFilters preset shape', () => {
  it('gives every preset a single-bit membership matching its own layer', () => {
    const expected: Record<string, CollisionLayer> = {
      default: CollisionLayer.Default,
      static: CollisionLayer.Static,
      character: CollisionLayer.Character,
      vehicle: CollisionLayer.Vehicle,
      projectile: CollisionLayer.Projectile,
      debris: CollisionLayer.Debris,
      trigger: CollisionLayer.Trigger,
      water: CollisionLayer.Water,
    };
    expect(Object.keys(collisionFilters).sort()).toEqual(Object.keys(expected).sort());
    for (const [name, layer] of Object.entries(expected)) {
      expect(collisionFilters[name].memberships).toBe(layer);
    }
  });

  it('never leaves a preset with an empty filter mask', () => {
    for (const preset of Object.values(collisionFilters)) {
      expect(preset.filter).toBeGreaterThan(0);
    }
  });
});

describe('collisionFilters interaction matrix', () => {
  it('lets a character stand on static geometry', () => {
    expect(interacts(collisionFilters.character, collisionFilters.static)).toBe(true);
  });

  it('lets a character float in water', () => {
    expect(interacts(collisionFilters.character, collisionFilters.water)).toBe(true);
  });

  it('lets a projectile hit a character', () => {
    expect(interacts(collisionFilters.projectile, collisionFilters.character)).toBe(true);
  });

  it('does not let projectiles collide with each other', () => {
    expect(interacts(collisionFilters.projectile, collisionFilters.projectile)).toBe(false);
  });

  it('does not let a projectile be stopped by debris', () => {
    expect(interacts(collisionFilters.projectile, collisionFilters.debris)).toBe(false);
  });

  it('does not let debris shove the player around', () => {
    expect(interacts(collisionFilters.debris, collisionFilters.character)).toBe(false);
  });

  it('does not let debris pile up inside a trigger volume', () => {
    expect(interacts(collisionFilters.debris, collisionFilters.trigger)).toBe(false);
  });

  it('lets a character and a vehicle enter a trigger volume', () => {
    expect(interacts(collisionFilters.trigger, collisionFilters.character)).toBe(true);
    expect(interacts(collisionFilters.trigger, collisionFilters.vehicle)).toBe(true);
  });

  it('does not let a trigger volume block a projectile', () => {
    expect(interacts(collisionFilters.trigger, collisionFilters.projectile)).toBe(false);
  });

  it('keeps debris resting on static and dynamic bodies only', () => {
    expect(interacts(collisionFilters.debris, collisionFilters.static)).toBe(true);
    expect(interacts(collisionFilters.debris, collisionFilters.water)).toBe(false);
  });

  it('treats interaction as symmetric for every preset pair', () => {
    const names = Object.keys(collisionFilters);
    for (const a of names) {
      for (const b of names) {
        expect(interacts(collisionFilters[a], collisionFilters[b])).toBe(
          interacts(collisionFilters[b], collisionFilters[a])
        );
      }
    }
  });

  it('lets the default preset be blocked by static geometry', () => {
    expect(interacts(collisionFilters.default, collisionFilters.static)).toBe(true);
  });
});
