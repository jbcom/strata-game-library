/**
 * Type definitions for the Capacitor plugin.
 *
 * Defines device profiles, input snapshots, haptics options, storage APIs,
 * and the full StrataPlugin interface that native and web implementations
 * must satisfy. Supports multi-platform input (touch, keyboard, gamepad)
 * and cross-platform persistent storage.
 *
 * @module CapacitorDefinitions
 * @category Player Experience
 */

export type InputMode = 'touch' | 'keyboard' | 'gamepad' | 'hybrid';
export type DeviceType = 'mobile' | 'tablet' | 'foldable' | 'desktop';
export type Platform = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'web';
export type Orientation = 'portrait' | 'landscape';

export interface DeviceProfile {
  deviceType: DeviceType;
  platform: Platform;
  inputMode: InputMode;
  orientation: Orientation;
  hasTouch: boolean;
  hasPointer: boolean;
  hasGamepad: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isFoldable: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface InputSnapshot {
  timestamp: number;
  leftStick: Vector2;
  rightStick: Vector2;
  buttons: Record<string, boolean>;
  triggers: {
    left: number;
    right: number;
  };
  touches: Array<{
    id: number;
    position: Vector2;
    phase: 'began' | 'moved' | 'ended' | 'cancelled';
  }>;
}

export interface InputMapping {
  moveForward: string[];
  moveBackward: string[];
  moveLeft: string[];
  moveRight: string[];
  jump: string[];
  action: string[];
  cancel: string[];
}

/**
 * Unified haptics options supporting multiple vibration modes.
 *
 * @example
 * // Preset intensity
 * await triggerHaptics({ intensity: 'medium' });
 *
 * @example
 * // Custom intensity with duration
 * await triggerHaptics({ customIntensity: 0.7, duration: 30 });
 *
 * @example
 * // Pattern (Android/Web only)
 * await triggerHaptics({ pattern: [100, 50, 100, 50, 100] });
 */
export interface HapticsOptions {
  /**
   * Preset intensity level (recommended for consistency across platforms).
   * Maps to platform-specific intensities:
   * - iOS: UIImpactFeedbackGenerator.light/medium/heavy
   * - Android: Amplitude 50/150/255
   * - Web: Duration 10/25/50ms (or gamepad magnitude 0.25/0.5/1.0)
   *
   * Optional when customIntensity or pattern is provided; defaults to 'medium'.
   */
  intensity?: 'light' | 'medium' | 'heavy';
  /**
   * Custom intensity (0-1) for fine-grained control.
   * If specified, takes precedence over intensity preset.
   * Note: iOS will round to nearest preset (light/medium/heavy).
   * @minimum 0
   * @maximum 1
   */
  customIntensity?: number;
  /**
   * Duration in milliseconds.
   * Note: iOS ignores this parameter (uses system default ~10ms).
   * @default Based on intensity (light=10, medium=25, heavy=50)
   */
  duration?: number;
  /**
   * Vibration pattern: [vibrate, pause, vibrate, pause, ...] in milliseconds.
   * When specified, overrides duration and intensity.
   * Note: Not supported on iOS. Android supports patterns.
   * Web: Uses Navigator.vibrate() pattern array.
   * Note: Pattern-based haptics do not trigger gamepad vibration.
   * @example [100, 50, 100] // vibrate 100ms, pause 50ms, vibrate 100ms
   */
  pattern?: number[];
  /**
   * Legacy type for backward compatibility with initial implementation.
   */
  type?: 'impact' | 'notification' | 'selection';
  /**
   * Legacy style for backward compatibility.
   */
  style?: 'light' | 'medium' | 'heavy';
}

export interface ControlHints {
  movement: string;
  action: string;
  camera: string;
}

export interface DeviceInfo {
  isMobile: boolean;
  platform: 'web' | 'ios' | 'android';
  model?: string;
  osVersion?: string;
}

export interface OrientationOptions {
  orientation:
    | 'any'
    | 'portrait'
    | 'landscape'
    | 'portrait-primary'
    | 'portrait-secondary'
    | 'landscape-primary'
    | 'landscape-secondary';
}

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PerformanceMode {
  enabled: boolean;
}

export interface TouchOptions {
  preventScrolling: boolean;
  preventZooming: boolean;
}

/**
 * Storage options for game save data.
 */
export interface StorageOptions {
  /**
   * Namespace prefix for all keys (e.g., 'mygame' -> 'strata:mygame:key').
   * Helps isolate game data from other localStorage usage.
   * @default 'strata'
   */
  namespace?: string;
}

/**
 * Result of a storage get operation.
 */
export interface StorageResult<T = unknown> {
  value: T | null;
  exists: boolean;
}

/**
 * Keys listing result.
 */
export interface StorageKeysResult {
  keys: string[];
}

export interface StrataPlugin {
  getDeviceProfile(): Promise<DeviceProfile>;
  getControlHints(): Promise<ControlHints>;
  getInputSnapshot(): Promise<InputSnapshot>;
  setInputMapping(mapping: Partial<InputMapping>): Promise<void>;
  /**
   * Triggers haptic feedback with unified API.
   *
   * @param options Haptics configuration
   * @returns Promise that resolves when haptic is triggered
   */
  triggerHaptics(options: HapticsOptions): Promise<void>;
  /**
   * Simple vibration method for basic haptic feedback.
   *
   * @param options Optional duration configuration
   * @returns Promise that resolves when vibration is triggered
   */
  vibrate(options?: { duration?: number }): Promise<void>;
  /**
   * Legacy haptics method for backward compatibility.
   */
  haptics(options: HapticsOptions): Promise<void>;
  /**
   * Get device information relevant to Strata 3D.
   */
  getDeviceInfo(): Promise<DeviceInfo>;
  /**
   * Lock or unlock screen orientation.
   */
  setScreenOrientation(options: OrientationOptions): Promise<void>;
  /**
   * Get safe area insets for the device.
   */
  getSafeAreaInsets(): Promise<SafeAreaInsets>;
  /**
   * Check if performance mode is enabled or suggest it.
   */
  getPerformanceMode(): Promise<PerformanceMode>;
  /**
   * Configure touch handling for games (e.g. prevent scrolling/zooming).
   */
  configureTouchHandling(options: TouchOptions): Promise<void>;

