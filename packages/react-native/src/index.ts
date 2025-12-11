/**
 * Strata React Native Plugin
 * 
 * Cross-platform device detection, input handling, and haptic feedback
 * for React Native applications.
 * 
 * @module @strata/react-native
 * 
 * @example
 * ```tsx
 * // Using the unified Strata API (same as Capacitor)
 * import { Strata } from '@strata/react-native';
 * 
 * const profile = await Strata.getDeviceProfile();
 * Strata.addListener('deviceChange', (profile) => {
 *   console.log('Device changed:', profile);
 * });
 * 
 * // Using React hooks
 * import { 
 *   DeviceProvider, 
 *   InputProvider, 
 *   useDevice, 
 *   useInput, 
 *   useHaptics 
 * } from '@strata/react-native';
 * 
 * function App() {
 *   return (
 *     <DeviceProvider>
 *       <InputProvider>
 *         <Game />
 *       </InputProvider>
 *     </DeviceProvider>
 *   );
 * }
 * 
 * function Game() {
 *   const device = useDevice();
 *   const { leftStick, isPressed } = useInput();
 *   const haptics = useHaptics();
 *   
 *   // Use device info, input, and haptics...
 * }
 * ```
 */

// Adapter (main API - Capacitor-compatible)
export { Strata } from './adapter';
export type { StrataPlatformAdapter } from './adapter';

// Types
export type {
  InputMode,
  DeviceType,
  Platform,
  Orientation,
  DeviceProfile,
  Vector2,
  TouchPhase,
  TouchPoint,
  InputSnapshot,
  InputMapping,
  HapticsOptions,
  HapticPattern,
  TriggerHapticOptions,
  ControlHint,
  ControlHints,
} from './types';

export {
  DEFAULT_INPUT_MAPPING,
  DEFAULT_DEVICE_PROFILE,
  DEFAULT_INPUT_SNAPSHOT,
} from './types';

// Modules
export { DeviceModule } from './DeviceModule';
export { InputModule } from './InputModule';
export { HapticsModule } from './HapticsModule';

// Hooks
export {
  useDevice,
  DeviceProvider,
  DeviceContext,
  useInput,
  InputProvider,
  InputContext,
  useHaptics,
  useControlHints,
} from './hooks';

export type {
  DeviceProviderProps,
  InputContextValue,
  InputProviderProps,
  UseHapticsResult,
  UseControlHintsResult,
  UseControlHintsOptions,
} from './hooks';
