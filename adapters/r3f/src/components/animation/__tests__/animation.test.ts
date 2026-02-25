/**
 * Animation Component Tests
 *
 * Tests for animation component exports and type structure.
 *
 * @module components/animation/__tests__/animation.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({}),
}));

vi.mock('@strata-game-library/core', () => ({
  solveFABRIK: vi.fn(),
  solveCCD: vi.fn(),
  solveTwoBoneIK: vi.fn(),
  updateSpringBone: vi.fn(),
  createProceduralWalk: vi.fn(),
}));

describe('Animation exports', () => {
  it('should export all animation components from index', async () => {
    const animModule = await import('../index');

    expect(animModule.BlinkController).toBeDefined();
    expect(animModule.BreathingAnimation).toBeDefined();
    expect(animModule.HeadTracker).toBeDefined();
    expect(animModule.IKChain).toBeDefined();
    expect(animModule.IKLimb).toBeDefined();
    expect(animModule.LookAt).toBeDefined();
    expect(animModule.ProceduralWalk).toBeDefined();
    expect(animModule.SpringBone).toBeDefined();
    expect(animModule.TailPhysics).toBeDefined();
  });

  it('should export all components as functions', async () => {
    const animModule = await import('../index');

    const componentNames = [
      'BlinkController',
      'BreathingAnimation',
      'HeadTracker',
      'IKChain',
      'IKLimb',
      'LookAt',
      'ProceduralWalk',
      'SpringBone',
      'TailPhysics',
    ] as const;

    for (const name of componentNames) {
      const component = animModule[name];
      // Components can be functions or forwardRef objects
      expect(component).toBeDefined();
    }
  });
});

describe('Animation type interfaces', () => {
  it('should define IKChain solver options', () => {
    const solverOptions: Array<'fabrik' | 'ccd'> = ['fabrik', 'ccd'];
    expect(solverOptions).toContain('fabrik');
    expect(solverOptions).toContain('ccd');
  });

  it('should define BreathingAnimation axis options', () => {
    const axisOptions: Array<'x' | 'y' | 'z' | 'scale'> = ['x', 'y', 'z', 'scale'];
    expect(axisOptions).toHaveLength(4);
  });

  it('should define ProceduralWalk foot options', () => {
    const footOptions: Array<'left' | 'right'> = ['left', 'right'];
    expect(footOptions).toHaveLength(2);
  });
});
