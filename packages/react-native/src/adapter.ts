/**
 * Strata Platform Adapter for React Native.
 * Provides a Promise-based API with the same interface as the Capacitor plugin.
 * 
 * @module react-native/adapter
 */
import * as DeviceModule from './DeviceModule';
import * as InputModule from './InputModule';
import * as HapticsModule from './HapticsModule';
import type {
  DeviceProfile,
  InputSnapshot,
  InputMapping,
  HapticsOptions,
  TriggerHapticOptions,
  ControlHints,
} from './types';

type ListenerCallback<T> = (data: T) => void;

export interface StrataPlatformAdapter {
  getDeviceProfile(): Promise<DeviceProfile>;
  getInputSnapshot(): Promise<InputSnapshot>;
  setInputMapping(mapping: Partial<InputMapping>): Promise<void>;
  triggerHaptics(options: HapticsOptions): Promise<void>;
  triggerHaptic(options: TriggerHapticOptions): Promise<void>;
  vibrate(options?: { duration?: number }): Promise<void>;
  getControlHints(): Promise<ControlHints>;
  addListener(
    eventName: 'deviceChange',
    callback: (profile: DeviceProfile) => void
  ): Promise<{ remove: () => void }>;
  addListener(
    eventName: 'inputChange',
    callback: (snapshot: InputSnapshot) => void
  ): Promise<{ remove: () => void }>;
  addListener(
    eventName: 'gamepadConnected',
    callback: (info: { index: number; id: string }) => void
  ): Promise<{ remove: () => void }>;
  addListener(
    eventName: 'gamepadDisconnected',
    callback: (info: { index: number }) => void
  ): Promise<{ remove: () => void }>;
}

class StrataReactNativeAdapter implements StrataPlatformAdapter {
  private deviceListeners: ListenerCallback<DeviceProfile>[] = [];
  private inputListeners: ListenerCallback<InputSnapshot>[] = [];
  private gamepadConnectedListeners: ListenerCallback<{ index: number; id: string }>[] = [];
  private gamepadDisconnectedListeners: ListenerCallback<{ index: number }>[] = [];
  private deviceSubscription: { remove: () => void } | null = null;
  private inputSubscription: { remove: () => void } | null = null;
  private gamepadConnectedSubscription: { remove: () => void } | null = null;
  private gamepadDisconnectedSubscription: { remove: () => void } | null = null;

  constructor() {
    this.setupModuleListeners();
  }

  private setupModuleListeners(): void {
    this.deviceSubscription = DeviceModule.addListener((profile) => {
      this.deviceListeners.forEach(cb => {
        try {
          cb(profile);
        } catch (error) {
          console.warn('StrataAdapter: Error in deviceChange callback:', error);
        }
      });
    });

    this.inputSubscription = InputModule.addInputListener((snapshot) => {
      this.inputListeners.forEach(cb => {
        try {
          cb(snapshot);
        } catch (error) {
          console.warn('StrataAdapter: Error in inputChange callback:', error);
        }
      });
    });

    this.gamepadConnectedSubscription = InputModule.addGamepadConnectedListener((info) => {
      this.gamepadConnectedListeners.forEach(cb => {
        try {
          cb(info as { index: number; id: string });
        } catch (error) {
          console.warn('StrataAdapter: Error in gamepadConnected callback:', error);
        }
      });
    });

    this.gamepadDisconnectedSubscription = InputModule.addGamepadDisconnectedListener((info) => {
      this.gamepadDisconnectedListeners.forEach(cb => {
        try {
          cb(info);
        } catch (error) {
          console.warn('StrataAdapter: Error in gamepadDisconnected callback:', error);
        }
      });
    });
  }

  async getDeviceProfile(): Promise<DeviceProfile> {
    return DeviceModule.getDeviceProfile();
  }

  async getInputSnapshot(): Promise<InputSnapshot> {
    return InputModule.getInputSnapshot();
  }

  async setInputMapping(mapping: Partial<InputMapping>): Promise<void> {
    return InputModule.setInputMapping(mapping);
  }

  async triggerHaptics(options: HapticsOptions): Promise<void> {
    return HapticsModule.triggerHaptics(options);
  }

  async triggerHaptic(options: TriggerHapticOptions): Promise<void> {
    return HapticsModule.triggerHaptic(options);
  }

  async vibrate(options?: { duration?: number }): Promise<void> {
    return HapticsModule.vibrate(options?.duration);
  }

  async getControlHints(): Promise<ControlHints> {
    const profile = await this.getDeviceProfile();

    switch (profile.inputMode) {
      case 'touch':
        return {
          movement: 'Drag to move',
          action: 'Tap to interact',
          camera: 'Pinch to zoom',
        };
      case 'gamepad':
        return {
          movement: 'Left stick to move',
          action: 'A / X to interact',
          camera: 'Right stick to look',
        };
      case 'hybrid':
        return {
          movement: 'Touch or stick to move',
          action: 'Tap or A to interact',
          camera: 'Swipe or right stick',
        };
      case 'keyboard':
      default:
        return {
          movement: 'WASD to move',
          action: 'Click to interact',
          camera: 'Mouse to look',
        };
    }
  }

  async addListener(
    eventName: 'deviceChange' | 'inputChange' | 'gamepadConnected' | 'gamepadDisconnected',
    callback: ListenerCallback<any>
  ): Promise<{ remove: () => void }> {
    const removeFromArray = <T>(arr: T[], item: T): void => {
      const idx = arr.indexOf(item);
      if (idx !== -1) {
        arr.splice(idx, 1);
      }
    };

    switch (eventName) {
      case 'deviceChange':
        this.deviceListeners.push(callback);
        return { remove: () => removeFromArray(this.deviceListeners, callback) };
      case 'inputChange':
        this.inputListeners.push(callback);
        return { remove: () => removeFromArray(this.inputListeners, callback) };
      case 'gamepadConnected':
        this.gamepadConnectedListeners.push(callback);
        return { remove: () => removeFromArray(this.gamepadConnectedListeners, callback) };
      case 'gamepadDisconnected':
        this.gamepadDisconnectedListeners.push(callback);
        return { remove: () => removeFromArray(this.gamepadDisconnectedListeners, callback) };
    }
  }

  destroy(): void {
    if (this.deviceSubscription) {
      this.deviceSubscription.remove();
      this.deviceSubscription = null;
    }
    if (this.inputSubscription) {
      this.inputSubscription.remove();
      this.inputSubscription = null;
    }
    if (this.gamepadConnectedSubscription) {
      this.gamepadConnectedSubscription.remove();
      this.gamepadConnectedSubscription = null;
    }
    if (this.gamepadDisconnectedSubscription) {
      this.gamepadDisconnectedSubscription.remove();
      this.gamepadDisconnectedSubscription = null;
    }
    this.deviceListeners = [];
    this.inputListeners = [];
    this.gamepadConnectedListeners = [];
    this.gamepadDisconnectedListeners = [];
  }
}

export const Strata = new StrataReactNativeAdapter();

export type { StrataReactNativeAdapter };
