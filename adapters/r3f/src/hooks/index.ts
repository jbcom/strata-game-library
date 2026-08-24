/**
 * React hooks exports
 */

export { useGameStatus, useMode, useScene, useTransition } from '../StrataGame';
export type { UsePauseToggleOptions } from './useGameStatus';
export { usePauseToggle } from './useGameStatus';
export type { ControlHint } from './useInput';
export {
  useActionPressed,
  useControlHints,
  useCurrentInputMap,
  useInput,
  useInputManager,
} from './useInput';
export type { KeyboardActions, KeyboardMapping } from './useKeyboardControls';
export { DEFAULT_KEYBOARD_MAPPING, useKeyboardControls } from './useKeyboardControls';
