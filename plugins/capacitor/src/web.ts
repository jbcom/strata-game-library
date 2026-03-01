/**
 * Web implementation of the Strata Capacitor plugin.
 *
 * Provides browser-based fallbacks for all native platform capabilities
 * including device detection via user agent and media queries, keyboard/gamepad/touch
 * input polling, Web Vibration API haptics, gamepad rumble via the Haptic Actuator API,
 * localStorage-based game save persistence, and screen orientation lock.
 *
 * @module CapacitorWeb
 * @category Player Experience
 */

import { WebPlugin } from '@capacitor/core';
import type { StrataPlatformAdapter } from './contract.js';
import type {
  ControlHints,
  DeviceInfo,
  DeviceProfile,
  DeviceType,
  HapticsOptions,
  InputMapping,
  InputMode,
  InputSnapshot,
  OrientationOptions,
  PerformanceMode,
  Platform,
  SafeAreaInsets,
  StorageKeysResult,
  StorageOptions,
  StorageResult,
  StrataPlugin,
  TouchOptions,
  Vector2,
} from './definitions.js';
import { DEFAULT_INPUT_MAPPING as DEFAULT_MAPPING } from './definitions.js';

type ListenerCallback<T> = (data: T) => void;

/**
 * TypeScript interface for the experimental Gamepad Haptic Actuator API.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/GamepadHapticActuator
 */
export class StrataWeb extends WebPlugin implements StrataPlugin, StrataPlatformAdapter {
  private inputMapping: InputMapping = { ...DEFAULT_MAPPING };
  private pressedKeys = new Set<string>();
  private gamepads: (Gamepad | null)[] = [];
  private touches: Map<
    number,
    { position: Vector2; phase: 'began' | 'moved' | 'ended' | 'cancelled' }
  > = new Map();
  private deviceListeners: ListenerCallback<DeviceProfile>[] = [];
  private inputListeners: ListenerCallback<InputSnapshot>[] = [];
  private gamepadConnectedListeners: ListenerCallback<{ index: number; id: string }>[] = [];
  private gamepadDisconnectedListeners: ListenerCallback<{ index: number }>[] = [];
  private animationFrameId: number | null = null;
  private lastInputSnapshot: InputSnapshot | null = null;
  private orientationMediaQuery: MediaQueryList | null = null;

  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('gamepadconnected', this.handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
    window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this.handleTouchCancel, { passive: true });
    window.addEventListener('resize', this.handleResize);
    this.orientationMediaQuery = window.matchMedia?.('(orientation: portrait)');
    if (this.orientationMediaQuery) {
      this.orientationMediaQuery.addEventListener('change', this.handleOrientationChange);
    }

