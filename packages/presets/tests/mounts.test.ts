import { describe, expect, it } from 'vitest';
import { createMount } from '../src/creatures/mount';

describe('createMount', () => {
  it('extends quadruped properties', () => {
    const mount = createMount('horse');

    // Quadruped properties
    expect(mount).toHaveProperty('size');
    expect(mount).toHaveProperty('legLength');
    expect(mount).toHaveProperty('furLength');

    // Mount properties
    expect(mount).toHaveProperty('saddled');
    expect(mount).toHaveProperty('saddleType');
    expect(mount).toHaveProperty('barding');
  });

  it('applies quadruped form values', () => {
    const horseMount = createMount('horse');
    const wolfMount = createMount('wolf');

    expect(horseMount.size).toBeGreaterThan(wolfMount.size);
    expect(horseMount.legLength).toBeGreaterThan(wolfMount.legLength);
  });

  it('allows mount-specific customizations', () => {
    const mount = createMount('horse', {
      saddleType: 'war',
      barding: 0.8,
      hasPanniers: true,
    });

    expect(mount.saddleType).toBe('war');
    expect(mount.barding).toBe(0.8);
    expect(mount.hasPanniers).toBe(true);
    expect(mount.saddled).toBe(true); // Auto-enabled
  });

  it('allows creature customizations in same call', () => {
    const mount = createMount('wolf', {
      size: 2.0, // creature param
      saddleType: 'pack', // mount param
    });

    expect(mount.size).toBe(2.0);
    expect(mount.saddleType).toBe('pack');
  });

  it('auto-enables gear when saddle is provided', () => {
    const mount = createMount('horse', { saddleType: 'basic' });

    expect(mount.saddled).toBe(true);
    expect(mount.hasReins).toBe(true);
  });
});
