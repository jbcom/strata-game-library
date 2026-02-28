import { describe, expect, it } from 'vitest';
import type { StrataPlatformAdapter } from '../src/contract.js';
import type {
  ControlHints,
  DeviceProfile,
  HapticsOptions,
  InputMapping,
  InputSnapshot,
} from '../src/contract.js';

describe('contract', () => {
  describe('StrataPlatformAdapter interface', () => {
    it('should allow creating a mock adapter that satisfies the interface', () => {
      const mockAdapter: StrataPlatformAdapter = {
        getDeviceProfile: async (): Promise<DeviceProfile> => ({
          deviceType: 'desktop',
          platform: 'web',
          inputMode: 'keyboard',
          orientation: 'landscape',
          hasTouch: false,
          hasPointer: true,
          hasGamepad: false,
          isMobile: false,
          isTablet: false,
          isFoldable: false,
          isDesktop: true,
          screenWidth: 1920,
          screenHeight: 1080,
          pixelRatio: 1,
          safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
        }),
        getInputSnapshot: async (): Promise<InputSnapshot> => ({
          timestamp: 0,
          leftStick: { x: 0, y: 0 },
          rightStick: { x: 0, y: 0 },
          buttons: {},
          triggers: { left: 0, right: 0 },
          touches: [],
        }),
        setInputMapping: async (_mapping: Partial<InputMapping>): Promise<void> => {},
        triggerHaptics: async (_options: HapticsOptions): Promise<void> => {},
        vibrate: async (_options?: { duration?: number }): Promise<void> => {},
        getControlHints: async (): Promise<ControlHints> => ({
          movement: 'WASD',
          action: 'Click',
          camera: 'Mouse',
        }),
        addListener: async (
          _eventName: string,
          _callback: (data: any) => void,
        ): Promise<{ remove: () => Promise<void> }> => ({
          remove: async () => {},
        }),
      };

      expect(mockAdapter.getDeviceProfile).toBeDefined();
      expect(mockAdapter.getInputSnapshot).toBeDefined();
      expect(mockAdapter.setInputMapping).toBeDefined();
      expect(mockAdapter.triggerHaptics).toBeDefined();
      expect(mockAdapter.vibrate).toBeDefined();
      expect(mockAdapter.getControlHints).toBeDefined();
      expect(mockAdapter.addListener).toBeDefined();
    });

    it('should return expected DeviceProfile from mock adapter', async () => {
      const mockAdapter: StrataPlatformAdapter = {
        getDeviceProfile: async () => ({
          deviceType: 'mobile',
          platform: 'ios',
          inputMode: 'touch',
          orientation: 'portrait',
          hasTouch: true,
          hasPointer: false,
          hasGamepad: false,
          isMobile: true,
          isTablet: false,
          isFoldable: false,
          isDesktop: false,
          screenWidth: 390,
          screenHeight: 844,
          pixelRatio: 3,
          safeAreaInsets: { top: 47, right: 0, bottom: 34, left: 0 },
        }),
        getInputSnapshot: async () => ({
          timestamp: 0,
          leftStick: { x: 0, y: 0 },
          rightStick: { x: 0, y: 0 },
          buttons: {},
          triggers: { left: 0, right: 0 },
          touches: [],
        }),
        setInputMapping: async () => {},
        triggerHaptics: async () => {},
        vibrate: async () => {},
        getControlHints: async () => ({
          movement: 'Drag',
          action: 'Tap',
          camera: 'Pinch',
        }),
        addListener: async () => ({ remove: async () => {} }),
      };

      const profile = await mockAdapter.getDeviceProfile();
      expect(profile.isMobile).toBe(true);
      expect(profile.platform).toBe('ios');
      expect(profile.safeAreaInsets.top).toBe(47);
    });

    it('should return a removable listener handle', async () => {
      let listenerAdded = false;
      let listenerRemoved = false;

      const mockAdapter: StrataPlatformAdapter = {
        getDeviceProfile: async () => ({} as DeviceProfile),
        getInputSnapshot: async () => ({} as InputSnapshot),
        setInputMapping: async () => {},
        triggerHaptics: async () => {},
        vibrate: async () => {},
        getControlHints: async () => ({} as ControlHints),
        addListener: async (_eventName, _callback) => {
          listenerAdded = true;
          return {
            remove: async () => {
              listenerRemoved = true;
            },
          };
        },
      };

      const handle = await mockAdapter.addListener('deviceChange', () => {});
      expect(listenerAdded).toBe(true);
      expect(listenerRemoved).toBe(false);

      await handle.remove();
      expect(listenerRemoved).toBe(true);
    });
  });

  describe('re-exported types', () => {
    it('should re-export ControlHints type', () => {
      const hints: ControlHints = {
        movement: 'WASD',
        action: 'E',
        camera: 'Mouse',
      };
      expect(hints.movement).toBe('WASD');
    });

    it('should re-export DeviceProfile type', () => {
      const profile: DeviceProfile = {
        deviceType: 'tablet',
        platform: 'android',
        inputMode: 'touch',
        orientation: 'portrait',
        hasTouch: true,
        hasPointer: false,
        hasGamepad: false,
        isMobile: false,
        isTablet: true,
        isFoldable: false,
        isDesktop: false,
        screenWidth: 768,
        screenHeight: 1024,
        pixelRatio: 2,
        safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
      };
      expect(profile.isTablet).toBe(true);
    });

    it('should re-export HapticsOptions type', () => {
      const opts: HapticsOptions = { intensity: 'light' };
      expect(opts.intensity).toBe('light');
    });

    it('should re-export InputMapping type', () => {
      const mapping: InputMapping = {
        moveForward: ['W'],
        moveBackward: ['S'],
        moveLeft: ['A'],
        moveRight: ['D'],
        jump: ['Space'],
        action: ['E'],
        cancel: ['Escape'],
      };
      expect(mapping.jump).toEqual(['Space']);
    });

    it('should re-export InputSnapshot type', () => {
      const snapshot: InputSnapshot = {
        timestamp: 100,
        leftStick: { x: 0, y: 0 },
        rightStick: { x: 0, y: 0 },
        buttons: {},
        triggers: { left: 0, right: 0 },
        touches: [],
      };
      expect(snapshot.timestamp).toBe(100);
    });
  });
});
