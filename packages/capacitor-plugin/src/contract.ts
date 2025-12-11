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

  addListener(eventName: 'deviceChange', callback: (profile: DeviceProfile) => void): Promise<{ remove: () => void }>;
  addListener(eventName: 'inputChange', callback: (snapshot: InputSnapshot) => void): Promise<{ remove: () => void }>;
  addListener(eventName: 'gamepadConnected', callback: (info: { index: number; id: string }) => void): Promise<{ remove: () => void }>;
  addListener(eventName: 'gamepadDisconnected', callback: (info: { index: number }) => void): Promise<{ remove: () => void }>;
}

export type {
  DeviceProfile,
  InputSnapshot,
  InputMapping,
  HapticsOptions,
  ControlHints,
} from './definitions';
