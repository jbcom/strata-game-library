import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StrataWeb } from '../src/web.js';

// Helper to create a mock matchMedia
function createMockMatchMedia(overrides: Record<string, boolean> = {}) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: overrides[query] ?? false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('StrataWeb', () => {
  let plugin: StrataWeb;

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMockMatchMedia(),
    });

    // Default window dimensions for desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: 1080,
    });
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: 1,
    });

    // Mock navigator.getGamepads
    Object.defineProperty(navigator, 'getGamepads', {
      writable: true,
      value: vi.fn().mockReturnValue([]),
      configurable: true,
    });

    // Mock performance.now
    vi.spyOn(performance, 'now').mockReturnValue(1000);

    plugin = new StrataWeb();
  });

  afterEach(() => {
    plugin.destroy();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // ============ Device Detection ============

  describe('getDeviceProfile', () => {
    it('should return a desktop profile by default', async () => {
      const profile = await plugin.getDeviceProfile();
      expect(profile.deviceType).toBe('desktop');
      expect(profile.isDesktop).toBe(true);
      expect(profile.isMobile).toBe(false);
      expect(profile.isTablet).toBe(false);
      expect(profile.isFoldable).toBe(false);
    });

    it('should report landscape orientation when width > height', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1920 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 1080 });
      const profile = await plugin.getDeviceProfile();
      expect(profile.orientation).toBe('landscape');
    });

    it('should report portrait orientation when height > width', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 390 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 844 });
      const profile = await plugin.getDeviceProfile();
      expect(profile.orientation).toBe('portrait');
    });

    it('should report screen dimensions and pixel ratio', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1440 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 900 });
      Object.defineProperty(window, 'devicePixelRatio', { writable: true, value: 2 });
      const profile = await plugin.getDeviceProfile();
      expect(profile.screenWidth).toBe(1440);
      expect(profile.screenHeight).toBe(900);
      expect(profile.pixelRatio).toBe(2);
    });

    it('should include safe area insets', async () => {
      const profile = await plugin.getDeviceProfile();
      expect(profile.safeAreaInsets).toEqual({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });
    });

    it('should report keyboard as default input mode', async () => {
      const profile = await plugin.getDeviceProfile();
      expect(profile.inputMode).toBe('keyboard');
    });

    it('should report hasTouch based on environment capabilities', async () => {
      const profile = await plugin.getDeviceProfile();
      // In jsdom, hasTouch may be true due to ontouchstart being defined.
      // We verify the property is a boolean and is consistent with detection logic.
      expect(typeof profile.hasTouch).toBe('boolean');
    });
  });

  describe('device type detection', () => {
    it('should detect mobile when width <= 480', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 812 });
      const profile = await plugin.getDeviceProfile();
      expect(profile.deviceType).toBe('mobile');
      expect(profile.isMobile).toBe(true);
    });

    it('should detect mobile when width 481-768 with touch', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 600 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 800 });
      Object.defineProperty(navigator, 'maxTouchPoints', { writable: true, value: 5, configurable: true });
      const profile = await plugin.getDeviceProfile();
      expect(profile.deviceType).toBe('mobile');
    });

    it('should detect mobile or desktop when width 481-768 based on touch capability', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 600 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 800 });
      const profile = await plugin.getDeviceProfile();
      // In jsdom, ontouchstart may be defined, making hasTouch() return true.
      // If touch is detected, device type is 'mobile'; otherwise 'desktop'.
      if (profile.hasTouch) {
        expect(profile.deviceType).toBe('mobile');
      } else {
        expect(profile.deviceType).toBe('desktop');
      }
    });

    it('should detect tablet when width 769-1024 with touch and normal ratio', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 });
      Object.defineProperty(navigator, 'maxTouchPoints', { writable: true, value: 5, configurable: true });
      const profile = await plugin.getDeviceProfile();
      expect(profile.deviceType).toBe('tablet');
      expect(profile.isTablet).toBe(true);
    });

    it('should detect foldable when width 769-1024 with touch and extreme ratio', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 400 });
      Object.defineProperty(navigator, 'maxTouchPoints', { writable: true, value: 5, configurable: true });
      const profile = await plugin.getDeviceProfile();
      // ratio = 1024/400 = 2.56, which is > 1.8
      expect(profile.deviceType).toBe('foldable');
      expect(profile.isFoldable).toBe(true);
    });

    it('should detect tablet or desktop when width 769-1024 based on touch capability', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 900 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 700 });
      const profile = await plugin.getDeviceProfile();
      // In jsdom, ontouchstart may be defined, making hasTouch() return true.
      // If touch is detected at this width range, device type is 'tablet'; otherwise 'desktop'.
      if (profile.hasTouch) {
        expect(profile.deviceType).toBe('tablet');
      } else {
        expect(profile.deviceType).toBe('desktop');
      }
    });

    it('should detect desktop when width > 1024', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1920 });
      const profile = await plugin.getDeviceProfile();
      expect(profile.deviceType).toBe('desktop');
    });
  });

  describe('platform detection', () => {
    it('should detect web platform by default (jsdom)', async () => {
      const profile = await plugin.getDeviceProfile();
      // jsdom's user agent contains "jsdom" which doesn't match specific platforms
      expect(['web', 'linux']).toContain(profile.platform);
    });

    it('should detect iOS from user agent', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        configurable: true,
      });
      const p = new StrataWeb();
      const profile = await p.getDeviceProfile();
      expect(profile.platform).toBe('ios');
      p.destroy();
    });

    it('should detect Android from user agent', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
        configurable: true,
      });
      const p = new StrataWeb();
      const profile = await p.getDeviceProfile();
      expect(profile.platform).toBe('android');
      p.destroy();
    });

    it('should detect Windows from user agent', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true,
      });
      const p = new StrataWeb();
      const profile = await p.getDeviceProfile();
      expect(profile.platform).toBe('windows');
      p.destroy();
    });

    it('should detect macOS from user agent', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        configurable: true,
      });
      const p = new StrataWeb();
      const profile = await p.getDeviceProfile();
      expect(profile.platform).toBe('macos');
      p.destroy();
    });

    it('should detect Linux from user agent', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (X11; Linux x86_64)',
        configurable: true,
      });
      const p = new StrataWeb();
      const profile = await p.getDeviceProfile();
      expect(profile.platform).toBe('linux');
      p.destroy();
    });
  });

  describe('input mode detection', () => {
    it('should return keyboard mode by default', async () => {
      const profile = await plugin.getDeviceProfile();
      expect(profile.inputMode).toBe('keyboard');
    });

    it('should return touch mode when touch is available and screen is small', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
      Object.defineProperty(navigator, 'maxTouchPoints', { writable: true, value: 5, configurable: true });
      const profile = await plugin.getDeviceProfile();
      expect(profile.inputMode).toBe('touch');
    });
  });

  // ============ Device Info ============

  describe('getDeviceInfo', () => {
    it('should return isMobile based on device profile', async () => {
      const info = await plugin.getDeviceInfo();
      expect(info).toHaveProperty('isMobile');
      expect(typeof info.isMobile).toBe('boolean');
    });

    it('should always report platform as web', async () => {
      const info = await plugin.getDeviceInfo();
      expect(info.platform).toBe('web');
    });

    it('should report isMobile false for desktop', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1920 });
      const info = await plugin.getDeviceInfo();
      expect(info.isMobile).toBe(false);
    });

    it('should report isMobile true for narrow screen', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 812 });
      const info = await plugin.getDeviceInfo();
      expect(info.isMobile).toBe(true);
    });
  });

  // ============ Safe Area ============

  describe('getSafeAreaInsets', () => {
    it('should return zero insets by default', async () => {
      const insets = await plugin.getSafeAreaInsets();
      expect(insets).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    });

    it('should read CSS custom properties for safe area', async () => {
      // Simulate CSS custom properties
      document.documentElement.style.setProperty('--sat', '47');
      document.documentElement.style.setProperty('--sab', '34');

      const insets = await plugin.getSafeAreaInsets();
      expect(insets.top).toBe(47);
      expect(insets.bottom).toBe(34);

      // Cleanup
      document.documentElement.style.removeProperty('--sat');
      document.documentElement.style.removeProperty('--sab');
    });
  });

  // ============ Control Hints ============

  describe('getControlHints', () => {
    it('should return keyboard hints by default', async () => {
      const hints = await plugin.getControlHints();
      expect(hints.movement).toBe('WASD to move');
      expect(hints.action).toBe('Click to interact');
      expect(hints.camera).toBe('Mouse to look');
    });

    it('should return touch hints when in touch mode', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
      Object.defineProperty(navigator, 'maxTouchPoints', { writable: true, value: 5, configurable: true });
      const hints = await plugin.getControlHints();
      expect(hints.movement).toBe('Drag to move');
      expect(hints.action).toBe('Tap to interact');
      expect(hints.camera).toBe('Pinch to zoom');
    });
  });

  // ============ Input ============

  describe('getInputSnapshot', () => {
    it('should return default input snapshot with no keys pressed', async () => {
      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.leftStick).toEqual({ x: 0, y: 0 });
      expect(snapshot.rightStick).toEqual({ x: 0, y: 0 });
      expect(snapshot.buttons.jump).toBe(false);
      expect(snapshot.buttons.action).toBe(false);
      expect(snapshot.buttons.cancel).toBe(false);
      expect(snapshot.triggers).toEqual({ left: 0, right: 0 });
      expect(snapshot.touches).toEqual([]);
      expect(typeof snapshot.timestamp).toBe('number');
    });

    it('should detect W key as forward input', async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.leftStick.y).toBe(-1);
    });

    it('should detect S key as backward input', async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' }));
      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.leftStick.y).toBe(1);
    });

    it('should detect A key as left input', async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.leftStick.x).toBe(-1);
    });

    it('should detect D key as right input', async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));
      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.leftStick.x).toBe(1);
    });

    it('should detect arrow keys for movement', async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.leftStick.y).toBe(-1);
      expect(snapshot.leftStick.x).toBe(-1);
    });

    it('should detect Space key as jump', async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.buttons.jump).toBe(true);
    });

    it('should detect E key as action', async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.buttons.action).toBe(true);
    });

    it('should detect Enter key as action', async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.buttons.action).toBe(true);
    });

    it('should detect Escape key as cancel', async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));
      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.buttons.cancel).toBe(true);
    });

    it('should release keys on keyup', async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
      let snapshot = await plugin.getInputSnapshot();
      expect(snapshot.leftStick.y).toBe(-1);

      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
      snapshot = await plugin.getInputSnapshot();
      expect(snapshot.leftStick.y).toBe(0);
    });

    it('should include gamepad input when connected', async () => {
      const mockGamepad = {
        index: 0,
        id: 'Xbox Controller',
        axes: [0.5, -0.3, 0.2, 0.7],
        buttons: [
          { pressed: true, value: 1, touched: true },  // Button 0 (jump)
          { pressed: false, value: 0, touched: false }, // Button 1 (action)
          { pressed: false, value: 0, touched: false }, // Button 2 (cancel)
          { pressed: false, value: 0, touched: false },
          { pressed: false, value: 0, touched: false },
          { pressed: false, value: 0, touched: false },
          { pressed: false, value: 0.5, touched: true }, // LT (trigger)
          { pressed: true, value: 1.0, touched: true },  // RT (trigger)
        ],
        mapping: 'standard',
        connected: true,
        timestamp: 0,
        hapticActuators: [],
        vibrationActuator: null,
      };

      Object.defineProperty(navigator, 'getGamepads', {
        writable: true,
        value: vi.fn().mockReturnValue([mockGamepad]),
        configurable: true,
      });

      // Simulate gamepad connected event to update internal state
      const gamepadEvent = new Event('gamepadconnected') as any;
      gamepadEvent.gamepad = mockGamepad;
      window.dispatchEvent(gamepadEvent);

      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.leftStick.x).toBe(0.5);
      expect(snapshot.leftStick.y).toBe(0.3); // Inverted from -0.3
      expect(snapshot.rightStick.x).toBe(0.2);
      expect(snapshot.rightStick.y).toBe(-0.7); // Inverted from 0.7
      expect(snapshot.buttons.jump).toBe(true);
      expect(snapshot.triggers.left).toBe(0.5);
      expect(snapshot.triggers.right).toBe(1.0);
    });

    it('should apply gamepad deadzone filtering', async () => {
      const mockGamepad = {
        index: 0,
        id: 'Controller',
        axes: [0.1, -0.05, 0.12, 0.01], // All below 0.15 deadzone
        buttons: Array(8).fill({ pressed: false, value: 0, touched: false }),
        mapping: 'standard',
        connected: true,
        timestamp: 0,
        hapticActuators: [],
        vibrationActuator: null,
      };

      const gamepadEvent = new Event('gamepadconnected') as any;
      gamepadEvent.gamepad = mockGamepad;
      window.dispatchEvent(gamepadEvent);

      Object.defineProperty(navigator, 'getGamepads', {
        writable: true,
        value: vi.fn().mockReturnValue([mockGamepad]),
        configurable: true,
      });

      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.leftStick.x).toBe(0);
      expect(snapshot.leftStick.y).toBe(0);
      expect(snapshot.rightStick.x).toBe(0);
      expect(snapshot.rightStick.y).toBe(0);
    });
  });

  describe('setInputMapping', () => {
    it('should override specific input mappings', async () => {
      await plugin.setInputMapping({ jump: ['KeyJ'] });

      // Old jump key should no longer work
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
      let snapshot = await plugin.getInputSnapshot();
      expect(snapshot.buttons.jump).toBe(false);

      // New jump key should work
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' }));
      snapshot = await plugin.getInputSnapshot();
      expect(snapshot.buttons.jump).toBe(true);
    });

    it('should preserve non-overridden mappings', async () => {
      await plugin.setInputMapping({ jump: ['KeyJ'] });

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.leftStick.y).toBe(-1);
    });
  });

  // ============ Touch Input ============

  describe('touch handling', () => {
    function createTouchEvent(type: string, touches: Array<{ identifier: number; clientX: number; clientY: number }>) {
      const touchList = touches.map(t => ({
        ...t,
        pageX: t.clientX,
        pageY: t.clientY,
        screenX: t.clientX,
        screenY: t.clientY,
        radiusX: 0,
        radiusY: 0,
        rotationAngle: 0,
        force: 1,
        target: document.body,
      }));
      return new TouchEvent(type, {
        changedTouches: touchList as unknown as Touch[],
        bubbles: true,
        cancelable: true,
      });
    }

    it('should track touch start events', async () => {
      const event = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 200 },
      ]);
      window.dispatchEvent(event);

      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.touches).toHaveLength(1);
      expect(snapshot.touches[0].id).toBe(0);
      expect(snapshot.touches[0].position).toEqual({ x: 100, y: 200 });
      expect(snapshot.touches[0].phase).toBe('began');
    });

    it('should track touch move events', async () => {
      const startEvent = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 200 },
      ]);
      window.dispatchEvent(startEvent);

      const moveEvent = createTouchEvent('touchmove', [
        { identifier: 0, clientX: 150, clientY: 250 },
      ]);
      window.dispatchEvent(moveEvent);

      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.touches).toHaveLength(1);
      expect(snapshot.touches[0].position).toEqual({ x: 150, y: 250 });
      expect(snapshot.touches[0].phase).toBe('moved');
    });

    it('should mark touch as ended on touchend', async () => {
      const startEvent = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 200 },
      ]);
      window.dispatchEvent(startEvent);

      const endEvent = createTouchEvent('touchend', [
        { identifier: 0, clientX: 100, clientY: 200 },
      ]);
      window.dispatchEvent(endEvent);

      // Immediately after end, touch should be in ended phase
      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.touches).toHaveLength(1);
      expect(snapshot.touches[0].phase).toBe('ended');
    });

    it('should remove touch on cancel', async () => {
      const startEvent = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 200 },
      ]);
      window.dispatchEvent(startEvent);

      const cancelEvent = createTouchEvent('touchcancel', [
        { identifier: 0, clientX: 100, clientY: 200 },
      ]);
      window.dispatchEvent(cancelEvent);

      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.touches).toHaveLength(0);
    });

    it('should track multiple simultaneous touches', async () => {
      const event = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 200 },
      ]);
      window.dispatchEvent(event);

      const event2 = createTouchEvent('touchstart', [
        { identifier: 1, clientX: 300, clientY: 400 },
      ]);
      window.dispatchEvent(event2);

      const snapshot = await plugin.getInputSnapshot();
      expect(snapshot.touches).toHaveLength(2);
    });
  });

  // ============ Haptics ============

  describe('triggerHaptics', () => {
    it('should call navigator.vibrate with pattern when pattern is provided', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.triggerHaptics({ pattern: [100, 50, 100] });
      expect(vibrateSpy).toHaveBeenCalledWith([100, 50, 100]);
    });

    it('should call navigator.vibrate with light duration', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.triggerHaptics({ intensity: 'light' });
      expect(vibrateSpy).toHaveBeenCalledWith(10);
    });

    it('should call navigator.vibrate with medium duration', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.triggerHaptics({ intensity: 'medium' });
      expect(vibrateSpy).toHaveBeenCalledWith(25);
    });

    it('should call navigator.vibrate with heavy duration', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.triggerHaptics({ intensity: 'heavy' });
      expect(vibrateSpy).toHaveBeenCalledWith(50);
    });

    it('should default to medium when no intensity is specified', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.triggerHaptics({});
      expect(vibrateSpy).toHaveBeenCalledWith(25);
    });

    it('should use custom duration when provided', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.triggerHaptics({ intensity: 'medium', duration: 75 });
      expect(vibrateSpy).toHaveBeenCalledWith(75);
    });

    it('should map customIntensity < 0.33 to light', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.triggerHaptics({ customIntensity: 0.2 });
      expect(vibrateSpy).toHaveBeenCalledWith(10); // light = 10ms
    });

    it('should map customIntensity 0.33-0.66 to medium', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.triggerHaptics({ customIntensity: 0.5 });
      expect(vibrateSpy).toHaveBeenCalledWith(25); // medium = 25ms
    });

    it('should map customIntensity >= 0.66 to heavy', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.triggerHaptics({ customIntensity: 0.8 });
      expect(vibrateSpy).toHaveBeenCalledWith(50); // heavy = 50ms
    });

    it('should clamp customIntensity to 0-1 range', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      // Above 1 should clamp to 1 (heavy)
      await plugin.triggerHaptics({ customIntensity: 2.0 });
      expect(vibrateSpy).toHaveBeenCalledWith(50); // heavy

      // Below 0 should clamp to 0 (light)
      await plugin.triggerHaptics({ customIntensity: -1.0 });
      expect(vibrateSpy).toHaveBeenCalledWith(10); // light
    });

    it('should trigger gamepad vibration when available', async () => {
      const playEffectSpy = vi.fn().mockResolvedValue(undefined);
      const mockGamepad = {
        index: 0,
        id: 'Controller',
        axes: [0, 0, 0, 0],
        buttons: Array(8).fill({ pressed: false, value: 0, touched: false }),
        mapping: 'standard',
        connected: true,
        timestamp: 0,
        vibrationActuator: { playEffect: playEffectSpy },
        hapticActuators: [],
      };

      const gamepadEvent = new Event('gamepadconnected') as any;
      gamepadEvent.gamepad = mockGamepad;
      window.dispatchEvent(gamepadEvent);

      Object.defineProperty(navigator, 'getGamepads', {
        writable: true,
        value: vi.fn().mockReturnValue([mockGamepad]),
        configurable: true,
      });

      // Trigger the input loop to pick up the gamepad
      await plugin.triggerHaptics({ intensity: 'heavy' });

      expect(playEffectSpy).toHaveBeenCalledWith('dual-rumble', {
        startDelay: 0,
        duration: 100,
        weakMagnitude: 1.0,
        strongMagnitude: 1.0,
      });
    });

    it('should handle gamepad vibration failure gracefully', async () => {
      const playEffectSpy = vi.fn().mockRejectedValue(new Error('Not supported'));
      const mockGamepad = {
        index: 0,
        id: 'Controller',
        axes: [0, 0, 0, 0],
        buttons: Array(8).fill({ pressed: false, value: 0, touched: false }),
        mapping: 'standard',
        connected: true,
        timestamp: 0,
        vibrationActuator: { playEffect: playEffectSpy },
        hapticActuators: [],
      };

      const gamepadEvent = new Event('gamepadconnected') as any;
      gamepadEvent.gamepad = mockGamepad;
      window.dispatchEvent(gamepadEvent);

      Object.defineProperty(navigator, 'getGamepads', {
        writable: true,
        value: vi.fn().mockReturnValue([mockGamepad]),
        configurable: true,
      });

      // Should not throw
      await expect(plugin.triggerHaptics({ intensity: 'heavy' })).resolves.not.toThrow();
    });
  });

  describe('haptics (legacy)', () => {
    it('should map impact type with style to triggerHaptics', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.haptics({ type: 'impact', style: 'heavy' });
      expect(vibrateSpy).toHaveBeenCalledWith(50);
    });

    it('should map notification type to pattern', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.haptics({ type: 'notification' });
      expect(vibrateSpy).toHaveBeenCalledWith([100, 30, 100]);
    });

    it('should map selection type to light with 10ms duration', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.haptics({ type: 'selection' });
      expect(vibrateSpy).toHaveBeenCalledWith(10);
    });

    it('should use style for impact type when provided', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.haptics({ type: 'impact', style: 'light' });
      expect(vibrateSpy).toHaveBeenCalledWith(10);
    });

    it('should default impact style to medium when no style provided', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.haptics({ type: 'impact' });
      expect(vibrateSpy).toHaveBeenCalledWith(25);
    });
  });

  describe('vibrate', () => {
    it('should delegate to triggerHaptics with duration', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.vibrate({ duration: 100 });
      expect(vibrateSpy).toHaveBeenCalledWith(100);
    });

    it('should work with no options', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { writable: true, value: vibrateSpy, configurable: true });

      await plugin.vibrate();
      expect(vibrateSpy).toHaveBeenCalledWith(25); // default medium = 25
    });
  });

  // ============ Controllers ============

  describe('selectController', () => {
    it('should always return success on web', async () => {
      const result = await plugin.selectController({ index: 0 });
      expect(result.success).toBe(true);
      expect(result.selectedIndex).toBe(0);
      expect(result.controllerId).toBe('Web Gamepad API');
    });

    it('should accept any index', async () => {
      const result = await plugin.selectController({ index: 3 });
      expect(result.success).toBe(true);
      expect(result.selectedIndex).toBe(3);
    });
  });

  describe('getConnectedControllers', () => {
    it('should return empty list when no gamepads connected', async () => {
      const result = await plugin.getConnectedControllers();
      expect(result.controllers).toEqual([]);
      expect(result.selectedIndex).toBe(0);
    });

    it('should list connected gamepads', async () => {
      const mockGamepad = {
        index: 0,
        id: 'Xbox Wireless Controller',
        axes: [0, 0, 0, 0],
        buttons: [],
        mapping: 'standard',
        connected: true,
        timestamp: 0,
        hapticActuators: [],
        vibrationActuator: null,
      };

      const gamepadEvent = new Event('gamepadconnected') as any;
      gamepadEvent.gamepad = mockGamepad;
      window.dispatchEvent(gamepadEvent);

      const result = await plugin.getConnectedControllers();
      expect(result.controllers).toHaveLength(1);
      expect(result.controllers[0].id).toBe('Xbox Wireless Controller');
      expect(result.controllers[0].index).toBe(0);
      expect(result.controllers[0].isSelected).toBe(true);
      expect(result.controllers[0].hasExtendedGamepad).toBe(true);
      expect(result.controllers[0].hasMicroGamepad).toBe(false);
    });

    it('should handle gamepad disconnection', async () => {
      const mockGamepad = {
        index: 0,
        id: 'Controller',
        axes: [0, 0, 0, 0],
        buttons: [],
        mapping: 'standard',
        connected: true,
        timestamp: 0,
        hapticActuators: [],
        vibrationActuator: null,
      };

      const connectEvent = new Event('gamepadconnected') as any;
      connectEvent.gamepad = mockGamepad;
      window.dispatchEvent(connectEvent);

      const disconnectEvent = new Event('gamepaddisconnected') as any;
      disconnectEvent.gamepad = mockGamepad;
      window.dispatchEvent(disconnectEvent);

      const result = await plugin.getConnectedControllers();
      expect(result.controllers).toHaveLength(0);
    });
  });

  // ============ Screen Orientation ============

  describe('setScreenOrientation', () => {
    it('should call screen.orientation.lock when available', async () => {
      const lockSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        value: { lock: lockSpy, type: 'landscape-primary', angle: 0 },
        configurable: true,
      });

      await plugin.setScreenOrientation({ orientation: 'portrait' });
      expect(lockSpy).toHaveBeenCalledWith('portrait');
    });

    it('should handle lock failure gracefully', async () => {
      const lockSpy = vi.fn().mockRejectedValue(new Error('Not allowed'));
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        value: { lock: lockSpy, type: 'landscape-primary', angle: 0 },
        configurable: true,
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await plugin.setScreenOrientation({ orientation: 'portrait' });
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  // ============ Performance Mode ============

  describe('getPerformanceMode', () => {
    it('should return disabled by default on web', async () => {
      const mode = await plugin.getPerformanceMode();
      expect(mode.enabled).toBe(false);
    });
  });

  // ============ Touch Handling Configuration ============

  describe('configureTouchHandling', () => {
    it('should set overflow hidden and touch-action none when preventing scrolling', async () => {
      await plugin.configureTouchHandling({ preventScrolling: true, preventZooming: false });
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.touchAction).toBe('none');
    });

    it('should reset overflow and touch-action when not preventing scrolling', async () => {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      await plugin.configureTouchHandling({ preventScrolling: false, preventZooming: false });
      expect(document.body.style.overflow).toBe('');
      expect(document.body.style.touchAction).toBe('');
    });

    it('should add user-scalable=no to viewport meta when preventing zooming', async () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', 'width=device-width');
      document.head.appendChild(meta);

      await plugin.configureTouchHandling({ preventScrolling: false, preventZooming: true });
      expect(meta.getAttribute('content')).toContain('user-scalable=no');

      document.head.removeChild(meta);
    });

    it('should remove user-scalable=no when not preventing zooming', async () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', 'width=device-width, user-scalable=no');
      document.head.appendChild(meta);

      await plugin.configureTouchHandling({ preventScrolling: false, preventZooming: false });
      expect(meta.getAttribute('content')).not.toContain('user-scalable=no');

      document.head.removeChild(meta);
    });

    it('should not duplicate user-scalable=no if already present', async () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', 'width=device-width, user-scalable=no');
      document.head.appendChild(meta);

      await plugin.configureTouchHandling({ preventScrolling: false, preventZooming: true });
      const content = meta.getAttribute('content') || '';
      const count = (content.match(/user-scalable=no/g) || []).length;
      expect(count).toBe(1);

      document.head.removeChild(meta);
    });
  });

  // ============ Storage API ============

  describe('storage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    describe('setItem', () => {
      it('should store a value in localStorage with namespace prefix', async () => {
        await plugin.setItem('score', 100);
        expect(localStorage.getItem('strata:score')).toBe('100');
      });

      it('should store complex objects as JSON', async () => {
        const data = { level: 5, items: ['sword', 'shield'] };
        await plugin.setItem('save1', data);
        expect(JSON.parse(localStorage.getItem('strata:save1')!)).toEqual(data);
      });

      it('should use custom namespace', async () => {
        await plugin.setItem('score', 100, { namespace: 'mygame' });
        expect(localStorage.getItem('mygame:score')).toBe('100');
        expect(localStorage.getItem('strata:score')).toBeNull();
      });

      it('should store string values', async () => {
        await plugin.setItem('name', 'Player1');
        expect(JSON.parse(localStorage.getItem('strata:name')!)).toBe('Player1');
      });

      it('should store boolean values', async () => {
        await plugin.setItem('tutorial_done', true);
        expect(JSON.parse(localStorage.getItem('strata:tutorial_done')!)).toBe(true);
      });

      it('should store null values', async () => {
        await plugin.setItem('empty', null);
        expect(JSON.parse(localStorage.getItem('strata:empty')!)).toBeNull();
      });
    });

    describe('getItem', () => {
      it('should retrieve stored value', async () => {
        localStorage.setItem('strata:score', '100');
        const result = await plugin.getItem<number>('score');
        expect(result.value).toBe(100);
        expect(result.exists).toBe(true);
      });

      it('should return null for nonexistent key', async () => {
        const result = await plugin.getItem('nonexistent');
        expect(result.value).toBeNull();
        expect(result.exists).toBe(false);
      });

      it('should return exists true but null value for invalid JSON', async () => {
        localStorage.setItem('strata:broken', 'not json{');
        const result = await plugin.getItem('broken');
        expect(result.value).toBeNull();
        expect(result.exists).toBe(true);
      });

      it('should use custom namespace', async () => {
        localStorage.setItem('mygame:score', '500');
        const result = await plugin.getItem<number>('score', { namespace: 'mygame' });
        expect(result.value).toBe(500);
      });
    });

    describe('removeItem', () => {
      it('should remove a stored item', async () => {
        localStorage.setItem('strata:score', '100');
        await plugin.removeItem('score');
        expect(localStorage.getItem('strata:score')).toBeNull();
      });

      it('should not throw for nonexistent key', async () => {
        await expect(plugin.removeItem('nonexistent')).resolves.not.toThrow();
      });

      it('should use custom namespace', async () => {
        localStorage.setItem('mygame:score', '100');
        await plugin.removeItem('score', { namespace: 'mygame' });
        expect(localStorage.getItem('mygame:score')).toBeNull();
      });
    });

    describe('keys', () => {
      it('should return all keys in the default namespace', async () => {
        localStorage.setItem('strata:a', '1');
        localStorage.setItem('strata:b', '2');
        localStorage.setItem('other:c', '3');

        const result = await plugin.keys();
        expect(result.keys).toContain('a');
        expect(result.keys).toContain('b');
        expect(result.keys).not.toContain('c');
      });

      it('should return empty array when no keys match', async () => {
        const result = await plugin.keys();
        expect(result.keys).toEqual([]);
      });

      it('should filter by custom namespace', async () => {
        localStorage.setItem('strata:a', '1');
        localStorage.setItem('mygame:b', '2');

        const result = await plugin.keys({ namespace: 'mygame' });
        expect(result.keys).toEqual(['b']);
      });
    });

    describe('clear', () => {
      it('should remove only keys in the default namespace', async () => {
        localStorage.setItem('strata:a', '1');
        localStorage.setItem('strata:b', '2');
        localStorage.setItem('other:c', '3');

        await plugin.clear();

        expect(localStorage.getItem('strata:a')).toBeNull();
        expect(localStorage.getItem('strata:b')).toBeNull();
        expect(localStorage.getItem('other:c')).toBe('3');
      });

      it('should clear only custom namespace', async () => {
        localStorage.setItem('strata:a', '1');
        localStorage.setItem('mygame:b', '2');

        await plugin.clear({ namespace: 'mygame' });

        expect(localStorage.getItem('strata:a')).toBe('1');
        expect(localStorage.getItem('mygame:b')).toBeNull();
      });

      it('should handle empty namespace gracefully', async () => {
        await expect(plugin.clear()).resolves.not.toThrow();
      });
    });
  });

  // ============ Event Listeners ============

  describe('addListener', () => {
    it('should register a deviceChange listener', async () => {
      const callback = vi.fn();
      const handle = await plugin.addListener('deviceChange', callback);
      expect(handle).toHaveProperty('remove');
      expect(typeof handle.remove).toBe('function');
    });

    it('should register an inputChange listener', async () => {
      const callback = vi.fn();
      const handle = await plugin.addListener('inputChange', callback);
      expect(handle).toHaveProperty('remove');
    });

    it('should register a gamepadConnected listener', async () => {
      const callback = vi.fn();
      const handle = await plugin.addListener('gamepadConnected', callback);

      const mockGamepad = {
        index: 0,
        id: 'Test Controller',
        axes: [],
        buttons: [],
        mapping: 'standard',
        connected: true,
        timestamp: 0,
        hapticActuators: [],
        vibrationActuator: null,
      };

      const event = new Event('gamepadconnected') as any;
      event.gamepad = mockGamepad;
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith({ index: 0, id: 'Test Controller' });
      await handle.remove();
    });

    it('should register a gamepadDisconnected listener', async () => {
      const callback = vi.fn();
      const handle = await plugin.addListener('gamepadDisconnected', callback);

      const mockGamepad = {
        index: 1,
        id: 'Test',
        axes: [],
        buttons: [],
        mapping: 'standard',
        connected: false,
        timestamp: 0,
        hapticActuators: [],
        vibrationActuator: null,
      };

      const event = new Event('gamepaddisconnected') as any;
      event.gamepad = mockGamepad;
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith({ index: 1 });
      await handle.remove();
    });

    it('should remove listener when handle.remove() is called', async () => {
      const callback = vi.fn();
      const handle = await plugin.addListener('gamepadConnected', callback);
      await handle.remove();

      const mockGamepad = {
        index: 0,
        id: 'Controller',
        axes: [],
        buttons: [],
        mapping: 'standard',
        connected: true,
        timestamp: 0,
        hapticActuators: [],
        vibrationActuator: null,
      };

      const event = new Event('gamepadconnected') as any;
      event.gamepad = mockGamepad;
      window.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should notify deviceChange listeners on resize', async () => {
      const callback = vi.fn();
      await plugin.addListener('deviceChange', callback);

      window.dispatchEvent(new Event('resize'));

      // Wait for async profile fetch
      await new Promise((r) => setTimeout(r, 50));

      expect(callback).toHaveBeenCalled();
      const profile = callback.mock.calls[0][0];
      expect(profile).toHaveProperty('deviceType');
      expect(profile).toHaveProperty('platform');
    });
  });

  // ============ Destroy ============

  describe('destroy', () => {
    it('should clean up all listeners and state', () => {
      plugin.destroy();
      // After destroy, dispatching events should not cause errors
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
      window.dispatchEvent(new Event('resize'));
      // No assertion needed; just verifying no errors are thrown
    });
  });
});
