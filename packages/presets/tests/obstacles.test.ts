import { describe, expect, it } from 'vitest';
import {
  createObstacle,
  HAZARD_MODIFIERS,
  type HazardLevel,
  OBSTACLE_DEFAULTS,
  OBSTACLE_FORMS,
  type ObstacleForm,
} from '../src/obstacles';

describe('createObstacle', () => {
  describe('defaults', () => {
    it('returns all required fields', () => {
      const result = createObstacle('rock');

      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
      expect(result).toHaveProperty('depth');
      expect(result).toHaveProperty('solid');
      expect(result).toHaveProperty('damaging');
      expect(result).toHaveProperty('material');
    });
  });

  describe('forms', () => {
    const formNames = Object.keys(OBSTACLE_FORMS) as ObstacleForm[];

    it.each(formNames)('form "%s" produces valid output', (form) => {
      const result = createObstacle(form);

      expect(typeof result.width).toBe('number');
      expect(typeof result.height).toBe('number');
      expect(result.width).not.toBe(0);
    });

    it('rock is solid irregular shape', () => {
      const rock = createObstacle('rock');

      expect(rock.solid).toBe(true);
      expect(rock.shape).toBe('irregular');
      expect(rock.material).toBe('stone');
    });

    it('spike deals damage', () => {
      const spike = createObstacle('spike');

      expect(spike.damaging).toBe(true);
      expect(spike.damageAmount).toBeGreaterThan(0);
      expect(spike.shape).toBe('cone');
    });

    it('pit is hazardous hole', () => {
      const pit = createObstacle('pit');

      expect(pit.solid).toBe(false);
      expect(pit.damaging).toBe(true);
      expect(pit.height).toBeLessThan(0); // Negative = hole
    });

    it('crate is destructible', () => {
      const crate = createObstacle('crate');

      expect(crate.destructible).toBe(true);
      expect(crate.health).toBeGreaterThan(0);
      expect(crate.material).toBe('wood');
    });

    it('water pool slows movement', () => {
      const water = createObstacle('water_pool');

      expect(water.slowing).toBe(true);
      expect(water.slowFactor).toBeLessThan(1);
      expect(water.particles).toBe('bubbles');
    });

    it('fire pit has particles and glow', () => {
      const fire = createObstacle('fire_pit');

      expect(fire.damaging).toBe(true);
      expect(fire.particles).toBe('fire');
      expect(fire.glow).toBeGreaterThan(0);
    });

    it('ice patch is slippery', () => {
      const ice = createObstacle('ice_patch');

      expect(ice.bouncy).toBe(true);
      expect(ice.roughness).toBeLessThan(0.1);
    });

    it('whirlpool rotates', () => {
      const whirlpool = createObstacle('whirlpool');

      expect(whirlpool.rotating).toBe(true);
      expect(whirlpool.rotationSpeed).toBeGreaterThan(0);
    });

    it('energy field has effects', () => {
      const energy = createObstacle('energy_field');

      expect(energy.glow).toBe(1);
      expect(energy.particles).toBe('energy');
      expect(energy.damaging).toBe(true);
    });
  });

  describe('hazard levels', () => {
    const hazards: HazardLevel[] = ['harmless', 'minor', 'moderate', 'severe', 'deadly'];

    it('harmless deals no damage', () => {
      const result = createObstacle('rock', 'harmless');

      expect(result.damaging).toBe(false);
      expect(result.damageAmount).toBe(0);
    });

    it('deadly deals high damage', () => {
      const result = createObstacle('spike', 'deadly');

      expect(result.damaging).toBe(true);
      expect(result.damageAmount).toBe(100);
    });

    it('hazard level progression', () => {
      const minor = createObstacle('spike', 'minor');
      const moderate = createObstacle('spike', 'moderate');
      const severe = createObstacle('spike', 'severe');
      const deadly = createObstacle('spike', 'deadly');

      expect(moderate.damageAmount).toBeGreaterThan(minor.damageAmount);
      expect(severe.damageAmount).toBeGreaterThan(moderate.damageAmount);
      expect(deadly.damageAmount).toBeGreaterThan(severe.damageAmount);
    });
  });

  describe('customization', () => {
    it('allows dimension override', () => {
      const result = createObstacle('rock', undefined, {
        width: 5,
        height: 3,
        depth: 4,
      });

      expect(result.width).toBe(5);
      expect(result.height).toBe(3);
      expect(result.depth).toBe(4);
    });

    it('allows making obstacles moving', () => {
      const result = createObstacle('spike', 'severe', {
        moving: true,
        movementPattern: 'vertical',
        movementSpeed: 2,
      });

      expect(result.moving).toBe(true);
      expect(result.movementPattern).toBe('vertical');
      expect(result.movementSpeed).toBe(2);
    });

    it('allows making obstacles destructible', () => {
      const result = createObstacle('rock', undefined, {
        destructible: true,
        health: 50,
      });

      expect(result.destructible).toBe(true);
      expect(result.health).toBe(50);
    });

    it('customization overrides hazard level', () => {
      const result = createObstacle('spike', 'deadly', { damageAmount: 5 });
      expect(result.damageAmount).toBe(5);
    });
  });

  describe('movement patterns', () => {
    it('supports horizontal movement', () => {
      const result = createObstacle('boulder', undefined, {
        moving: true,
        movementPattern: 'horizontal',
        movementDistance: 5,
      });

      expect(result.movementPattern).toBe('horizontal');
      expect(result.movementDistance).toBe(5);
    });

    it('supports circular movement', () => {
      const result = createObstacle('crystal', undefined, {
        moving: true,
        movementPattern: 'circular',
      });

      expect(result.movementPattern).toBe('circular');
    });

    it('supports rotation', () => {
      const result = createObstacle('barrel', undefined, {
        rotating: true,
        rotationSpeed: 3,
        rotationAxis: 'y',
      });

      expect(result.rotating).toBe(true);
      expect(result.rotationSpeed).toBe(3);
      expect(result.rotationAxis).toBe('y');
    });
  });
});
