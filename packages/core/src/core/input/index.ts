/**
 * Input handling: pointer, keyboard, gamepad, and touch.
 *
 * Includes the mobile helpers — joystick normalisation and safe-area insets —
 * because they exist to turn raw touch geometry into usable input, not to
 * render anything.
 *
 * @packageDocumentation
 */
export * from './input.js';
export * from './joystick-normalize.js';
export * from './safe-area-insets.js';