  // ============ Storage API ============

  /**
   * Save game data to persistent storage.
   * On web: Uses localStorage with optional namespace prefix.
   * On native: Uses native platform storage.
   *
   * @param key The key to store data under
   * @param value The value to store (will be JSON serialized)
   * @param options Optional storage configuration
   */
  setItem<T = unknown>(key: string, value: T, options?: StorageOptions): Promise<void>;

  /**
   * Retrieve game data from persistent storage.
   *
   * @param key The key to retrieve
   * @param options Optional storage configuration
   * @returns The stored value or null if not found
   */
  getItem<T = unknown>(key: string, options?: StorageOptions): Promise<StorageResult<T>>;

  /**
   * Remove a specific key from storage.
   *
   * @param key The key to remove
   * @param options Optional storage configuration
   */
  removeItem(key: string, options?: StorageOptions): Promise<void>;

  /**
   * List all keys in storage (within the namespace if specified).
   *
   * @param options Optional storage configuration
   * @returns Array of keys
   */
  keys(options?: StorageOptions): Promise<StorageKeysResult>;

  /**
   * Clear all storage (within the namespace if specified).
   *
   * @param options Optional storage configuration
   */
  clear(options?: StorageOptions): Promise<void>;

  /**
   * Select which controller to use for input (iOS only, 0-based index).
   * Use getConnectedControllers() to see available controllers.
   *
   * @param options Object with index property
   * @returns Object with success status and selected controller info
   */
  selectController(options: { index: number }): Promise<{
    success: boolean;
    selectedIndex?: number;
    controllerId?: string;
    error?: string;
  }>;
  /**
   * Get list of all connected game controllers (iOS only).
   *
   * @returns Object with array of controllers and selected index
   */
  getConnectedControllers(): Promise<{
    controllers: Array<{
      index: number;
      id: string;
      isSelected: boolean;
      hasExtendedGamepad: boolean;
      hasMicroGamepad: boolean;
    }>;
    selectedIndex: number;
  }>;
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

export const DEFAULT_INPUT_MAPPING: InputMapping = {
  moveForward: ['KeyW', 'ArrowUp'],
  moveBackward: ['KeyS', 'ArrowDown'],
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  jump: ['Space'],
  action: ['KeyE', 'Enter'],
  cancel: ['Escape'],
};
