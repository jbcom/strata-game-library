import { act, renderHook } from '@testing-library/react';
import { createInputManager } from '@strata-game-library/core';
import { describe, expect, it } from 'vitest';
import { useInputManager } from '../useInput';

describe('useInputManager', () => {
  it('subscribes to input manager snapshots', () => {
    const inputManager = createInputManager();
    const element = document.createElement('div');

    act(() => {
      inputManager.attach(element);
      inputManager.setActionMap({
        confirm: {
          keyboard: ['enter'],
        },
      });
    });

    const { result } = renderHook(() => useInputManager(inputManager));

    expect(result.current.actionMap.confirm.keyboard).toEqual(['enter']);
    expect(result.current.activeActions).toEqual([]);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter' }));
    });

    expect(result.current.activeActions).toEqual(['confirm']);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', key: 'Enter' }));
    });

    expect(result.current.activeActions).toEqual([]);

    act(() => {
      inputManager.detach();
    });
  });
});