    this.startInputLoop();
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    this.pressedKeys.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.pressedKeys.delete(e.code);
  };

  private handleGamepadConnected = (e: GamepadEvent): void => {
    this.gamepads[e.gamepad.index] = e.gamepad;
    this.gamepadConnectedListeners.forEach((cb) => {
      cb({ index: e.gamepad.index, id: e.gamepad.id });
    });
    this.notifyDeviceChange();
  };

  private handleGamepadDisconnected = (e: GamepadEvent): void => {
    this.gamepads[e.gamepad.index] = null;
    this.gamepadDisconnectedListeners.forEach((cb) => {
      cb({ index: e.gamepad.index });
    });
    this.notifyDeviceChange();
  };

  private handleTouchStart = (e: TouchEvent): void => {
    for (const touch of Array.from(e.changedTouches)) {
      this.touches.set(touch.identifier, {
        position: { x: touch.clientX, y: touch.clientY },
        phase: 'began',
      });
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    for (const touch of Array.from(e.changedTouches)) {
      const existing = this.touches.get(touch.identifier);
      if (existing) {
        existing.position = { x: touch.clientX, y: touch.clientY };
        existing.phase = 'moved';
      }
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    const touchIds: number[] = [];
    for (const touch of Array.from(e.changedTouches)) {
      touchIds.push(touch.identifier);
      const existing = this.touches.get(touch.identifier);
      if (existing) {
        existing.phase = 'ended';
      }
    }
    setTimeout(() => {
      for (const id of touchIds) {
        this.touches.delete(id);
      }
    }, 16);
  };

  private handleTouchCancel = (e: TouchEvent): void => {
    for (const touch of Array.from(e.changedTouches)) {
      this.touches.delete(touch.identifier);
    }
  };

  private handleResize = (): void => {
    this.notifyDeviceChange();
  };

  private handleOrientationChange = (): void => {
    this.notifyDeviceChange();
  };

  private notifyDeviceChange(): void {
    this.getDeviceProfile().then((profile) => {
      this.deviceListeners.forEach((cb) => {
        cb(profile);
      });
    });
  }

  private startInputLoop(): void {
    const loop = (): void => {
      this.gamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];

      if (this.inputListeners.length > 0) {
        this.getInputSnapshot().then((snapshot) => {
          if (this.hasInputChanged(snapshot)) {
            this.lastInputSnapshot = snapshot;
            this.inputListeners.forEach((cb) => {
              cb(snapshot);
            });
          }
        });
      }

      if (this.inputListeners.length === 0 && this.deviceListeners.length === 0) {
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
        return;
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  private hasInputChanged(current: InputSnapshot): boolean {
    if (!this.lastInputSnapshot) return true;
    const last = this.lastInputSnapshot;

    if (current.leftStick.x !== last.leftStick.x || current.leftStick.y !== last.leftStick.y)
      return true;
    if (current.rightStick.x !== last.rightStick.x || current.rightStick.y !== last.rightStick.y)
      return true;

    if (
      current.triggers.left !== last.triggers.left ||
      current.triggers.right !== last.triggers.right
    )
      return true;

    const currentButtons = Object.keys(current.buttons);
    const lastButtons = Object.keys(last.buttons);
    if (currentButtons.length !== lastButtons.length) return true;
    for (const key of currentButtons) {
      if (current.buttons[key] !== last.buttons[key]) return true;
    }

    if (current.touches.length !== last.touches.length) return true;
    for (let i = 0; i < current.touches.length; i++) {
      const currTouch = current.touches[i];
      const lastTouch = last.touches.find((t) => t.id === currTouch.id);
      if (!lastTouch) return true;
      if (currTouch.phase !== lastTouch.phase) return true;
      if (
        currTouch.position.x !== lastTouch.position.x ||
        currTouch.position.y !== lastTouch.position.y
      )
        return true;
    }

    return false;
  }

  private detectPlatform(): Platform {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    if (/windows/.test(ua)) return 'windows';
    if (/macintosh|mac os x/.test(ua)) return 'macos';
    if (/linux/.test(ua)) return 'linux';
    return 'web';
  }

  private detectDeviceType(): DeviceType {
    const width = window.innerWidth;
    const hasTouch = this.hasTouch();

    if (width <= 480) return 'mobile';
    if (width <= 768) return hasTouch ? 'mobile' : 'desktop';
    if (width <= 1024) {
      if (hasTouch) {
        const ratio = window.innerWidth / window.innerHeight;
        if (ratio > 1.8 || ratio < 0.6) return 'foldable';
        return 'tablet';
      }
      return 'desktop';
    }
    return 'desktop';
  }

  private detectInputMode(): InputMode {
    const hasGamepad = this.gamepads.some((gp) => gp !== null);
    const hasTouch = this.hasTouch();

    if (hasGamepad && hasTouch) return 'hybrid';
    if (hasGamepad) return 'gamepad';
    if (hasTouch && window.innerWidth <= 1024) return 'touch';
    return 'keyboard';
  }

  private hasTouch(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia?.('(pointer: coarse)').matches ?? false)
    );
  }

  private hasPointer(): boolean {
    return window.matchMedia?.('(pointer: fine)').matches ?? false;
  }

  async getDeviceProfile(): Promise<DeviceProfile> {
    const deviceType = this.detectDeviceType();
    const platform = this.detectPlatform();
    const inputMode = this.detectInputMode();
    const hasTouch = this.hasTouch();
    const hasPointer = this.hasPointer();
    const hasGamepad = this.gamepads.some((gp) => gp !== null);

    return {
      deviceType,
      platform,
      inputMode,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      hasTouch,
      hasPointer,
      hasGamepad,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isFoldable: deviceType === 'foldable',
      isDesktop: deviceType === 'desktop',
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      safeAreaInsets: await this.getSafeAreaInsets(),
    };
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    const profile = await this.getDeviceProfile();
    return {
      isMobile: profile.isMobile,
      platform: 'web', // Always web for StrataWeb
    };
  }

  async getSafeAreaInsets(): Promise<SafeAreaInsets> {
    if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 };
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--sat') || '0', 10) || 0,
      right: parseInt(style.getPropertyValue('--sar') || '0', 10) || 0,
      bottom: parseInt(style.getPropertyValue('--sab') || '0', 10) || 0,
      left: parseInt(style.getPropertyValue('--sal') || '0', 10) || 0,
    };
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
      default:
        return {
          movement: 'WASD to move',
          action: 'Click to interact',
          camera: 'Mouse to look',
        };
    }
  }

  private isKeyPressed(keys: string[]): boolean {
    return keys.some((key) => this.pressedKeys.has(key));
  }

  async getInputSnapshot(): Promise<InputSnapshot> {
    const leftStick: Vector2 = { x: 0, y: 0 };
    const rightStick: Vector2 = { x: 0, y: 0 };
    const buttons: Record<string, boolean> = {};
    const triggers = { left: 0, right: 0 };

    if (this.isKeyPressed(this.inputMapping.moveForward)) leftStick.y = -1;
    if (this.isKeyPressed(this.inputMapping.moveBackward)) leftStick.y = 1;
    if (this.isKeyPressed(this.inputMapping.moveLeft)) leftStick.x = -1;
    if (this.isKeyPressed(this.inputMapping.moveRight)) leftStick.x = 1;

    buttons.jump = this.isKeyPressed(this.inputMapping.jump);
    buttons.action = this.isKeyPressed(this.inputMapping.action);
    buttons.cancel = this.isKeyPressed(this.inputMapping.cancel);

    const gamepad = this.gamepads.find((gp) => gp !== null);
    if (gamepad) {
      const deadzone = 0.15;

      if (Math.abs(gamepad.axes[0]) > deadzone) leftStick.x = gamepad.axes[0];
      if (Math.abs(gamepad.axes[1]) > deadzone) leftStick.y = -gamepad.axes[1];

      if (gamepad.axes.length > 2 && Math.abs(gamepad.axes[2]) > deadzone)
        rightStick.x = gamepad.axes[2];
      if (gamepad.axes.length > 3 && Math.abs(gamepad.axes[3]) > deadzone)
        rightStick.y = -gamepad.axes[3];

      buttons.jump = buttons.jump || (gamepad.buttons[0]?.pressed ?? false);
      buttons.action = buttons.action || (gamepad.buttons[1]?.pressed ?? false);
      buttons.cancel = buttons.cancel || (gamepad.buttons[2]?.pressed ?? false);

      if (gamepad.buttons.length > 6) triggers.left = gamepad.buttons[6].value;
      if (gamepad.buttons.length > 7) triggers.right = gamepad.buttons[7].value;
    }

    const touchArray = Array.from(this.touches.entries()).map(([id, data]) => ({
      id,
      position: data.position,
      phase: data.phase,
    }));

    return {
      timestamp: performance.now(),
      leftStick,
      rightStick,
      buttons,
      triggers,
      touches: touchArray,
    };
  }

  async setInputMapping(mapping: Partial<InputMapping>): Promise<void> {
    this.inputMapping = { ...this.inputMapping, ...mapping };
  }

  async haptics(options: HapticsOptions): Promise<void> {
    // Legacy haptics mapping
    if (options.type) {
      if (options.type === 'impact') {
        options.intensity = options.style || 'medium';
      } else if (options.type === 'notification') {
        options.pattern = [100, 30, 100];
      } else if (options.type === 'selection') {
        options.intensity = 'light';
        options.duration = 10;
      }
    }
    return this.triggerHaptics(options);
  }

  async triggerHaptics(options: HapticsOptions): Promise<void> {
    if (options.pattern && 'vibrate' in navigator) {
      navigator.vibrate(options.pattern);
      return;
    }

    let intensity: 'light' | 'medium' | 'heavy';
    let customMagnitude: number | undefined;

    if (options.customIntensity !== undefined) {
      const clampedIntensity = Math.max(0, Math.min(1, options.customIntensity));

      if (clampedIntensity < 0.33) {
        intensity = 'light';
      } else if (clampedIntensity < 0.66) {
        intensity = 'medium';
      } else {
        intensity = 'heavy';
      }

      customMagnitude = clampedIntensity;
    } else {
      intensity = options.intensity ?? 'medium';
    }

    if ('vibrate' in navigator) {
      const durations = { light: 10, medium: 25, heavy: 50 };
      navigator.vibrate(options.duration ?? durations[intensity]);
    }

    const gamepad = this.gamepads.find((gp) => gp !== null && 'vibrationActuator' in gp) as any;
    if (gamepad?.vibrationActuator) {
      const magnitudes = { light: 0.25, medium: 0.5, heavy: 1.0 };
      const magnitude = customMagnitude ?? magnitudes[intensity];
      try {
        await gamepad.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: options.duration ?? 100,
          weakMagnitude: magnitude,
          strongMagnitude: magnitude,
        });
      } catch {
        // Gamepad haptics not supported
      }
    }
  }

  async vibrate(options?: { duration?: number }): Promise<void> {
    await this.triggerHaptics({ duration: options?.duration });
  }

  async selectController(options: { index: number }): Promise<{
    success: boolean;
    selectedIndex?: number;
    controllerId?: string;
    error?: string;
  }> {
    return {
      success: true,
      selectedIndex: options.index,
      controllerId: 'Web Gamepad API',
    };
  }

  async getConnectedControllers(): Promise<{
    controllers: Array<{
      index: number;
      id: string;
      isSelected: boolean;
      hasExtendedGamepad: boolean;
      hasMicroGamepad: boolean;
    }>;
    selectedIndex: number;
  }> {
    const controllers = this.gamepads
      .map((gp, index) => {
        if (!gp) return null;
        return {
          index,
          id: gp.id,
          isSelected: index === 0,
          hasExtendedGamepad: true,
          hasMicroGamepad: false,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    return {
      controllers,
      selectedIndex: 0,
    };
  }

  async setScreenOrientation(options: OrientationOptions): Promise<void> {
    const orientation = screen.orientation as any;
    if (orientation?.lock) {
      try {
        await orientation.lock(options.orientation);
      } catch (e) {
        console.warn('Orientation lock failed:', e);
      }
    }
  }

  async getPerformanceMode(): Promise<PerformanceMode> {
    return {
      enabled: false,
    };
  }

  async configureTouchHandling(options: TouchOptions): Promise<void> {
    if (options.preventScrolling) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      let content = viewport.getAttribute('content') || '';
      if (options.preventZooming) {
        if (!content.includes('user-scalable=no')) {
          const cleanContent = content.trim().endsWith(',')
            ? content.trim()
            : content.trim()
              ? `${content.trim()},`
              : '';
          viewport.setAttribute('content', `${cleanContent} user-scalable=no`);
        }
      } else {
        if (content.includes('user-scalable=no')) {
          content = content
            .replace(/,\s*user-scalable=no/g, '')
            .replace(/user-scalable=no,\s*/g, '')
            .replace(/user-scalable=no/g, '');
          viewport.setAttribute('content', content.trim());
        }
      }
    }
  }

  // ============ Storage API Implementation ============

  private getStorageKey(key: string, options?: StorageOptions): string {
    const namespace = options?.namespace || 'strata';
    return `${namespace}:${key}`;
  }

  async setItem<T = unknown>(key: string, value: T, options?: StorageOptions): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const storageKey = this.getStorageKey(key, options);
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (e) {
      console.warn('Strata: Failed to save to localStorage', { key: storageKey, error: e });
      throw e;
    }
  }

  async getItem<T = unknown>(key: string, options?: StorageOptions): Promise<StorageResult<T>> {
    if (typeof localStorage === 'undefined') {
      return { value: null, exists: false };
    }
    const storageKey = this.getStorageKey(key, options);
    const raw = localStorage.getItem(storageKey);
    if (raw === null) {
      return { value: null, exists: false };
    }
    try {
      return { value: JSON.parse(raw) as T, exists: true };
    } catch {
      return { value: null, exists: true };
    }
  }

  async removeItem(key: string, options?: StorageOptions): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const storageKey = this.getStorageKey(key, options);
    localStorage.removeItem(storageKey);
  }

  async keys(options?: StorageOptions): Promise<StorageKeysResult> {
    if (typeof localStorage === 'undefined') {
      return { keys: [] };
    }
    const namespace = options?.namespace || 'strata';
    const prefix = `${namespace}:`;
    const result: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        result.push(key.slice(prefix.length));
      }
    }
    return { keys: result };
  }

  async clear(options?: StorageOptions): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const namespace = options?.namespace || 'strata';
    const prefix = `${namespace}:`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }

  override addListener(
    eventName: 'deviceChange',
    callback: (profile: DeviceProfile) => void
  ): Promise<{ remove: () => Promise<void> }>;
  override addListener(
    eventName: 'inputChange',
    callback: (snapshot: InputSnapshot) => void
  ): Promise<{ remove: () => Promise<void> }>;
  override addListener(
    eventName: 'gamepadConnected',
    callback: (info: { index: number; id: string }) => void
  ): Promise<{ remove: () => Promise<void> }>;
  override addListener(
    eventName: 'gamepadDisconnected',
    callback: (info: { index: number }) => void
  ): Promise<{ remove: () => Promise<void> }>;
  override async addListener(
    eventName: 'deviceChange' | 'inputChange' | 'gamepadConnected' | 'gamepadDisconnected',
    callback: (data: any) => void
  ): Promise<{ remove: () => Promise<void> }> {
    const removeFromArray = <T>(arr: T[], item: T): void => {
      const idx = arr.indexOf(item);
      if (idx !== -1) {
        arr.splice(idx, 1);
      }
    };

    switch (eventName) {
      case 'deviceChange':
        this.deviceListeners.push(callback);
        return { remove: async () => removeFromArray(this.deviceListeners, callback) };
      case 'inputChange':
        this.inputListeners.push(callback);
        return { remove: async () => removeFromArray(this.inputListeners, callback) };
      case 'gamepadConnected':
        this.gamepadConnectedListeners.push(callback);
        return {
          remove: async () => removeFromArray(this.gamepadConnectedListeners, callback),
        };
      case 'gamepadDisconnected':
        this.gamepadDisconnectedListeners.push(callback);
        return {
          remove: async () => removeFromArray(this.gamepadDisconnectedListeners, callback),
        };
    }
  }

  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('touchcancel', this.handleTouchCancel);
    window.removeEventListener('resize', this.handleResize);

    if (this.orientationMediaQuery) {
      this.orientationMediaQuery.removeEventListener('change', this.handleOrientationChange);
      this.orientationMediaQuery = null;
    }

    this.deviceListeners = [];
    this.inputListeners = [];
    this.gamepadConnectedListeners = [];
    this.gamepadDisconnectedListeners = [];
  }
}
