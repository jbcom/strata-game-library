/**
 * Capacitor plugin for native mobile platform integration.
 *
 * Bridges Strata games to native iOS/Android capabilities including device
 * detection, haptic feedback, input handling, screen orientation, safe area
 * insets, and persistent storage. Falls back to web implementations when
 * running in a browser.
 *
 * @module Capacitor
 * @category Player Experience
 */

import { registerPlugin } from '@capacitor/core';
import type { StrataPlugin } from './definitions.js';

const Strata = registerPlugin<StrataPlugin>('Strata', {
  web: () => import('./web.js').then((m) => new m.StrataWeb()),
});

export const version = '0.0.1';
export function hello() {
  return 'Hello from Strata Capacitor Plugin';
}

export * from './definitions.js';
export { Strata };
