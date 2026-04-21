import { useCallback, useEffect } from 'react';
import type { InputEvent } from '@strata-game-library/core';
import { useGame, useGameStatus } from '../StrataGame';

export interface UsePauseToggleOptions {
  action?: string;
  enabled?: boolean;
}

export function usePauseToggle(options: UsePauseToggleOptions = {}) {
  const { action = 'pause', enabled = false } = options;
  const game = useGame();
  const status = useGameStatus();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handlePauseAction = (event: InputEvent) => {
      if (event.action !== action) {
        return;
      }

      if (game.isPaused) {
        game.resume();
        return;
      }

      game.pause();
    };

    game.inputManager.on('actionStart', handlePauseAction);

    return () => {
      game.inputManager.off('actionStart', handlePauseAction);
    };
  }, [action, enabled, game]);

  const pause = useCallback(() => {
    game.pause();
  }, [game]);

  const resume = useCallback(() => {
    game.resume();
  }, [game]);

  const toggle = useCallback(() => {
    if (game.isPaused) {
      game.resume();
      return;
    }

    game.pause();
  }, [game]);

  return {
    ...status,
    pause,
    resume,
    toggle,
  };
}

export { useGameStatus };
