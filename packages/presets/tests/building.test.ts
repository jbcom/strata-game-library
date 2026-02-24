import { describe, expect, it } from 'vitest';
import {
  BUILDING_DEFAULTS,
  BUILDING_FORMS,
  type BuildingForm,
  createBuilding,
} from '../src/structures/building';

describe('createBuilding', () => {
  describe('defaults', () => {
    it('returns all required fields', () => {
      const result = createBuilding('hut');

      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('depth');
      expect(result).toHaveProperty('floors');
      expect(result).toHaveProperty('roofType');
      expect(result).toHaveProperty('wallMaterial');
      expect(result).toHaveProperty('doorCount');
    });
  });

  describe('forms', () => {
    const formNames = Object.keys(BUILDING_FORMS) as BuildingForm[];

    it.each(formNames)('form "%s" produces valid output', (form) => {
      const result = createBuilding(form);

      expect(typeof result.width).toBe('number');
      expect(typeof result.depth).toBe('number');
      expect(typeof result.floors).toBe('number');
      expect(result.width).toBeGreaterThan(0);
      expect(result.depth).toBeGreaterThan(0);
      expect(result.floors).toBeGreaterThanOrEqual(1);
    });

    it('hut has characteristic traits', () => {
      const hut = createBuilding('hut');

      expect(hut.foundationType).toBe('stilts');
      expect(hut.roofType).toBe('conical');
      expect(hut.roofMaterial).toBe('thatch');
    });

    it('temple has characteristic traits', () => {
      const temple = createBuilding('temple');

      expect(temple.columnCount).toBeGreaterThan(0);
      expect(temple.foundationType).toBe('raised');
      expect(temple.doorStyle).toBe('arched');
    });

    it('tower has multiple floors', () => {
      const tower = createBuilding('tower');

      expect(tower.floors).toBeGreaterThanOrEqual(3);
      expect(tower.baseShape).toBe('round');
    });

    it('barn has large doors', () => {
      const barn = createBuilding('barn');

      expect(barn.doorWidth).toBeGreaterThan(2);
      expect(barn.doorHeight).toBeGreaterThan(3);
      expect(barn.doorStyle).toBe('double');
    });

    it('bunker has reinforced walls', () => {
      const bunker = createBuilding('bunker');

      expect(bunker.wallThickness).toBeGreaterThan(0.3);
      expect(bunker.roofType).toBe('flat');
      expect(bunker.windowsPerWall).toBe(0);
    });
  });

  describe('customization', () => {
    it('allows floor count override', () => {
      const result = createBuilding('cabin', { floors: 3 });
      expect(result.floors).toBe(3);
    });

    it('allows adding features', () => {
      const result = createBuilding('shack', {
        hasChimney: true,
        hasPorch: true,
        hasBalcony: true,
      });

      expect(result.hasChimney).toBe(true);
      expect(result.hasPorch).toBe(true);
      expect(result.hasBalcony).toBe(true);
    });

    it('allows material override', () => {
      const result = createBuilding('cabin', {
        wallMaterial: 'stone',
        roofMaterial: 'slate',
      });

      expect(result.wallMaterial).toBe('stone');
      expect(result.roofMaterial).toBe('slate');
    });

    it('allows condition override', () => {
      const result = createBuilding('cottage', {
        wear: 0.8,
        overgrown: 0.5,
        damage: 0.3,
      });

      expect(result.wear).toBe(0.8);
      expect(result.overgrown).toBe(0.5);
      expect(result.damage).toBe(0.3);
    });
  });

  describe('roof types', () => {
    it('peaked roof has height', () => {
      const result = createBuilding('cabin');
      expect(result.roofType).toBe('gabled');
      expect(result.roofHeight).toBeGreaterThan(0);
    });

    it('flat roof is minimal', () => {
      const result = createBuilding('bunker');
      expect(result.roofType).toBe('flat');
      expect(result.roofHeight).toBeLessThan(0.5);
    });

    it('dome roof for lighthouse', () => {
      const result = createBuilding('lighthouse');
      expect(result.roofType).toBe('dome');
    });
  });
});
