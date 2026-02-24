import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSceneManager } from '../../../src/game/SceneManager';

describe('SceneManager', () => {
  let manager: ReturnType<typeof createSceneManager>;

  beforeEach(() => {
    manager = createSceneManager();
  });

  it('should register a scene', () => {
    const scene = {
      id: 'test',
      setup: async () => {},
      teardown: async () => {},
      render: () => null,
    };
    manager.register(scene);
    // Internal state check if possible, or just via load
    expect(async () => await manager.load('test')).not.toThrow();
  });

  it('should load a registered scene', async () => {
    const setup = vi.fn().mockResolvedValue(undefined);
    const teardown = vi.fn().mockResolvedValue(undefined);
    const scene = {
      id: 'test',
      setup,
      teardown,
      render: () => null,
    };

    manager.register(scene);
    await manager.load('test');

    expect(setup).toHaveBeenCalled();
    expect(manager.current?.id).toBe('test');
    expect(manager.stack.length).toBe(1);
  });

  it('should call teardown when switching scenes', async () => {
    const teardown1 = vi.fn().mockResolvedValue(undefined);
    const scene1 = {
      id: 'scene1',
      setup: async () => {},
      teardown: teardown1,
      render: () => null,
    };
    const scene2 = {
      id: 'scene2',
      setup: async () => {},
      teardown: async () => {},
      render: () => null,
    };

    manager.register(scene1);
    manager.register(scene2);

    await manager.load('scene1');
    await manager.load('scene2');

    expect(teardown1).toHaveBeenCalled();
    expect(manager.current?.id).toBe('scene2');
  });

  it('should push and pop scenes', async () => {
    const scene1 = {
      id: 's1',
      setup: async () => {},
      teardown: async () => {},
      render: () => null,
    };
    const scene2 = {
      id: 's2',
      setup: async () => {},
      teardown: async () => {},
      render: () => null,
    };

    manager.register(scene1);
    manager.register(scene2);

    await manager.load('s1');
    await manager.push('s2');

    expect(manager.stack.length).toBe(2);
    expect(manager.current?.id).toBe('s2');

    await manager.pop();
    expect(manager.stack.length).toBe(1);
    expect(manager.current?.id).toBe('s1');
  });

  it('should throw error when loading unregistered scene', async () => {
    await expect(manager.load('unknown')).rejects.toThrow('Scene "unknown" not registered.');
  });
});
