import { describe, expect, it } from 'vitest';
import {
  ALL_BUTTON_PRESETS,
  ALL_INPUT_PRESETS,
  ALL_JOYSTICK_PRESETS,
  ALL_PLATE_PRESETS,
  ALL_SWITCH_PRESETS,
  ALL_TRIGGER_PRESETS,
  ARCADE_BUTTON_PRESET,
  ARCADE_STICK_PRESET,
  CIRCUIT_BREAKER_PRESET,
  DOOR_SWITCH_PRESET,
  ELEVATOR_BUTTON_PRESET,
  EMERGENCY_STOP_PRESET,
  FLIGHT_STICK_PRESET,
  FLOOR_BUTTON_PRESET,
  getPresetByName,
  getPresetsByType,
  GUN_TRIGGER_PRESET,
  PICKUP_SPHERE_PRESET,
  POWER_SWITCH_PRESET,
  RAILWAY_SWITCH_PRESET,
  TRAP_TRIGGER_PRESET,
  VEHICLE_THROTTLE_PRESET,
  WASD_JOYSTICK_PRESET,
  WEIGHT_PLATE_PRESET,
} from '../src/input';

describe('Joystick Presets', () => {
  it('has expected presets', () => {
    expect(ALL_JOYSTICK_PRESETS).toHaveLength(3);
    expect(ALL_JOYSTICK_PRESETS).toContain(WASD_JOYSTICK_PRESET);
    expect(ALL_JOYSTICK_PRESETS).toContain(FLIGHT_STICK_PRESET);
    expect(ALL_JOYSTICK_PRESETS).toContain(ARCADE_STICK_PRESET);
  });

  it.each([
    ['WASD', WASD_JOYSTICK_PRESET],
    ['Flight', FLIGHT_STICK_PRESET],
    ['Arcade', ARCADE_STICK_PRESET],
  ] as const)('%s joystick has required properties', (_label, preset) => {
    expect(preset.type).toBe('joystick');
    expect(typeof preset.name).toBe('string');
    expect(typeof preset.description).toBe('string');
    expect(preset.props).toHaveProperty('baseColor');
    expect(preset.props).toHaveProperty('knobColor');
    expect(preset.props).toHaveProperty('size');
    expect(preset.props).toHaveProperty('deadzone');
    expect(preset.props).toHaveProperty('returnSpeed');
    expect(preset.props).toHaveProperty('maxTilt');
  });

  it('WASD has moderate settings', () => {
    expect(WASD_JOYSTICK_PRESET.props.deadzone).toBe(0.15);
    expect(WASD_JOYSTICK_PRESET.props.returnSpeed).toBe(10);
  });

  it('Arcade has snappy settings', () => {
    expect(ARCADE_STICK_PRESET.props.returnSpeed).toBeGreaterThan(
      WASD_JOYSTICK_PRESET.props.returnSpeed!
    );
    expect(ARCADE_STICK_PRESET.props.deadzone).toBeLessThan(
      WASD_JOYSTICK_PRESET.props.deadzone!
    );
  });

  it('Flight has larger dead zone', () => {
    expect(FLIGHT_STICK_PRESET.props.deadzone).toBeGreaterThan(
      WASD_JOYSTICK_PRESET.props.deadzone!
    );
  });
});

describe('Switch Presets', () => {
  it('has expected presets', () => {
    expect(ALL_SWITCH_PRESETS).toHaveLength(3);
    expect(ALL_SWITCH_PRESETS).toContain(DOOR_SWITCH_PRESET);
    expect(ALL_SWITCH_PRESETS).toContain(RAILWAY_SWITCH_PRESET);
    expect(ALL_SWITCH_PRESETS).toContain(CIRCUIT_BREAKER_PRESET);
  });

  it.each([
    ['Door', DOOR_SWITCH_PRESET],
    ['Railway', RAILWAY_SWITCH_PRESET],
    ['Circuit', CIRCUIT_BREAKER_PRESET],
  ] as const)('%s switch has required properties', (_label, preset) => {
    expect(preset.type).toBe('switch');
    expect(typeof preset.name).toBe('string');
    expect(typeof preset.description).toBe('string');
    expect(preset.props).toHaveProperty('axis');
    expect(preset.props).toHaveProperty('throwDistance');
    expect(preset.props).toHaveProperty('material');
    expect(preset.props).toHaveProperty('size');
  });

  it('Railway switch has largest throw distance', () => {
    expect(RAILWAY_SWITCH_PRESET.props.throwDistance).toBeGreaterThan(
      DOOR_SWITCH_PRESET.props.throwDistance!
    );
    expect(RAILWAY_SWITCH_PRESET.props.throwDistance).toBeGreaterThan(
      CIRCUIT_BREAKER_PRESET.props.throwDistance!
    );
  });

  it('Circuit breaker is smallest', () => {
    expect(CIRCUIT_BREAKER_PRESET.props.size).toBeLessThan(DOOR_SWITCH_PRESET.props.size!);
  });
});

