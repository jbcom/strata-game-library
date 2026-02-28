import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Strata plugin before importing hooks
vi.mock('../src/index.js', () => ({
  Strata: {
    getDeviceInfo: vi.fn(),
    getSafeAreaInsets: vi.fn(),
    haptics: vi.fn(),
    getDeviceProfile: vi.fn(),
    getControlHints: vi.fn(),
    triggerHaptics: vi.fn(),
    addListener: vi.fn(),
    getInputSnapshot: vi.fn(),
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
    keys: vi.fn(),
    clear: vi.fn(),
  },
}));

import { Strata } from '../src/index.js';
import { DeviceContext, DeviceProvider, useDevice } from '../src/react/useDevice.js';
import { useControlHints } from '../src/react/useControlHints.js';
import { useHaptics } from '../src/react/useHaptics.js';
import { InputContext, InputProvider, useInput } from '../src/react/useInput.js';
import { useStorage } from '../src/react/useStorage.js';
import { useStrata } from '../src/react/index.js';

const mockedStrata = vi.mocked(Strata);

describe('React hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // ============ useStrata ============

  describe('useStrata', () => {
    it('should fetch device info and safe area on mount', async () => {
      mockedStrata.getDeviceInfo.mockResolvedValue({
        isMobile: false,
        platform: 'web',
      });
      mockedStrata.getSafeAreaInsets.mockResolvedValue({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });

      function TestComponent() {
        const { deviceInfo } = useStrata();
        return (
          <div data-testid="strata-info">
            {deviceInfo?.platform ?? 'loading'}
          </div>
        );
      }

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('strata-info').textContent).toBe('web');
      });

      expect(mockedStrata.getDeviceInfo).toHaveBeenCalledTimes(1);
      expect(mockedStrata.getSafeAreaInsets).toHaveBeenCalledTimes(1);
    });

    it('should provide a triggerHaptic function', async () => {
      mockedStrata.getDeviceInfo.mockResolvedValue({
        isMobile: false,
        platform: 'web',
      });
      mockedStrata.getSafeAreaInsets.mockResolvedValue({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });
      mockedStrata.haptics.mockResolvedValue(undefined);

      let hookResult: ReturnType<typeof useStrata> | undefined;

      function TestComponent() {
        hookResult = useStrata();
        return <div>strata-haptic-test</div>;
      }

      render(<TestComponent />);

      await waitFor(() => {
        expect(hookResult).toBeDefined();
      });

      act(() => {
        hookResult!.triggerHaptic('impact', 'heavy');
      });

      await waitFor(() => {
        expect(mockedStrata.haptics).toHaveBeenCalledWith({
          type: 'impact',
          style: 'heavy',
        });
      });
    });

    it('should handle getDeviceInfo failure gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedStrata.getDeviceInfo.mockRejectedValue(new Error('fail'));
      mockedStrata.getSafeAreaInsets.mockResolvedValue({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });

      function TestComponent() {
        const { deviceInfo } = useStrata();
        return <div data-testid="strata-fail">{deviceInfo ? 'loaded' : 'null'}</div>;
      }

      render(<TestComponent />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  // ============ useDevice ============

  describe('useDevice', () => {
    it('should return default desktop profile from context', () => {
      function TestComponent() {
        const profile = useDevice();
        return <div data-testid="device-default">{profile.deviceType}</div>;
      }

      render(<TestComponent />);
      expect(screen.getByTestId('device-default').textContent).toBe('desktop');
    });

    it('should return custom profile from DeviceContext.Provider', () => {
      const customProfile = {
        deviceType: 'mobile' as const,
        platform: 'ios' as const,
        inputMode: 'touch' as const,
        orientation: 'portrait' as const,
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
      };

      function TestComponent() {
        const profile = useDevice();
        return (
          <div>
            <span data-testid="device-custom-type">{profile.deviceType}</span>
            <span data-testid="device-custom-mobile">{String(profile.isMobile)}</span>
          </div>
        );
      }

      render(
        <DeviceContext.Provider value={customProfile}>
          <TestComponent />
        </DeviceContext.Provider>,
      );

      expect(screen.getByTestId('device-custom-type').textContent).toBe('mobile');
      expect(screen.getByTestId('device-custom-mobile').textContent).toBe('true');
    });

    it('DeviceProvider should fetch and set profile', async () => {
      mockedStrata.getDeviceProfile.mockResolvedValue({
        deviceType: 'tablet',
        platform: 'android',
        inputMode: 'touch',
        orientation: 'landscape',
        hasTouch: true,
        hasPointer: false,
        hasGamepad: false,
        isMobile: false,
        isTablet: true,
        isFoldable: false,
        isDesktop: false,
        screenWidth: 1024,
        screenHeight: 768,
        pixelRatio: 2,
        safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
      });
      mockedStrata.addListener.mockResolvedValue({
        remove: async () => {},
      });

      function TestComponent() {
        const profile = useDevice();
        return <div data-testid="provider-type">{profile.deviceType}</div>;
      }

      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('provider-type').textContent).toBe('tablet');
      });
    });

    it('DeviceProvider should register deviceChange listener', async () => {
      mockedStrata.getDeviceProfile.mockResolvedValue({
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
      });
      mockedStrata.addListener.mockResolvedValue({
        remove: async () => {},
      });

      function TestComponent() {
        useDevice();
        return <div>device-listener-test</div>;
      }

      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>,
      );

      await waitFor(() => {
        expect(mockedStrata.addListener).toHaveBeenCalledWith(
          'deviceChange',
          expect.any(Function),
        );
      });
    });
  });

  // ============ useControlHints ============

  describe('useControlHints', () => {
    it('should return default keyboard hints initially', () => {
      // Don't resolve the promise -- just leave it pending so the default stays
      mockedStrata.getControlHints.mockReturnValue(new Promise(() => {}));

      function TestComponent() {
        const hints = useControlHints();
        return <div data-testid="hints-default">{hints.movement}</div>;
      }

      render(<TestComponent />);
      expect(screen.getByTestId('hints-default').textContent).toBe('WASD to move');
    });

    it('should fetch and update hints from Strata', async () => {
      mockedStrata.getControlHints.mockResolvedValue({
        movement: 'Drag to move',
        action: 'Tap to interact',
        camera: 'Pinch to zoom',
      });

      function TestComponent() {
        const hints = useControlHints();
        return <div data-testid="hints-fetched">{hints.movement}</div>;
      }

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('hints-fetched').textContent).toBe('Drag to move');
      });
    });

    it('should handle fetch failure gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockedStrata.getControlHints.mockRejectedValue(new Error('fail'));

      function TestComponent() {
        const hints = useControlHints();
        return <div data-testid="hints-error">{hints.movement}</div>;
      }

      render(<TestComponent />);

      // Should keep default hints
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      expect(screen.getByTestId('hints-error').textContent).toBe('WASD to move');

      consoleSpy.mockRestore();
    });
  });

  // ============ useHaptics ============

  describe('useHaptics', () => {
    it('should return trigger functions', () => {
      let hookResult: ReturnType<typeof useHaptics> | undefined;

      function TestComponent() {
        hookResult = useHaptics();
        return <div>haptics-test</div>;
      }

      render(<TestComponent />);

      expect(hookResult).toBeDefined();
      expect(typeof hookResult!.trigger).toBe('function');
      expect(typeof hookResult!.light).toBe('function');
      expect(typeof hookResult!.medium).toBe('function');
      expect(typeof hookResult!.heavy).toBe('function');
      expect(typeof hookResult!.vibrate).toBe('function');
    });

    it('should call triggerHaptics with light intensity', async () => {
      mockedStrata.triggerHaptics.mockResolvedValue(undefined);

      let hookResult: ReturnType<typeof useHaptics> | undefined;

      function TestComponent() {
        hookResult = useHaptics();
        return <div>haptics-light</div>;
      }

      render(<TestComponent />);

      await act(async () => {
        await hookResult!.light();
      });

      expect(mockedStrata.triggerHaptics).toHaveBeenCalledWith({
        intensity: 'light',
      });
    });

    it('should call triggerHaptics with medium intensity', async () => {
      mockedStrata.triggerHaptics.mockResolvedValue(undefined);

      let hookResult: ReturnType<typeof useHaptics> | undefined;

      function TestComponent() {
        hookResult = useHaptics();
        return <div>haptics-medium</div>;
      }

      render(<TestComponent />);

      await act(async () => {
        await hookResult!.medium();
      });

      expect(mockedStrata.triggerHaptics).toHaveBeenCalledWith({
        intensity: 'medium',
      });
    });

    it('should call triggerHaptics with heavy intensity', async () => {
      mockedStrata.triggerHaptics.mockResolvedValue(undefined);

      let hookResult: ReturnType<typeof useHaptics> | undefined;

      function TestComponent() {
        hookResult = useHaptics();
        return <div>haptics-heavy</div>;
      }

      render(<TestComponent />);

      await act(async () => {
        await hookResult!.heavy();
      });

      expect(mockedStrata.triggerHaptics).toHaveBeenCalledWith({
        intensity: 'heavy',
      });
    });

    it('should call triggerHaptics with custom options', async () => {
      mockedStrata.triggerHaptics.mockResolvedValue(undefined);

      let hookResult: ReturnType<typeof useHaptics> | undefined;

      function TestComponent() {
        hookResult = useHaptics();
        return <div>haptics-custom</div>;
      }

      render(<TestComponent />);

      await act(async () => {
        await hookResult!.trigger({ customIntensity: 0.7, duration: 50 });
      });

      expect(mockedStrata.triggerHaptics).toHaveBeenCalledWith({
        customIntensity: 0.7,
        duration: 50,
      });
    });

    it('should call vibrate with duration', async () => {
      mockedStrata.triggerHaptics.mockResolvedValue(undefined);

      let hookResult: ReturnType<typeof useHaptics> | undefined;

      function TestComponent() {
        hookResult = useHaptics();
        return <div>haptics-vibrate</div>;
      }

      render(<TestComponent />);

      await act(async () => {
        await hookResult!.vibrate(100);
      });

      expect(mockedStrata.triggerHaptics).toHaveBeenCalledWith({
        duration: 100,
      });
    });
  });

  // ============ useInput ============

  describe('useInput', () => {
    it('should return default snapshot from context', () => {
      function TestComponent() {
        const input = useInput();
        return (
          <div>
            <span data-testid="input-lx">{input.leftStick.x}</span>
            <span data-testid="input-ly">{input.leftStick.y}</span>
            <span data-testid="input-trigger">{input.leftTrigger}</span>
          </div>
        );
      }

      render(<TestComponent />);
      expect(screen.getByTestId('input-lx').textContent).toBe('0');
      expect(screen.getByTestId('input-ly').textContent).toBe('0');
      expect(screen.getByTestId('input-trigger').textContent).toBe('0');
    });

    it('should provide isPressed function', () => {
      let result: ReturnType<typeof useInput> | undefined;

      function TestComponent() {
        result = useInput();
        return <div>input-pressed</div>;
      }

      render(<TestComponent />);
      expect(result!.isPressed('jump')).toBe(false);
    });

    it('should read custom values from InputContext.Provider', () => {
      const customValue = {
        snapshot: {
          timestamp: 123,
          leftStick: { x: 0.5, y: -0.5 },
          rightStick: { x: 0, y: 0 },
          buttons: { jump: true },
          triggers: { left: 0.5, right: 0 },
          touches: [],
        },
        leftStick: { x: 0.5, y: -0.5 },
        rightStick: { x: 0, y: 0 },
        isPressed: (btn: string) => btn === 'jump',
        leftTrigger: 0.5,
        rightTrigger: 0,
        touches: [] as any[],
      };

      function TestComponent() {
        const input = useInput();
        return (
          <div>
            <span data-testid="ctx-lx">{input.leftStick.x}</span>
            <span data-testid="ctx-jump">{String(input.isPressed('jump'))}</span>
            <span data-testid="ctx-lt">{input.leftTrigger}</span>
          </div>
        );
      }

      render(
        <InputContext.Provider value={customValue}>
          <TestComponent />
        </InputContext.Provider>,
      );

      expect(screen.getByTestId('ctx-lx').textContent).toBe('0.5');
      expect(screen.getByTestId('ctx-jump').textContent).toBe('true');
      expect(screen.getByTestId('ctx-lt').textContent).toBe('0.5');
    });

    it('InputProvider should register inputChange listener', async () => {
      mockedStrata.addListener.mockResolvedValue({
        remove: async () => {},
      });

      function TestComponent() {
        useInput();
        return <div>input-provider-test</div>;
      }

      render(
        <InputProvider>
          <TestComponent />
        </InputProvider>,
      );

      await waitFor(() => {
        expect(mockedStrata.addListener).toHaveBeenCalledWith(
          'inputChange',
          expect.any(Function),
        );
      });
    });

    it('InputProvider should update snapshot when listener fires', async () => {
      let listenerCallback: ((snapshot: any) => void) | undefined;

      mockedStrata.addListener.mockImplementation(async (_event: any, callback: any) => {
        listenerCallback = callback;
        return { remove: async () => {} };
      });

      function TestComponent() {
        const input = useInput();
        return <div data-testid="input-update-lx">{input.leftStick.x}</div>;
      }

      render(
        <InputProvider>
          <TestComponent />
        </InputProvider>,
      );

      // Wait for listener to be registered
      await waitFor(() => {
        expect(listenerCallback).toBeDefined();
      });

      // Trigger input change
      act(() => {
        listenerCallback!({
          timestamp: 500,
          leftStick: { x: 0.8, y: 0 },
          rightStick: { x: 0, y: 0 },
          buttons: {},
          triggers: { left: 0, right: 0 },
          touches: [],
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('input-update-lx').textContent).toBe('0.8');
      });
    });
  });

  // ============ useStorage ============

  describe('useStorage', () => {
    it('should provide storage functions', () => {
      let result: ReturnType<typeof useStorage> | undefined;

      function TestComponent() {
        result = useStorage();
        return <div>storage-funcs</div>;
      }

      render(<TestComponent />);

      expect(result).toBeDefined();
      expect(typeof result!.saveGame).toBe('function');
      expect(typeof result!.loadGame).toBe('function');
      expect(typeof result!.deleteGame).toBe('function');
      expect(typeof result!.listSaves).toBe('function');
      expect(typeof result!.clearAllSaves).toBe('function');
      expect(result!.loading).toBe(false);
      expect(result!.error).toBeNull();
    });

    it('should call setItem with namespace when saving', async () => {
      mockedStrata.setItem.mockResolvedValue(undefined);

      let result: ReturnType<typeof useStorage> | undefined;

      function TestComponent() {
        result = useStorage('mygame');
        return <div>storage-save</div>;
      }

      render(<TestComponent />);

      await act(async () => {
        await result!.saveGame('progress', { level: 5 });
      });

      expect(mockedStrata.setItem).toHaveBeenCalledWith(
        'progress',
        { level: 5 },
        { namespace: 'mygame' },
      );
    });

    it('should call getItem with namespace when loading', async () => {
      mockedStrata.getItem.mockResolvedValue({
        value: { level: 5 },
        exists: true,
      });

      let result: ReturnType<typeof useStorage> | undefined;

      function TestComponent() {
        result = useStorage('mygame');
        return <div>storage-load</div>;
      }

      render(<TestComponent />);

      let loadResult: any;
      await act(async () => {
        loadResult = await result!.loadGame('progress');
      });

      expect(mockedStrata.getItem).toHaveBeenCalledWith('progress', {
        namespace: 'mygame',
      });
      expect(loadResult).toEqual({ value: { level: 5 }, exists: true });
    });

    it('should call removeItem when deleting', async () => {
      mockedStrata.removeItem.mockResolvedValue(undefined);

      let result: ReturnType<typeof useStorage> | undefined;

      function TestComponent() {
        result = useStorage();
        return <div>storage-delete</div>;
      }

      render(<TestComponent />);

      await act(async () => {
        await result!.deleteGame('progress');
      });

      expect(mockedStrata.removeItem).toHaveBeenCalledWith('progress', {
        namespace: 'strata',
      });
    });

    it('should call keys when listing saves', async () => {
      mockedStrata.keys.mockResolvedValue({ keys: ['save1', 'save2'] });

      let result: ReturnType<typeof useStorage> | undefined;

      function TestComponent() {
        result = useStorage();
        return <div>storage-list</div>;
      }

      render(<TestComponent />);

      let saves: string[] = [];
      await act(async () => {
        saves = await result!.listSaves();
      });

      expect(saves).toEqual(['save1', 'save2']);
    });

    it('should call clear when clearing all saves', async () => {
      mockedStrata.clear.mockResolvedValue(undefined);

      let result: ReturnType<typeof useStorage> | undefined;

      function TestComponent() {
        result = useStorage('mygame');
        return <div>storage-clear</div>;
      }

      render(<TestComponent />);

      await act(async () => {
        await result!.clearAllSaves();
      });

      expect(mockedStrata.clear).toHaveBeenCalledWith({
        namespace: 'mygame',
      });
    });

    it('should use default strata namespace', async () => {
      mockedStrata.setItem.mockResolvedValue(undefined);

      let result: ReturnType<typeof useStorage> | undefined;

      function TestComponent() {
        result = useStorage();
        return <div>storage-default-ns</div>;
      }

      render(<TestComponent />);

      await act(async () => {
        await result!.saveGame('test', 'value');
      });

      expect(mockedStrata.setItem).toHaveBeenCalledWith('test', 'value', {
        namespace: 'strata',
      });
    });

    it('should set error state on save failure', async () => {
      mockedStrata.setItem.mockRejectedValue(new Error('Storage full'));

      let result: ReturnType<typeof useStorage> | undefined;

      function TestComponent() {
        result = useStorage();
        return <div data-testid="storage-error">{result?.error?.message ?? 'none'}</div>;
      }

      render(<TestComponent />);

      await act(async () => {
        try {
          await result!.saveGame('test', 'value');
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('storage-error').textContent).toBe('Storage full');
      });
    });

    it('should return empty results on load failure', async () => {
      mockedStrata.getItem.mockRejectedValue(new Error('fail'));

      let result: ReturnType<typeof useStorage> | undefined;

      function TestComponent() {
        result = useStorage();
        return <div>storage-load-fail</div>;
      }

      render(<TestComponent />);

      let loadResult: any;
      await act(async () => {
        loadResult = await result!.loadGame('test');
      });

      expect(loadResult).toEqual({ value: null, exists: false });
    });

    it('should return empty array on listSaves failure', async () => {
      mockedStrata.keys.mockRejectedValue(new Error('fail'));

      let result: ReturnType<typeof useStorage> | undefined;

      function TestComponent() {
        result = useStorage();
        return <div>storage-keys-fail</div>;
      }

      render(<TestComponent />);

      let saves: string[] = [];
      await act(async () => {
        saves = await result!.listSaves();
      });

      expect(saves).toEqual([]);
    });
  });
});
