import { useEffect, useRef } from 'react';

export interface KeyboardMapping {
  [key: string]: string;
}

export interface KeyboardActions {
  [action: string]: boolean;
}

/**
 * Standard keyboard control mapping for common actions.
 */
export const DEFAULT_KEYBOARD_MAPPING: KeyboardMapping = {
  w: 'forward',
  s: 'backward',
  a: 'left',
  d: 'right',
  arrowup: 'forward',
  arrowdown: 'backward',
  arrowleft: 'left',
  arrowright: 'right',
  ' ': 'fire',
  shift: 'sprint',
};

/**
 * A hook for managing keyboard controls and mapping keys to game actions.
 *
 * @param mapping - A map of keys to action names.
 * @returns A ref object containing the current state of all actions.
 */
export function useKeyboardControls(mapping: KeyboardMapping = DEFAULT_KEYBOARD_MAPPING) {
  const actions = useRef<KeyboardActions>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const action = mapping[key];
      if (action) {
        actions.current[action] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const action = mapping[key];
      if (action) {
        actions.current[action] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mapping]);

  return actions;
}
