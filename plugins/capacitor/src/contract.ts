/**
 * Platform adapter contract for the Capacitor plugin.
 *
 * Defines the abstract interface that platform-specific implementations
 * (web, iOS, Android) must fulfill. Covers device profiling, input capture,
 * haptic feedback, control hints, and event listeners for device/input changes.
 *
 * @module CapacitorContract
 * @category Player Experience
 */

import type {
  ControlHints,
  DeviceProfile,
  HapticsOptions,
  InputMapping,
  InputSnapshot,
} from './definitions.js';

export interface StrataPlatformAdapter {
  getDeviceProfile(): Promise<DeviceProfile>;

  getInputSnapshot(): Promise<InputSnapshot>;
  setInputMapping(mapping: Partial<InputMapping>): Promise<void>;

  triggerHaptics(options: HapticsOptions): Promise<void>;
  vibrate(options?: { duration?: number }): Promise<void>;

  getControlHints(): Promise<ControlHints>;

  addListener(
    eventName: 'deviceChange',
    callback: (profile: DeviceProfile) => void
  ): Promise<{ remove: () => Promise<void> }>;
  addListener(
    eventName: 'inputChange',
    callback: (snapshot: InputSnapshot) => void
  ): Promise<{ remove: () => Promise<void> }>;
  addListener(
    eventName: 'gamepadConnected',
    callback: (info: { index: number; id: string }) => void
  ): Promise<{ remove: () => Promise<void> }>;
  addListener(
    eventName: 'gamepadDisconnected',
    callback: (info: { index: number }) => void
  ): Promise<{ remove: () => Promise<void> }>;
}

export type {
  ControlHints,
  DeviceProfile,
  HapticsOptions,
  InputMapping,
  InputSnapshot,
} from './definitions.js';
