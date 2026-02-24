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

  it('should push and pop modes', () => {
    const onEnter = vi.fn();
    const onExit = vi.fn();
    const mode = {
      id: 'explore',
      systems: [],
      inputMap: {},
      onEnter,
      onExit,
    };

    manager.register(mode);
    manager.push('explore', { someProp: 'test' });

    expect(onEnter).toHaveBeenCalledWith({ someProp: 'test' });
    expect(manager.current?.config.id).toBe('explore');
    expect(manager.current?.props.someProp).toBe('test');
    expect(manager.stack.length).toBe(1);

    manager.pop();
    expect(onExit).toHaveBeenCalled();
    expect(manager.current).toBeNull();
  });

  it('should handle mode pausing and resuming', () => {
    const onPause = vi.fn();
    const onResume = vi.fn();

    const mode1 = { id: 'm1', systems: [], inputMap: {}, onPause, onResume };
    const mode2 = { id: 'm2', systems: [], inputMap: {}, onEnter: vi.fn() };

    manager.register(mode1);
    manager.register(mode2);

    manager.push('m1');
    manager.push('m2');

    expect(onPause).toHaveBeenCalled();
    expect(manager.stack.length).toBe(2);

    manager.pop();
    expect(onResume).toHaveBeenCalled();
    expect(manager.current?.config.id).toBe('m1');
  });

  it('should replace current mode', () => {
    const onExit1 = vi.fn();
    const onEnter2 = vi.fn();

    const mode1 = { id: 'm1', systems: [], inputMap: {}, onExit: onExit1 };
    const mode2 = { id: 'm2', systems: [], inputMap: {}, onEnter: onEnter2 };

    manager.register(mode1);
    manager.register(mode2);

    manager.push('m1');
    manager.replace('m2', { new: true });

    expect(onExit1).toHaveBeenCalled();
    expect(onEnter2).toHaveBeenCalledWith({ new: true });
    expect(manager.stack.length).toBe(1);
    expect(manager.current?.config.id).toBe('m2');
  });
});
