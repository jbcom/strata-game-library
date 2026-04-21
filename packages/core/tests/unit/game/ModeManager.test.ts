import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createModeManager } from '../../../src/game/ModeManager';

describe('ModeManager', () => {
  let manager: ReturnType<typeof createModeManager>;

  beforeEach(() => {
    manager = createModeManager();
  });

  it('should register a mode', () => {
    const mode = {
      id: 'explore',
      systems: [],
      inputMap: {},
    };
    manager.register(mode);
    expect(manager.hasMode('explore')).toBe(true);
  });

  it('should push and pop modes', async () => {
    const onEnter = vi.fn();
    const onExit = vi.fn();
    const setup = vi.fn().mockResolvedValue(undefined);
    const teardown = vi.fn().mockResolvedValue(undefined);
    const mode = {
      id: 'explore',
      systems: [],
      inputMap: {},
      onEnter,
      onExit,
      setup,
      teardown,
    };

    manager.register(mode);
    await manager.push('explore', { someProp: 'test' });

    expect(setup).toHaveBeenCalledWith({ someProp: 'test' });
    expect(onEnter).toHaveBeenCalledWith({ someProp: 'test' });
    expect(manager.current?.config.id).toBe('explore');
    expect(manager.current?.props.someProp).toBe('test');
    expect(manager.stack.length).toBe(1);

    await manager.pop();
    expect(onExit).toHaveBeenCalled();
    expect(teardown).toHaveBeenCalledWith({ someProp: 'test' });
    expect(manager.current).toBeNull();
  });

  it('should handle mode pausing and resuming', async () => {
    const onPause = vi.fn();
    const onResume = vi.fn();

    const mode1 = { id: 'm1', systems: [], inputMap: {}, onPause, onResume };
    const mode2 = { id: 'm2', systems: [], inputMap: {}, onEnter: vi.fn() };

    manager.register(mode1);
    manager.register(mode2);

    await manager.push('m1');
    await manager.push('m2');

    expect(onPause).toHaveBeenCalled();
    expect(manager.stack.length).toBe(2);

    await manager.pop();
    expect(onResume).toHaveBeenCalled();
    expect(manager.current?.config.id).toBe('m1');
  });

  it('should replace current mode', async () => {
    const onExit1 = vi.fn();
    const onEnter2 = vi.fn();
    const teardown1 = vi.fn().mockResolvedValue(undefined);
    const setup2 = vi.fn().mockResolvedValue(undefined);

    const mode1 = { id: 'm1', systems: [], inputMap: {}, onExit: onExit1, teardown: teardown1 };
    const mode2 = { id: 'm2', systems: [], inputMap: {}, onEnter: onEnter2, setup: setup2 };

    manager.register(mode1);
    manager.register(mode2);

    await manager.push('m1');
    await manager.replace('m2', { new: true });

    expect(onExit1).toHaveBeenCalled();
    expect(teardown1).toHaveBeenCalled();
    expect(setup2).toHaveBeenCalledWith({ new: true });
    expect(onEnter2).toHaveBeenCalledWith({ new: true });
    expect(manager.stack.length).toBe(1);
    expect(manager.current?.config.id).toBe('m2');
  });

  it('should notify subscribers when mode state changes', async () => {
    const listener = vi.fn();
    const unsubscribe = manager.subscribe(listener);
    const mode = {
      id: 'explore',
      systems: [],
      inputMap: {},
    };

    manager.register(mode);
    await manager.push('explore');

    expect(listener).toHaveBeenCalled();
    expect(manager.getSnapshot().current?.config.id).toBe('explore');

    unsubscribe();
  });
});
