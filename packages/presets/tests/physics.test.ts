import { describe, expect, it } from 'vitest';
import {
  BOAT_BUOYANCY_PRESET,
  BOUNCY_MATERIAL_PRESET,
  buoyancyPresets,
  CAR_VEHICLE_PRESET,
  characterPresets,
  CONCRETE_MATERIAL_PRESET,
  destructiblePresets,
  FPS_CHARACTER_PRESET,
  getBuoyancyPreset,
  getCharacterPreset,
  getDestructiblePreset,
  getMaterialPreset,
  getVehiclePreset,
  GLASS_PRESET,
  HEAVY_BUOYANCY_PRESET,
  ICE_MATERIAL_PRESET,
  LIGHT_BUOYANCY_PRESET,
  materialPresets,
  MEDIUM_BUOYANCY_PRESET,
  METAL_MATERIAL_PRESET,
  MOTORCYCLE_VEHICLE_PRESET,
  MUD_MATERIAL_PRESET,
  PLATFORMER_CHARACTER_PRESET,
  RUBBER_MATERIAL_PRESET,
  SPORTS_CAR_PRESET,
  STONE_PRESET,
  TANK_CHARACTER_PRESET,
  THIRD_PERSON_CHARACTER_PRESET,
  TRUCK_VEHICLE_PRESET,
  vehiclePresets,
  WOOD_MATERIAL_PRESET,
  WOODEN_CRATE_PRESET,
} from '../src/physics';

