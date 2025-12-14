import type {
  DeviceProfile,
  InputSnapshot,
  InputMapping,
  HapticsOptions,
  ControlHints,
} from './definitions';

export interface StrataPlatformAdapter {
  getDeviceProfile(): Promise<DeviceProfile>;

  getInputSnapshot(): Promise<InputSnapshot>;
  setInputMapping(mapping: Partial<InputMapping>): Promise<void>;

  triggerHaptics(options: HapticsOptions): Promise<void>;
  vibrate(options?: { duration?: number }): Promise<void>;

  getControlHints(): Promise<ControlHints>;

  addListener(eventName: 'deviceChange', callback: (profile: DeviceProfile) => void): Promise<{ remove: () => Promise<void> }>;
  addListener(eventName: 'inputChange', callback: (snapshot: InputSnapshot) => void): Promise<{ remove: () => Promise<void> }>;
  addListener(eventName: 'gamepadConnected', callback: (info: { index: number; id: string }) => void): Promise<{ remove: () => Promise<void> }>;
  addListener(eventName: 'gamepadDisconnected', callback: (info: { index: number }) => void): Promise<{ remove: () => Promise<void> }>;
}

export type {
  DeviceProfile,
  InputSnapshot,
  InputMapping,
  HapticsOptions,
  ControlHints,
} from './definitions';
