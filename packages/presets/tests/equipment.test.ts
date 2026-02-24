import { describe, expect, it } from 'vitest';
import {
  createEquipment,
  EQUIPMENT_FORMS,
  type EquipmentForm,
  generateEquipmentPrompt,
  suggestEquipmentStats,
} from '../src/equipment';

describe('createEquipment', () => {
  describe('defaults', () => {
    it('returns all required fields', () => {
      const result = createEquipment('pistol-standard');

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('receiver');
      expect(result).toHaveProperty('barrel');
      expect(result).toHaveProperty('wear');
      expect(result).toHaveProperty('weight');
    });
  });

  describe('forms', () => {
    const formNames = Object.keys(EQUIPMENT_FORMS) as EquipmentForm[];

    it.each(formNames)('form "%s" produces valid output', (form) => {
      const result = createEquipment(form);

      expect(typeof result.size).toBe('number');
      expect(typeof result.weight).toBe('number');
      expect(result.size).toBeGreaterThan(0);
    });

    it('pistol-standard has correct components', () => {
      const pistol = createEquipment('pistol-standard');

      expect(pistol.type).toBe('weapon');
      expect(pistol.receiver).toBe('pistol');
      expect(pistol.barrel).toBe('short');
      expect(pistol.grip).toBe('pistol');
    });

    it('rifle-assault has correct components', () => {
      const rifle = createEquipment('rifle-assault');

      expect(rifle.type).toBe('weapon');
      expect(rifle.receiver).toBe('rifle');
      expect(rifle.barrel).toBe('long');
      expect(rifle.stock).toBe('tactical');
      expect(rifle.magazine).toBe('box');
    });

    it('shotgun-pump has correct components', () => {
      const shotgun = createEquipment('shotgun-pump');

      expect(shotgun.type).toBe('weapon');
      expect(shotgun.receiver).toBe('shotgun');
      expect(shotgun.barrel).toBe('double');
      expect(shotgun.stock).toBe('wood');
    });

    it('vest-tactical has correct properties', () => {
      const vest = createEquipment('vest-tactical');

      expect(vest.type).toBe('armor');
      expect(vest.style).toBe('tactical');
      expect(vest.protection).toBeGreaterThan(0.5);
      expect(vest.materialType).toBe('fabric');
    });

    it('backpack-radio has correct properties', () => {
      const backpack = createEquipment('backpack-radio');

      expect(backpack.type).toBe('backpack');
      expect(backpack.style).toBe('radio');
      expect(backpack.weight).toBeGreaterThan(5);
    });
  });

  describe('customization', () => {
    it('allows size override', () => {
      const result = createEquipment('helmet-standard', { size: 1.5 });
      expect(result.size).toBe(1.5);
    });

    it('allows condition customization', () => {
      const result = createEquipment('rifle-assault', { wear: 0.5, dirt: 0.8 });
      expect(result.wear).toBe(0.5);
      expect(result.dirt).toBe(0.8);
    });

    it('allows component customization', () => {
      const result = createEquipment('rifle-assault', { magazine: 'drum' as any, barrel: 'short' });
      expect(result.magazine).toBe('drum');
      expect(result.barrel).toBe('short');
    });
  });

  describe('generateEquipmentPrompt', () => {
    it('generates prompt for weapon', () => {
      const params = createEquipment('rifle-assault');
      const prompt = generateEquipmentPrompt(params, 'AK-47');

      expect(prompt).toContain('AK-47');
      expect(prompt).toContain('rifle receiver');
      expect(prompt).toContain('long barrel');
      expect(prompt).toContain('metal material');
    });

    it('generates prompt for worn gear', () => {
      const params = createEquipment('vest-tactical', { wear: 0.6, dirt: 0.7 });
      const prompt = generateEquipmentPrompt(params);

      expect(prompt).toContain('armor');
      expect(prompt).toContain('worn and damaged');
      expect(prompt).toContain('filthy');
    });
  });

  describe('suggestEquipmentStats', () => {
    it('suggests stats for armor', () => {
      const params = createEquipment('vest-tactical');
      const stats = suggestEquipmentStats(params);

      expect(stats.weight).toBe(5);
      expect(stats.protection).toBe(0.8);
      expect(stats.durability).toBe(1);
    });

    it('suggests stats for backpack', () => {
      const params = createEquipment('backpack-medic');
      const stats = suggestEquipmentStats(params);

      expect(stats.capacity).toBe(0.8);
      expect(stats.weight).toBe(4);
    });
  });
});
