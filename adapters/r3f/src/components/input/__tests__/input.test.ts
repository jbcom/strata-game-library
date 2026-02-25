/**
 * Input Component Tests
 *
 * Tests for input component exports and type structure.
 *
 * @module components/input/__tests__/input.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({}),
}));

vi.mock('@strata-game-library/core', () => ({
  createDragState: vi.fn(),
  processInputAxis: vi.fn(),
}));

describe('Input exports', () => {
  it('should export all input components from index', async () => {
    const inputModule = await import('../index');

    expect(inputModule.GroundSwitch).toBeDefined();
    expect(inputModule.Joystick3D).toBeDefined();
    expect(inputModule.PressurePlate).toBeDefined();
    expect(inputModule.TriggerComposer).toBeDefined();
    expect(inputModule.WallButton).toBeDefined();
  });
});

describe('Input type constants', () => {
  it('should define trigger shape options', () => {
    const shapes: Array<'box' | 'sphere' | 'cylinder' | 'custom'> = [
      'box',
      'sphere',
      'cylinder',
      'custom',
    ];
    expect(shapes).toHaveLength(4);
  });

  it('should define trigger behavior options', () => {
    const behaviors: Array<'momentary' | 'toggle' | 'axis' | 'pressure'> = [
      'momentary',
      'toggle',
      'axis',
      'pressure',
    ];
    expect(behaviors).toHaveLength(4);
  });

  it('should define WallButton type options', () => {
    const types: Array<'momentary' | 'toggle'> = ['momentary', 'toggle'];
    expect(types).toHaveLength(2);
  });

  it('should define GroundSwitch axis options', () => {
    const axes: Array<'x' | 'z'> = ['x', 'z'];
    expect(axes).toHaveLength(2);
  });

  it('should define GroundSwitch material options', () => {
    const materials: Array<'steel' | 'brass' | 'chrome'> = ['steel', 'brass', 'chrome'];
    expect(materials).toHaveLength(3);
  });
});

describe('Joystick3D default props', () => {
  it('should define sensible defaults', () => {
    const defaults = {
      size: 1.0,
      deadzone: 0.1,
      returnSpeed: 8,
      maxTilt: Math.PI / 6,
    };

    expect(defaults.deadzone).toBe(0.1);
    expect(defaults.returnSpeed).toBe(8);
    expect(defaults.maxTilt).toBeCloseTo(0.5236, 4);
  });
});

describe('PressurePlate default props', () => {
  it('should define sensible defaults', () => {
    const defaults = {
      size: [1, 0.15, 1] as [number, number, number],
      activationDepth: 0.08,
      springiness: 12,
    };

    expect(defaults.size).toEqual([1, 0.15, 1]);
    expect(defaults.activationDepth).toBe(0.08);
    expect(defaults.springiness).toBe(12);
  });
});
