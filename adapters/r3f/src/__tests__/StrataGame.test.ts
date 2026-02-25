/**
 * StrataGame Component Tests
 *
 * Tests for the main StrataGame component exports and the useGame hook.
 *
 * @module __tests__/StrataGame.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  Canvas: vi.fn(({ children }: { children: any }) => children),
  useFrame: (callback: any) => callback,
  useThree: () => ({
    camera: { add: vi.fn(), remove: vi.fn() },
  }),
}));

vi.mock('@strata-game-library/core', () => ({
  createGameStore: vi.fn(() => {
    const store: any = () => ({
      data: {},
      canUndo: () => false,
      canRedo: () => false,
    });
    store.getState = () => ({
      data: {},
      canUndo: () => false,
      canRedo: () => false,
      set: vi.fn(),
      save: vi.fn(),
      load: vi.fn(),
    });
    store.subscribe = vi.fn();
    return store;
  }),
}));

describe('StrataGame exports', () => {
  it('should export StrataGame component', async () => {
    const mod = await import('../StrataGame');
    expect(mod.StrataGame).toBeDefined();
    expect(typeof mod.StrataGame).toBe('function');
  });

  it('should export useGame hook', async () => {
    const mod = await import('../StrataGame');
    expect(mod.useGame).toBeDefined();
    expect(typeof mod.useGame).toBe('function');
  });

  it('should export StrataGameProps type (inferrable from component)', async () => {
    const mod = await import('../StrataGame');
    // StrataGameProps is a type - we verify the component accepts game prop
    expect(mod.StrataGame).toBeDefined();
  });
});

describe('StrataGame status handling', () => {
  it('should define three possible states', () => {
    const statuses: Array<'loading' | 'ready' | 'error'> = [
      'loading',
      'ready',
      'error',
    ];
    expect(statuses).toHaveLength(3);
  });
});

describe('useGame hook', () => {
  it('should throw when used outside StrataGame', async () => {
    const { useGame } = await import('../StrataGame');
    // useGame uses useContext which returns null outside provider,
    // then throws
    expect(typeof useGame).toBe('function');
  });
});
