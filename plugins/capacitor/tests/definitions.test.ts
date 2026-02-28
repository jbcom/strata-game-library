import { describe, expect, it } from 'vitest';
import { DEFAULT_INPUT_MAPPING } from '../src/definitions.js';
import type {
  ControlHints,
  DeviceInfo,
  DeviceProfile,
  DeviceType,
  HapticsOptions,
  InputMapping,
  InputMode,
  InputSnapshot,
  Orientation,
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
} from '../src/definitions.js';

describe('definitions', () => {
  describe('DEFAULT_INPUT_MAPPING', () => {
    it('should define moveForward keys', () => {
      expect(DEFAULT_INPUT_MAPPING.moveForward).toEqual(['KeyW', 'ArrowUp']);
    });

    it('should define moveBackward keys', () => {
      expect(DEFAULT_INPUT_MAPPING.moveBackward).toEqual(['KeyS', 'ArrowDown']);
    });

    it('should define moveLeft keys', () => {
      expect(DEFAULT_INPUT_MAPPING.moveLeft).toEqual(['KeyA', 'ArrowLeft']);
    });

    it('should define moveRight keys', () => {
      expect(DEFAULT_INPUT_MAPPING.moveRight).toEqual(['KeyD', 'ArrowRight']);
    });

    it('should define jump keys', () => {
      expect(DEFAULT_INPUT_MAPPING.jump).toEqual(['Space']);
    });

    it('should define action keys', () => {
      expect(DEFAULT_INPUT_MAPPING.action).toEqual(['KeyE', 'Enter']);
    });

    it('should define cancel keys', () => {
      expect(DEFAULT_INPUT_MAPPING.cancel).toEqual(['Escape']);
    });

    it('should have all required InputMapping fields', () => {
      const requiredKeys: (keyof InputMapping)[] = [
        'moveForward',
        'moveBackward',
        'moveLeft',
        'moveRight',
        'jump',
        'action',
        'cancel',
      ];
      for (const key of requiredKeys) {
        expect(DEFAULT_INPUT_MAPPING).toHaveProperty(key);
        expect(Array.isArray(DEFAULT_INPUT_MAPPING[key])).toBe(true);
        expect(DEFAULT_INPUT_MAPPING[key].length).toBeGreaterThan(0);
      }
    });
  });

  describe('type exports', () => {
    it('should allow constructing a valid DeviceProfile', () => {
      const profile: DeviceProfile = {
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
      };
      expect(profile.deviceType).toBe('desktop');
      expect(profile.isDesktop).toBe(true);
    });

    it('should allow constructing a valid InputSnapshot', () => {
      const snapshot: InputSnapshot = {
        timestamp: 1234,
        leftStick: { x: 0, y: 0 },
        rightStick: { x: 0.5, y: -0.5 },
        buttons: { jump: true, action: false },
        triggers: { left: 0.5, right: 1.0 },
        touches: [
          { id: 0, position: { x: 100, y: 200 }, phase: 'began' },
        ],
      };
      expect(snapshot.timestamp).toBe(1234);
      expect(snapshot.touches).toHaveLength(1);
      expect(snapshot.touches[0].phase).toBe('began');
    });

    it('should allow constructing a valid Vector2', () => {
      const vec: Vector2 = { x: 1.5, y: -2.3 };
      expect(vec.x).toBe(1.5);
      expect(vec.y).toBe(-2.3);
    });

    it('should allow constructing valid HapticsOptions with presets', () => {
      const opts: HapticsOptions = { intensity: 'heavy' };
      expect(opts.intensity).toBe('heavy');
    });

    it('should allow constructing HapticsOptions with customIntensity', () => {
      const opts: HapticsOptions = { customIntensity: 0.7, duration: 30 };
      expect(opts.customIntensity).toBe(0.7);
      expect(opts.duration).toBe(30);
    });

    it('should allow constructing HapticsOptions with pattern', () => {
      const opts: HapticsOptions = { pattern: [100, 50, 100, 50, 100] };
      expect(opts.pattern).toEqual([100, 50, 100, 50, 100]);
    });

    it('should allow constructing HapticsOptions with legacy fields', () => {
      const opts: HapticsOptions = { type: 'impact', style: 'heavy' };
      expect(opts.type).toBe('impact');
      expect(opts.style).toBe('heavy');
    });

    it('should allow constructing a valid DeviceInfo', () => {
      const info: DeviceInfo = {
        isMobile: true,
        platform: 'ios',
        model: 'iPhone 15',
        osVersion: '17.0',
      };
      expect(info.isMobile).toBe(true);
      expect(info.platform).toBe('ios');
    });

    it('should allow constructing a valid StorageResult', () => {
      const result: StorageResult<{ score: number }> = {
        value: { score: 100 },
        exists: true,
      };
      expect(result.exists).toBe(true);
      expect(result.value?.score).toBe(100);
    });

    it('should allow constructing a null StorageResult', () => {
      const result: StorageResult<string> = {
        value: null,
        exists: false,
      };
      expect(result.exists).toBe(false);
      expect(result.value).toBeNull();
    });

    it('should allow all DeviceType values', () => {
      const types: DeviceType[] = ['mobile', 'tablet', 'foldable', 'desktop'];
      expect(types).toHaveLength(4);
    });

    it('should allow all Platform values', () => {
      const platforms: Platform[] = ['ios', 'android', 'windows', 'macos', 'linux', 'web'];
      expect(platforms).toHaveLength(6);
    });

    it('should allow all InputMode values', () => {
      const modes: InputMode[] = ['touch', 'keyboard', 'gamepad', 'hybrid'];
      expect(modes).toHaveLength(4);
    });

    it('should allow all Orientation values', () => {
      const orientations: Orientation[] = ['portrait', 'landscape'];
      expect(orientations).toHaveLength(2);
    });

    it('should allow constructing valid ControlHints', () => {
      const hints: ControlHints = {
        movement: 'WASD to move',
        action: 'Click to interact',
        camera: 'Mouse to look',
      };
      expect(hints.movement).toBe('WASD to move');
    });

    it('should allow constructing valid StorageOptions', () => {
      const opts: StorageOptions = { namespace: 'mygame' };
      expect(opts.namespace).toBe('mygame');
    });

    it('should allow constructing valid StorageKeysResult', () => {
      const result: StorageKeysResult = { keys: ['save1', 'save2'] };
      expect(result.keys).toHaveLength(2);
    });

    it('should allow constructing valid OrientationOptions', () => {
      const opts: OrientationOptions = { orientation: 'landscape-primary' };
      expect(opts.orientation).toBe('landscape-primary');
    });

    it('should allow constructing valid PerformanceMode', () => {
      const mode: PerformanceMode = { enabled: true };
      expect(mode.enabled).toBe(true);
    });

    it('should allow constructing valid TouchOptions', () => {
      const opts: TouchOptions = { preventScrolling: true, preventZooming: false };
      expect(opts.preventScrolling).toBe(true);
      expect(opts.preventZooming).toBe(false);
    });
  });
});
