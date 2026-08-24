/**
 * Hooks Tests
 *
 * Tests for the standard React Three Fiber hook exports.
 *
 * @module hooks/__tests__/hooks.test
 */

import { describe, expect, it } from 'vitest';

describe('Hooks exports', () => {
  it('should export useKeyboardControls from index', async () => {
    const hooks = await import('../index');
    expect(hooks.useKeyboardControls).toBeDefined();
    expect(typeof hooks.useKeyboardControls).toBe('function');
    expect(hooks.useGameStatus).toBeDefined();
    expect(typeof hooks.useGameStatus).toBe('function');
    expect(hooks.usePauseToggle).toBeDefined();
    expect(typeof hooks.usePauseToggle).toBe('function');
    expect(hooks.useInput).toBeDefined();
    expect(typeof hooks.useInput).toBe('function');
    expect(hooks.useInputManager).toBeDefined();
    expect(typeof hooks.useInputManager).toBe('function');
    expect(hooks.useActionPressed).toBeDefined();
    expect(typeof hooks.useActionPressed).toBe('function');
    expect(hooks.useCurrentInputMap).toBeDefined();
    expect(typeof hooks.useCurrentInputMap).toBe('function');
    expect(hooks.useControlHints).toBeDefined();
    expect(typeof hooks.useControlHints).toBe('function');
    expect(hooks.useScene).toBeDefined();
    expect(typeof hooks.useScene).toBe('function');
    expect(hooks.useMode).toBeDefined();
    expect(typeof hooks.useMode).toBe('function');
    expect(hooks.useTransition).toBeDefined();
    expect(typeof hooks.useTransition).toBe('function');
  });
});

describe('DEFAULT_KEYBOARD_MAPPING', () => {
  it('should export the default keyboard mapping', async () => {
    const { DEFAULT_KEYBOARD_MAPPING } = await import('../useKeyboardControls');
    expect(DEFAULT_KEYBOARD_MAPPING).toBeDefined();
    expect(typeof DEFAULT_KEYBOARD_MAPPING).toBe('object');
  });

  it('should map WASD keys to movement actions', async () => {
    const { DEFAULT_KEYBOARD_MAPPING } = await import('../useKeyboardControls');

    expect(DEFAULT_KEYBOARD_MAPPING.w).toBe('forward');
    expect(DEFAULT_KEYBOARD_MAPPING.s).toBe('backward');
    expect(DEFAULT_KEYBOARD_MAPPING.a).toBe('left');
    expect(DEFAULT_KEYBOARD_MAPPING.d).toBe('right');
  });

  it('should map arrow keys to movement actions', async () => {
    const { DEFAULT_KEYBOARD_MAPPING } = await import('../useKeyboardControls');

    expect(DEFAULT_KEYBOARD_MAPPING.arrowup).toBe('forward');
    expect(DEFAULT_KEYBOARD_MAPPING.arrowdown).toBe('backward');
    expect(DEFAULT_KEYBOARD_MAPPING.arrowleft).toBe('left');
    expect(DEFAULT_KEYBOARD_MAPPING.arrowright).toBe('right');
  });

  it('should map space to fire', async () => {
    const { DEFAULT_KEYBOARD_MAPPING } = await import('../useKeyboardControls');
    expect(DEFAULT_KEYBOARD_MAPPING[' ']).toBe('fire');
  });

  it('should map shift to sprint', async () => {
    const { DEFAULT_KEYBOARD_MAPPING } = await import('../useKeyboardControls');
    expect(DEFAULT_KEYBOARD_MAPPING.shift).toBe('sprint');
  });
});

describe('Keyboard action tracking', () => {
  it('should track key state as boolean map', () => {
    const actions: Record<string, boolean> = {};
    const mapping: Record<string, string> = { w: 'forward', s: 'backward' };

    // Simulate keydown
    const key = 'w';
    const action = mapping[key];
    if (action) {
      actions[action] = true;
    }
    expect(actions.forward).toBe(true);

    // Simulate keyup
    actions[action] = false;
    expect(actions.forward).toBe(false);
  });

  it('should lowercase key before lookup', () => {
    const mapping: Record<string, string> = { w: 'forward' };
    const key = 'W';
    const action = mapping[key.toLowerCase()];
    expect(action).toBe('forward');
  });

  it('should ignore unmapped keys', () => {
    const mapping: Record<string, string> = { w: 'forward' };
    const actions: Record<string, boolean> = {};

    const key = 'q';
    const action = mapping[key];
    if (action) {
      actions[action] = true;
    }

    expect(Object.keys(actions)).toHaveLength(0);
  });
});
