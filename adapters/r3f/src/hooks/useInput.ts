import { useSyncExternalStore } from 'react';
import type {
  InputActionBinding,
  InputActionMap,
  InputManager,
  InputManagerSnapshot,
} from '@strata-game-library/core';
import { useGame, useMode } from '../StrataGame';

export interface ControlHint extends InputActionBinding {
  action: string;
}

function useInputManagerSnapshot(inputManager: InputManager): InputManagerSnapshot {
  return useSyncExternalStore(
    inputManager.subscribe.bind(inputManager),
    inputManager.getSnapshot.bind(inputManager),
    inputManager.getSnapshot.bind(inputManager),
  );
}

export function useInputManager(inputManager: InputManager): InputManagerSnapshot {
  return useInputManagerSnapshot(inputManager);
}

export function useInput(): InputManagerSnapshot {
  const game = useGame();
  return useInputManagerSnapshot(game.inputManager);
}

export function useActionPressed(action: string): boolean {
  return useInput().activeActions.includes(action);
}

export function useCurrentInputMap(): InputActionMap {
  const mode = useMode();
  return mode?.config.inputMap ?? {};
}

export function useControlHints(): ControlHint[] {
  return Object.entries(useCurrentInputMap()).map(([action, binding]) => ({
    action,
    ...binding,
    keyboard: binding.keyboard ? [...binding.keyboard] : undefined,
  }));
}