describe('Plate Presets', () => {
  it('has expected presets', () => {
    expect(ALL_PLATE_PRESETS).toHaveLength(3);
    expect(ALL_PLATE_PRESETS).toContain(TRAP_TRIGGER_PRESET);
    expect(ALL_PLATE_PRESETS).toContain(FLOOR_BUTTON_PRESET);
    expect(ALL_PLATE_PRESETS).toContain(WEIGHT_PLATE_PRESET);
  });

  it.each([
    ['Trap', TRAP_TRIGGER_PRESET],
    ['Floor', FLOOR_BUTTON_PRESET],
    ['Weight', WEIGHT_PLATE_PRESET],
  ] as const)('%s plate has required properties', (_label, preset) => {
    expect(preset.type).toBe('plate');
    expect(typeof preset.name).toBe('string');
    expect(typeof preset.description).toBe('string');
    expect(preset.props).toHaveProperty('size');
    expect(preset.props).toHaveProperty('activationDepth');
    expect(preset.props).toHaveProperty('springiness');
    expect(preset.props).toHaveProperty('color');
    expect(preset.props).toHaveProperty('activeColor');
  });

  it('Trap has small activation depth', () => {
    expect(TRAP_TRIGGER_PRESET.props.activationDepth).toBeLessThan(
      FLOOR_BUTTON_PRESET.props.activationDepth!
    );
  });
});

describe('Button Presets', () => {
  it('has expected presets', () => {
    expect(ALL_BUTTON_PRESETS).toHaveLength(3);
    expect(ALL_BUTTON_PRESETS).toContain(ELEVATOR_BUTTON_PRESET);
    expect(ALL_BUTTON_PRESETS).toContain(EMERGENCY_STOP_PRESET);
    expect(ALL_BUTTON_PRESETS).toContain(ARCADE_BUTTON_PRESET);
  });

  it.each([
    ['Elevator', ELEVATOR_BUTTON_PRESET],
    ['Emergency', EMERGENCY_STOP_PRESET],
    ['Arcade', ARCADE_BUTTON_PRESET],
  ] as const)('%s button has required properties', (_label, preset) => {
    expect(preset.type).toBe('button');
    expect(typeof preset.name).toBe('string');
    expect(typeof preset.description).toBe('string');
    expect(preset.props).toHaveProperty('size');
    expect(preset.props).toHaveProperty('type');
    expect(preset.props).toHaveProperty('color');
    expect(preset.props).toHaveProperty('activeColor');
  });

  it('Emergency stop is toggle type', () => {
    expect(EMERGENCY_STOP_PRESET.props.type).toBe('toggle');
  });

  it('Elevator is momentary type', () => {
    expect(ELEVATOR_BUTTON_PRESET.props.type).toBe('momentary');
  });

  it('Emergency stop is largest button', () => {
    expect(EMERGENCY_STOP_PRESET.props.size).toBeGreaterThan(ELEVATOR_BUTTON_PRESET.props.size!);
    expect(EMERGENCY_STOP_PRESET.props.size).toBeGreaterThan(ARCADE_BUTTON_PRESET.props.size!);
  });
});

