/**
 * Physics Component Tests
 *
 * Tests for physics component exports.
 *
 * @module components/physics/__tests__/physics.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({}),
}));

vi.mock('@react-three/rapier', () => ({
  useRapier: vi.fn(),
  RigidBody: vi.fn(),
  CuboidCollider: vi.fn(),
  BallCollider: vi.fn(),
}));

describe('Physics exports', () => {
  it('should export all physics components from index', async () => {
    const physicsModule = await import('../index');

    expect(physicsModule.Buoyancy).toBeDefined();
    expect(physicsModule.CharacterController).toBeDefined();
    expect(physicsModule.Destructible).toBeDefined();
    expect(physicsModule.Ragdoll).toBeDefined();
    expect(physicsModule.VehicleBody).toBeDefined();
  });
});
