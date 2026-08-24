/**
 * Input handling: pointer, keyboard, gamepad, and touch.
 *
 * Includes the mobile helpers — joystick normalisation and safe-area insets —
 * because they exist to turn raw touch geometry into usable input, not to
 * render anything.
 *
 * @packageDocumentation
 */

export type {
  DragState,
  GamepadState,
  HapticPattern,
  InputActionBinding,
  InputActionMap,
  InputActionSource,
  InputAxis,
  InputEvent,
  InputManagerConfig,
  InputManagerSnapshot,
  PointerState,
} from './input.js';
export {
  angleToAxis,
  axisToAngle,
  axisToMagnitude,
  clampAxis,
  createInputManager,
  HapticFeedback,
  InputManager,
  InputStateMachine,
  normalizeAxisValue,
} from './input.js';
export type { JoystickVector, RawOffset } from './joystick-normalize.js';
export { normalizeJoystick } from './joystick-normalize.js';
export type { SafeAreaInsets } from './safe-area-insets.js';
export { getSafeAreaInsets, resetSafeAreaCache } from './safe-area-insets.js';
