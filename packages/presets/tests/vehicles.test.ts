import { describe, expect, it } from 'vitest';
import { createVehicle, VEHICLE_DEFAULTS, VEHICLE_FORMS, type VehicleForm } from '../src/vehicles';

describe('createVehicle', () => {
  describe('defaults', () => {
    it('returns all required fields', () => {
      const result = createVehicle('cart');

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('length');
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('propulsion');
      expect(result).toHaveProperty('passengerCapacity');
      expect(result).toHaveProperty('cargoCapacity');
      expect(result).toHaveProperty('material');
      expect(result).toHaveProperty('condition');
    });

    it('uses VEHICLE_DEFAULTS as base', () => {
      const result = createVehicle('cart', {});
      // cart form might override some defaults, but not all
      expect(result.material).toBe(VEHICLE_DEFAULTS.material);
    });
  });

  describe('forms', () => {
    const formNames = Object.keys(VEHICLE_FORMS) as VehicleForm[];

    it.each(formNames)('form "%s" produces valid output', (form) => {
      const result = createVehicle(form);

      expect(typeof result.size).toBe('number');
      expect(typeof result.length).toBe('number');
      expect(typeof result.width).toBe('number');
      expect(result.size).toBeGreaterThan(0);
    });

    it('canoe form has characteristic traits', () => {
      const canoe = createVehicle('canoe');
      expect(canoe.type).toBe('boat');
      expect(canoe.propulsion).toBe('paddle');
      expect(canoe.length).toBeGreaterThan(canoe.width);
      expect(canoe.hasOars).toBe(true);
    });

    it('wagon form has characteristic traits', () => {
      const wagon = createVehicle('wagon');
      expect(wagon.type).toBe('wagon');
      expect(wagon.wheelCount).toBe(4);
      expect(wagon.hasCanopy).toBe(true);
      expect(wagon.cargoCapacity).toBeGreaterThan(2);
    });

    it('sled form has characteristic traits', () => {
      const sled = createVehicle('sled');
      expect(sled.type).toBe('sled');
      expect(sled.propulsion).toBe('runner');
      expect(sled.hasRunners).toBe(true);
    });
  });

  describe('customization', () => {
    it('allows property overrides', () => {
      const result = createVehicle('sailboat', {
        sailCount: 3,
        material: 'metal',
        size: 2.5,
      });

      expect(result.sailCount).toBe(3);
      expect(result.material).toBe('metal');
      expect(result.size).toBe(2.5);
    });

    it('adjusts wear based on condition', () => {
      const dilapidated = createVehicle('cart', { condition: 'dilapidated' });
      const ruined = createVehicle('cart', { condition: 'ruined' });

      expect(dilapidated.wear).toBeGreaterThanOrEqual(0.6);
      expect(ruined.wear).toBeGreaterThanOrEqual(0.9);
    });
  });
});