describe('Trigger Presets', () => {
  it('has expected presets', () => {
    expect(ALL_TRIGGER_PRESETS).toHaveLength(4);
    expect(ALL_TRIGGER_PRESETS).toContain(VEHICLE_THROTTLE_PRESET);
    expect(ALL_TRIGGER_PRESETS).toContain(GUN_TRIGGER_PRESET);
    expect(ALL_TRIGGER_PRESETS).toContain(PICKUP_SPHERE_PRESET);
    expect(ALL_TRIGGER_PRESETS).toContain(POWER_SWITCH_PRESET);
  });

  it.each([
    ['Throttle', VEHICLE_THROTTLE_PRESET],
    ['Gun', GUN_TRIGGER_PRESET],
    ['Pickup', PICKUP_SPHERE_PRESET],
    ['Power', POWER_SWITCH_PRESET],
  ] as const)('%s trigger has required properties', (_label, preset) => {
    expect(preset.type).toBe('trigger');
    expect(typeof preset.name).toBe('string');
    expect(typeof preset.description).toBe('string');
    expect(preset.props).toHaveProperty('shapeConfig');
    expect(preset.props).toHaveProperty('materialConfig');
    expect(preset.props).toHaveProperty('behaviorConfig');
  });

  it('Vehicle throttle uses axis behavior', () => {
    expect(VEHICLE_THROTTLE_PRESET.props.behaviorConfig?.type).toBe('axis');
  });

  it('Gun trigger uses pressure behavior', () => {
    expect(GUN_TRIGGER_PRESET.props.behaviorConfig?.type).toBe('pressure');
  });

  it('Power switch uses toggle behavior', () => {
    expect(POWER_SWITCH_PRESET.props.behaviorConfig?.type).toBe('toggle');
  });

  it('Pickup sphere uses momentary behavior', () => {
    expect(PICKUP_SPHERE_PRESET.props.behaviorConfig?.type).toBe('momentary');
  });

  it('Pickup sphere has emissive intensity', () => {
    expect(PICKUP_SPHERE_PRESET.props.materialConfig?.emissiveIntensity).toBeGreaterThan(0);
  });
});

describe('ALL_INPUT_PRESETS', () => {
  it('contains all preset types', () => {
    const types = new Set(ALL_INPUT_PRESETS.map((p) => p.type));

    expect(types).toContain('joystick');
    expect(types).toContain('switch');
    expect(types).toContain('plate');
    expect(types).toContain('button');
    expect(types).toContain('trigger');
  });

  it('has correct total count', () => {
    const expectedCount =
      ALL_JOYSTICK_PRESETS.length +
      ALL_SWITCH_PRESETS.length +
      ALL_PLATE_PRESETS.length +
      ALL_BUTTON_PRESETS.length +
      ALL_TRIGGER_PRESETS.length;

    expect(ALL_INPUT_PRESETS).toHaveLength(expectedCount);
  });

  it('all presets have unique names', () => {
    const names = ALL_INPUT_PRESETS.map((p) => p.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});

describe('getPresetByName', () => {
  it('finds existing preset', () => {
    const result = getPresetByName('WASD Movement');
    expect(result).toBe(WASD_JOYSTICK_PRESET);
  });

  it('finds button preset by name', () => {
    const result = getPresetByName('Emergency Stop');
    expect(result).toBe(EMERGENCY_STOP_PRESET);
  });

  it('returns undefined for unknown name', () => {
    const result = getPresetByName('nonexistent');
    expect(result).toBeUndefined();
  });
});

describe('getPresetsByType', () => {
  it('returns all joystick presets', () => {
    const result = getPresetsByType('joystick');
    expect(result).toHaveLength(ALL_JOYSTICK_PRESETS.length);
    expect(result.every((p) => p.type === 'joystick')).toBe(true);
  });

  it('returns all switch presets', () => {
    const result = getPresetsByType('switch');
    expect(result).toHaveLength(ALL_SWITCH_PRESETS.length);
    expect(result.every((p) => p.type === 'switch')).toBe(true);
  });

  it('returns all plate presets', () => {
    const result = getPresetsByType('plate');
    expect(result).toHaveLength(ALL_PLATE_PRESETS.length);
  });

  it('returns all button presets', () => {
    const result = getPresetsByType('button');
    expect(result).toHaveLength(ALL_BUTTON_PRESETS.length);
  });

  it('returns all trigger presets', () => {
    const result = getPresetsByType('trigger');
    expect(result).toHaveLength(ALL_TRIGGER_PRESETS.length);
  });
});
