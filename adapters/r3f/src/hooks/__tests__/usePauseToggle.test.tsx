import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const runtime = {
  actionHandler: null as ((event: { action?: string }) => void) | null,
  isPaused: false,
  off: vi.fn(),
  on: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
};

const game = {
  get isPaused() {
    return runtime.isPaused;
  },
  pause: () => {
    runtime.pause();
    runtime.isPaused = true;
  },
  resume: () => {
    runtime.resume();
    runtime.isPaused = false;
  },
  inputManager: {
    off: (event: string, handler: (event: { action?: string }) => void) => {
      runtime.off(event, handler);
      if (runtime.actionHandler === handler) {
        runtime.actionHandler = null;
      }
    },
    on: (event: string, handler: (event: { action?: string }) => void) => {
      runtime.on(event, handler);
      runtime.actionHandler = handler;
    },
  },
};

vi.mock('../../StrataGame', () => ({
  useGame: () => game,
  useGameStatus: () => ({
    isPaused: runtime.isPaused,
  }),
}));

import { usePauseToggle } from '../useGameStatus';

describe('usePauseToggle', () => {
  beforeEach(() => {
    runtime.actionHandler = null;
    runtime.isPaused = false;
    runtime.off.mockReset();
    runtime.on.mockReset();
    runtime.pause.mockReset();
    runtime.resume.mockReset();
  });

  it('does not bind action listeners unless explicitly enabled', () => {
    const { result } = renderHook(() => usePauseToggle());

    expect(runtime.on).not.toHaveBeenCalled();

    act(() => {
      result.current.toggle();
    });

    expect(runtime.pause).toHaveBeenCalledOnce();
  });

  it('binds the pause action when enabled and cleans up on unmount', () => {
    const { unmount } = renderHook(() => usePauseToggle({ enabled: true }));

    expect(runtime.on).toHaveBeenCalledWith('actionStart', expect.any(Function));
    expect(runtime.actionHandler).toBeTypeOf('function');

    act(() => {
      runtime.actionHandler?.({ action: 'jump' });
    });
    expect(runtime.pause).not.toHaveBeenCalled();

    act(() => {
      runtime.actionHandler?.({ action: 'pause' });
    });
    expect(runtime.pause).toHaveBeenCalledOnce();

    act(() => {
      runtime.actionHandler?.({ action: 'pause' });
    });
    expect(runtime.resume).toHaveBeenCalledOnce();

    const boundHandler = runtime.actionHandler;
    unmount();

    expect(runtime.off).toHaveBeenCalledWith('actionStart', boundHandler);
  });
});
