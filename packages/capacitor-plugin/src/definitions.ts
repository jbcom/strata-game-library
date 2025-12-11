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

export interface HapticsOptions {
  intensity: 'light' | 'medium' | 'heavy';
  duration?: number;
}

export interface HapticPattern {
  duration: number;
  intensity: number;
}

export interface TriggerHapticOptions {
  pattern?: HapticPattern;
}

export interface ControlHints {
  movement: string;
  action: string;
  camera: string;
}

export interface StrataPlugin {
  getDeviceProfile(): Promise<DeviceProfile>;
  getControlHints(): Promise<ControlHints>;
  getInputSnapshot(): Promise<InputSnapshot>;
  setInputMapping(mapping: Partial<InputMapping>): Promise<void>;
  triggerHaptics(options: HapticsOptions): Promise<void>;
  triggerHaptic(options: TriggerHapticOptions): Promise<void>;
  vibrate(options?: { duration?: number }): Promise<void>;
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

export const DEFAULT_INPUT_MAPPING: InputMapping = {
  moveForward: ['KeyW', 'ArrowUp'],
  moveBackward: ['KeyS', 'ArrowDown'],
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  jump: ['Space'],
  action: ['KeyE', 'Enter'],
  cancel: ['Escape'],
};