describe('physics presets', () => {
  describe('character presets', () => {
    it('contains all 4 presets', () => {
      expect(Object.keys(characterPresets)).toHaveLength(4);
    });

    it('maps correctly', () => {
      expect(characterPresets.fps).toBe(FPS_CHARACTER_PRESET);
      expect(characterPresets.thirdPerson).toBe(THIRD_PERSON_CHARACTER_PRESET);
      expect(characterPresets.platformer).toBe(PLATFORMER_CHARACTER_PRESET);
      expect(characterPresets.tank).toBe(TANK_CHARACTER_PRESET);
    });

    const names = Object.keys(characterPresets);

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = characterPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('description');
      expect(preset).toHaveProperty('config');
      expect(preset.config).toHaveProperty('mass');
      expect(preset.config).toHaveProperty('maxSpeed');
      expect(preset.config).toHaveProperty('jumpForce');
      expect(preset.config).toHaveProperty('capsuleRadius');
      expect(preset.config).toHaveProperty('capsuleHeight');
    });

    it.each(names)('preset "%s" has positive physics values', (name) => {
      const config = characterPresets[name].config;
      expect(config.mass).toBeGreaterThan(0);
      expect(config.maxSpeed).toBeGreaterThan(0);
      expect(config.jumpForce).toBeGreaterThan(0);
      expect(config.capsuleRadius).toBeGreaterThan(0);
      expect(config.capsuleHeight).toBeGreaterThan(0);
    });

    it('platformer has double jump', () => {
      expect(PLATFORMER_CHARACTER_PRESET.config.maxJumps).toBe(2);
    });

    it('tank is heaviest', () => {
      const masses = Object.values(characterPresets).map((p) => p.config.mass);
      expect(TANK_CHARACTER_PRESET.config.mass).toBe(Math.max(...masses));
    });
  });

  describe('vehicle presets', () => {
    it('contains all 4 presets', () => {
      expect(Object.keys(vehiclePresets)).toHaveLength(4);
    });

    it('maps correctly', () => {
      expect(vehiclePresets.car).toBe(CAR_VEHICLE_PRESET);
      expect(vehiclePresets.truck).toBe(TRUCK_VEHICLE_PRESET);
      expect(vehiclePresets.motorcycle).toBe(MOTORCYCLE_VEHICLE_PRESET);
      expect(vehiclePresets.sportsCar).toBe(SPORTS_CAR_PRESET);
    });

    const names = Object.keys(vehiclePresets);

    it.each(names)('preset "%s" has required config fields', (name) => {
      const config = vehiclePresets[name].config;
      expect(config).toHaveProperty('chassisMass');
      expect(config).toHaveProperty('chassisSize');
      expect(config).toHaveProperty('wheelRadius');
      expect(config).toHaveProperty('wheelPositions');
      expect(config).toHaveProperty('motorForce');
      expect(config).toHaveProperty('brakeForce');
    });

    it('motorcycle has only 2 wheels', () => {
      expect(MOTORCYCLE_VEHICLE_PRESET.config.wheelPositions).toHaveLength(2);
    });

    it('car, truck, and sportsCar have 4 wheels', () => {
      expect(CAR_VEHICLE_PRESET.config.wheelPositions).toHaveLength(4);
      expect(TRUCK_VEHICLE_PRESET.config.wheelPositions).toHaveLength(4);
      expect(SPORTS_CAR_PRESET.config.wheelPositions).toHaveLength(4);
    });

    it('truck is heaviest', () => {
      const masses = Object.values(vehiclePresets).map((p) => p.config.chassisMass);
      expect(TRUCK_VEHICLE_PRESET.config.chassisMass).toBe(Math.max(...masses));
    });
  });

  describe('material presets', () => {
    it('contains all 7 presets', () => {
      expect(Object.keys(materialPresets)).toHaveLength(7);
    });

    it('maps correctly', () => {
      expect(materialPresets.ice).toBe(ICE_MATERIAL_PRESET);
      expect(materialPresets.rubber).toBe(RUBBER_MATERIAL_PRESET);
      expect(materialPresets.metal).toBe(METAL_MATERIAL_PRESET);
      expect(materialPresets.wood).toBe(WOOD_MATERIAL_PRESET);
      expect(materialPresets.concrete).toBe(CONCRETE_MATERIAL_PRESET);
      expect(materialPresets.bouncy).toBe(BOUNCY_MATERIAL_PRESET);
      expect(materialPresets.mud).toBe(MUD_MATERIAL_PRESET);
    });

    const names = Object.keys(materialPresets);

    it.each(names)('preset "%s" has required material fields', (name) => {
      const material = materialPresets[name].material;
      expect(material).toHaveProperty('friction');
      expect(material).toHaveProperty('restitution');
      expect(material).toHaveProperty('density');
    });

    it('ice has lowest friction', () => {
      const frictions = Object.values(materialPresets).map((p) => p.material.friction);
      expect(ICE_MATERIAL_PRESET.material.friction).toBe(Math.min(...frictions));
    });

    it('bouncy has highest restitution', () => {
      const restitutions = Object.values(materialPresets).map((p) => p.material.restitution);
      expect(BOUNCY_MATERIAL_PRESET.material.restitution).toBe(Math.max(...restitutions));
    });
  });

  describe('destructible presets', () => {
    it('contains all 3 presets', () => {
      expect(Object.keys(destructiblePresets)).toHaveLength(3);
    });

    const names = Object.keys(destructiblePresets);

    it.each(names)('preset "%s" has required config fields', (name) => {
      const config = destructiblePresets[name].config;
      expect(config).toHaveProperty('health');
      expect(config).toHaveProperty('breakForce');
      expect(config).toHaveProperty('shardCount');
    });

    it('glass is most fragile', () => {
      expect(GLASS_PRESET.config.health).toBeLessThan(WOODEN_CRATE_PRESET.config.health);
      expect(GLASS_PRESET.config.health).toBeLessThan(STONE_PRESET.config.health);
    });

    it('stone is most durable', () => {
      const healths = Object.values(destructiblePresets).map((p) => p.config.health);
      expect(STONE_PRESET.config.health).toBe(Math.max(...healths));
    });
  });

  describe('buoyancy presets', () => {
    it('contains all 4 presets', () => {
      expect(Object.keys(buoyancyPresets)).toHaveLength(4);
    });

    it('maps correctly', () => {
      expect(buoyancyPresets.light).toBe(LIGHT_BUOYANCY_PRESET);
      expect(buoyancyPresets.medium).toBe(MEDIUM_BUOYANCY_PRESET);
      expect(buoyancyPresets.heavy).toBe(HEAVY_BUOYANCY_PRESET);
      expect(buoyancyPresets.boat).toBe(BOAT_BUOYANCY_PRESET);
    });

    it('light has highest buoyancy force', () => {
      expect(LIGHT_BUOYANCY_PRESET.config.buoyancyForce).toBeGreaterThan(
        MEDIUM_BUOYANCY_PRESET.config.buoyancyForce
      );
      expect(LIGHT_BUOYANCY_PRESET.config.buoyancyForce).toBeGreaterThan(
        HEAVY_BUOYANCY_PRESET.config.buoyancyForce
      );
    });
  });

  describe('getter functions', () => {
    it('getCharacterPreset returns correct preset', () => {
      expect(getCharacterPreset('fps')).toBe(FPS_CHARACTER_PRESET);
    });

    it('getVehiclePreset returns correct preset', () => {
      expect(getVehiclePreset('car')).toBe(CAR_VEHICLE_PRESET);
    });

    it('getMaterialPreset returns correct preset', () => {
      expect(getMaterialPreset('ice')).toBe(ICE_MATERIAL_PRESET);
    });

    it('getDestructiblePreset returns correct preset', () => {
      expect(getDestructiblePreset('glass')).toBe(GLASS_PRESET);
    });

    it('getBuoyancyPreset returns correct preset', () => {
      expect(getBuoyancyPreset('boat')).toBe(BOAT_BUOYANCY_PRESET);
    });
  });
});
