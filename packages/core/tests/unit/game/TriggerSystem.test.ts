import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { createTriggerSystem } from '../../../src/game/TriggerSystem';

describe('TriggerSystem', () => {
  it('should activate proximity trigger when entity is in range', () => {
    const action = vi.fn();
    const triggerEntity = {
      id: 'trigger1',
      transform: { position: new THREE.Vector3(0, 0, 0) },
      trigger: {
        id: 't1',
        type: 'proximity' as const,
        shape: 'sphere' as const,
        radius: 5,
        enabled: true,
        action,
      },
    };

    const playerEntity = {
      id: 'player',
      transform: { position: new THREE.Vector3(3, 0, 0) },
      triggerable: true,
    };

    const worldMock = {
      query: vi.fn((...components: string[]) => {
        if (components.includes('trigger')) return [triggerEntity];
        if (components.includes('triggerable')) return [playerEntity];
        return [];
      }),
    };

    const system = createTriggerSystem();
    system(worldMock as any, 0.1);

    expect(action).toHaveBeenCalledWith(playerEntity, triggerEntity);
    expect(triggerEntity.trigger.triggerCount).toBe(1);
  });

  it('should NOT activate proximity trigger when entity is out of range', () => {
    const action = vi.fn();
    const triggerEntity = {
      id: 'trigger1',
      transform: { position: new THREE.Vector3(0, 0, 0) },
      trigger: {
        id: 't1',
        type: 'proximity' as const,
        shape: 'sphere' as const,
        radius: 5,
        enabled: true,
        action,
      },
    };

    const playerEntity = {
      id: 'player',
      transform: { position: new THREE.Vector3(10, 0, 0) },
      triggerable: true,
    };

    const worldMock = {
      query: vi.fn((...components: string[]) => {
        if (components.includes('trigger')) return [triggerEntity];
        if (components.includes('triggerable')) return [playerEntity];
        return [];
      }),
    };

    const system = createTriggerSystem();
    system(worldMock as any, 0.1);

    expect(action).not.toHaveBeenCalled();
  });

  it('should respect cooldown', () => {
    const action = vi.fn();
    const triggerEntity = {
      id: 'trigger1',
      transform: { position: new THREE.Vector3(0, 0, 0) },
      trigger: {
        id: 't1',
        type: 'proximity' as const,
        shape: 'sphere' as const,
        radius: 5,
        enabled: true,
        cooldown: 10,
        action,
      },
    };

    const playerEntity = {
      id: 'player',
      transform: { position: new THREE.Vector3(0, 0, 0) },
      triggerable: true,
    };

    const worldMock = {
      query: vi.fn((...components: string[]) => {
        if (components.includes('trigger')) return [triggerEntity];
        if (components.includes('triggerable')) return [playerEntity];
        return [];
      }),
    };

    const system = createTriggerSystem();

    // First activation
    system(worldMock as any, 0.1);
    expect(action).toHaveBeenCalledTimes(1);

    // Second activation immediately (should be blocked by cooldown)
    system(worldMock as any, 0.1);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should respect "once" property', () => {
    const action = vi.fn();
    const triggerEntity = {
      id: 'trigger1',
      transform: { position: new THREE.Vector3(0, 0, 0) },
      trigger: {
        id: 't1',
        type: 'proximity' as const,
        shape: 'sphere' as const,
        radius: 5,
        enabled: true,
        once: true,
        action,
      },
    };

    const playerEntity = {
      id: 'player',
      transform: { position: new THREE.Vector3(0, 0, 0) },
      triggerable: true,
    };

    const worldMock = {
      query: vi.fn((...components: string[]) => {
        if (components.includes('trigger')) return [triggerEntity];
        if (components.includes('triggerable')) return [playerEntity];
        return [];
      }),
    };

    const system = createTriggerSystem();

    system(worldMock as any, 0.1);
    system(worldMock as any, 0.1);

    expect(action).toHaveBeenCalledTimes(1);
  });
});
